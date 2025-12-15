// Main Application Module
import { config } from './config.js';
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
                // Load API test data from JSON file
                this.switchTab('api');
                this.apiTester.loadTestData(file.path);
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
            // Set current value
            input.value = config.getBaseUrl();

            let validationTimeout;

            // Auto-validate and save on input change
            input.addEventListener('input', () => {
                clearTimeout(validationTimeout);
                
                validationTimeout = setTimeout(async () => {
                    const newUrl = input.value.trim();
                    if (!newUrl) return;

                    // Validate URL format
                    try {
                        new URL(newUrl);
                    } catch (e) {
                        UIComponents.showNotification('❌ URL không đúng định dạng', 'error');
                        return;
                    }

                    // Test health endpoint
                    const isValid = await this.validateHealthEndpoint(newUrl);
                    if (isValid) {
                        config.saveBaseUrl(newUrl);
                        UIComponents.showNotification('✅ Đã lưu Base URL', 'success');
                    } else {
                        UIComponents.showNotification('❌ Không kết nối được api/health', 'error');
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

        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);

        // Toggle button handler
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            UIComponents.showNotification(
                `🎨 Đã chuyển sang giao diện ${newTheme === 'dark' ? 'tối' : 'sáng'}`,
                'info'
            );
        });

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
                UIComponents.showNotification('🗑️ Đã xóa token', 'info');
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

    // Setup general settings (Base URL)
    setupGeneralSettings() {
        const baseUrlInput = document.getElementById('settingsBaseUrl');
        const saveSettingsBtn = document.getElementById('saveSettings');

        if (!baseUrlInput || !saveSettingsBtn) return;

        // Load saved settings
        baseUrlInput.value = config.getBaseUrl();

        // Save settings
        saveSettingsBtn.addEventListener('click', () => {
            const baseUrl = baseUrlInput.value.trim();

            if (!baseUrl) {
                UIComponents.showNotification('⚠️ Vui lòng nhập Base URL', 'warning');
                return;
            }

            config.saveBaseUrl(baseUrl);
            UIComponents.showNotification('✅ Đã lưu cấu hình', 'success');
        });

        // Enter key handler
        baseUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSettingsBtn.click();
            }
        });
    }

    // Set theme
    setTheme(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
            if (toggleBtn) toggleBtn.textContent = '☀️';
        } else {
            document.body.removeAttribute('data-theme');
            if (toggleBtn) toggleBtn.textContent = '🌙';
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
            if (e.target && e.target.id === 'executeRequestBtn') {
                if (window.apiTester) window.apiTester.executeRequest();
            }
        });
    }
});

export default App;
