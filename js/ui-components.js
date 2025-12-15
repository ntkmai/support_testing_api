// UI Components Module
export class UIComponents {
    // Show notification
    static showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        `;

        container.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Create loading spinner
    static showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Đang tải...</p>
            </div>
        `;
    }

    // Create empty state
    static showEmptyState(containerId, title, message, icon = '📭') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Create error state
    static showError(containerId, title, message, suggestion = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>${title}</h3>
                <p>${message}</p>
                ${suggestion ? `<p style="margin-top: 10px; color: var(--text-secondary); font-size: 14px;">${suggestion}</p>` : ''}
            </div>
        `;
    }

    // Format JSON with syntax highlighting
    static formatJSON(obj) {
        const json = JSON.stringify(obj, null, 2);
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: null/g, ': <span class="json-null">null</span>');
    }

    // Create modal dialog
    static createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.class || ''}" onclick="${btn.onclick}">${btn.text}</button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Format duration
    static formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('📋 Đã copy vào clipboard', 'success');
            return true;
        } catch (error) {
            this.showNotification('❌ Không thể copy: ' + error.message, 'error');
            return false;
        }
    }
}
