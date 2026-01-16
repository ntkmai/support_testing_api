// Project Manager Module
// Quản lý các dự án với MongoDB Atlas Backend

import { API_BASE_URL } from './api-config.js';

export class ProjectManager {
    constructor() {
        this.apiBaseUrl = API_BASE_URL;
        this.currentProjectKey = 'current_project';
        this.userId = 'default_user'; // Có thể thay đổi cho từng user
        this.projects = [];
        this.useLocalStorage = false; // Fallback to localStorage if API fails
    }

    // Load all projects from MongoDB
    async loadProjects() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/projects?userId=${this.userId}`);
            const result = await response.json();
            
            if (result.success) {
                this.projects = result.data.map(p => ({
                    ...p,
                    id: p._id.toString()
                }));
                return this.projects;
            } else {
                console.error('Failed to load projects from API:', result.error);
                return this.loadProjectsFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading projects from API:', error);
            console.log('📱 Fallback to localStorage');
            this.useLocalStorage = true;
            return this.loadProjectsFromLocalStorage();
        }
    }

    // Fallback: Load from localStorage
    loadProjectsFromLocalStorage() {
        try {
            const data = localStorage.getItem('api_test_projects');
            this.projects = data ? JSON.parse(data) : [];
            return this.projects;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    // Save projects to localStorage (fallback)
    saveProjectsToLocalStorage() {
        try {
            localStorage.setItem('api_test_projects', JSON.stringify(this.projects));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Create new project
    async createProject(name, description = '', color = '#667eea') {
        if (this.useLocalStorage) {
            const project = {
                id: this.generateId(),
                name: name.trim(),
                description: description.trim(),
                color: color,
                pattern: null,
                hasPassword: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                apiFolder: null,
                settings: {
                    baseUrl: 'http://localhost:3000',
                    theme: 'light'
                }
            };
            this.projects.push(project);
            this.saveProjectsToLocalStorage();
            return project;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    name,
                    description,
                    color
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const project = {
                    ...result.data,
                    id: result.data._id.toString()
                };
                this.projects.push(project);
                return project;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            return null;
        }
    }

    // Update project
    async updateProject(projectId, updates) {
        if (this.useLocalStorage) {
            const index = this.projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                this.projects[index] = {
                    ...this.projects[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveProjectsToLocalStorage();
                return this.projects[index];
            }
            return null;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`Failed to update project: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const updated = {
                    ...result.data,
                    id: result.data._id.toString()
                };
                const index = this.projects.findIndex(p => p.id === projectId);
                if (index !== -1) {
                    this.projects[index] = updated;
                } else {
                    // Add if not found locally
                    this.projects.push(updated);
                }
                return updated;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error updating project:', error);
            return null;
        }
    }

    // Delete project
    async deleteProject(projectId) {
        if (this.useLocalStorage) {
            const index = this.projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                this.projects.splice(index, 1);
                this.saveProjectsToLocalStorage();
                return true;
            }
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                const index = this.projects.findIndex(p => p.id === projectId);
                if (index !== -1) {
                    this.projects.splice(index, 1);
                }
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    }

    // Get project by ID
    getProject(projectId) {
        const found = this.projects.find(p => p.id === projectId || p._id === projectId);
        if (!found) {
            console.warn('⚠️ Project not found:', projectId);
            console.log('Available projects:', this.projects.map(p => ({ id: p.id, _id: p._id, name: p.name })));
        }
        return found;
    }

    // Get all projects (sorted by last accessed)
    getAllProjects() {
        return [...this.projects].sort((a, b) => 
            new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );
    }

    // Set project pattern password
    setPattern(projectId, pattern) {
        const project = this.getProject(projectId);
        if (project) {
            project.pattern = pattern;
            project.hasPassword = pattern && pattern.length > 0;
            project.updatedAt = new Date().toISOString();
            this.saveProjects();
            return true;
        }
        return false;
    }

    // Verify pattern password
    async verifyPattern(projectId, inputPattern) {
        const project = this.getProject(projectId);
        if (!project || !project.hasPassword) {
            return true; // No password set
        }

        if (this.useLocalStorage) {
            if (!inputPattern || !project.pattern) {
                return false;
            }
            
            if (inputPattern.length !== project.pattern.length) {
                return false;
            }
            
            for (let i = 0; i < inputPattern.length; i++) {
                if (inputPattern[i] !== project.pattern[i]) {
                    return false;
                }
            }
            
            return true;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/verify-pattern`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pattern: inputPattern })
            });
            
            const result = await response.json();
            return result.success && result.verified;
        } catch (error) {
            console.error('Error verifying pattern:', error);
            return false;
        }
    }

    // Set current project
    async setCurrentProject(projectId) {
        const project = this.getProject(projectId);
        if (project) {
            if (!this.useLocalStorage) {
                try {
                    await fetch(`${this.apiBaseUrl}/projects/${projectId}/access`, {
                        method: 'POST'
                    });
                } catch (error) {
                    console.error('Error updating access time:', error);
                }
            }
            localStorage.setItem(this.currentProjectKey, projectId);
            return true;
        }
        return false;
    }

    // Get current project
    getCurrentProject() {
        const projectId = localStorage.getItem(this.currentProjectKey);
        return projectId ? this.getProject(projectId) : null;
    }

    // Clear current project
    clearCurrentProject() {
        localStorage.removeItem(this.currentProjectKey);
    }

    // Generate unique ID
    generateId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Export project data
    exportProject(projectId) {
        const project = this.getProject(projectId);
        if (project) {
            const dataStr = JSON.stringify(project, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }

    // Import project data
    importProject(jsonData) {
        try {
            const project = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            // Generate new ID to avoid conflicts
            project.id = this.generateId();
            project.createdAt = new Date().toISOString();
            project.updatedAt = new Date().toISOString();
            project.lastAccessed = new Date().toISOString();
            
            this.projects.push(project);
            this.saveProjects();
            return project;
        } catch (error) {
            console.error('Error importing project:', error);
            return null;
        }
    }

    // Get project statistics
    getStatistics() {
        return {
            total: this.projects.length,
            withPassword: this.projects.filter(p => p.hasPassword).length,
            withoutPassword: this.projects.filter(p => !p.hasPassword).length,
            recentlyUsed: this.projects
                .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
                .slice(0, 5)
        };
    }
}
