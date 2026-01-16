const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8888;
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const API_DOCS_DIR = path.join(__dirname, 'api-docs');

// Function to get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    
    // Priority order: Ethernet > Wi-Fi > Others
    const priorityNames = ['Ethernet', 'Wi-Fi', 'en0', 'eth0', 'wlan0'];
    
    // First, try priority interfaces
    for (const priorityName of priorityNames) {
        if (interfaces[priorityName]) {
            for (const iface of interfaces[priorityName]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
    }
    
    // Fallback: any non-internal IPv4, excluding virtual adapters
    for (const name of Object.keys(interfaces)) {
        // Skip virtual adapters (WSL, VirtualBox, VMware, Hyper-V, etc.)
        if (name.includes('vEthernet') || 
            name.includes('WSL') || 
            name.includes('VirtualBox') || 
            name.includes('VMware') ||
            name.includes('Hyper-V')) {
            continue;
        }
        
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    
    return 'localhost';
}

// Serve api-docs folder for API documentation and test data
app.use('/api-docs', express.static(API_DOCS_DIR));

// Serve static files (CSS, JS, images, etc.) - but NOT HTML files
app.use(express.static(FRONTEND_DIR, {
    extensions: false,
    index: false,
    setHeaders: (res, path) => {
        // Prevent serving .html files as static
        if (path.endsWith('.html')) {
            res.status(404);
        }
    }
}));

// Redirect .html URLs to clean slugs
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const slugMap = {
            '/projects-static.html': '/',
            '/project-home.html': '/project-home',
            '/init-project.html': '/init-project',
            '/reset-admin-password.html': '/reset-password',
            '/index.html': '/index',
        };
        
        const cleanUrl = slugMap[req.path];
        if (cleanUrl) {
            return res.redirect(301, cleanUrl);
        }
        
        // For other .html files, redirect to path without .html
        const withoutHtml = req.path.replace('.html', '');
        return res.redirect(301, withoutHtml);
    }
    next();
});

// Define routes with clean slugs
const routes = {
    '/': 'pages/projects-static.html',           // Home page
    '/home': 'pages/projects-static.html',        // Alternative home
    '/projects': 'pages/projects-static.html',    // Projects list
    '/index': 'pages/index.html',                // API Tester main page
    '/project-home': 'pages/project-home.html',   // Project home
    '/init-project': 'pages/init-project.html',   // Initialize project
    '/reset-password': 'pages/reset-admin-password.html', // Reset password
};

// Apply all routes
Object.keys(routes).forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(FRONTEND_DIR, routes[route]));
    });
});

// Fallback: try to add .html extension for other routes
app.use((req, res, next) => {
    if (!path.extname(req.path)) {
        const htmlPath = path.join(FRONTEND_DIR, 'pages', req.path + '.html');
        res.sendFile(htmlPath, (err) => {
            if (err) {
                next();
            }
        });
    } else {
        next();
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    
    console.log(`\n🌐 Server is running!`);
    console.log(`📄 Clean URLs with slugs\n`);
    
    console.log(`📍 Access URLs:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${localIP}:${PORT}`);
    
    console.log(`\n👥 Share with others on same network:`);
    console.log(`   http://${localIP}:${PORT}`);
    
    console.log(`\n✨ Available Routes (Clean URLs):`);
    console.log(`   http://${localIP}:${PORT}/              → Home (Projects)`);
    console.log(`   http://${localIP}:${PORT}/projects      → Projects List`);
    console.log(`   http://${localIP}:${PORT}/project-home  → Project Home`);
    console.log(`   http://${localIP}:${PORT}/init-project  → Init Project`);
    console.log(`   http://${localIP}:${PORT}/reset-password → Reset Password`);
    
    console.log(`\n⚠️  Make sure Windows Firewall allows port ${PORT}`);
    console.log(`\n✨ Press Ctrl+C to stop\n`);
});
