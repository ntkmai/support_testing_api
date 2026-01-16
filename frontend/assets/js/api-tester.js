// API Tester Module
import { config } from './config-mongodb.js';
import { UIComponents } from './ui-components.js';
import { APIService } from './api-service.js';

export class APITester {
    constructor() {
        this.requests = [];
        this.currentRequest = null;
        this.history = [];
        this.currentFolder = null;
        this.testDataPath = null;
        this.completedRequests = this.loadCompletedRequests();
    }

    // Load completed requests from localStorage
    loadCompletedRequests() {
        const saved = localStorage.getItem('completedRequests');
        return saved ? JSON.parse(saved) : {};
    }

    // Save completed requests to localStorage
    saveCompletedRequests() {
        localStorage.setItem('completedRequests', JSON.stringify(this.completedRequests));
    }

    // Get request ID (unique identifier)
    getRequestId(request) {
        return `${request.method}-${request.endpoint}`;
    }

    // Normalize endpoint - convert UUIDs and numeric IDs to placeholders
    normalizeEndpoint(endpoint) {
        if (!endpoint) return endpoint;
        
        // Replace UUIDs with {id}
        let normalized = endpoint.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{id}');
        
        // Replace numeric IDs at the end or in path segments
        normalized = normalized.replace(/\/\d+(?:\/|$)/g, (match) => {
            return match.replace(/\d+/, '{id}');
        });
        
        return normalized;
    }

    // Get normalized API name for saving/loading response samples
    getApiName(request) {
        const normalizedEndpoint = this.normalizeEndpoint(request.endpoint);
        return `${request.method}-${normalizedEndpoint}`;
    }

    // Check if request is completed
    isRequestCompleted(request) {
        const id = this.getRequestId(request);
        return this.completedRequests[id] === true;
    }

    // Toggle request completed status
    toggleRequestCompleted(request, index) {
        const id = this.getRequestId(request);
        if (this.completedRequests[id]) {
            delete this.completedRequests[id];
        } else {
            this.completedRequests[id] = true;
        }
        this.saveCompletedRequests();
        
        // Update UI without full re-render
        this.updateRequestItemUI(index, request);
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
            // Add cache-busting to prevent stale data
            const cacheBuster = filePath.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            const response = await fetch(filePath + cacheBuster);
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
            
            // UIComponents.showNotification(`🧪 Đã tải ${this.requests.length} API tests`, 'success');
            this.renderRequestList();
            
            // Auto-select first request if available (with small delay to ensure render completes)
            if (this.requests.length > 0) {
                setTimeout(() => {
                    this.selectRequest(0);
                }, 50);
            }
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

        // Update endpoint if template has endpoint
        if (template.endpoint) {
            this.currentRequest.endpoint = template.endpoint;
        }

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
        if (!container) {
            console.warn('❌ requestList container not found');
            return;
        }

        // Clear empty state from request details when we have requests
        if (this.requests.length > 0) {
            const requestDetails = document.getElementById('requestDetails');
            if (requestDetails) {
                const emptyState = requestDetails.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
            }
        }

        // No sorting - keep original order, just mark completed ones
        container.innerHTML = this.requests.map((req, index) => {
            const completed = this.isRequestCompleted(req);
            return `
                <div class="request-item ${completed ? 'completed' : ''}" data-index="${index}">
                    <div class="request-checkbox" data-index="${index}" title="${completed ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}">
                        <input type="checkbox" class="request-checkbox-input" data-index="${index}" ${completed ? 'checked' : ''}>
                    </div>
                    <div class="request-content">
                        <div class="request-header">
                            <span class="method-badge ${req.method.toLowerCase()}">${req.method}</span>
                            <span class="request-name">${req.name}</span>
                        </div>
                        <div class="request-endpoint">${req.endpoint}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers for request items (entire item is clickable)
        container.querySelectorAll('.request-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on checkbox
                if (e.target.classList.contains('request-checkbox-input') || 
                    e.target.closest('.request-checkbox')) {
                    return;
                }
                const index = parseInt(item.dataset.index);
                this.selectRequest(index);
            });
        });

        // Add click handlers for checkboxes
        container.querySelectorAll('.request-checkbox-input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const index = parseInt(checkbox.dataset.index);
                const request = this.requests[index];
                this.toggleRequestCompleted(request, index);
            });
        });
    }

    // Update single request item UI without full re-render
    updateRequestItemUI(index, request) {
        const item = document.querySelector(`.request-item[data-index="${index}"]`);
        if (!item) return;
        
        const completed = this.isRequestCompleted(request);
        const checkbox = item.querySelector('.request-checkbox-input');
        
        // Update checkbox state
        if (checkbox) {
            checkbox.checked = completed;
        }
        
        // Update item classes
        if (completed) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
        
        // Update title
        const checkboxContainer = item.querySelector('.request-checkbox');
        if (checkboxContainer) {
            checkboxContainer.title = completed ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành';
        }
    }

    // Check if request uses multipart/form-data
    isMultipartRequest() {
        if (!this.currentRequest || !this.currentRequest.headers) return false;
        
        const contentType = this.currentRequest.headers['Content-Type'] || 
                           this.currentRequest.headers['content-type'];
        
        return contentType && contentType.includes('multipart/form-data');
    }

    // Select a request
    selectRequest(index) {
        this.currentRequest = this.requests[index];

        // Update active state - compare by data-index, not DOM position
        document.querySelectorAll('.request-item').forEach((item) => {
            const itemIndex = parseInt(item.dataset.index);
            item.classList.toggle('active', itemIndex === index);
        });

        this.renderRequestDetails();
        
        // Clear previous response UI when selecting new request (don't delete from MongoDB)
        this.clearResponseUI();
        
        // Auto-switch to Request tab when selecting a request
        this.switchApiSubTab('request');
        
        // Check if multipart and update UI accordingly
        this.updateExecuteButton();
        if (this.isMultipartRequest()) {
            this.showMultipartWarning();
        }
    }

    // Update execute button state based on request type
    updateExecuteButton() {
        const executeBtn = document.getElementById('executeRequestBtn');
        if (!executeBtn) return;
        
        if (this.isMultipartRequest()) {
            executeBtn.disabled = true;
            executeBtn.style.opacity = '0.5';
            executeBtn.style.cursor = 'not-allowed';
            executeBtn.title = 'Cannot test multipart/form-data requests in this tool';
        } else {
            executeBtn.disabled = false;
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
            executeBtn.title = '';
        }
    }

    // Show warning for multipart requests in Response tab
    showMultipartWarning() {
        const responseContainer = document.getElementById('responseContainer');
        if (!responseContainer) return;
        
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">⚠️</div>
                <h3 style="color: var(--warning-color); margin-bottom: 15px;">Không hỗ trợ Multipart/Form-Data</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px; max-width: 500px; margin-left: auto; margin-right: auto;">
                    API này sử dụng <code>multipart/form-data</code> để upload file. 
                    Tool này không hỗ trợ kiểu request này.
                </p>
                <div style="background: var(--bg-secondary); padding: 20px; border-radius: 8px; margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <h4 style="margin-bottom: 12px; color: var(--primary-color);">Hướng dẫn test:</h4>
                    <p style="margin-bottom: 10px; font-size: 13px;"><strong>1. Sử dụng cURL:</strong></p>
                    <pre style="background: var(--bg-tertiary); padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">curl -X POST ${config.getBaseUrl()}${this.currentRequest.endpoint} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@/path/to/file.pdf"</pre>
                    <p style="margin: 15px 0 10px 0; font-size: 13px;"><strong>2. Sử dụng Postman:</strong></p>
                    <ul style="font-size: 13px; color: var(--text-secondary); margin-left: 20px;">
                        <li>Chọn method: ${this.currentRequest.method}</li>
                        <li>URL: ${config.getBaseUrl()}${this.currentRequest.endpoint}</li>
                        <li>Headers: Authorization: Bearer YOUR_TOKEN</li>
                        <li>Body > form-data > Key: file (type = File)</li>
                    </ul>
                </div>
            </div>
        `;
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
    async switchApiSubTab(tabName, skipLoadSample = false) {
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

        // Auto-load response sample when switching to response tab (unless told to skip)
        if (tabName === 'response' && !skipLoadSample) {
            await this.loadResponseSample();
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
            // Render markdown if marked is available
            const renderedContent = typeof marked !== 'undefined'
                ? marked.parse(description)
                : `<p>${description}</p>`;

            return `
                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>Mô tả</label>
                    </div>
                    <div class="section-content markdown-body">
                        ${renderedContent}
                    </div>
                </div>
            `;
        }

        // Multiple sections
        return sections.map((section, index) => {
            // Render markdown if marked is available
            const renderedContent = typeof marked !== 'undefined'
                ? marked.parse(section.content)
                : `<p>${section.content}</p>`;

            return `
                <div class="detail-section collapsible-section">
                    <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                        <span class="toggle-icon">▼</span>
                        <label>${section.title || 'Mô tả ' + (index + 1)}</label>
                    </div>
                    <div class="section-content markdown-body">
                        ${renderedContent}
                    </div>
                </div>
            `;
        }).join('');
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

    // Render request details with proxy badge if enabled
    renderUrlWithProxyBadge(fullUrl) {
        const proxyUrl = config.getProxyUrl();
        const useProxy = config.isProxyEnabled();
        
        if (useProxy && proxyUrl && fullUrl.startsWith(proxyUrl)) {
            // Remove proxy URL and show badge
            const actualUrl = fullUrl.replace(proxyUrl, '');
            return `
                <div style="display: flex; align-items: center;">
                    <span class="proxy-badge">use_proxy</span>
                    <input type="text" class="form-control" value="${actualUrl}" readonly style="flex: 1;">
                </div>
            `;
        }
        
        return `<input type="text" class="form-control" value="${fullUrl}" readonly>`;
    }

    // Extract path parameters from endpoint (e.g., {id}, {userId})
    getPathParameters(endpoint) {
        const regex = /\{([^}]+)\}/g;
        const params = [];
        let match;
        
        while ((match = regex.exec(endpoint)) !== null) {
            params.push(match[1]);
        }
        
        return params;
    }

    // Render path parameter inputs
    renderPathParameters(endpoint) {
        const params = this.getPathParameters(endpoint);
        
        if (params.length === 0) return '';
        
        return `
            <div class="detail-section collapsible-section">
                <div class="section-header" onclick="window.apiTester.toggleSection(this)">
                    <span class="toggle-icon">▼</span>
                    <label>Path Parameters <span style="font-size: 11px; color: var(--text-secondary); font-weight: normal;">(Auto-saved)</span></label>
                </div>
                <div class="section-content">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${params.map(param => {
                            const savedValue = config.getEnvVar(param);
                            return `
                                <div>
                                    <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block;">
                                        {${param}}
                                        ${savedValue ? '<span style="color: var(--success-color); margin-left: 5px;">✓</span>' : ''}
                                    </label>
                                    <input 
                                        type="text" 
                                        id="param-${param}" 
                                        class="form-control param-input" 
                                        data-param-name="${param}"
                                        placeholder="Enter ${param} value"
                                        value="${savedValue}"
                                        style="font-family: monospace;"
                                    >
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners for path parameters to auto-save and sync
    setupPathParameterListeners() {
        const paramInputs = document.querySelectorAll('.param-input');
        
        paramInputs.forEach(input => {
            // Save to environment variables on change
            input.addEventListener('input', (e) => {
                const paramName = e.target.dataset.paramName;
                const value = e.target.value;
                
                // Save to environment variables
                config.setEnvVar(paramName, value);
                
                // Sync all inputs with the same parameter name
                this.syncPathParameter(paramName, value);
            });
        });
    }

    // Sync all inputs with the same parameter name across the page
    syncPathParameter(paramName, value) {
        const allInputs = document.querySelectorAll(`[data-param-name="${paramName}"]`);
        allInputs.forEach(input => {
            if (input.value !== value) {
                input.value = value;
            }
        });
    }

    // Validate path parameters are filled
    validatePathParameters(endpoint) {
        const params = this.getPathParameters(endpoint);
        const missingParams = [];
        
        params.forEach(param => {
            const input = document.getElementById(`param-${param}`);
            if (!input || !input.value || input.value.trim() === '') {
                missingParams.push(param);
            }
        });
        
        return {
            valid: missingParams.length === 0,
            missingParams: missingParams
        };
    }

    // Replace path parameters in endpoint
    replacePathParameters(endpoint) {
        const params = this.getPathParameters(endpoint);
        let result = endpoint;
        
        params.forEach(param => {
            const input = document.getElementById(`param-${param}`);
            if (input && input.value) {
                result = result.replace(`{${param}}`, input.value);
            }
        });
        
        return result;
    }

    renderRequestDetails() {
        if (!this.currentRequest) return;

        const container = document.getElementById('requestDetails');
        if (!container) {
            console.warn('❌ requestDetails container not found');
            return;
        }


        const fullUrl = config.getApiUrl(this.currentRequest.endpoint);
        const descriptionHTML = this.renderDescription(this.currentRequest.description);

        container.innerHTML = `
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
                    ${this.renderUrlWithProxyBadge(fullUrl)}
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

                ${this.renderPathParameters(this.currentRequest.endpoint)}

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
        `;


        // Render template selector if request has templates
        if (this.currentRequest.templates && this.currentRequest.templates.length > 0) {
            this.renderTemplateSelector();
        } else {
        }

        // Setup event listeners for path parameters
        this.setupPathParameterListeners();
    }

    // Execute current request
    async executeRequest() {
        if (!this.currentRequest) {
            UIComponents.showNotification('⚠️ Chưa chọn request', 'warning');
            return;
        }

        // Prevent execution of multipart requests
        if (this.isMultipartRequest()) {
            UIComponents.showNotification('⚠️ Không thể test API multipart/form-data trong tool này', 'warning');
            this.showMultipartWarning();
            return;
        }

        const responseContainer = document.getElementById('responseContainer');
        if (!responseContainer) {
            return;
        }

        const executeBtn = document.getElementById('executeRequestBtn');

        // Get updated values
        let endpoint = document.getElementById('requestEndpoint')?.value || this.currentRequest.endpoint;

        // Validate path parameters before executing
        const validation = this.validatePathParameters(endpoint);

        if (!validation.valid) {
            const paramList = validation.missingParams.map(p => `{${p}}`).join(', ');
            UIComponents.showNotification(
                `⚠️ Vui lòng điền đầy đủ path parameters: ${paramList}`,
                'warning'
            );
            // Auto switch to Request tab to show the missing fields
            this.switchApiSubTab('request');
            // Highlight the first missing parameter input
            const firstMissingInput = document.getElementById(`param-${validation.missingParams[0]}`);
            if (firstMissingInput) {
                firstMissingInput.focus();
                firstMissingInput.style.border = '2px solid var(--error-color)';
                setTimeout(() => {
                    firstMissingInput.style.border = '';
                }, 2000);
            }
            return;
        }

        // Switch to Response tab immediately (skip loading sample since we'll have new data)
        this.switchApiSubTab('response', true);

        // Show loading in button
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.innerHTML = '<span class="btn-spinner"></span> Loading...';
        }

        // Replace path parameters if any
        endpoint = this.replacePathParameters(endpoint);

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

        // Show loading with rocket animation
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = `
            <div class="loading-spinner">
                <img src="/assets/images/rocket-loading.gif" alt="Loading..." style="width: 120px; height: 120px; margin-bottom: 20px;">
                <p style="font-size: 16px; color: var(--text-primary); font-weight: 500;">🚀 Đang gửi request...</p>
            </div>
        `;

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
            
            // Reset button state
            if (executeBtn) {
                executeBtn.disabled = false;
                executeBtn.innerHTML = '▶ Run now';
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            this.renderError(error, duration, url);
            UIComponents.showNotification(`❌ Request failed: ${error.message}`, 'error');

            // Reset button state
            if (executeBtn) {
                executeBtn.disabled = false;
                executeBtn.innerHTML = '▶ Run now';
            }
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
                <button class="btn btn-sm" onclick="window.apiTester.clearResponse()">❌️ Clear</button>
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
                <button class="save-sample-btn" onclick="window.apiTester.saveResponseSample()">💾 Save Sample</button>
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
        
        // Auto-switch to Response tab (skip loading sample since we just rendered new data)
        this.switchApiSubTab('response', true);
    }

    // Render error
    renderError(error, duration, url) {
        const container = document.getElementById('responseContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="response-header">
                <h4>❌ Error</h4>
                <button class="btn btn-sm" onclick="window.apiTester.clearResponse()">❌️ Clear</button>
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
        
        // Auto-switch to Response tab (skip loading sample since we just rendered error)
        this.switchApiSubTab('response', true);
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
    async clearResponse() {
        // Clear response from MongoDB if current request exists
        if (this.currentRequest) {
            const apiName = this.getApiName(this.currentRequest);
            try {
                await APIService.deleteResponseSample(apiName);
            } catch (error) {
                console.error('Error deleting response sample:', error);
            }
        }

        this.clearResponseUI();
    }

    // Clear response UI only (no MongoDB deletion)
    clearResponseUI() {
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

    // Save response sample to MongoDB
    async saveResponseSample() {
        if (!this.currentRequest) {
            UIComponents.showNotification('❌ Không có request nào đang được chọn', 'error');
            return;
        }

        // Get last response from history
        const lastEntry = this.history[0];
        if (!lastEntry || !lastEntry.response) {
            UIComponents.showNotification('❌ Không có response nào để lưu', 'error');
            return;
        }

        const apiName = this.getApiName(this.currentRequest);
        
        
        try {
            const success = await APIService.saveResponseSample(apiName, {
                response: lastEntry.response.data,
                statusCode: lastEntry.response.status,
                headers: lastEntry.response.headers || {}
            });

            if (success) {
                UIComponents.showNotification('💾 Đã lưu response sample vào MongoDB!', 'success');
            } else {
                console.error('❌ Failed to save response sample');
                UIComponents.showNotification('❌ Không thể lưu response sample', 'error');
            }
        } catch (error) {
            console.error('Error saving response sample:', error);
            UIComponents.showNotification('❌ Lỗi khi lưu response sample', 'error');
        }
    }

    // Load response sample from MongoDB
    async loadResponseSample() {
        if (!this.currentRequest) return;

        const apiName = this.getApiName(this.currentRequest);
        
        
        try {
            const sample = await APIService.getResponseSample(apiName);
            
            
            if (sample && sample.response) {
                // Render the saved sample
                this.renderResponse({
                    status: sample.statusCode,
                    statusText: 'Sample Response (từ MongoDB)',
                    data: sample.response,
                    headers: sample.headers || {},
                    duration: 0
                });
                
                UIComponents.showNotification('📦 Đã load response sample từ MongoDB', 'info');
            } else {
                // Show empty state when no sample exists
                const responseContainer = document.getElementById('responseContainer');
                if (responseContainer) {
                    responseContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i data-lucide="inbox" style="width: 48px; height: 48px;"></i></div>
                            <h3>Chưa có Response Sample</h3>
                            <p>Thực thi request và nhấn "💾 Save Sample" để lưu response</p>
                        </div>
                    `;
                    responseContainer.style.display = 'block';
                    lucide.createIcons();
                }
            }
        } catch (error) {
            console.error('Error loading response sample:', error);
            // Show error state
            const responseContainer = document.getElementById('responseContainer');
            if (responseContainer) {
                responseContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="alert-circle" style="width: 48px; height: 48px; color: var(--danger-color);"></i></div>
                        <h3>Lỗi khi load response</h3>
                        <p>Không thể tải response sample từ MongoDB</p>
                    </div>
                `;
                responseContainer.style.display = 'block';
                lucide.createIcons();
            }
        }
    }

    // Delete response sample from MongoDB
    async deleteResponseSample() {
        if (!this.currentRequest) {
            UIComponents.showNotification('⚠️ Vui lòng chọn request trước', 'warning');
            return;
        }

        const apiName = this.getApiName(this.currentRequest);
        
        // Confirm before delete
        if (!confirm(`Bạn có chắc muốn xóa response sample cho "${this.currentRequest.name}"?`)) {
            return;
        }

        try {
            const success = await APIService.deleteResponseSample(apiName);
            
            if (success) {
                UIComponents.showNotification('🗑️ Đã xóa response sample từ MongoDB', 'success');
                
                // Clear response display
                const responseContainer = document.getElementById('responseContainer');
                if (responseContainer) {
                    responseContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i data-lucide="inbox" style="width: 48px; height: 48px;"></i></div>
                            <h3>No Response</h3>
                            <p>Thực thi một request để xem response</p>
                        </div>
                    `;
                    lucide.createIcons();
                }
            } else {
                UIComponents.showNotification('⚠️ Không tìm thấy response sample để xóa', 'warning');
            }
        } catch (error) {
            console.error('Error deleting response sample:', error);
            UIComponents.showNotification('❌ Lỗi khi xóa response sample', 'error');
        }
    }
}
