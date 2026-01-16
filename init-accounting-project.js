// Initialize Default Accounting Project
// Script tự động tạo dự án kế toán mặc định

import { ProjectManager } from './js/project-manager.js';

async function initDefaultProject() {
    const projectManager = new ProjectManager();
    
    // Load existing projects
    await projectManager.loadProjects();
    const existingProjects = projectManager.getAllProjects();
    
    // Check if accounting project already exists
    const accountingProject = existingProjects.find(p => 
        p.name === 'Dự án Kế toán Mobile' || p.id === 'ke-toan-mobile-app'
    );
    
    if (accountingProject) {
        console.log('✅ Dự án Kế toán đã tồn tại:', accountingProject.name);
        return accountingProject;
    }
    
    // Create new accounting project
    console.log('📝 Đang tạo dự án Kế toán mới...');
    
    const project = await projectManager.createProject(
        'Dự án Kế toán Mobile',
        'Hệ thống API kế toán cho ứng dụng di động - Bao gồm: Tỷ lệ lọ, Phiếu thanh toán, Phiếu tạm ứng, và các API mobile',
        '#667eea'
    );
    
    if (project) {
        // Update project with accounting-specific settings
        await projectManager.updateProject(project.id, {
            apiFolder: 'apis/ke-toan',
            settings: {
                baseUrl: 'http://localhost:3000',
                theme: 'light',
                defaultFolder: 'mobile-api-accountant'
            }
        });
        
        console.log('✅ Đã tạo dự án Kế toán thành công!');
        console.log('📁 API Folder:', 'apis/ke-toan');
        console.log('🎨 Màu:', '#667eea');
        console.log('📋 ID:', project.id);
        
        return project;
    } else {
        console.error('❌ Không thể tạo dự án');
        return null;
    }
}

// Run initialization
initDefaultProject().then(project => {
    if (project) {
        console.log('\n🎉 Khởi tạo hoàn tất!');
        console.log('👉 Mở project-home.html để xem dự án');
    }
}).catch(error => {
    console.error('❌ Lỗi khởi tạo:', error);
});
