/**
 * Project Unlock Manager
 * Quản lý logic mở khóa project với pattern lock
 */

import { API_BASE_URL } from './api-config.js';

export class ProjectUnlockManager {
    constructor(options = {}) {
        this.patternLock = null;
        this.currentProject = null;
        this.pendingProject = null; // Store project info for success state
        this.onUnlockSuccess = options.onUnlockSuccess || null;
        this.PatternLockClass = options.PatternLockClass || null;
        
        // Projects không cần mật khẩu (whitelist)
        this.noPasswordProjects = options.noPasswordProjects || [];
    }
    
    /**
     * Kiểm tra xem project có cần mật khẩu không
     */
    requiresPassword(project) {
        if (!project) return false;
        
        // Kiểm tra whitelist (không cần password)
        const projectName = project.name || project.id;
        return !this.noPasswordProjects.some(name => 
            projectName.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    /**
     * Mở project với kiểm tra password
     */
    async openProject(project, projectManager) {
        if (!project) return;
        
        this.currentProject = project;
        
        // Nếu project không cần password, vào thẳng
        if (!this.requiresPassword(project)) {
            console.log('🔓 Project không cần mật khẩu:', project.name);
            this.enterProject(project.id, projectManager);
            return;
        }
        
        // Check xem đã có password chưa
        const hasPassword = await this.hasProjectPassword(project.id);
        
        if (!hasPassword) {
            // Chưa có password -> setup password mới
            this.showPasswordSetup(project, projectManager);
        } else {
            // Đã có password -> yêu cầu nhập
            this.showPasswordVerify(project, projectManager);
        }
    }
    
    /**
     * Hiển thị modal setup password
     */
    showPasswordSetup(project, projectManager) {
        const modal = document.getElementById('projectPasswordModal');
        const title = document.getElementById('passwordModalTitle');
        const info = document.getElementById('passwordInfo');
        
        if (!modal || !title || !info) {
            console.error('Modal elements not found');
            return;
        }
        
        // Reset to pattern input state
        this.showPatternInputState();
        
        title.textContent = `Thiết lập mật khẩu cho: ${project.name}`;
        info.textContent = 'Vẽ mẫu hình để đặt mật khẩu (ít nhất 4 điểm, sẽ xác nhận 2 lần)';
        info.style.color = '#cbd5e1';
        
        modal.classList.add('active');
        
        // Initialize pattern lock
        setTimeout(() => {
            this.initPatternLock('setup', project, projectManager);
        }, 100);
    }
    
    /**
     * Hiển thị modal verify password
     */
    showPasswordVerify(project, projectManager) {
        const modal = document.getElementById('projectPasswordModal');
        const title = document.getElementById('passwordModalTitle');
        const info = document.getElementById('passwordInfo');
        
        if (!modal || !title || !info) {
            console.error('Modal elements not found');
            return;
        }
        
        // Reset to pattern input state
        this.showPatternInputState();
        
        title.textContent = `Mở khóa`;
        info.textContent = 'Vẽ mẫu hình để mở khóa project';
        info.style.color = '#cbd5e1';
        
        modal.classList.add('active');
        
        // Initialize pattern lock
        setTimeout(() => {
            this.initPatternLock('verify', project, projectManager);
        }, 100);
    }
    
    /**
     * Khởi tạo pattern lock
     */
    initPatternLock(mode, project, projectManager) {
        if (!this.PatternLockClass) {
            console.error('PatternLock class not provided');
            return;
        }
        
        const canvas = document.getElementById('projectPatternCanvas');
        if (!canvas) {
            console.error('Pattern canvas not found');
            return;
        }
        
        // Tạo pattern lock mới
        if (this.patternLock) {
            this.patternLock.reset();
        }
        
        this.patternLock = new this.PatternLockClass('projectPatternCanvas', {
            onComplete: null
        });
        
        if (mode === 'setup') {
            this.handleSetupMode(project, projectManager);
        } else if (mode === 'verify') {
            this.handleVerifyMode(project, projectManager);
        }
    }
    
    /**
     * Xử lý setup mode
     */
    handleSetupMode(project, projectManager) {
        let firstPattern = null;
        const info = document.getElementById('passwordInfo');
        
        this.patternLock.onPatternComplete((pattern) => {
            // Convert array to string for comparison
            const patternString = JSON.stringify(pattern);
            
            if (pattern.length < 4) {
                info.textContent = '❌ Mẫu hình phải có ít nhất 4 điểm!';
                info.style.color = '#f56565';
                this.patternLock.showError();
                setTimeout(() => {
                    this.patternLock.reset();
                    info.textContent = 'Vẽ mẫu hình để đặt mật khẩu (ít nhất 4 điểm, sẽ xác nhận 2 lần)';
                    info.style.color = '#718096';
                }, 1500);
                return;
            }
            
            if (!firstPattern) {
                // Lần đầu
                firstPattern = patternString;
                this.patternLock.showSuccess();
                setTimeout(() => {
                    this.patternLock.reset();
                    info.textContent = '✓ Vẽ lại mẫu hình để xác nhận';
                    info.style.color = '#48bb78';
                }, 500);
            } else {
                // Lần xác nhận
                if (patternString === firstPattern) {
                    // Khớp -> lưu password
                    this.patternLock.showSuccess();
                    
                    // Show loading state
                    setTimeout(() => {
                        this.showLoadingState();
                    }, 800);
                    
                    // Save to MongoDB
                    setTimeout(async () => {
                        await this.saveProjectPassword(project.id, patternString);
                        this.showSuccessState(project, projectManager);
                    }, 1000);
                } else {
                    // Không khớp
                    info.textContent = '❌ Mẫu hình không khớp! Thử lại từ đầu.';
                    info.style.color = '#f56565';
                    this.patternLock.showError();
                    
                    setTimeout(() => {
                        firstPattern = null;
                        this.patternLock.reset();
                        info.textContent = 'Vẽ mẫu hình để đặt mật khẩu (ít nhất 4 điểm, sẽ xác nhận 2 lần)';
                        info.style.color = '#718096';
                    }, 1500);
                }
            }
        });
    }
    
    /**
     * Xử lý verify mode
     */
    handleVerifyMode(project, projectManager) {
        const info = document.getElementById('passwordInfo');
        
        this.patternLock.onPatternComplete(async (pattern) => {
            // Convert array to string for verification
            const patternString = JSON.stringify(pattern);
            
            // Verify with server
            const isValid = await this.verifyProjectPassword(project.id, pattern);
            
            if (isValid) {
                // Đúng password
                this.patternLock.showSuccess();
                info.textContent = '✓ Mở khóa thành công!';
                info.style.color = '#48bb78';
                
                setTimeout(() => {
                    this.closePasswordModal();
                    this.enterProject(project.id, projectManager);
                }, 800);
            } else {
                // Sai password
                this.patternLock.showError();
                info.textContent = '❌ Mật khẩu không đúng!';
                info.style.color = '#f56565';
                
                setTimeout(() => {
                    this.patternLock.reset();
                    info.textContent = 'Vẽ mẫu hình để mở khóa project';
                    info.style.color = '#718096';
                }, 1500);
            }
        });
    }
    
    /**
     * Lưu password của project vào MongoDB
     */
    async saveProjectPassword(projectId, pattern) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pattern })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('Failed to save password:', data.error);
                throw new Error(data.error);
            }
            
            console.log('✅ Password saved to MongoDB');
            return true;
        } catch (error) {
            console.error('Error saving password:', error);
            // Fallback to localStorage if API fails
            const key = `project_password_${projectId}`;
            localStorage.setItem(key, pattern);
            console.log('⚠️ Fallback: Saved to localStorage');
            return false;
        }
    }
    
    /**
     * Kiểm tra project có password hay không
     */
    async hasProjectPassword(projectId) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/password`);
            const data = await response.json();
            
            if (data.success) {
                return data.data.hasPassword;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking password:', error);
            // Fallback to localStorage if API fails
            const key = `project_password_${projectId}`;
            return localStorage.getItem(key) !== null;
        }
    }
    
    /**
     * Verify password với server
     */
    async verifyProjectPassword(projectId, pattern) {
        try {
            console.log('🔐 Verifying password for project:', projectId);
            console.log('   Pattern to verify:', pattern);
            console.log('   Pattern type:', typeof pattern);
            
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/verify-pattern`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pattern })
            });
            
            const data = await response.json();
            console.log('   Server response:', data);
            
            if (data.success) {
                console.log('   Verification result:', data.verified);
                return data.verified;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error verifying password:', error);
            // Fallback to localStorage if API fails
            const key = `project_password_${projectId}`;
            const savedPattern = localStorage.getItem(key);
            return savedPattern && JSON.stringify(pattern) === savedPattern;
        }
    }
    
    /**
     * Xóa password của project từ MongoDB
     */
    async removeProjectPassword(projectId) {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/password`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('Failed to remove password:', data.error);
                throw new Error(data.error);
            }
            
            console.log('✅ Password removed from MongoDB');
            return true;
        } catch (error) {
            console.error('Error removing password:', error);
            // Fallback to localStorage if API fails
            const key = `project_password_${projectId}`;
            localStorage.removeItem(key);
            console.log('⚠️ Fallback: Removed from localStorage');
            return false;
        }
    }
    
    /**
     * Đổi password của project
     */
    async changeProjectPassword(project, projectManager) {
        await this.removeProjectPassword(project.id);
        this.showPasswordSetup(project, projectManager);
    }
    
    /**
     * Đóng modal password
     */
    closePasswordModal() {
        const modal = document.getElementById('projectPasswordModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset states
        this.hideAllStates();
        
        if (this.patternLock) {
            this.patternLock.reset();
        }
    }
    
    /**
     * Hiển thị loading state
     */
    showLoadingState() {
        this.hideAllStates();
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('active');
        }
    }
    
    /**
     * Hiển thị success state
     */
    showSuccessState(project, projectManager) {
        this.hideAllStates();
        const successState = document.getElementById('successState');
        if (successState) {
            successState.classList.add('active');
            
            // Store project info for later use
            this.pendingProject = { project, projectManager };
            
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }
    
    /**
     * Ẩn tất cả states
     */
    hideAllStates() {
        const patternState = document.getElementById('patternInputState');
        const loadingState = document.getElementById('loadingState');
        const successState = document.getElementById('successState');
        
        if (patternState) patternState.style.display = 'flex';
        if (loadingState) loadingState.classList.remove('active');
        if (successState) successState.classList.remove('active');
    }
    
    /**
     * Reset về pattern input state
     */
    showPatternInputState() {
        this.hideAllStates();
        const patternState = document.getElementById('patternInputState');
        if (patternState) {
            patternState.style.display = 'flex';
        }
    }
    
    /**
     * Tiếp tục sau khi success
     */
    proceedAfterSuccess() {
        if (this.pendingProject) {
            const { project, projectManager } = this.pendingProject;
            this.closePasswordModal();
            this.enterProject(project.id, projectManager);
            this.pendingProject = null;
        }
    }
    
    /**
     * Vào project
     */
    enterProject(projectId, projectManager) {
        if (this.onUnlockSuccess) {
            this.onUnlockSuccess(projectId, projectManager);
        } else {
            // Default behavior
            projectManager.setCurrentProject(projectId).then(() => {
                window.location.href = 'index.html';
            });
        }
    }
    
    /**
     * Hiển thị notification
     */
    showNotification(message, type = 'info') {
        // Nếu có hàm showNotification global, dùng nó
        if (window.showNotification) {
            window.showNotification('Thông báo', message);
            return;
        }
        
        // Fallback: dùng alert
        alert(message);
    }
    
    /**
     * Tạo HTML cho modal password
     */
    static createPasswordModal() {
        return `
            <!-- Project Password Modal -->
            <div class="modal" id="projectPasswordModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title" id="passwordModalTitle">Mở khóa Project</h2>
                        <button class="modal-close" onclick="window.projectUnlock?.closePasswordModal()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>

                    <div class="pattern-lock-container">
                        <canvas id="projectPatternCanvas" class="pattern-canvas" width="300" height="300"></canvas>
                        <div class="pattern-info" id="passwordInfo">
                            Vẽ mẫu hình để mở khóa
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

export default ProjectUnlockManager;
