// Configuration Management Module
export class ConfigManager {
    constructor() {
        this.config = {
            baseUrl: this.loadBaseUrl(),
            apiTimeout: 30000,
            maxRetries: 3,
            useProxy: this.loadProxyEnabled(),
            proxyUrl: this.loadProxyUrl(),
            authType: this.loadAuthType(),
            tokenPath: this.loadTokenPath(),
            customHeaders: this.loadCustomHeaders()
        };
        
        this.listeners = [];
    }

    // Load auth type
    loadAuthType() {
        return localStorage.getItem('authType') || 'Bearer';
    }

    // Load token path for auto-extraction
    loadTokenPath() {
        return localStorage.getItem('tokenPath') || 'data.access_token';
    }

    // Load custom headers
    loadCustomHeaders() {
        const saved = localStorage.getItem('customHeaders');
        return saved ? JSON.parse(saved) : {};
    }

    // Save auth settings
    saveAuthSettings(authType, tokenPath) {
        this.config.authType = authType;
        this.config.tokenPath = tokenPath;
        localStorage.setItem('authType', authType);
        localStorage.setItem('tokenPath', tokenPath);
        this.notifyListeners('auth', { authType, tokenPath });
    }

    // Save custom headers
    saveCustomHeaders(headers) {
        this.config.customHeaders = headers;
        localStorage.setItem('customHeaders', JSON.stringify(headers));
        this.notifyListeners('customHeaders', headers);
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    // Save auth token
    saveAuthToken(token) {
        localStorage.setItem('authToken', token);
        this.notifyListeners('authToken', token);
    }

    // Clear auth token
    clearAuthToken() {
        localStorage.removeItem('authToken');
        this.notifyListeners('authToken', null);
    }

    // Get authorization header value
    getAuthHeader() {
        const token = this.getAuthToken();
        if (!token) return null;
        
        switch (this.config.authType) {
            case 'Bearer':
                return `Bearer ${token}`;
            case 'Basic':
                return `Basic ${token}`;
            case 'Token':
                return `Token ${token}`;
            case 'Custom':
                return token;
            default:
                return `Bearer ${token}`;
        }
    }

    // Get all headers (auth + custom)
    getAllHeaders() {
        const headers = { ...this.config.customHeaders };
        
        const authHeader = this.getAuthHeader();
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        
        return headers;
    }

    // Load base URL from localStorage or use default
    loadBaseUrl() {
        return localStorage.getItem('baseUrl') || 'http://localhost:3000';
    }

    // Load proxy enabled state
    loadProxyEnabled() {
        return localStorage.getItem('useProxy') === 'true';
    }

    // Load proxy URL
    loadProxyUrl() {
        return localStorage.getItem('proxyUrl') || 'https://cors-anywhere.herokuapp.com/';
    }

    // Save base URL to localStorage
    saveBaseUrl(url) {
        // Remove trailing slash
        url = url.replace(/\/$/, '');
        this.config.baseUrl = url;
        localStorage.setItem('baseUrl', url);
        this.notifyListeners('baseUrl', url);
    }

    // Save proxy settings
    saveProxySettings(enabled, proxyUrl) {
        this.config.useProxy = enabled;
        this.config.proxyUrl = proxyUrl.replace(/\/$/, '') + '/';
        localStorage.setItem('useProxy', enabled.toString());
        localStorage.setItem('proxyUrl', this.config.proxyUrl);
        this.notifyListeners('proxy', { enabled, proxyUrl: this.config.proxyUrl });
    }

    // Get proxy enabled state
    isProxyEnabled() {
        return this.config.useProxy;
    }

    // Get proxy URL
    getProxyUrl() {
        return this.config.proxyUrl;
    }

    // Get current base URL
    getBaseUrl() {
        return this.config.baseUrl;
    }

    // Get full API URL
    getApiUrl(endpoint) {
        // Remove leading and trailing slashes
        endpoint = endpoint.replace(/^\/+|\/+$/g, '');
        let baseUrl = this.config.baseUrl.replace(/\/+$/, '');
        
        // Build full URL
        let fullUrl = `${baseUrl}/${endpoint}`;
        
        // If proxy is enabled, prepend proxy URL
        if (this.config.useProxy) {
            const proxyUrl = this.config.proxyUrl;
            const proxiedUrl = `${proxyUrl}${fullUrl}`;
            console.log('🔄 Proxy URL:', proxiedUrl);
            console.log('📍 Target:', fullUrl);
            return proxiedUrl;
        }
        
        console.log('📡 Direct URL:', fullUrl);
        return fullUrl;
    }

    // Subscribe to config changes
    onChange(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners(key, value) {
        this.listeners.forEach(callback => callback(key, value));
    }

    // Export configuration
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    // Import configuration
    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.config = { ...this.config, ...imported };
            if (imported.baseUrl) {
                this.saveBaseUrl(imported.baseUrl);
            }
            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }
}

// Create global config instance
export const config = new ConfigManager();
