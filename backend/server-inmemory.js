// Backend API Server - In-Memory Mode (No MongoDB Required)
// Giải pháp tạm thời khi MongoDB Atlas không khả dụng

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Storage (thay thế MongoDB)
const inMemoryDB = {
    projects: []
};

let nextId = 1;

console.log('⚠️  Running in IN-MEMORY mode (No MongoDB)');
console.log('📝 Data will be lost when server restarts');

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API Test Tool Backend is running (In-Memory Mode)',
        database: 'in-memory',
        projectCount: inMemoryDB.projects.length
    });
});

// Get all projects
app.get('/api/projects', (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        
        const projects = inMemoryDB.projects
            .filter(p => p.userId === userId)
            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
        
        res.json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch projects'
        });
    }
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
    try {
        const project = inMemoryDB.projects.find(p => p._id === req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project'
        });
    }
});

// Create new project
app.post('/api/projects', (req, res) => {
    try {
        const { name, description, color, userId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Project name is required'
            });
        }
        
        const project = {
            _id: String(nextId++),
            userId: userId || 'default_user',
            name: name.trim(),
            description: description?.trim() || '',
            color: color || '#667eea',
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
        
        inMemoryDB.projects.push(project);
        
        console.log(`✅ Created project: ${project.name} (ID: ${project._id})`);
        
        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create project'
        });
    }
});

// Update project
app.put('/api/projects/:id', (req, res) => {
    try {
        const index = inMemoryDB.projects.findIndex(p => p._id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        const { name, description, color, pattern, hasPassword, settings, apiFolder } = req.body;
        const project = inMemoryDB.projects[index];
        
        if (name !== undefined) project.name = name.trim();
        if (description !== undefined) project.description = description.trim();
        if (color !== undefined) project.color = color;
        if (pattern !== undefined) project.pattern = pattern;
        if (hasPassword !== undefined) project.hasPassword = hasPassword;
        if (settings !== undefined) project.settings = settings;
        if (apiFolder !== undefined) project.apiFolder = apiFolder;
        
        project.updatedAt = new Date().toISOString();
        
        console.log(`✏️  Updated project: ${project.name} (ID: ${project._id})`);
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update project'
        });
    }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    try {
        const index = inMemoryDB.projects.findIndex(p => p._id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        const deleted = inMemoryDB.projects.splice(index, 1)[0];
        
        console.log(`🗑️  Deleted project: ${deleted.name} (ID: ${deleted._id})`);
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete project'
        });
    }
});

// Update last accessed
app.post('/api/projects/:id/access', (req, res) => {
    try {
        const project = inMemoryDB.projects.find(p => p._id === req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        project.lastAccessed = new Date().toISOString();
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error updating access time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update access time'
        });
    }
});

// Verify pattern
app.post('/api/projects/:id/verify-pattern', (req, res) => {
    try {
        const { pattern } = req.body;
        const project = inMemoryDB.projects.find(p => p._id === req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        if (!project.hasPassword || !project.pattern) {
            return res.json({
                success: true,
                verified: true
            });
        }
        
        const isValid = JSON.stringify(pattern) === JSON.stringify(project.pattern);
        
        res.json({
            success: true,
            verified: isValid
        });
    } catch (error) {
        console.error('Error verifying pattern:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify pattern'
        });
    }
});

// Get statistics
app.get('/api/projects/stats/summary', (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const userProjects = inMemoryDB.projects.filter(p => p.userId === userId);
        
        const total = userProjects.length;
        const withPassword = userProjects.filter(p => p.hasPassword).length;
        
        const recentlyUsed = userProjects
            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
            .slice(0, 5);
        
        res.json({
            success: true,
            data: {
                total,
                withPassword,
                withoutPassword: total - withPassword,
                recentlyUsed
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Admin: Clear all
app.delete('/api/admin/clear-all', (req, res) => {
    try {
        const count = inMemoryDB.projects.length;
        inMemoryDB.projects = [];
        nextId = 1;
        
        console.log(`🗑️  Cleared ${count} projects`);
        
        res.json({
            success: true,
            message: `Deleted ${count} projects`,
            deletedCount: count
        });
    } catch (error) {
        console.error('Error clearing projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear projects'
        });
    }
});

// Admin: Seed demo data
app.post('/api/admin/seed-demo', (req, res) => {
    try {
        const demoProjects = [
            {
                _id: String(nextId++),
                userId: 'default_user',
                name: 'Dự án Kế toán',
                description: 'Hệ thống API kế toán',
                color: '#667eea',
                pattern: null,
                hasPassword: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                apiFolder: 'ke-toan',
                settings: { baseUrl: 'http://localhost:3000', theme: 'light' }
            },
            {
                _id: String(nextId++),
                userId: 'default_user',
                name: 'Payment Gateway',
                description: 'API thanh toán',
                color: '#38b2ac',
                pattern: null,
                hasPassword: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                apiFolder: null,
                settings: { baseUrl: 'http://localhost:3000', theme: 'light' }
            }
        ];
        
        inMemoryDB.projects.push(...demoProjects);
        
        console.log(`✅ Seeded ${demoProjects.length} demo projects`);
        
        res.json({
            success: true,
            message: `Created ${demoProjects.length} demo projects`,
            data: demoProjects
        });
    } catch (error) {
        console.error('Error seeding demo data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to seed demo data'
        });
    }
});

// Initialize project from template
app.post('/api/init-project', async (req, res) => {
    try {
        const { projectId, projectName, description } = req.body;
        
        if (!projectId || !projectName) {
            return res.status(400).json({
                success: false,
                error: 'projectId and projectName are required'
            });
        }

        // Check if project already exists (check both database and filesystem)
        const fs = require('fs');
        const path = require('path');
        
        const existingProject = inMemoryDB.projects.find(p => p.apiFolder === projectId);
        const targetDir = path.join(__dirname, '..', 'api-docs', projectId);
        const folderExists = fs.existsSync(targetDir);
        
        if (existingProject && folderExists) {
            // Project already exists in DB and filesystem, just return it
            console.log(`✅ Project already exists: ${projectName} (ID: ${projectId})`);
            return res.json({
                success: true,
                data: existingProject,
                message: 'Project already exists'
            });
        }
        
        if (!existingProject && folderExists) {
            // Folder exists but not in DB, add to DB
            const project = {
                _id: String(nextId++),
                userId: 'default_user',
                name: projectName,
                description: description || '',
                color: '#38b2ac',
                pattern: null,
                hasPassword: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                apiFolder: projectId,
                settings: {
                    baseUrl: 'http://localhost:3000',
                    theme: 'light'
                }
            };
            
            inMemoryDB.projects.push(project);
            
            console.log(`✅ Added existing project to DB: ${projectName} (ID: ${projectId})`);
            
            return res.json({
                success: true,
                data: project,
                message: 'Project folder exists, added to database'
            });
        }

        // Create project from template
        const templateDir = path.join(__dirname, '..', 'init-template');

        // Copy template to new project folder
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy files from template
        const filesToCopy = ['README.md', 'API-DOCUMENT.md', 'api-json-template.json', 'manifest.json'];
        filesToCopy.forEach(file => {
            const srcPath = path.join(templateDir, file);
            const destPath = path.join(targetDir, file);
            
            if (fs.existsSync(srcPath)) {
                let content = fs.readFileSync(srcPath, 'utf8');
                
                // Replace placeholders
                content = content.replace(/\{PROJECT_NAME\}/g, projectName);
                content = content.replace(/\{PROJECT_ID\}/g, projectId);
                content = content.replace(/\{DESCRIPTION\}/g, description || '');
                
                fs.writeFileSync(destPath, content, 'utf8');
            }
        });

        // Create project in database
        const project = {
            _id: String(nextId++),
            userId: 'default_user',
            name: projectName,
            description: description || '',
            color: '#38b2ac',
            pattern: null,
            hasPassword: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            apiFolder: projectId,
            settings: {
                baseUrl: 'http://localhost:3000',
                theme: 'light'
            }
        };
        
        inMemoryDB.projects.push(project);
        
        console.log(`✅ Created project from template: ${projectName} (ID: ${projectId})`);
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error creating project from template:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    console.log(`\n⚠️  IN-MEMORY MODE: Data will be lost on restart`);
    console.log(`\n💡 To seed demo data: POST http://localhost:${PORT}/api/admin/seed-demo`);
    console.log(`\n✨ Press Ctrl+C to stop\n`);
});
