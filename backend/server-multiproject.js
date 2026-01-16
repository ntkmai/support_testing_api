// Enhanced Backend API Server - Multi-Project Support
// Hỗ trợ 6 dự án với database riêng biệt

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maithanh1504thuan_db_user:iKd83ezf6YmLvpy@masterbe.xjftrtj.mongodb.net/';
const DB_NAME = 'api_test_tool';

// Project Collections Mapping
const PROJECT_TYPES = {
    'ke-toan': {
        name: 'Dự án Kế toán',
        collections: ['projects', 'jar_ratios', 'payment_requests', 'vouchers']
    },
    'payment-gateway': {
        name: 'Payment Gateway API',
        collections: ['projects', 'transactions', 'configs']
    },
    'user-management': {
        name: 'User Management & RBAC',
        collections: ['projects', 'users', 'roles', 'permissions']
    },
    'ecommerce': {
        name: 'E-commerce API',
        collections: ['projects', 'products', 'orders', 'customers']
    },
    'notification': {
        name: 'Notification Service',
        collections: ['projects', 'templates', 'messages', 'subscriptions']
    },
    'analytics': {
        name: 'Analytics Dashboard',
        collections: ['projects', 'events', 'reports', 'dashboards']
    }
};

let db;
let collections = {};

// Connect to MongoDB with proper error handling
async function connectDB() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...');
        
        const client = await MongoClient.connect(MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
        
        db = client.db(DB_NAME);
        
        console.log('✅ Connected to MongoDB Atlas');
        console.log(`📦 Database: ${DB_NAME}`);
        
        // Initialize collections for all project types
        await initializeCollections();
        
        return client;
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        
        // Gợi ý khắc phục
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check MongoDB Atlas IP Whitelist (0.0.0.0/0 for development)');
        console.log('   2. Verify username and password in connection string');
        console.log('   3. Ensure database user has read/write permissions');
        console.log('   4. Check if cluster is available and not paused');
        
        throw error;
    }
}

// Initialize collections for all projects
async function initializeCollections() {
    console.log('\n📁 Initializing collections...');
    
    for (const [projectType, config] of Object.entries(PROJECT_TYPES)) {
        collections[projectType] = {};
        
        for (const collectionName of config.collections) {
            const fullCollectionName = `${projectType}_${collectionName}`;
            collections[projectType][collectionName] = db.collection(fullCollectionName);
            
            // Create indexes
            if (collectionName === 'projects') {
                await collections[projectType][collectionName].createIndex({ userId: 1 });
                await collections[projectType][collectionName].createIndex({ createdAt: -1 });
            }
        }
        
        console.log(`   ✓ ${config.name}`);
    }
    
    console.log('✅ All collections initialized\n');
}

// ============================================
// GENERIC PROJECT ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Multi-Project API Backend is running',
        database: db ? 'connected' : 'disconnected',
        projects: Object.keys(PROJECT_TYPES)
    });
});

// Get all project types
app.get('/api/project-types', (req, res) => {
    const projectTypes = Object.entries(PROJECT_TYPES).map(([key, value]) => ({
        id: key,
        name: value.name,
        collections: value.collections
    }));
    
    res.json({
        success: true,
        data: projectTypes
    });
});

// Get all projects for a specific project type
app.get('/api/:projectType/projects', async (req, res) => {
    try {
        const { projectType } = req.params;
        const userId = req.query.userId || 'default_user';
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
        const projects = await collections[projectType].projects
            .find({ userId })
            .sort({ lastAccessed: -1 })
            .toArray();
        
        res.json({
            success: true,
            projectType,
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
app.get('/api/:projectType/projects/:id', async (req, res) => {
    try {
        const { projectType, id } = req.params;
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
        const project = await collections[projectType].projects.findOne({
            _id: new ObjectId(id)
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
app.post('/api/:projectType/projects', async (req, res) => {
    try {
        const { projectType } = req.params;
        const { name, description, color, userId } = req.body;
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
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
            projectType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            settings: {
                baseUrl: 'http://localhost:3000',
                theme: 'light'
            }
        };
        
        const result = await collections[projectType].projects.insertOne(project);
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
app.put('/api/:projectType/projects/:id', async (req, res) => {
    try {
        const { projectType, id } = req.params;
        const { name, description, color, settings } = req.body;
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
        const updates = {
            updatedAt: new Date().toISOString()
        };
        
        if (name !== undefined) updates.name = name.trim();
        if (description !== undefined) updates.description = description.trim();
        if (color !== undefined) updates.color = color;
        if (settings !== undefined) updates.settings = settings;
        
        const updatedProject = await collections[projectType].projects.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
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
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update project'
        });
    }
});

// Delete project
app.delete('/api/:projectType/projects/:id', async (req, res) => {
    try {
        const { projectType, id } = req.params;
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
        const result = await collections[projectType].projects.deleteOne({
            _id: new ObjectId(id)
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

// ============================================
// ADMIN ROUTES
// ============================================

// Get all projects across all types
app.get('/api/admin/all-projects', async (req, res) => {
    try {
        const userId = req.query.userId || 'default_user';
        const allProjects = [];
        
        for (const [projectType, config] of Object.entries(PROJECT_TYPES)) {
            const projects = await collections[projectType].projects
                .find({ userId })
                .toArray();
            
            allProjects.push({
                projectType,
                projectName: config.name,
                count: projects.length,
                projects
            });
        }
        
        res.json({
            success: true,
            data: allProjects
        });
    } catch (error) {
        console.error('Error fetching all projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch all projects'
        });
    }
});

// Clear all data for a project type
app.delete('/api/admin/:projectType/clear', async (req, res) => {
    try {
        const { projectType } = req.params;
        
        if (!PROJECT_TYPES[projectType]) {
            return res.status(404).json({
                success: false,
                error: 'Project type not found'
            });
        }
        
        let totalDeleted = 0;
        const results = {};
        
        for (const [collectionName, collection] of Object.entries(collections[projectType])) {
            const result = await collection.deleteMany({});
            results[collectionName] = result.deletedCount;
            totalDeleted += result.deletedCount;
        }
        
        res.json({
            success: true,
            message: `Cleared all data for ${projectType}`,
            totalDeleted,
            details: results
        });
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear data'
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        availableRoutes: [
            'GET /api/health',
            'GET /api/project-types',
            'GET /api/:projectType/projects',
            'POST /api/:projectType/projects',
            'GET /api/:projectType/projects/:id',
            'PUT /api/:projectType/projects/:id',
            'DELETE /api/:projectType/projects/:id'
        ]
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Multi-Project API Server is running on http://localhost:${PORT}`);
            console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
            console.log(`\n📚 Available Project Types:`);
            Object.entries(PROJECT_TYPES).forEach(([key, value]) => {
                console.log(`   • ${key}: ${value.name}`);
            });
            console.log(`\n✨ Press Ctrl+C to stop\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
