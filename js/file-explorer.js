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
            // Load manifest file that contains folder structure (with cache-busting)
            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(`${basePath}/manifest.json${cacheBuster}`);
            const manifest = await response.json();
            
            this.folders = new Map();
            
            // Process each folder from manifest
            for (const folderConfig of manifest.folders) {
                const folderPath = `${basePath}/${folderConfig.path}`;
                const files = [];
                
                // Create file objects for each file in the folder
                for (const fileName of folderConfig.files) {
                    let icon = 'file';
                    let type = 'file';

                    if (fileName.endsWith('.md')) {
                        icon = fileName.includes('README') ? 'book-open' : 'file-text';
                        type = 'md';
                    } else if (fileName.endsWith('.json')) {
                        icon = 'file-json';
                        type = 'json';
                    } else if (fileName.endsWith('.http')) {
                        icon = 'globe';
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
            UIComponents.showNotification('Không thể tải danh sách thư mục', 'error');
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
                        <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Tất cả thư mục
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
                        <div class="folder-info-icon"><i data-lucide="folder" style="width: 28px; height: 28px;"></i></div>
                        <div class="folder-info-text">
                            <strong>${this.currentFolder}</strong>
                            <p>${folder.files.length} files</p>
                        </div>
                    </div>
                    <ul class="folder-files">
                        ${folder.files.map((file, index) => `
                            <li class="file-item" data-path="${file.path}" data-type="${file.type}">
                                <span class="file-icon">${index + 1}</span>
                                <span class="file-name">${file.name}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        } else {
            // Show all folders as cards
            html += '<div class="folder-cards-grid">';
            let folderIndex = 1;
            this.folders.forEach((folder, folderName) => {
                html += `
                    <div class="folder-card" data-folder="${folderName}" style="border-left-color: ${folder.color || 'var(--primary-color)'}">
                        <div class="folder-card-icon">${folderIndex}</div>
                        <div class="folder-card-content">
                            <h4 class="folder-card-title">${folderName}</h4>
                            <p class="folder-card-description">${folder.description || ''}</p>
                            <div class="folder-card-stats">
                                <span class="stat-item">
                                    <span class="stat-value">${folder.files.filter(f => f.type === 'md').length} MD</span>
                                </span>
                                <span class="stat-item">
                                    <span class="stat-value">${folder.files.filter(f => f.type === 'http' || f.type === 'json').length} Tests</span>
                                </span>
                            </div>
                        </div>
                        <div class="folder-card-arrow"><i data-lucide="chevron-right" style="width: 20px; height: 20px;"></i></div>
                    </div>
                `;
                folderIndex++;
            });
            html += '</div>';
        }

        container.innerHTML = html;

        // Re-initialize Lucide icons after DOM update
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

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
            UIComponents.showNotification(`${this.folders.size} thư mục có sẵn`, 'success');
        }
    }

    // Select a folder to view its files
    selectFolder(folderName) {
        this.currentFolder = folderName;
        this.render();

        const folder = this.folders.get(folderName);
        UIComponents.showNotification(`${folderName} - ${folder.files.length} files`, 'info');
        
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
    selectFile(path, name, type, skipCallback = false) {
        console.log('selectFile called:', path, 'skipCallback:', skipCallback);

        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetElement = document.querySelector(`[data-path="${path}"]`);
        console.log('Target element found:', targetElement);

        if (targetElement) {
            targetElement.classList.add('active');
        }

        this.currentFile = { path, name, type };

        // Trigger callback only if not skipped
        if (!skipCallback && this.onFileSelectCallback) {
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

    // Set active file by path (used when loading file from markdown links)
    setActiveFileByPath(filePath) {
        console.log('setActiveFileByPath called with:', filePath);

        // Clean path by removing query string
        const cleanPath = filePath.split('?')[0];

        // Find the file in our structure
        let foundFile = null;
        let foundFolderName = null;

        this.folders.forEach((folder, folderName) => {
            const file = folder.files.find(f => f.path === cleanPath);
            if (file) {
                foundFile = file;
                foundFolderName = folderName;
            }
        });

        if (!foundFile) {
            console.warn('File not found in explorer:', cleanPath);
            console.log('Available files:', Array.from(this.folders.values()).flatMap(f => f.files.map(file => file.path)));
            return;
        }

        console.log('Found file:', foundFile.name, 'in folder:', foundFolderName);

        // If the folder is not currently open, open it first
        if (this.currentFolder !== foundFolderName) {
            console.log('Switching from folder', this.currentFolder, 'to', foundFolderName);
            this.currentFolder = foundFolderName;
            this.render();
        }

        // Then highlight the file (skip callback to avoid re-loading)
        setTimeout(() => {
            console.log('Highlighting file:', foundFile.path);
            this.selectFile(foundFile.path, foundFile.name, foundFile.type, true);
        }, 150);
    }
}
