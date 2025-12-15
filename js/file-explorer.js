// File Explorer Module
import { UIComponents } from './ui-components.js';

export class FileExplorer {
    constructor() {
        this.files = [];
        this.folders = new Map();
        this.currentFile = null;
        this.currentFolder = null;
        this.onFileSelectCallback = null;
        this.onFolderSelectCallback = null;
    }

    // Initialize file explorer
    async init() {
        await this.loadFileStructure();
        this.render();
    }

    // Load file structure from apis folder
    async loadFileStructure() {
        const basePath = 'apis';
        
        try {
            // Load manifest file that contains folder structure
            const response = await fetch(`${basePath}/manifest.json`);
            const manifest = await response.json();
            
            this.folders = new Map();
            
            // Process each folder from manifest
            for (const folderConfig of manifest.folders) {
                const folderPath = `${basePath}/${folderConfig.path}`;
                const files = [];
                
                // Create file objects for each file in the folder
                for (const fileName of folderConfig.files) {
                    let icon = '📄';
                    let type = 'file';
                    
                    if (fileName.endsWith('.md')) {
                        icon = fileName.includes('README') ? '📖' : '📝';
                        type = 'md';
                    } else if (fileName.endsWith('.json')) {
                        icon = '📊';
                        type = 'json';
                    } else if (fileName.endsWith('.http')) {
                        icon = '🌐';
                        type = 'http';
                    }
                    
                    files.push({
                        name: fileName,
                        icon: icon,
                        path: `${folderPath}/${fileName}`,
                        type: type
                    });
                }
                
                this.folders.set(folderConfig.name, {
                    icon: folderConfig.icon,
                    color: folderConfig.color,
                    description: folderConfig.description,
                    path: folderPath,
                    files: files
                });
            }
            
            // Flatten all files
            this.files = [];
            this.folders.forEach(folder => {
                this.files.push(...folder.files);
            });
            
        } catch (error) {
            console.error('Error loading file structure:', error);
            UIComponents.showNotification('❌ Không thể tải danh sách thư mục', 'error');
        }
    }

    // Render folder tree
    render() {
        const container = document.getElementById('fileList');
        if (!container) return;

        let html = '';
        
        // Breadcrumb navigation
        if (this.currentFolder) {
            html += `
                <div class="breadcrumb">
                    <span class="breadcrumb-item" onclick="window.fileExplorer.showAllFolders()">
                        <span style="font-size: 14px;">⬅️</span> Tất cả thư mục
                    </span>
                </div>
            `;
        }
        
        // If a folder is selected, show only that folder's files
        if (this.currentFolder && this.folders.has(this.currentFolder)) {
            const folder = this.folders.get(this.currentFolder);
            html += `
                <div class="folder-content">
                    <div class="folder-info">
                        <div class="folder-info-icon">${folder.icon}</div>
                        <div class="folder-info-text">
                            <strong>${this.currentFolder}</strong>
                            <p>${folder.files.length} files</p>
                        </div>
                    </div>
                    <ul class="folder-files">
                        ${folder.files.map(file => `
                            <li class="file-item" data-path="${file.path}" data-type="${file.type}">
                                <span class="file-icon">${file.icon}</span>
                                <span class="file-name">${file.name}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        } else {
            // Show all folders as cards
            html += '<div class="folder-cards-grid">';
            this.folders.forEach((folder, folderName) => {
                html += `
                    <div class="folder-card" data-folder="${folderName}" style="border-left-color: ${folder.color || 'var(--primary-color)'}">
                        <div class="folder-card-icon">${folder.icon}</div>
                        <div class="folder-card-content">
                            <h4 class="folder-card-title">${folderName}</h4>
                            <p class="folder-card-description">${folder.description || ''}</p>
                            <div class="folder-card-stats">
                                <span class="stat-item">
                                    <span class="stat-icon">📄</span>
                                    <span class="stat-value">${folder.files.filter(f => f.type === 'md').length} MD</span>
                                </span>
                                <span class="stat-item">
                                    <span class="stat-icon">🧪</span>
                                    <span class="stat-value">${folder.files.filter(f => f.type === 'http' || f.type === 'json').length} Tests</span>
                                </span>
                            </div>
                        </div>
                        <div class="folder-card-arrow">→</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;

        // Add click handlers for folder cards
        container.querySelectorAll('.folder-card').forEach(card => {
            card.addEventListener('click', () => {
                const folderName = card.dataset.folder;
                this.selectFolder(folderName);
            });
        });

        // Add click handlers for files
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                const type = item.dataset.type;
                const name = item.querySelector('.file-name').textContent;
                
                this.selectFile(path, name, type);
            });
        });

        if (!this.currentFolder) {
            UIComponents.showNotification(`📂 ${this.folders.size} thư mục có sẵn`, 'success');
        }
    }

    // Select a folder to view its files
    selectFolder(folderName) {
        this.currentFolder = folderName;
        this.render();
        
        const folder = this.folders.get(folderName);
        UIComponents.showNotification(`📂 ${folderName} - ${folder.files.length} files`, 'info');
        
        // Trigger folder select callback with files
        if (this.onFolderSelectCallback) {
            this.onFolderSelectCallback(folder.path, folder.files);
        }
    }

    // Show all folders
    showAllFolders() {
        this.currentFolder = null;
        this.render();
    }

    // Select a file
    selectFile(path, name, type) {
        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-path="${path}"]`)?.classList.add('active');

        this.currentFile = { path, name, type };

        // Trigger callback
        if (this.onFileSelectCallback) {
            this.onFileSelectCallback(this.currentFile);
        }
    }

    // Set callback for file selection
    onFileSelect(callback) {
        this.onFileSelectCallback = callback;
    }

    // Set callback for folder selection
    onFolderSelect(callback) {
        this.onFolderSelectCallback = callback;
    }

    // Get all files
    getAllFiles() {
        return this.files;
    }

    // Get files by type
    getFilesByType(type) {
        return this.files.filter(file => file.type === type);
    }

    // Search files
    searchFiles(query) {
        query = query.toLowerCase();
        return this.files.filter(file => 
            file.name.toLowerCase().includes(query) ||
            file.path.toLowerCase().includes(query)
        );
    }
}
