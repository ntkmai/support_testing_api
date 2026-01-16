// API Service for Backend Communication
import { API_BASE_URL } from './api-config.js';

const USER_ID = 'default_user';

export class APIService {
    // Get current project ID
    static getCurrentProjectId() {
        return localStorage.getItem('current_project_id') || 'ke-toan';
    }

    // ============================================
    // CONFIG APIs
    // ============================================

    // Get config for current project
    static async getConfig(projectId = null) {
        const pid = projectId || this.getCurrentProjectId();
        try {
            const response = await fetch(`${API_BASE_URL}/configs/${pid}?userId=${USER_ID}`);
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching config:', error);
            // Return default config if fetch fails
            return {
                userId: USER_ID,
                projectId: pid,
                baseUrl: 'http://localhost:5000',
                apiPrefix: '',
                environmentVars: {},
                authType: 'Bearer',
                tokenPath: 'data.access_token',
                customHeaders: [],
                useProxy: false,
                proxyUrl: 'https://cors-anywhere.herokuapp.com/',
                loadingDelay: 0
            };
        }
    }

    // Save config for current project
    static async saveConfig(configData, projectId = null) {
        try {
            const pid = projectId || this.getCurrentProjectId();
            const response = await fetch(`${API_BASE_URL}/configs/${pid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...configData,
                    userId: USER_ID
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    // ============================================
    // RESPONSE SAMPLES APIs
    // ============================================

    // Get all response samples for current project
    static async getResponseSamples(projectId = null) {
        try {
            const pid = projectId || this.getCurrentProjectId();
            const response = await fetch(`${API_BASE_URL}/response-samples/${pid}?userId=${USER_ID}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching response samples:', error);
            return [];
        }
    }

    // Get response sample for specific API
    static async getResponseSample(apiName, projectId = null) {
        try {
            const pid = projectId || this.getCurrentProjectId();
            const response = await fetch(`${API_BASE_URL}/response-samples/${pid}/${encodeURIComponent(apiName)}?userId=${USER_ID}`);
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching response sample:', error);
            return null;
        }
    }

    // Save response sample
    static async saveResponseSample(apiName, responseData, projectId = null) {
        try {
            const pid = projectId || this.getCurrentProjectId();
            const response = await fetch(`${API_BASE_URL}/response-samples/${pid}/${encodeURIComponent(apiName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: USER_ID,
                    response: responseData.response,
                    statusCode: responseData.statusCode,
                    headers: responseData.headers
                })
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error saving response sample:', error);
            return false;
        }
    }

    // Delete response sample
    static async deleteResponseSample(apiName, projectId = null) {
        try {
            const pid = projectId || this.getCurrentProjectId();
            const response = await fetch(`${API_BASE_URL}/response-samples/${pid}/${encodeURIComponent(apiName)}?userId=${USER_ID}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error deleting response sample:', error);
            return false;
        }
    }
}
