// Backend API Server for Project Management
// Kết nối MongoDB Atlas và cung cấp REST API

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3939;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maithanh1504thuan_db_user:iKd83ezf6YmLvpy@masterbe.xjftrtj.mongodb.net/';
const DB_NAME = 'api_test_tool';
const COLLECTION_NAME = 'projects';

let db;
let projectsCollection;
let configsCollection;
let responseSamplesCollection;

// Connect to MongoDB with multiple fallback strategies
async function connectDB() {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('📍 Cluster: masterbe.xjftrtj.mongodb.net');
    
    // Try multiple connection configurations
    const connectionConfigs = [
        {
            name: 'Standard TLS',
            options: {
                tls: true,
                tlsAllowInvalidCertificates: true,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
            }
        },
        {
            name: 'Relaxed SSL',
            options: {
                ssl: true,
                sslValidate: false,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
            }
        },
        {
            name: 'Basic Connection',
            options: {
                serverSelectionTimeoutMS: 10000,
            }
        }
    ];
    
    for (const config of connectionConfigs) {
        try {
            console.log(`\n🔌 Trying: ${config.name}...`);
            
            const client = await MongoClient.connect(MONGODB_URI, config.options);
            
            db = client.db(DB_NAME);
            projectsCollection = db.collection(COLLECTION_NAME);
            configsCollection = db.collection('configs');
            responseSamplesCollection = db.collection('response_samples');
            
            console.log('\n✅ Connected to MongoDB Atlas successfully!');
            console.log(`📦 Database: ${DB_NAME}`);
            console.log(`📁 Collections: ${COLLECTION_NAME}, configs, response_samples`);
            console.log(`🔧 Method: ${config.name}`);
            
            // Create indexes
            await projectsCollection.createIndex({ userId: 1 });
            await projectsCollection.createIndex({ createdAt: -1 });
            await configsCollection.createIndex({ userId: 1, projectId: 1 });
            await responseSamplesCollection.createIndex({ userId: 1, projectId: 1, apiName: 1 });
            
            return client;
            
        } catch (error) {
            console.log(`   ❌ ${config.name} failed: ${error.message}`);
            
            if (config === connectionConfigs[connectionConfigs.length - 1]) {
                // Last attempt failed
                console.error('\n❌ All connection attempts failed!');
                console.error('\n🔧 Common solutions:');
                console.error('   1. Whitelist your IP in MongoDB Atlas:');
                console.error('      → https://cloud.mongodb.com/');
                console.error('      → Network Access → Add IP Address → 0.0.0.0/0');
                console.error('\n   2. Check cluster status (not paused):');
                console.error('      → MongoDB Atlas → Clusters → Check status');
                console.error('\n   3. Verify credentials:');
                console.error('      → Database Access → Check username/password');
                console.error('\n   4. Check connection string format:');
                console.error('      → Should be: mongodb+srv://user:pass@cluster.mongodb.net/');
                console.error('\n   5. Try connecting from MongoDB Compass first');
                console.error('\n💡 Quick test: Can you ping masterbe.xjftrtj.mongodb.net?');
                console.error('   Run: ping masterbe.xjftrtj.mongodb.net');
                
                throw error;
            }
        }
    }
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API Test Tool Backend is running',
        database: db ? 'connected' : 'disconnected'
    });
});

// Get all projects for a user
app.get('/api/projects', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        
        const projects = await projectsCollection
            .find({ userId })
            .sort({ lastAccessed: -1 })
            .toArray();
        
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

// Get single project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await projectsCollection.findOne({
            _id: new ObjectId(req.params.id)
        });
        
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
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, color, userId } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Project name is required'
            });
        }
        
        const project = {
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
                baseUrl: 'http://localhost:5000',
                theme: 'light'
            }
        };
        
        const result = await projectsCollection.insertOne(project);
        project._id = result.insertedId;
        
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
app.put('/api/projects/:id', async (req, res) => {
    try {
        console.log('📝 PUT /api/projects/:id called');
        console.log('   ID:', req.params.id);
        console.log('   Body:', JSON.stringify(req.body));
        
        const { name, description, color, pattern, hasPassword, settings, apiFolder } = req.body;
        
        const updates = {
            updatedAt: new Date().toISOString()
        };
        
        if (name !== undefined) updates.name = name.trim();
        if (description !== undefined) updates.description = description.trim();
        if (color !== undefined) updates.color = color;
        if (pattern !== undefined) updates.pattern = pattern;
        if (hasPassword !== undefined) updates.hasPassword = hasPassword;
        if (settings !== undefined) updates.settings = settings;
        if (apiFolder !== undefined) updates.apiFolder = apiFolder;
        
        console.log('   Updates:', JSON.stringify(updates));
        console.log('   Creating ObjectId from:', req.params.id);
        
        const updatedProject = await projectsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        
        console.log('   Updated project:', updatedProject ? 'FOUND' : 'NOT FOUND');
        
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: updatedProject
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
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const result = await projectsCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
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

// Update last accessed time
app.post('/api/projects/:id/access', async (req, res) => {
    try {
        const updatedProject = await projectsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: { lastAccessed: new Date().toISOString() } },
            { returnDocument: 'after' }
        );
        
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: updatedProject
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
app.post('/api/projects/:id/verify-pattern', async (req, res) => {
    try {
        console.log('🔐 POST /api/projects/:id/verify-pattern');
        console.log('   Project ID:', req.params.id);
        console.log('   Pattern received:', req.body.pattern);
        
        const { pattern } = req.body;
        
        const project = await projectsCollection.findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!project) {
            console.log('   ❌ Project not found');
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        if (!project.hasPassword || !project.pattern) {
            console.log('   ✅ No password set, allowing access');
            return res.json({
                success: true,
                verified: true
            });
        }
        
        console.log('   Saved pattern:', project.pattern);
        console.log('   Saved pattern type:', typeof project.pattern);
        console.log('   Input pattern type:', typeof pattern);
        
        // Compare patterns - both should be strings at this point
        const savedPattern = typeof project.pattern === 'string' ? project.pattern : JSON.stringify(project.pattern);
        const inputPattern = typeof pattern === 'string' ? pattern : JSON.stringify(pattern);
        
        const isValid = inputPattern === savedPattern;
        
        console.log('   Comparison result:', isValid);
        console.log('   Saved:', savedPattern);
        console.log('   Input:', inputPattern);
        
        res.json({
            success: true,
            verified: isValid
        });
    } catch (error) {
        console.error('   ❌ Error verifying pattern:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify pattern'
        });
    }
});

// Get project statistics
app.get('/api/projects/stats/summary', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        
        const total = await projectsCollection.countDocuments({ userId });
        const withPassword = await projectsCollection.countDocuments({ 
            userId, 
            hasPassword: true 
        });
        
        const recentlyUsed = await projectsCollection
            .find({ userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .toArray();
        
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

// Save project password
app.post('/api/projects/:id/password', async (req, res) => {
    try {
        console.log('🔐 POST /api/projects/:id/password');
        console.log('   Project ID:', req.params.id);
        console.log('   Pattern:', req.body.pattern ? 'provided' : 'missing');
        
        const { pattern } = req.body;
        
        if (!pattern) {
            console.log('   ❌ Pattern is missing');
            return res.status(400).json({
                success: false,
                error: 'Pattern is required'
            });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            console.log('   ❌ Invalid ObjectId format');
            return res.status(400).json({
                success: false,
                error: 'Invalid project ID format'
            });
        }
        
        const updatedProject = await projectsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    pattern: pattern,
                    hasPassword: true,
                    updatedAt: new Date().toISOString()
                } 
            },
            { returnDocument: 'after' }
        );
        
        if (!updatedProject) {
            console.log('   ❌ Project not found in database');
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        console.log('   ✅ Password saved successfully');
        res.json({
            success: true,
            message: 'Password saved successfully'
        });
    } catch (error) {
        console.error('   ❌ Error saving password:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Failed to save password',
            details: error.message
        });
    }
});

// Get project password status
app.get('/api/projects/:id/password', async (req, res) => {
    try {
        const project = await projectsCollection.findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { hasPassword: 1 } }
        );
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                hasPassword: project.hasPassword || false
            }
        });
    } catch (error) {
        console.error('Error getting password status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get password status'
        });
    }
});

// Delete project password
app.delete('/api/projects/:id/password', async (req, res) => {
    try {
        const updatedProject = await projectsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    pattern: null,
                    hasPassword: false,
                    updatedAt: new Date().toISOString()
                } 
            },
            { returnDocument: 'after' }
        );
        
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Password removed successfully'
        });
    } catch (error) {
        console.error('Error removing password:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove password'
        });
    }
});

// ============================================
// CONFIGURATION ROUTES
// ============================================

// Get user configs for a project
app.get('/api/configs/:projectId', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const projectId = req.params.projectId;
        
        const config = await configsCollection.findOne({ 
            userId, 
            projectId 
        });
        
        res.json({
            success: true,
            data: config || {
                userId,
                projectId,
                baseUrl: 'http://localhost:5000',
                apiPrefix: '',
                environmentVars: {},
                authType: 'Bearer',
                tokenPath: 'data.access_token',
                customHeaders: [],
                useProxy: false,
                proxyUrl: 'https://cors-anywhere.herokuapp.com/',
                loadingDelay: 0
            }
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch config'
        });
    }
});

// Save user configs for a project
app.post('/api/configs/:projectId', async (req, res) => {
    try {
        const userId = req.body.userId || 'default_user';
        const projectId = req.params.projectId;
        
        const configData = {
            userId,
            projectId,
            baseUrl: req.body.baseUrl,
            apiPrefix: req.body.apiPrefix,
            environmentVars: req.body.environmentVars || {},
            authType: req.body.authType,
            tokenPath: req.body.tokenPath,
            customHeaders: req.body.customHeaders || [],
            useProxy: req.body.useProxy || false,
            proxyUrl: req.body.proxyUrl,
            loadingDelay: req.body.loadingDelay || 0,
            updatedAt: new Date().toISOString()
        };
        
        const result = await configsCollection.findOneAndUpdate(
            { userId, projectId },
            { $set: configData, $setOnInsert: { createdAt: new Date().toISOString() } },
            { upsert: true, returnDocument: 'after' }
        );
        
        console.log(`✅ Saved config for project: ${projectId}`);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save config'
        });
    }
});

// ============================================
// RESPONSE SAMPLES ROUTES
// ============================================

// Get all response samples for a project
app.get('/api/response-samples/:projectId', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const projectId = req.params.projectId;
        
        const samples = await responseSamplesCollection
            .find({ userId, projectId })
            .toArray();
        
        res.json({
            success: true,
            data: samples
        });
    } catch (error) {
        console.error('Error fetching response samples:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch response samples'
        });
    }
});

// Get response sample for specific API
app.get('/api/response-samples/:projectId/:apiName', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const projectId = req.params.projectId;
        const apiName = req.params.apiName;
        
        const sample = await responseSamplesCollection.findOne({ 
            userId, 
            projectId, 
            apiName 
        });
        
        res.json({
            success: true,
            data: sample
        });
    } catch (error) {
        console.error('Error fetching response sample:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch response sample'
        });
    }
});

// Save response sample
app.post('/api/response-samples/:projectId/:apiName', async (req, res) => {
    try {
        const userId = req.body.userId || 'default_user';
        const projectId = req.params.projectId;
        const apiName = req.params.apiName;
        
        const sampleData = {
            userId,
            projectId,
            apiName,
            response: req.body.response,
            statusCode: req.body.statusCode,
            headers: req.body.headers,
            updatedAt: new Date().toISOString()
        };
        
        const result = await responseSamplesCollection.findOneAndUpdate(
            { userId, projectId, apiName },
            { $set: sampleData, $setOnInsert: { createdAt: new Date().toISOString() } },
            { upsert: true, returnDocument: 'after' }
        );
        
        console.log(`✅ Saved response sample: ${projectId}/${apiName}`);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error saving response sample:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save response sample'
        });
    }
});

// Delete response sample
app.delete('/api/response-samples/:projectId/:apiName', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const projectId = req.params.projectId;
        const apiName = req.params.apiName;
        
        const result = await responseSamplesCollection.deleteOne({
            userId,
            projectId,
            apiName
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Response sample not found'
            });
        }
        
        console.log(`🗑️ Deleted response sample: ${projectId}/${apiName}`);
        
        res.json({
            success: true,
            message: 'Response sample deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting response sample:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete response sample'
        });
    }
});

// ============================================
// PROJECT INITIALIZATION FROM TEMPLATE
// ============================================

// Create project from template (init-template folder)
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
        
        const existingProject = await projectsCollection.findOne({ apiFolder: projectId });
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
                    baseUrl: 'http://localhost:5000',
                    theme: 'light'
                }
            };
            
            const result = await projectsCollection.insertOne(project);
            project._id = result.insertedId;
            
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
                baseUrl: 'http://localhost:5000',
                theme: 'light'
            }
        };
        
        const result = await projectsCollection.insertOne(project);
        project._id = result.insertedId;
        
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

// ============================================
// ERROR HANDLING
// ============================================

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

// ============================================
// ADMIN ROUTES (Development only)
// ============================================

// Clear all projects
app.delete('/api/admin/clear-all', async (req, res) => {
    try {
        const result = await projectsCollection.deleteMany({});
        
        console.log(`🗑️  Cleared ${result.deletedCount} projects from database`);
        
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} projects`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear projects'
        });
    }
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
        console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
        console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
        console.log(`\n📚 Available routes:`);
        console.log(`   GET    /api/health`);
        console.log(`   GET    /api/projects`);
        console.log(`   GET    /api/projects/:id`);
        console.log(`   POST   /api/projects`);
        console.log(`   PUT    /api/projects/:id`);
        console.log(`   DELETE /api/projects/:id`);
        console.log(`   POST   /api/projects/:id/access`);
        console.log(`   POST   /api/projects/:id/verify-pattern`);
        console.log(`   POST   /api/projects/:id/password`);
        console.log(`   GET    /api/projects/:id/password`);
        console.log(`   DELETE /api/projects/:id/password`);
        console.log(`   GET    /api/projects/stats/summary`);
        console.log(`\n✨ Press Ctrl+C to stop\n`);
    });
}

startServer().catch(console.error);
