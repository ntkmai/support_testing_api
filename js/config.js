// Configuration Management Module
export class ConfigManager {
    constructor() {
        this.config = {
            baseUrl: this.loadBaseUrl(),
            apiPrefix: this.loadApiPrefix(),
            apiTimeout: 30000,
            maxRetries: 3,
            useProxy: this.loadProxyEnabled(),
            proxyUrl: this.loadProxyUrl(),
            authType: this.loadAuthType(),
            tokenPath: this.loadTokenPath(),
            customHeaders: this.loadCustomHeaders()
        };

        this.listeners = [];
        this.environmentVars = this.loadEnvironmentVars();
    }

    // Load environment variables (path parameters)
    loadEnvironmentVars() {
        const saved = localStorage.getItem('environmentVars');
        return saved ? JSON.parse(saved) : {};
    }

    // Save environment variables
    saveEnvironmentVars(vars) {
        this.environmentVars = { ...this.environmentVars, ...vars };
        localStorage.setItem('environmentVars', JSON.stringify(this.environmentVars));
        this.notifyListeners('environmentVars', this.environmentVars);
    }

    // Get environment variable
    getEnvVar(key) {
        return this.environmentVars[key] || '';
    }

    // Set environment variable
    setEnvVar(key, value) {
        this.environmentVars[key] = value;
        localStorage.setItem('environmentVars', JSON.stringify(this.environmentVars));
        this.notifyListeners('environmentVars', this.environmentVars);
    }

    // Clear all environment variables
    clearEnvironmentVars() {
        this.environmentVars = {};
        localStorage.removeItem('environmentVars');
        this.notifyListeners('environmentVars', this.environmentVars);
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

    // Load API prefix from localStorage (e.g., /api)
    loadApiPrefix() {
        return localStorage.getItem('apiPrefix') || '';
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

    // Save API prefix to localStorage
    saveApiPrefix(prefix) {
        // Normalize prefix: ensure it starts with / and no trailing slash
        if (prefix && !prefix.startsWith('/')) {
            prefix = '/' + prefix;
        }
        prefix = prefix.replace(/\/$/, '');
        this.config.apiPrefix = prefix;
        localStorage.setItem('apiPrefix', prefix);
        this.notifyListeners('apiPrefix', prefix);
    }

    // Get API prefix
    getApiPrefix() {
        return this.config.apiPrefix;
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
        // Remove leading and trailing slashes from endpoint
        endpoint = endpoint.replace(/^\/+|\/+$/g, '');
        let baseUrl = this.config.baseUrl.replace(/\/+$/, '');
        let apiPrefix = this.config.apiPrefix || '';

        // Build full URL with optional API prefix
        let fullUrl;
        if (apiPrefix) {
            // Remove leading slash from apiPrefix for comparison
            const prefixWithoutSlash = apiPrefix.replace(/^\/+/, '');

            // Check if endpoint already starts with the prefix
            if (endpoint.startsWith(prefixWithoutSlash + '/') || endpoint === prefixWithoutSlash) {
                // Endpoint already has the prefix, don't add it again
                // Example: endpoint = "api/payment-request/detail/xxx" and prefix = "/api"
                console.log('⚠️ Endpoint already contains prefix, skipping duplicate');
                fullUrl = `${baseUrl}/${endpoint}`;
            } else {
                // baseUrl + apiPrefix + endpoint
                // Example: http://localhost:3000 + /api + /auth/login
                fullUrl = `${baseUrl}${apiPrefix}/${endpoint}`;
            }
        } else {
            // baseUrl + endpoint (no prefix)
            fullUrl = `${baseUrl}/${endpoint}`;
        }

        // If proxy is enabled, prepend proxy URL
        if (this.config.useProxy) {
            const proxyUrl = this.config.proxyUrl;
            const proxiedUrl = `${proxyUrl}${fullUrl}`;
            console.log('⟳ Proxy URL:', proxiedUrl);
            console.log('⊙ Target:', fullUrl);
            return proxiedUrl;
        }

        console.log('⚡ Direct URL:', fullUrl);
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
