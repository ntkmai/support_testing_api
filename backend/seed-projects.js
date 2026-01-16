// Script to seed 6 projects into MongoDB
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maithanh1504thuan_db_user:urswNfVgM7icDnCE@masterbe.xjftrtj.mongodb.net/';
const DB_NAME = 'api_test_tool';
const COLLECTION_NAME = 'projects';

const projects = [
    {
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
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    },
    {
        userId: 'default_user',
        name: 'Taco Web CMS',
        description: 'API cho dự án sushi Taco',
        color: '#38b2ac',
        pattern: null,
        hasPassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        apiFolder: 'taco-web-cms',
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    },
    {
        userId: 'default_user',
        name: 'User Management',
        description: 'Quản lý người dùng và phân quyền RBAC',
        color: '#f6ad55',
        pattern: null,
        hasPassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        apiFolder: 'user-management',
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    },
    {
        userId: 'default_user',
        name: 'E-commerce API',
        description: 'API thương mại điện tử toàn diện',
        color: '#ed64a6',
        pattern: null,
        hasPassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        apiFolder: 'e-commerce-api',
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    },
    {
        userId: 'default_user',
        name: 'Notification Service',
        description: 'Dịch vụ gửi thông báo đa kênh',
        color: '#4299e1',
        pattern: null,
        hasPassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        apiFolder: 'notification-service',
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    },
    {
        userId: 'default_user',
        name: 'Analytics Dashboard',
        description: 'API phân tích dữ liệu và báo cáo',
        color: '#9f7aea',
        pattern: null,
        hasPassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        apiFolder: 'analytics-dashboard',
        settings: {
            baseUrl: 'http://localhost:5000',
            theme: 'light'
        }
    }
];

async function seedProjects() {
    let client;
    
    try {
        console.log('🔄 Connecting to MongoDB...');
        client = await MongoClient.connect(MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 10000,
        });
        
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        console.log('✅ Connected to MongoDB');
        
        // Clear existing projects
        console.log('🗑️  Clearing existing projects...');
        const deleteResult = await collection.deleteMany({ userId: 'default_user' });
        console.log(`   Deleted ${deleteResult.deletedCount} existing projects`);
        
        // Insert new projects
        console.log('📦 Inserting 6 new projects...');
        const result = await collection.insertMany(projects);
        console.log(`✅ Successfully inserted ${result.insertedCount} projects`);
        
        // Display inserted projects
        console.log('\n📋 Inserted Projects:');
        projects.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} (${p.apiFolder})`);
        });
        
        console.log('\n✨ Seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding projects:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('👋 Database connection closed');
        }
    }
}

// Run the seed function
seedProjects();
