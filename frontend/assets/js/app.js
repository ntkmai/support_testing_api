// Main Application Module
import { config } from './config-mongodb.js';
import { FileExplorer } from './file-explorer.js';
import { MarkdownViewer } from './markdown-viewer.js';
import { APITester } from './api-tester.js';
import { UIComponents } from './ui-components.js';

class App {
    constructor() {
        this.fileExplorer = new FileExplorer();
        this.markdownViewer = new MarkdownViewer();
        this.apiTester = new APITester();
        this.currentTab = 'markdown';
    }

    // Initialize application
    async init() {

        // Initialize config from MongoDB
        await config.init();

        // Initialize modules
        await this.fileExplorer.init();
        await this.apiTester.init();

        // Setup event handlers
        this.setupEventHandlers();

        // Setup config UI
        this.setupConfigUI();

        // Setup theme toggle
        this.setupThemeToggle();

        // Setup proxy settings
        this.setupProxySettings();

        // Setup auth settings
        this.setupAuthSettings();

        // Setup general settings
        this.setupGeneralSettings();

        // Setup environment variables UI
        this.setupEnvironmentVarsUI();

        // Setup Christmas snowfall effect (December only)
        this.setupChristmasSnowfall();

        // Setup music player and musical notes
        this.setupMusicPlayer();

        // Don't load any file by default - let user choose folder first
        // User will see folder cards on initial load

        // Expose globally for onclick handlers
        window.app = this;
        window.apiTester = this.apiTester;
        window.fileExplorer = this.fileExplorer;

    }

    // Setup event handlers
    setupEventHandlers() {
        // Tab switching handlers
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const tabs = ['markdown', 'api', 'settings'];
                this.switchTab(tabs[index]);
            });
        });

        // File selection handler
        this.fileExplorer.onFileSelect((file) => {
            if (file.type === 'md') {
                // Switch to markdown tab and load file
                this.switchTab('markdown');
                // Small delay to ensure tab is switched before loading
                setTimeout(() => {
                    this.markdownViewer.loadFile(file.path, file.name);
                }, 100);
            } else if (file.type === 'json') {
                // Switch to API tab first and wait for DOM to be fully visible
                this.switchTab('api');
                
                // Use requestAnimationFrame to ensure tab is rendered
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.apiTester.loadTestData(file.path);
                    });
                });
            } else if (file.type === 'http') {
                this.switchTab('api');
                UIComponents.showNotification(`📄 Đã chọn: ${file.name}`, 'info');
            }
        });
        
        // Folder selection handler
        this.fileExplorer.onFolderSelect((folderPath, files) => {
            this.apiTester.setFolder(folderPath, files);
        });

        // Config change handler
        config.onChange((key, value) => {
            if (key === 'baseUrl') {
                UIComponents.showNotification(`🔧 Base URL đã thay đổi: ${value}`, 'success');
                // Update API tester if needed
                if (this.apiTester.currentRequest) {
                    this.apiTester.renderRequestDetails();
                }
            } else if (key === 'proxy') {
                // Re-render request details when proxy settings change
                if (this.apiTester.currentRequest) {
                    this.apiTester.renderRequestDetails();
                }
            }
        });
    }

    // Setup config UI
    setupConfigUI() {
        const input = document.getElementById('baseUrlInput');

        if (input) {
            // Set current value from config
            const currentBaseUrl = config.getBaseUrl();
            input.value = currentBaseUrl;
            
            // Also sync with settings input
            const settingsInput = document.getElementById('settingsBaseUrl');
            if (settingsInput) {
                settingsInput.value = currentBaseUrl;
            }

            let validationTimeout;

            // Auto-validate and save on input change
            input.addEventListener('input', () => {
                clearTimeout(validationTimeout);
                
                // Remove all validation classes while typing
                input.classList.remove('validating', 'valid', 'invalid');
                
                validationTimeout = setTimeout(async () => {
                    const newUrl = input.value.trim();
                    if (!newUrl) {
                        input.classList.remove('validating', 'valid', 'invalid');
                        return;
                    }

                    // Show validating state
                    input.classList.add('validating');

                    // Validate URL format
                    try {
                        new URL(newUrl);
                    } catch (e) {
                        input.classList.remove('validating');
                        input.classList.add('invalid');
                        UIComponents.showNotification('❌ URL không đúng định dạng', 'error');
                        setTimeout(() => input.classList.remove('invalid'), 3000);
                        return;
                    }

                    // Test health endpoint
                    const isValid = await this.validateHealthEndpoint(newUrl);
                    input.classList.remove('validating');
                    
                    if (isValid) {
                        input.classList.add('valid');
                        config.saveBaseUrl(newUrl);
                        
                        // Sync with settings tab input
                        const settingsInput = document.getElementById('settingsBaseUrl');
                        if (settingsInput) {
                            settingsInput.value = newUrl;
                        }
                        
                        UIComponents.showNotification('✅ Đã lưu Base URL', 'success');
                        setTimeout(() => input.classList.remove('valid'), 3000);
                    } else {
                        input.classList.add('invalid');
                        UIComponents.showNotification('❌ Không kết nối được api/health', 'error');
                        setTimeout(() => input.classList.remove('invalid'), 3000);
                    }
                }, 800); // Wait 800ms after user stops typing
            });
        }
    }

    // Validate health endpoint
    async validateHealthEndpoint(baseUrl) {
        try {
            const url = baseUrl + '/api/health';
            const proxyUrl = config.isProxyEnabled() ? config.getProxyUrl() : '';
            const finalUrl = proxyUrl + url;

            const response = await fetch(finalUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Setup theme toggle
    setupThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return;

        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Toggle button handler
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            UIComponents.showNotification(
                `🎨 Đã chuyển sang giao diện ${newTheme === 'dark' ? 'tối' : 'sáng'}`,
                'info'
            );
        });

        // Pet toggle
        this.setupPetToggle();

        // Sidebar toggle
        const sidebarToggleBtn = document.getElementById('sidebarToggle');
        if (sidebarToggleBtn) {
            // Load saved sidebar state
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                this.toggleSidebar(false);
            }

            sidebarToggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    // Setup pet toggle and animation
    setupPetToggle() {
        const petToggleBtn = document.getElementById('petToggle');
        const pet = document.getElementById('pet');
        const petImg = pet?.querySelector('img');

        if (!petToggleBtn || !pet || !petImg) return;

        let petEnabled = localStorage.getItem('petEnabled') === 'true';
        let animationFrame;
        let state = 'walking-right'; // walking-right, walking-left, climbing, falling, dragging, throwing
        let direction = 'right';
        let posX = -60;
        let posY = 20;
        let velocityY = 0;
        let velocityX = 0;
        let rotation = 0; // Góc xoay khi ném
        const gravity = 0.5;
        const climbSpeed = 2;
        const walkSpeed = 3;
        const bounce = 0.7; // Độ nảy khi chạm tường (70% vận tốc)
        const friction = 0.98; // Lực ma sát
        const spinSpeed = 20; // Tốc độ xoay (degrees per frame)

        // Drag & drop variables
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let lastTime = 0;

        const updatePet = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            if (state === 'walking-right') {
                posX += walkSpeed;
                posX = Math.min(posX, screenWidth - 50);
                pet.style.left = posX + 'px';
                pet.style.bottom = posY + 'px';
                if (!pet.classList.contains('walking-right')) {
                    pet.className = 'pet walking-right';
                    petImg.style.transform = ''; // Reset transform for walking
                }

                if (posX >= screenWidth - 50) {
                    state = 'climbing-right';
                    pet.className = 'pet climbing-right';
                    petImg.style.transform = ''; // Reset to let CSS handle rotation
                }
            } else if (state === 'walking-left') {
                posX -= walkSpeed;
                posX = Math.max(posX, 0);
                pet.style.left = posX + 'px';
                pet.style.bottom = posY + 'px';
                if (!pet.classList.contains('walking-left')) {
                    pet.className = 'pet walking-left';
                    petImg.style.transform = ''; // Reset transform for walking
                }

                if (posX <= 0) {
                    state = 'climbing-left';
                    pet.className = 'pet climbing-left';
                    petImg.style.transform = ''; // Reset to let CSS handle rotation
                }
            } else if (state === 'climbing-right' || state === 'climbing-left') {
                posY += climbSpeed;
                posX = Math.max(0, Math.min(posX, screenWidth - 50));
                pet.style.left = posX + 'px';
                pet.style.bottom = posY + 'px';

                if (posY >= screenHeight - 70) {
                    state = 'falling';
                    velocityY = 0;
                    pet.className = 'pet falling';
                    petImg.style.transform = ''; // Reset transform for falling
                }
            } else if (state === 'falling') {
                velocityY += gravity;
                posY -= velocityY;
                posX = Math.max(0, Math.min(posX, screenWidth - 50));
                pet.style.left = posX + 'px';
                pet.style.bottom = posY + 'px';
                pet.className = 'pet falling';

                if (posY <= 20) {
                    posY = 20;
                    velocityY = 0;
                    petImg.src = '/assets/images/pet-run.gif';
                    petImg.style.transform = '';
                    if (posX < screenWidth / 2) {
                        state = 'walking-right';
                    } else {
                        state = 'walking-left';
                    }
                }
            } else if (state === 'throwing') {
                velocityY -= gravity;
                velocityX *= friction;
                velocityY *= friction;

                posX += velocityX;
                posY += velocityY;

                // Luôn xoay nhanh khi đang throwing
                const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                // Xoay 40 độ/frame (≈6-7 vòng/giây), tăng thêm khi tốc độ cao
                rotation += 40 + (speed * 3); // Xoay tròn liên tục nhiều vòng

                if (posX <= 0) {
                    posX = 0;
                    velocityX = Math.abs(velocityX) * bounce;
                } else if (posX >= screenWidth - 50) {
                    posX = screenWidth - 50;
                    velocityX = -Math.abs(velocityX) * bounce;
                }

                if (posY >= screenHeight - 70) {
                    posY = screenHeight - 70;
                    velocityY = -Math.abs(velocityY) * bounce;
                }

                if (posY <= 20) {
                    posY = 20;
                    velocityY = Math.abs(velocityY) * bounce;
                    
                    if (Math.abs(velocityY) < 2 && Math.abs(velocityX) < 1) {
                        velocityY = 0;
                        velocityX = 0;
                        rotation = 0; // Reset rotation
                        petImg.src = '/assets/images/pet-run.gif';
                        petImg.style.transform = '';
                        if (posX < screenWidth / 2) {
                            state = 'walking-right';
                        } else {
                            state = 'walking-left';
                        }
                    }
                }

                pet.style.left = posX + 'px';
                pet.style.bottom = posY + 'px';
                
                // Sử dụng rotation angle thay vì tính toán từ velocity
                petImg.style.transform = `rotate(${rotation}deg)`;
            }

            if (petEnabled && state !== 'dragging') {
                animationFrame = requestAnimationFrame(updatePet);
            }
        };

        const startPetAnimation = () => {
            petEnabled = true;
            pet.style.display = 'block';

            // Get button position to drop from there
            const btnRect = petToggleBtn.getBoundingClientRect();
            posX = btnRect.left + btnRect.width / 2 - 25; // Center pet on button
            posY = window.innerHeight - btnRect.bottom; // Convert to bottom coordinates

            // Start falling state with drag image
            state = 'falling';
            velocityY = 0;
            velocityX = 0;
            pet.className = 'pet falling';
            petImg.src = '/assets/images/pet-drag.png'; // Use drag image when falling from button

            updatePet();
        };

        const stopPetAnimation = () => {
            petEnabled = false;
            pet.style.display = 'none';
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };

        const onMouseDown = (e) => {
            if (!petEnabled) return;

            isDragging = true;
            state = 'dragging';

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            pet.className = 'pet';
            petImg.src = '/assets/images/pet-drag.png';
            petImg.style.transform = '';

            dragOffsetX = e.clientX - posX;
            dragOffsetY = e.clientY - (window.innerHeight - posY - pet.offsetHeight);

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            lastTime = Date.now();

            pet.style.cursor = 'grabbing';
            pet.style.pointerEvents = 'auto';

            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            // Always update last position before calculating new position
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTime;
            
            if (timeDiff > 0) {
                // Calculate velocity during drag
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                
                // Store velocity (smooth with previous velocity)
                velocityX = (deltaX / timeDiff) * 16 * 0.8; // 80% strength
                velocityY = -(deltaY / timeDiff) * 16 * 0.8; // Invert Y
            }

            posX = e.clientX - dragOffsetX;
            const mouseBottomY = window.innerHeight - e.clientY + dragOffsetY;
            posY = mouseBottomY;

            posX = Math.max(0, Math.min(posX, window.innerWidth - 50));
            posY = Math.max(20, Math.min(posY, window.innerHeight - 70));

            pet.style.left = posX + 'px';
            pet.style.bottom = posY + 'px';

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            lastTime = currentTime;
        };

        const onMouseUp = (e) => {
            if (!isDragging) return;

            isDragging = false;

            // Check if we have enough velocity to throw
            const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            
            if (speed > 2) { // Lower threshold from 3 to 2
                // Throwing mode - pet will bounce around
                state = 'throwing';                rotation = 0; // Reset rotation để bắt đầu xoay từ 0                petImg.src = '/assets/images/pet-drag.png';
                pet.className = 'pet';
                UIComponents.showNotification(`😲 OMG cú ném hoang dã!!!`, 'info');
            } else {
                // Normal drop - just fall straight down
                state = 'falling';
                velocityY = 0;
                velocityX = 0;
                petImg.src = '/assets/images/pet-run.gif';
                petImg.style.transform = '';
                pet.className = 'pet falling';
            }

            pet.style.cursor = 'grab';

            if (petEnabled && !animationFrame) {
                updatePet();
            }
        };

        pet.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        pet.style.pointerEvents = 'auto';
        pet.style.cursor = 'grab';

        if (petEnabled) {
            startPetAnimation();
        }

        petToggleBtn.addEventListener('click', () => {
            petEnabled = !petEnabled;
            localStorage.setItem('petEnabled', petEnabled);
            
            if (petEnabled) {
                startPetAnimation();
                UIComponents.showNotification('🐾 Pet đã được bật!', 'success');
            } else {
                stopPetAnimation();
                UIComponents.showNotification('🐾 Pet đã được tắt!', 'info');
            }
        });
    }

    // Toggle sidebar visibility
    toggleSidebar(showNotification = true) {
        const sidebar = document.querySelector('.sidebar');
        const mainLayout = document.querySelector('.main-layout');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        if (!sidebar || !mainLayout) return;

        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Show sidebar
            sidebar.classList.remove('collapsed');
            mainLayout.classList.remove('sidebar-collapsed');
            if (toggleBtn) {
                toggleBtn.classList.remove('collapsed');
                toggleBtn.textContent = '☰';
            }
            localStorage.setItem('sidebarCollapsed', 'false');
            if (showNotification) {
                UIComponents.showNotification('📂 Đã hiện menu', 'info');
            }
        } else {
            // Hide sidebar
            sidebar.classList.add('collapsed');
            mainLayout.classList.add('sidebar-collapsed');
            if (toggleBtn) {
                toggleBtn.classList.add('collapsed');
                toggleBtn.textContent = '»';
            }
            localStorage.setItem('sidebarCollapsed', 'true');
            if (showNotification) {
                UIComponents.showNotification('📂 Đã ẩn menu', 'info');
            }
        }
    }

    // Setup proxy settings
    setupProxySettings() {
        const enableProxyCheckbox = document.getElementById('enableProxy');
        const proxyUrlInput = document.getElementById('proxyUrl');
        const saveProxyBtn = document.getElementById('saveProxySettings');
        const testProxyBtn = document.getElementById('testProxy');

        if (!enableProxyCheckbox || !proxyUrlInput || !saveProxyBtn) return;

        // Load saved settings
        enableProxyCheckbox.checked = config.isProxyEnabled();
        const savedUrl = config.getProxyUrl();
        proxyUrlInput.value = savedUrl || 'https://cors-anywhere.herokuapp.com/';
        proxyUrlInput.disabled = !enableProxyCheckbox.checked;

        // Enable/disable inputs based on checkbox
        enableProxyCheckbox.addEventListener('change', (e) => {
            proxyUrlInput.disabled = !e.target.checked;
        });

        // Save proxy settings
        saveProxyBtn.addEventListener('click', () => {
            const enabled = enableProxyCheckbox.checked;
            const proxyUrl = proxyUrlInput.value.trim();

            if (enabled && !proxyUrl) {
                UIComponents.showNotification('⚠️ Vui lòng nhập Proxy URL', 'warning');
                return;
            }

            config.saveProxySettings(enabled, proxyUrl);
            
            const message = enabled 
                ? `✅ Đã bật CORS Proxy`
                : '✅ Đã tắt CORS Proxy';
            
            UIComponents.showNotification(message, 'success');
        });

        // Test proxy
        if (testProxyBtn) {
            testProxyBtn.addEventListener('click', async () => {
                const enabled = enableProxyCheckbox.checked;
                const proxyUrl = proxyUrlInput.value.trim();

                if (!enabled) {
                    UIComponents.showNotification('⚠️ Proxy chưa được bật', 'warning');
                    return;
                }

                if (!proxyUrl) {
                    UIComponents.showNotification('⚠️ Vui lòng nhập Proxy URL', 'warning');
                    return;
                }

                UIComponents.showNotification('🧪 Đang test proxy...', 'info');

                try {
                    // Test with a simple API
                    const testUrl = `${proxyUrl}${config.getBaseUrl()}/api/health`;
                    const response = await fetch(testUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        UIComponents.showNotification('✅ Proxy hoạt động tốt!', 'success');
                    } else {
                        UIComponents.showNotification(`⚠️ Proxy trả về status: ${response.status}`, 'warning');
                    }
                } catch (error) {
                    UIComponents.showNotification('❌ Lỗi kết nối proxy: ' + error.message, 'error');
                }
            });
        }
    }

    // Setup auth settings
    setupAuthSettings() {
        const authTypeSelect = document.getElementById('authType');
        const tokenPathInput = document.getElementById('tokenPath');
        const currentTokenTextarea = document.getElementById('currentToken');
        const saveAuthBtn = document.getElementById('saveAuthSettings');
        const clearTokenBtn = document.getElementById('clearToken');
        const customHeadersTextarea = document.getElementById('customHeaders');
        const saveCustomHeadersBtn = document.getElementById('saveCustomHeaders');

        if (!authTypeSelect || !tokenPathInput) return;

        // Load saved settings
        authTypeSelect.value = config.config.authType;
        tokenPathInput.value = config.config.tokenPath;
        currentTokenTextarea.value = config.getAuthToken();
        customHeadersTextarea.value = JSON.stringify(config.config.customHeaders, null, 2);

        // Update current token display when token changes
        config.onChange((key, value) => {
            if (key === 'authToken' && currentTokenTextarea) {
                currentTokenTextarea.value = value || '';
            }
        });

        // Save auth settings
        if (saveAuthBtn) {
            saveAuthBtn.addEventListener('click', () => {
                const authType = authTypeSelect.value;
                const tokenPath = tokenPathInput.value.trim();

                if (!tokenPath) {
                    UIComponents.showNotification('⚠️ Vui lòng nhập Token Path', 'warning');
                    return;
                }

                config.saveAuthSettings(authType, tokenPath);
                UIComponents.showNotification('✅ Đã lưu cấu hình Authentication', 'success');
            });
        }

        // Clear token
        if (clearTokenBtn) {
            clearTokenBtn.addEventListener('click', () => {
                config.clearAuthToken();
                currentTokenTextarea.value = '';
                UIComponents.showNotification('❌️ Đã xóa token', 'info');
            });
        }

        // Save custom headers
        if (saveCustomHeadersBtn && customHeadersTextarea) {
            saveCustomHeadersBtn.addEventListener('click', () => {
                try {
                    const headers = JSON.parse(customHeadersTextarea.value || '{}');
                    config.saveCustomHeaders(headers);
                    UIComponents.showNotification('✅ Đã lưu Custom Headers', 'success');
                } catch (error) {
                    UIComponents.showNotification('❌ JSON không hợp lệ: ' + error.message, 'error');
                }
            });
        }
    }

    // Setup general settings (Base URL & API Prefix)
    setupGeneralSettings() {
        const baseUrlInput = document.getElementById('settingsBaseUrl');
        const apiPrefixInput = document.getElementById('settingsApiPrefix');
        const loadingDelayInput = document.getElementById('settingsLoadingDelay');
        const saveSettingsBtn = document.getElementById('saveSettings');

        if (!baseUrlInput || !saveSettingsBtn) return;

        // Load saved settings
        baseUrlInput.value = config.getBaseUrl();
        if (apiPrefixInput) {
            apiPrefixInput.value = config.getApiPrefix();
        }
        if (loadingDelayInput) {
            loadingDelayInput.value = config.getLoadingDelay();
        }

        // Save settings
        saveSettingsBtn.addEventListener('click', () => {
            const baseUrl = baseUrlInput.value.trim();
            const apiPrefix = apiPrefixInput ? apiPrefixInput.value.trim() : '';
            const loadingDelay = loadingDelayInput ? parseInt(loadingDelayInput.value, 10) : 800;

            if (!baseUrl) {
                UIComponents.showNotification('⚠️ Vui lòng nhập Base URL', 'warning');
                return;
            }

            // Validate loading delay
            if (loadingDelayInput && (isNaN(loadingDelay) || loadingDelay < 0 || loadingDelay > 5000)) {
                UIComponents.showNotification('⚠️ Loading Delay phải từ 0-5000ms', 'warning');
                return;
            }

            config.saveBaseUrl(baseUrl);
            config.saveApiPrefix(apiPrefix);
            if (loadingDelayInput) {
                config.saveLoadingDelay(loadingDelay);
            }
            
            // Sync with header input
            const headerInput = document.getElementById('baseUrlInput');
            if (headerInput) {
                headerInput.value = baseUrl;
            }
            
            UIComponents.showNotification('✅ Đã lưu cấu hình', 'success');
        });

        // Enter key handler
        baseUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSettingsBtn.click();
            }
        });

        if (apiPrefixInput) {
            apiPrefixInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveSettingsBtn.click();
                }
            });
        }

        if (loadingDelayInput) {
            loadingDelayInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveSettingsBtn.click();
                }
            });
        }
    }

    // Setup environment variables UI
    setupEnvironmentVarsUI() {
        const refreshBtn = document.getElementById('refreshEnvVars');
        const clearBtn = document.getElementById('clearEnvVars');
        const envVarsList = document.getElementById('envVarsList');

        // Render environment variables list
        const renderEnvVars = () => {
            const envVars = config.environmentVars;
            const keys = Object.keys(envVars);

            if (keys.length === 0) {
                envVarsList.innerHTML = `
                    <div style="color: var(--text-secondary); text-align: center; padding: 20px;">
                        Chưa có biến môi trường nào được lưu
                    </div>
                `;
                return;
            }

            envVarsList.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${keys.map(key => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 4px;">
                            <div style="flex: 1;">
                                <strong style="color: var(--primary-color); font-family: monospace;">{${key}}</strong>
                                <span style="color: var(--text-secondary); margin-left: 12px; font-family: monospace; font-size: 13px;">${envVars[key]}</span>
                            </div>
                            <button 
                                class="btn-delete-env-var" 
                                data-key="${key}"
                                style="background: none; border: none; color: var(--error-color); cursor: pointer; padding: 4px 8px; font-size: 16px;"
                                title="Xóa biến này"
                            >❌️</button>
                        </div>
                    `).join('')}
                </div>
            `;

            // Add delete handlers
            envVarsList.querySelectorAll('.btn-delete-env-var').forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.dataset.key;
                    const newVars = { ...config.environmentVars };
                    delete newVars[key];
                    config.saveEnvironmentVars(newVars);
                    UIComponents.showNotification(`❌️ Đã xóa biến: {${key}}`, 'success');
                    renderEnvVars();
                });
            });
        };

        // Initial render
        renderEnvVars();

        // Refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                renderEnvVars();
                UIComponents.showNotification('🔄 Đã refresh danh sách biến môi trường', 'info');
            });
        }

        // Clear all button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (Object.keys(config.environmentVars).length === 0) {
                    UIComponents.showNotification('⚠️ Không có biến môi trường nào để xóa', 'warning');
                    return;
                }

                if (confirm('⚠️ Bạn có chắc muốn xóa TẤT CẢ biến môi trường?')) {
                    config.clearEnvironmentVars();
                    renderEnvVars();
                    UIComponents.showNotification('❌️ Đã xóa tất cả biến môi trường', 'success');
                }
            });
        }

        // Listen to config changes to auto-refresh the list
        config.onChange((key, value) => {
            if (key === 'environmentVars') {
                renderEnvVars();
            }
        });
    }

    // Set theme
    setTheme(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-lucide="sun"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        } else {
            document.body.setAttribute('data-theme', 'dark');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-lucide="moon"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }

    // Switch tab
    switchTab(tabName) {
        this.currentTab = tabName;

        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Remove active from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tabPane = document.getElementById(tabName + 'Tab');
        if (tabPane) {
            tabPane.classList.add('active');
        } else {
            console.warn(`  ❌ Tab pane not found: ${tabName}Tab`);
        }

        // Activate corresponding button based on index
        const tabIndex = ['markdown', 'api', 'settings'].indexOf(tabName);
        if (tabIndex >= 0) {
            const buttons = document.querySelectorAll('.tab-btn');
            if (buttons[tabIndex]) {
                buttons[tabIndex].classList.add('active');
            }
        }
    }

    // Setup Christmas snowfall effect (December only)
    setupChristmasSnowfall() {
        const currentMonth = new Date().getMonth(); // 0 = January, 11 = December

        // Only show snowfall in December (month 11)
        if (currentMonth !== 11) return;

        const snowflakeCount = 50;
        const snowflakes = ['❄', '❅', '❆'];
        const container = document.body;

        // Create snowflakes
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];

            // Random horizontal position
            snowflake.style.left = Math.random() * 100 + '%';

            // Random animation duration (5-15 seconds)
            const duration = 5 + Math.random() * 10;
            snowflake.style.animationDuration = duration + 's';

            // Random delay to stagger the start
            const delay = Math.random() * 5;
            snowflake.style.animationDelay = delay + 's';

            container.appendChild(snowflake);

            // Remove snowflake after animation completes (once)
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, (duration + delay) * 1000);
        }
    }

    // Setup music player and musical notes animation
    setupMusicPlayer() {
        const musicToggleBtn = document.getElementById('musicToggle');
        const audio = document.getElementById('backgroundMusic');
        const notesContainer = document.getElementById('musicalNotesContainer');
        const dancingFrogContainer = document.getElementById('dancingFrogContainer');

        if (!musicToggleBtn || !audio || !notesContainer) return;

        // Always start with music disabled (browsers don't allow autoplay)
        let musicEnabled = false;
        localStorage.setItem('musicEnabled', 'false');
        let notesInterval = null;

        const musicalNotes = ['♩', '♪', '♫', '♬'];

        const createMusicalNote = () => {
            const note = document.createElement('div');
            note.className = 'musical-note';
            note.textContent = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];

            // Random horizontal position
            note.style.left = Math.random() * 100 + '%';

            // Random animation duration (8-12 seconds for slower fall)
            const duration = 8 + Math.random() * 4;
            note.style.animationDuration = duration + 's';

            // Random colors
            const colors = ['#60a5fa', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
            note.style.color = colors[Math.floor(Math.random() * colors.length)];

            notesContainer.appendChild(note);

            // Remove note after animation completes
            setTimeout(() => {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            }, duration * 1000);
        };

        const startMusicalNotes = () => {
            // Create notes every 2 seconds (thưa hơn snowfall)
            notesInterval = setInterval(createMusicalNote, 2000);
        };

        const stopMusicalNotes = () => {
            if (notesInterval) {
                clearInterval(notesInterval);
                notesInterval = null;
            }
            // Clear all existing notes
            notesContainer.innerHTML = '';
        };

        const startMusic = () => {
            musicEnabled = true;
            localStorage.setItem('musicEnabled', 'true');

            // Play audio
            audio.play().catch(err => {
                console.error('Cannot play audio:', err);
                UIComponents.showNotification('❌ Không thể phát nhạc', 'error');
            });

            // Start musical notes animation
            startMusicalNotes();

            // Show dancing frog
            if (dancingFrogContainer) {
                dancingFrogContainer.style.display = 'block';
            }

            // Change icon to pause
            musicToggleBtn.innerHTML = '<i data-lucide="pause"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            UIComponents.showNotification('🎵 Đã bật nhạc!', 'success');
        };

        const stopMusic = () => {
            musicEnabled = false;
            localStorage.setItem('musicEnabled', 'false');

            // Pause audio
            audio.pause();

            // Stop musical notes animation
            stopMusicalNotes();

            // Hide dancing frog
            if (dancingFrogContainer) {
                dancingFrogContainer.style.display = 'none';
            }

            // Change icon to play
            musicToggleBtn.innerHTML = '<i data-lucide="play"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            UIComponents.showNotification('🎵 Đã tắt nhạc!', 'info');
        };

        // Toggle music on button click
        musicToggleBtn.addEventListener('click', () => {
            if (musicEnabled) {
                stopMusic();
            } else {
                startMusic();
            }
        });
    }

    // Export current markdown
    exportMarkdown() {
        this.markdownViewer.exportAsHTML();
    }

    // Search in files
    searchFiles(query) {
        const results = this.fileExplorer.searchFiles(query);
        // TODO: Display search results
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Add event listener for Execute button in API tab
    const apiTab = document.getElementById('apiTab');
    if (apiTab) {
        apiTab.addEventListener('click', (e) => {
            // Check if clicked element or its parent is the execute button
            const button = e.target.closest('#executeRequestBtn');
            if (button) {
                if (window.apiTester) {
                    window.apiTester.executeRequest();
                }
            }
        });
    }
});

export default App;
