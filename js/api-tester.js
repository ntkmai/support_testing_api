// API Tester Module
import { config } from './config.js';
import { UIComponents } from './ui-components.js';

export class APITester {
    constructor() {
        this.requests = [];
        this.currentRequest = null;
        this.history = [];
        this.currentFolder = null;
        this.testDataPath = null;
    }

    // Initialize API tester
    async init() {
        // Don't load any data initially, wait for folder selection
        this.renderRequestList();
        this.setupSubTabs();
    }

    // Load test data from specific JSON file path
    async loadTestData(filePath = null) {
        // If no path provided, try to find JSON file in current folder
        if (!filePath && this.currentFolder) {
            // Auto-detect JSON file in folder
            return;
        }
        
        if (!filePath) {
            // No folder selected, show empty state
            this.requests = [];
            this.renderRequestList();
            return;
        }
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Cannot load test data');

            const data = await response.json();
            this.testDataPath = filePath;
            
            // Check if data has requests array, if not create from template
            if (data.requests && Array.isArray(data.requests)) {
                this.requests = data.requests;
            } else {
                // Create requests from base_url if available
                this.requests = this.getDefaultRequests(data.base_url || 'http://localhost:3000');
            }

            UIComponents.showNotification(`🧪 Đã tải ${this.requests.length} API tests`, 'success');
            this.renderRequestList();
        } catch (error) {
            console.error('Error loading test data:', error);
            this.requests = [];
            this.renderRequestList();
            UIComponents.showNotification('❌ Không thể tải test data', 'error');
        }
    }

    // Set current folder and load its test data
    async setFolder(folderPath, files = []) {
        this.currentFolder = folderPath;
        
        // Auto-load first JSON file in the folder
        const jsonFile = files.find(f => f.type === 'json');
        if (jsonFile) {
            await this.loadTestData(jsonFile.path);
        } else {
            // Clear current requests if no JSON file found
            this.requests = [];
            this.currentRequest = null;
            this.renderRequestList();
        }

    }

    // Render template selector UI (from JSON templates)
    renderTemplateSelector() {
        const container = document.getElementById('requestDetails');
        
        if (!container || !this.currentRequest || !this.currentRequest.templates) {
            return;
        }

        const templates = this.currentRequest.templates;
        if (templates.length === 0) {
            return;
        }
        
        const selectorHTML = `
            <div class="template-selector">
                <div class="template-header">
                    <h4>📋 Quick Templates</h4>
                    <span class="template-count">${templates.length} variations</span>
                </div>
                <div class="template-buttons">
                    ${templates.map((t, idx) => `
                        <button class="template-btn" data-template-idx="${idx}">
                            <span class="template-name">${t.name}</span>
                            ${t.description ? `<span class="template-desc">${t.description}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert at top of request details
        const existingSelector = container.querySelector('.template-selector');
        if (existingSelector) {
            existingSelector.remove();
        }

        container.insertAdjacentHTML('afterbegin', selectorHTML);

        // Add event listeners to buttons
        container.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.templateIdx);
                if (!isNaN(idx) && idx >= 0 && idx < templates.length) {
                    this.applyTemplate(templates[idx]);
                }
            });
        });
    }

    // Apply template to current request (from JSON template)
    applyTemplate(template) {
        if (!this.currentRequest || !template) return;


        // Update body if template has body
        if (template.body) {
            this.currentRequest.body = { ...template.body };
        }

        // Update headers if template has headers
        if (template.headers) {
            this.currentRequest.headers = { ...this.currentRequest.headers, ...template.headers };
        }

        // Re-render the details to show updated values
        this.renderRequestDetails();

        // Auto-switch to Request tab
        this.switchApiSubTab('request');

        UIComponents.showNotification(
            `✅ Đã áp dụng template: ${template.name}`, 
            'success'
        );
    }

    // Get default requests if JSON file not available
    getDefaultRequests(baseUrl = 'http://localhost:3000') {
        return [
            {
                name: 'Get JAR Ratio',
                method: 'GET',
                endpoint: '/api/jar-ratio',
                description: 'Lấy tỷ lệ JAR hiện tại'
            },
            {
                name: 'Update JAR Ratio',
                method: 'POST',
                endpoint: '/api/jar-ratio',
                body: { ratio: 0.75 },
                description: 'Cập nhật tỷ lệ JAR mới'
            },
            {
                name: 'Get Config',
                method: 'GET',
                endpoint: '/api/config',
                description: 'Lấy cấu hình hệ thống'
            }
        ];
    }

    // Render request list
    renderRequestList() {
        const container = document.getElementById('requestList');
        if (!container) return;

        container.innerHTML = this.requests.map((req, index) => `
            <div class="request-item" data-index="${index}">
                <div class="request-header">
                    <span class="method-badge ${req.method.toLowerCase()}">${req.method}</span>
                    <span class="request-name">${req.name}</span>
                </div>
                <div class="request-endpoint">${req.endpoint}</div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.request-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectRequest(index);
            });
        });
    }

    // Select a request
    selectRequest(index) {
        this.currentRequest = this.requests[index];

        // Update active state
        document.querySelectorAll('.request-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        this.renderRequestDetails();
    }

    // Setup sub tabs for Request/Response
    setupSubTabs() {
        const subTabButtons = document.querySelectorAll('.api-sub-tab-btn');
        subTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchApiSubTab(tabName);
            });
        });
    }

    // Switch API sub tab
    switchApiSubTab(tabName) {
        // Update buttons
        document.querySelectorAll('.api-sub-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panes
        document.querySelectorAll('.api-sub-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        const targetPane = tabName === 'request' ? 
            document.getElementById('requestPane') : 
            document.getElementById('responsePane');
        
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    // Render description with collapsible sections
    renderDescription(description) {
        if (!description) {
            return '<div class="detail-section"><label>Mô tả:</label><p>Không có mô tả</p></div>';
        }

        // Parse description into sections (split by double line breaks or section markers)
        const sections = this.parseDescriptionSections(description);
        
        if (sections.length <= 1) {
            // Simple description without sections
            return `
                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>Mô tả</label>
                    </div>
                    <div class="section-content">
                        <p>${description}</p>
                    </div>
                </div>
            `;
        }

        // Multiple sections
        return sections.map((section, index) => `
            <div class="detail-section collapsible-section">
                <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                    <span class="toggle-icon">▼</span>
                    <label>${section.title || 'Mô tả ' + (index + 1)}</label>
                </div>
                <div class="section-content">
                    <p>${section.content}</p>
                </div>
            </div>
        `).join('');
    }

    // Parse description into sections
    parseDescriptionSections(description) {
        const sections = [];
        
        // Try to split by common section patterns
        // Pattern 1: "## Title" or "### Title" (Markdown headers)
        if (description.includes('##')) {
            const parts = description.split(/(?=##)/g);
            parts.forEach(part => {
                const match = part.match(/^###+\s*(.+?)\n([\s\S]*)/);
                if (match) {
                    sections.push({
                        title: match[1].trim(),
                        content: match[2].trim()
                    });
                }
            });
        }
        // Pattern 2: "Title:" followed by content
        else if (description.includes(':') && description.split(':').length > 2) {
            const lines = description.split('\n');
            let currentSection = null;
            
            lines.forEach(line => {
                const colonMatch = line.match(/^([^:]+):\s*(.*)/);
                if (colonMatch && colonMatch[1].length < 50) {
                    if (currentSection) sections.push(currentSection);
                    currentSection = {
                        title: colonMatch[1].trim(),
                        content: colonMatch[2].trim()
                    };
                } else if (currentSection && line.trim()) {
                    currentSection.content += '\n' + line.trim();
                }
            });
            if (currentSection) sections.push(currentSection);
        }
        // Pattern 3: Double line break sections
        else if (description.includes('\n\n')) {
            const parts = description.split('\n\n').filter(p => p.trim());
            if (parts.length > 1) {
                parts.forEach((part, index) => {
                    const firstLine = part.split('\n')[0];
                    sections.push({
                        title: firstLine.length < 60 ? firstLine : `Phần ${index + 1}`,
                        content: part
                    });
                });
            } else {
                sections.push({ title: 'Mô tả', content: description });
            }
        }
        else {
            sections.push({ title: 'Mô tả', content: description });
        }

        return sections.length > 0 ? sections : [{ title: 'Mô tả', content: description }];
    }

    // Toggle section visibility
    toggleSection(headerElement) {
        const section = headerElement.closest('.collapsible-section');
        const content = section.querySelector('.section-content');
        const icon = headerElement.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
        }
    }

    // Render request details
    renderRequestDetails() {
        if (!this.currentRequest) return;

        const container = document.getElementById('requestDetails');
        if (!container) return;

        const fullUrl = config.getApiUrl(this.currentRequest.endpoint);
        const descriptionHTML = this.renderDescription(this.currentRequest.description);

        container.innerHTML = `
            <div class="request-details">
                <div class="detail-header">
                    <h3>${this.currentRequest.name}</h3>
                </div>

                ${descriptionHTML}

                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>Method</label>
                    </div>
                    <div class="section-content">
                        <span class="method-badge ${this.currentRequest.method.toLowerCase()}">${this.currentRequest.method}</span>
                    </div>
                </div>

                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>URL</label>
                    </div>
                    <div class="section-content">
                        <input type="text" class="form-control" value="${fullUrl}" readonly>
                    </div>
                </div>

                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>Endpoint</label>
                    </div>
                    <div class="section-content">
                        <input type="text" id="requestEndpoint" class="form-control" value="${this.currentRequest.endpoint}">
                    </div>
                </div>

                ${this.currentRequest.headers ? `
                    <div class="detail-section collapsible-section">
                        <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                            <span class="toggle-icon">▼</span>
                            <label>Headers</label>
                        </div>
                        <div class="section-content">
                            <textarea id="requestHeaders" class="form-control" rows="4">${JSON.stringify(this.currentRequest.headers, null, 2)}</textarea>
                        </div>
                    </div>
                ` : ''}

                ${this.currentRequest.body ? `
                    <div class="detail-section collapsible-section">
                        <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                            <span class="toggle-icon">▼</span>
                            <label>Request Body</label>
                        </div>
                        <div class="section-content">
                            <textarea id="requestBody" class="form-control" rows="6">${JSON.stringify(this.currentRequest.body, null, 2)}</textarea>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Render template selector if request has templates
        if (this.currentRequest.templates && this.currentRequest.templates.length > 0) {
            this.renderTemplateSelector();
        } else {
        }
    }

    // Execute current request
    async executeRequest() {
        if (!this.currentRequest) {
            UIComponents.showNotification('⚠️ Chưa chọn request', 'warning');
            return;
        }

        const responseContainer = document.getElementById('responseContainer');
        if (!responseContainer) return;

        // Get updated values
        const endpoint = document.getElementById('requestEndpoint')?.value || this.currentRequest.endpoint;
        const url = config.getApiUrl(endpoint);

        // Prepare request options
        const allHeaders = config.getAllHeaders();
        
        const options = {
            method: this.currentRequest.method,
            headers: {
                'Content-Type': 'application/json',
                ...this.currentRequest.headers, // Request-specific headers first
                ...allHeaders  // Global auth headers override request headers
            }
        };
        

        // Add body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(this.currentRequest.method)) {
            const bodyTextarea = document.getElementById('requestBody');
            if (bodyTextarea) {
                try {
                    options.body = bodyTextarea.value;
                } catch (error) {
                    UIComponents.showNotification('❌ Invalid JSON body', 'error');
                    return;
                }
            }
        }

        // Show loading
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Đang gửi request...</p></div>';

        const startTime = Date.now();

        try {
            const response = await fetch(url, options);
            const duration = Date.now() - startTime;

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Render response
            this.renderResponse({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                duration: duration,
                url: url,
                method: this.currentRequest.method
            });

            // Auto-extract token if this is a login/auth request
            if (response.ok && typeof responseData === 'object') {
                this.autoExtractToken(responseData);
            }

            // Add to history
            this.addToHistory({
                request: this.currentRequest,
                response: {
                    status: response.status,
                    data: responseData,
                    duration: duration
                },
                timestamp: new Date()
            });

            const statusType = response.ok ? 'success' : 'error';
            UIComponents.showNotification(
                `${response.ok ? '✅' : '❌'} ${response.status} - ${UIComponents.formatDuration(duration)}`,
                statusType
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            this.renderError(error, duration, url);
            UIComponents.showNotification(`❌ Request failed: ${error.message}`, 'error');
        }
    }

    // Render response
    renderResponse(response) {
        const container = document.getElementById('responseContainer');
        if (!container) return;

        const statusClass = response.status >= 200 && response.status < 300 ? 'success' : 
                           response.status >= 400 ? 'error' : 'warning';

        container.innerHTML = `
            <div class="response-header">
                <h4>📥 Response</h4>
                <button class="btn btn-sm" onclick="window.apiTester.clearResponse()">🗑️ Clear</button>
            </div>

            <div class="response-meta">
                <div class="response-status ${statusClass}">
                    <strong>Status:</strong> ${response.status} ${response.statusText}
                </div>
                <div class="response-time">
                    <strong>Time:</strong> ${UIComponents.formatDuration(response.duration)}
                </div>
            </div>

            <div class="response-tabs">
                <button class="tab-btn active" onclick="window.apiTester.switchResponseTab('body')">Body</button>
                <button class="tab-btn" onclick="window.apiTester.switchResponseTab('headers')">Headers</button>
            </div>

            <div id="responseBody" class="response-tab-content active">
                <button class="copy-btn" onclick="window.apiTester.copyResponse()">📋 Copy</button>
                <pre><code>${typeof response.data === 'object' ? 
                    UIComponents.formatJSON(response.data) : 
                    response.data
                }</code></pre>
            </div>

            <div id="responseHeaders" class="response-tab-content">
                <pre><code>${UIComponents.formatJSON(response.headers)}</code></pre>
            </div>
        `;

        container.style.display = 'block';
        
        // Auto-switch to Response tab
        this.switchApiSubTab('response');
    }

    // Render error
    renderError(error, duration, url) {
        const container = document.getElementById('responseContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="response-header">
                <h4>❌ Error</h4>
                <button class="btn btn-sm" onclick="window.apiTester.clearResponse()">🗑️ Clear</button>
            </div>

            <div class="response-meta error">
                <div class="response-status error">
                    <strong>❌ Error</strong>
                </div>
                <div class="response-time">
                    <strong>Time:</strong> ${UIComponents.formatDuration(duration)}
                </div>
            </div>

            <div class="error-details">
                <h4>Error Message:</h4>
                <p>${error.message}</p>
                
                <h4>URL:</h4>
                <p>${url}</p>

                <h4>Possible Causes:</h4>
                <ul>
                    <li>Server không chạy tại địa chỉ: ${config.getBaseUrl()}</li>
                    <li>CORS policy block request</li>
                    <li>Network error hoặc timeout</li>
                    <li>Endpoint không tồn tại</li>
                </ul>

                <h4>Suggestions:</h4>
                <ul>
                    <li>Kiểm tra server có đang chạy không</li>
                    <li>Xác nhận lại Base URL trong Settings</li>
                    <li>Kiểm tra CORS configuration trên server</li>
                </ul>
            </div>
        `;

        container.style.display = 'block';
        
        // Auto-switch to Response tab
        this.switchApiSubTab('response');
    }

    // Switch response tab
    switchResponseTab(tab) {
        document.querySelectorAll('.response-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.response-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        event.target.classList.add('active');
        document.getElementById(`response${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
    }

    // Copy response
    async copyResponse() {
        const responseBody = document.querySelector('#responseBody code');
        if (responseBody) {
            await UIComponents.copyToClipboard(responseBody.textContent);
        }
    }

    // Clear response
    clearResponse() {
        const container = document.getElementById('responseContainer');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
        // Switch back to Request tab
        this.switchApiSubTab('request');
    }

    // Auto-extract token from response
    autoExtractToken(responseData) {
        try {
            const tokenPath = config.config.tokenPath || 'data.access_token';
            
            const token = this.getNestedValue(responseData, tokenPath);
            
            if (token) {
                config.saveAuthToken(token);
                UIComponents.showNotification(`🔑 Đã lưu token tự động!`, 'success');
                
                // Update UI if settings tab is open
                const tokenDisplay = document.getElementById('currentToken');
                if (tokenDisplay) {
                    tokenDisplay.value = token;
                }
            } else {
            }
        } catch (error) {
        }
    }

    // Get nested value from object using path (e.g., 'data.access_token')
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Add to history
    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
    }

    // Get history
    getHistory() {
        return this.history;
    }
}
