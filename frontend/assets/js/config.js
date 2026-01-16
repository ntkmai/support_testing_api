// Configuration Management Module with MongoDB Backend
import { APIService } from './api-service.js';

export class ConfigManager {
    constructor() {
        this.config = {
            baseUrl: 'http://localhost:3000',
            apiPrefix: '',
            apiTimeout: 30000,
            maxRetries: 3,
            useProxy: false,
            proxyUrl: 'https://cors-anywhere.herokuapp.com/',
            authType: 'Bearer',
            tokenPath: 'data.access_token',
            customHeaders: {},
            loadingDelay: 800
        };

        this.listeners = [];
        this.environmentVars = {};
        this.initialized = false;
    }

    // Initialize from MongoDB
    async init() {
        if (this.initialized) return;
        
        try {
            const savedConfig = await APIService.getConfig();
            if (savedConfig) {
                this.config.baseUrl = savedConfig.baseUrl || this.config.baseUrl;
                this.config.apiPrefix = savedConfig.apiPrefix || this.config.apiPrefix;
                this.config.useProxy = savedConfig.useProxy || this.config.useProxy;
                this.config.proxyUrl = savedConfig.proxyUrl || this.config.proxyUrl;
                this.config.authType = savedConfig.authType || this.config.authType;
                this.config.tokenPath = savedConfig.tokenPath || this.config.tokenPath;
                this.config.customHeaders = savedConfig.customHeaders || this.config.customHeaders;
                this.config.loadingDelay = savedConfig.loadingDelay || this.config.loadingDelay;
                this.environmentVars = savedConfig.environmentVars || {};
            }
            this.initialized = true;
        } catch (error) {
            console.error('Error loading config from MongoDB:', error);
            // Fallback to localStorage
            this.loadFromLocalStorage();
            this.initialized = true;
        }
    }

    // Fallback: Load from localStorage
    loadFromLocalStorage() {
        this.config.baseUrl = localStorage.getItem('baseUrl') || this.config.baseUrl;
        this.config.apiPrefix = localStorage.getItem('apiPrefix') || this.config.apiPrefix;
        this.config.useProxy = localStorage.getItem('useProxy') === 'true';
        this.config.proxyUrl = localStorage.getItem('proxyUrl') || this.config.proxyUrl;
        this.config.authType = localStorage.getItem('authType') || this.config.authType;
        this.config.tokenPath = localStorage.getItem('tokenPath') || this.config.tokenPath;
        this.config.loadingDelay = parseInt(localStorage.getItem('loadingDelay') || '800', 10);
        
        const savedHeaders = localStorage.getItem('customHeaders');
        if (savedHeaders) {
            this.config.customHeaders = JSON.parse(savedHeaders);
        }
        
        const savedEnvVars = localStorage.getItem('environmentVars');
        if (savedEnvVars) {
            this.environmentVars = JSON.parse(savedEnvVars);
        }
    }

    // Save to MongoDB
    async saveToMongoDB() {
        try {
            await APIService.saveConfig({
                baseUrl: this.config.baseUrl,
                apiPrefix: this.config.apiPrefix,
                environmentVars: this.environmentVars,
                authType: this.config.authType,
                tokenPath: this.config.tokenPath,
                customHeaders: this.config.customHeaders,
                useProxy: this.config.useProxy,
                proxyUrl: this.config.proxyUrl,
                loadingDelay: this.config.loadingDelay
            });
            console.log('✅ Config saved to MongoDB');
        } catch (error) {
            console.error('Error saving config to MongoDB:', error);
        }
    }

    // Load environment variables (path parameters)
    loadEnvironmentVars() {
        return this.environmentVars;
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

    // Load loading delay from localStorage
    loadLoadingDelay() {
        const saved = localStorage.getItem('loadingDelay');
        return saved ? parseInt(saved, 10) : 800; // Default 800ms
    }

    // Save loading delay to localStorage
    saveLoadingDelay(delay) {
        // Ensure delay is within valid range (0-5000ms)
        delay = Math.max(0, Math.min(5000, parseInt(delay, 10)));
        this.config.loadingDelay = delay;
        localStorage.setItem('loadingDelay', delay.toString());
        this.notifyListeners('loadingDelay', delay);
    }

    // Get loading delay
    getLoadingDelay() {
        return this.config.loadingDelay;
    }

    // Get current base URL
    getBaseUrl() {
        return this.config.baseUrl;
    }

    // Get full API URL
    getApiUrl(endpoint) {
        // Clean endpoint: remove leading/trailing slashes
        endpoint = endpoint.replace(/^\/+|\/+$/g, '');
        
        // Clean baseUrl: remove trailing slashes
        let baseUrl = this.config.baseUrl.replace(/\/+$/, '');
        
        // Clean apiPrefix: remove leading/trailing slashes
        let apiPrefix = (this.config.apiPrefix || '').replace(/^\/+|\/+$/g, '');

        let fullUrl;
        
        // Case 1: No prefix configured
        if (!apiPrefix) {
            fullUrl = `${baseUrl}/${endpoint}`;
        } 
        // Case 2: Endpoint already starts with the prefix (avoid double prefix)
        else if (endpoint.startsWith(apiPrefix + '/') || endpoint === apiPrefix) {
            fullUrl = `${baseUrl}/${endpoint}`;
        }
        // Case 3: Need to add prefix
        else {
            fullUrl = `${baseUrl}/${apiPrefix}/${endpoint}`;
        }
        
        // Clean up any double slashes (except after protocol://)
        fullUrl = fullUrl.replace(/([^:])\/\/+/g, '$1/');
        
        // Debug log to help troubleshoot URL construction
        console.log('🔗 URL Construction:', {
            baseUrl,
            apiPrefix: apiPrefix || '(none)',
            endpoint,
            result: fullUrl
        });

        // If proxy is enabled, prepend proxy URL
        if (this.config.useProxy) {
            const proxyUrl = this.config.proxyUrl;
            const proxiedUrl = `${proxyUrl}${fullUrl}`;
            return proxiedUrl;
        }
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
