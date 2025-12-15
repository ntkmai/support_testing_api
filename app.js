// Application State
const state = {
    currentFile: null,
    markdownFiles: [],
    testData: null
};

// Tab Management
function switchTab(tabName, event) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Remove active from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Activate clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Load Demo Files
function loadDemoFiles() {
    const demoFiles = [
        { name: 'JAR-RATIO-COMPLETE-TEST-GUIDE.md', icon: '📚', path: 'jar-ratio-testing/JAR-RATIO-COMPLETE-TEST-GUIDE.md' },
        { name: 'TEST-README.md', icon: '📖', path: 'jar-ratio-testing/TEST-README.md' },
        { name: 'QUICK-START-TEST.md', icon: '🚀', path: 'jar-ratio-testing/QUICK-START-TEST.md' },
        { name: 'TEST-FILES-SUMMARY.md', icon: '📋', path: 'jar-ratio-testing/TEST-FILES-SUMMARY.md' },
        { name: 'TEST-INDEX.md', icon: '📑', path: 'jar-ratio-testing/TEST-INDEX.md' },
        { name: 'README-TEST-JAR-RATIO.md', icon: '📘', path: 'jar-ratio-testing/README-TEST-JAR-RATIO.md' },
        { name: 'README.md', icon: '📄', path: 'jar-ratio-testing/README.md' }
    ];

    state.markdownFiles = demoFiles;

    const fileList = document.getElementById('fileList');
    fileList.innerHTML = demoFiles.map((file, index) => `
        <li class="file-item ${index === 0 ? 'active' : ''}" onclick="loadMarkdownFile('${file.path}', '${file.name}')">
            <span class="file-icon">${file.icon}</span>
            <span>${file.name}</span>
        </li>
    `).join('');

    // Load first file by default
    loadMarkdownFile(demoFiles[0].path, demoFiles[0].name);
    showNotification('✅ Đã tải ' + demoFiles.length + ' file Markdown', 'success');
}

// Load Markdown File
async function loadMarkdownFile(filePath, fileName) {
    state.currentFile = fileName;

    // Update active state in file list
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent.includes(fileName)) {
            item.classList.add('active');
        }
    });

    try {
        // Fetch the markdown file
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Không thể tải file: ' + fileName);
        }

        const markdownText = await response.text();

        // Parse and render markdown using marked.js
        const htmlContent = marked.parse(markdownText);

        const contentDiv = document.getElementById('markdownContent');
        contentDiv.innerHTML = htmlContent;

        showNotification('📖 Đã tải: ' + fileName, 'success');

    } catch (error) {
        console.error('Error loading markdown:', error);

        const contentDiv = document.getElementById('markdownContent');
        contentDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Không thể tải file</h3>
                <p>${error.message}</p>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 14px;">
                    <strong>Gợi ý:</strong> Hãy chạy một local server từ thư mục này:
                </p>
                <pre style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-top: 10px; text-align: left;">
npx http-server -p 8000
# hoặc
python -m http.server 8000
                </pre>
                <p style="margin-top: 10px; font-size: 14px;">
                    Sau đó mở: <code>http://localhost:8000</code>
                </p>
            </div>
        `;

        showNotification('❌ Lỗi: ' + error.message, 'error');
    }
}

// API Tester Functions
async function sendRequest() {
    const baseUrl = document.getElementById('baseUrl').value.trim();
    const endpoint = document.getElementById('endpoint').value.trim();
    const method = document.getElementById('method').value;
    const bodyText = document.getElementById('requestBody').value.trim();

    const responseArea = document.getElementById('responseArea');

    // Show loading
    responseArea.innerHTML = `
        <div class="empty-state">
            <div class="loading"></div>
            <p style="margin-top: 10px;">Đang gửi request...</p>
        </div>
    `;

    try {
        const url = baseUrl + endpoint;

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Add body for POST, PUT, PATCH
        if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText) {
            try {
                JSON.parse(bodyText); // Validate JSON
                options.body = bodyText;
            } catch (e) {
                throw new Error('Request Body không phải là JSON hợp lệ');
            }
        }

        const startTime = Date.now();
        const response = await fetch(url, options);
        const endTime = Date.now();

        let responseData;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        const statusClass = response.ok ? 'success' : 'error';
        const statusIcon = response.ok ? '✅' : '❌';

        responseArea.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-secondary); border-radius: 8px;">
                <strong>${statusIcon} Status:</strong>
                <span style="color: ${response.ok ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                    ${response.status} ${response.statusText}
                </span>
                <span style="float: right; color: var(--text-secondary);">⏱️ ${endTime - startTime}ms</span>
            </div>

            <div style="margin-bottom: 10px;">
                <strong>🔗 URL:</strong> <code style="font-size: 12px;">${url}</code>
            </div>

            <div>
                <strong>📥 Response:</strong>
                <pre style="margin-top: 10px; background: var(--bg-secondary); padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 400px;">${typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData}</pre>
            </div>
        `;

        showNotification(statusIcon + ' Request thành công!', statusClass);

    } catch (error) {
        responseArea.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Request thất bại</h3>
                <p style="color: var(--danger-color); margin-top: 10px;">${error.message}</p>
                <div style="text-align: left; margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 8px;">
                    <strong>💡 Gợi ý:</strong>
                    <ul style="margin-top: 10px; margin-left: 20px; line-height: 1.8;">
                        <li>Kiểm tra Base URL có đúng không</li>
                        <li>Kiểm tra API server đã chạy chưa</li>
                        <li>Kiểm tra CORS settings</li>
                        <li>Kiểm tra định dạng JSON của Request Body</li>
                    </ul>
                </div>
            </div>
        `;

        showNotification('❌ Lỗi: ' + error.message, 'error');
    }
}

// Load Demo Request
function loadDemoRequest() {
    document.getElementById('baseUrl').value = 'https://jsonplaceholder.typicode.com';
    document.getElementById('endpoint').value = '/posts/1';
    document.getElementById('method').value = 'GET';
    document.getElementById('requestBody').value = '';

    showNotification('📋 Đã tải demo request', 'info');
}

// Load Demo Test Data
function loadDemoData() {
    const demoData = {
        "testSuite": "JAR Ratio Testing",
        "version": "1.0.0",
        "testAccounts": [
            {
                "username": "admin",
                "password": "admin123",
                "role": "Admin",
                "permissions": ["read", "write", "delete"]
            },
            {
                "username": "user",
                "password": "user123",
                "role": "User",
                "permissions": ["read"]
            },
            {
                "username": "tester",
                "password": "test123",
                "role": "Tester",
                "permissions": ["read", "write"]
            }
        ],
        "testCases": [
            {
                "id": "TC001",
                "name": "Login with valid credentials",
                "status": "passed",
                "priority": "high"
            },
            {
                "id": "TC002",
                "name": "Create new JAR entry",
                "status": "passed",
                "priority": "high"
            },
            {
                "id": "TC003",
                "name": "Calculate JAR ratio",
                "status": "passed",
                "priority": "medium"
            },
            {
                "id": "TC004",
                "name": "Update existing entry",
                "status": "pending",
                "priority": "low"
            }
        ],
        "apiEndpoints": [
            "/api/auth/login",
            "/api/jar/create",
            "/api/jar/calculate",
            "/api/jar/list",
            "/api/jar/update/:id",
            "/api/jar/delete/:id"
        ],
        "config": {
            "baseUrl": "http://localhost:3000",
            "timeout": 5000,
            "retries": 3,
            "environment": "development"
        },
        "testResults": {
            "total": 15,
            "passed": 12,
            "failed": 2,
            "pending": 1,
            "successRate": "80%"
        }
    };

    state.testData = demoData;

    const testDataArea = document.getElementById('testDataArea');
    testDataArea.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">📊 Test Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600;">${demoData.testResults.total}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Total Tests</div>
                </div>
                <div style="background: var(--success-color); color: white; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600;">${demoData.testResults.passed}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Passed</div>
                </div>
                <div style="background: var(--danger-color); color: white; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600;">${demoData.testResults.failed}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Failed</div>
                </div>
                <div style="background: var(--warning-color); color: white; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 600;">${demoData.testResults.successRate}</div>
                    <div style="font-size: 14px; opacity: 0.9;">Success Rate</div>
                </div>
            </div>
        </div>

        <div>
            <h4 style="color: var(--text-primary); margin-bottom: 10px;">📋 Full Test Data (JSON)</h4>
            <pre style="background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; max-height: 500px;">${JSON.stringify(demoData, null, 2)}</pre>
        </div>
    `;

    showNotification('✅ Đã tải demo test data', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    const colors = {
        'success': 'var(--success-color)',
        'error': 'var(--danger-color)',
        'info': 'var(--primary-color)',
        'warning': 'var(--warning-color)'
    };

    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
        font-size: 14px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Test Tool Viewer initialized');
});
