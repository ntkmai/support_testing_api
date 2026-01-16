// Configuration Management Module with MongoDB Backend
import { APIService } from './api-service.js';

export class ConfigManager {
    constructor() {
        this.config = {
            baseUrl: 'http://localhost:5000',
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

    // Environment Variables
    loadEnvironmentVars() {
        return this.environmentVars;
    }

    saveEnvironmentVars(vars) {
        this.environmentVars = { ...this.environmentVars, ...vars };
        this.saveToMongoDB();
        this.notifyListeners('environmentVars', this.environmentVars);
    }

    getEnvVar(key) {
        return this.environmentVars[key] || '';
    }

    setEnvVar(key, value) {
        this.environmentVars[key] = value;
        this.saveToMongoDB();
        this.notifyListeners('environmentVars', this.environmentVars);
    }

    clearEnvironmentVars() {
        this.environmentVars = {};
        this.saveToMongoDB();
        this.notifyListeners('environmentVars', this.environmentVars);
    }

    // Auth Settings
    loadAuthType() {
        return this.config.authType;
    }

    loadTokenPath() {
        return this.config.tokenPath;
    }

    loadCustomHeaders() {
        return this.config.customHeaders;
    }

    saveAuthSettings(authType, tokenPath) {
        this.config.authType = authType;
        this.config.tokenPath = tokenPath;
        this.saveToMongoDB();
        this.notifyListeners('auth', { authType, tokenPath });
    }

    saveCustomHeaders(headers) {
        this.config.customHeaders = headers;
        this.saveToMongoDB();
        this.notifyListeners('customHeaders', headers);
    }

    // Auth Token (still use localStorage for security)
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    saveAuthToken(token) {
        localStorage.setItem('authToken', token);
        this.notifyListeners('authToken', token);
    }

    clearAuthToken() {
        localStorage.removeItem('authToken');
        this.notifyListeners('authToken', null);
    }

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

    getAllHeaders() {
        const headers = { ...this.config.customHeaders };
        
        const authHeader = this.getAuthHeader();
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        
        return headers;
    }

    // Base URL
    loadBaseUrl() {
        return this.config.baseUrl;
    }

    saveBaseUrl(url) {
        url = url.replace(/\/$/, '');
        this.config.baseUrl = url;
        this.saveToMongoDB();
        this.notifyListeners('baseUrl', url);
    }

    getBaseUrl() {
        return this.config.baseUrl;
    }

    // API Prefix
    loadApiPrefix() {
        return this.config.apiPrefix;
    }

    saveApiPrefix(prefix) {
        if (prefix && !prefix.startsWith('/')) {
            prefix = '/' + prefix;
        }
        prefix = prefix.replace(/\/$/, '');
        this.config.apiPrefix = prefix;
        this.saveToMongoDB();
        this.notifyListeners('apiPrefix', prefix);
    }

    getApiPrefix() {
        return this.config.apiPrefix;
    }

    // Proxy Settings
    loadProxyEnabled() {
        return this.config.useProxy;
    }

    loadProxyUrl() {
        return this.config.proxyUrl;
    }

    saveProxySettings(enabled, proxyUrl) {
        this.config.useProxy = enabled;
        this.config.proxyUrl = proxyUrl.replace(/\/$/, '') + '/';
        this.saveToMongoDB();
        this.notifyListeners('proxy', { enabled, proxyUrl: this.config.proxyUrl });
    }

    isProxyEnabled() {
        return this.config.useProxy;
    }

    getProxyUrl() {
        return this.config.proxyUrl;
    }

    // Loading Delay
    loadLoadingDelay() {
        return this.config.loadingDelay;
    }

    saveLoadingDelay(delay) {
        delay = Math.max(0, Math.min(5000, parseInt(delay, 10)));
        this.config.loadingDelay = delay;
        this.saveToMongoDB();
        this.notifyListeners('loadingDelay', delay);
    }

    getLoadingDelay() {
        return this.config.loadingDelay;
    }

    // Get Full API URL
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

        // Apply proxy if enabled
        if (this.config.useProxy) {
            const proxyUrl = this.config.proxyUrl;
            const proxiedUrl = `${proxyUrl}${fullUrl}`;
            return proxiedUrl;
        }
        
        return fullUrl;
    }

    // Listeners
    onChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(key, value) {
        this.listeners.forEach(callback => callback(key, value));
    }

    // Export/Import
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.config = { ...this.config, ...imported };
            if (imported.baseUrl) {
                this.saveBaseUrl(imported.baseUrl);
            }
            this.saveToMongoDB();
            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }
}

// Create global config instance
export const config = new ConfigManager();
