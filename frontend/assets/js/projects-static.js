// Import modules
import { PatternLock } from './pattern-lock.js';
import { ProjectUnlockManager } from './project-unlock-manager.js';
import { API_BASE_URL } from './api-config.js';

// ==============================================
// CONFIGURATION - Bật/Tắt load từ API
// ==============================================
const USE_API_LOADING = false; // TODO: Đổi thành true khi muốn load từ MongoDB API
// false = Load từ projectTemplates tĩnh
// true  = Load từ MongoDB API với fallback về templates

// Static project templates (fallback nếu không load được từ MongoDB)
const projectTemplates = [
    {
        name: 'Dự án Kế toán',
        description: 'Hệ thống API kế toán',
        colorStart: '#667eea',
        colorEnd: '#764ba2',
        date: '1/1/2026',
        apiFolder: 'ke-toan'
    },
    {
        name: 'Taco Web CMS',
        description: 'API cho dự án sushi Taco',
        colorStart: '#38b2ac',
        colorEnd: '#48bb78',
        date: '1/1/2026',
        apiFolder: 'taco-web-cms'
    },
    {
        name: 'OKR Management',
        description: 'Quản lý người dùng và phân quyền RBAC',
        colorStart: '#f6ad55',
        colorEnd: '#ed8936',
        date: '1/1/2026',
        apiFolder: 'okr-management'
    },
    {
        name: 'E-commerce API',
        description: 'API thương mại điện tử toàn diện',
        colorStart: '#ed64a6',
        colorEnd: '#d53f8c',
        date: '1/1/2026',
        apiFolder: 'e-commerce-api'
    },
    {
        name: 'Notification Service',
        description: 'Dịch vụ gửi thông báo đa kênh',
        colorStart: '#4299e1',
        colorEnd: '#3182ce',
        date: '1/1/2026',
        apiFolder: 'notification-service'
    },
    {
        name: 'Analytics Dashboard',
        description: 'API phân tích dữ liệu và báo cáo',
        colorStart: '#9f7aea',
        colorEnd: '#805ad5',
        date: '1/1/2026',
        apiFolder: 'analytics-dashboard'
    }
];

let projects = [];

// Canvas Honeycomb Rendering
let mouseX = -1000;
let mouseY = -1000;
let hexagons = [];
let hoveredHex = null;
let animationTime = 0;

function renderHoneycombCanvas() {
    animationTime += 0.04;  // Tăng tốc độ xoay gradient
    const canvas = document.getElementById('honeycombCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configuration
    const extraRows = 5;
    const extraCols = 9;
    const rowSpacing = -59;
    const rowOffsetEven = 34;
    const hexMarginLeft = 9;
    const hexMarginTop = 50;
    const borderWidth = 2;
    const gridStartX = -40;

    // Calculate hexagon dimensions
    const hexSize = 40;
    const hexHeightActual = hexSize * Math.sqrt(3);
    const hexWidthActual = hexSize * 2;

    // Calculate grid dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const hexPerRow = Math.ceil(screenWidth / (hexWidthActual * 0.75)) + extraCols + 2;
    const rows = Math.ceil(screenHeight / (hexHeightActual + rowSpacing)) + extraRows + 2;

    // Build hexagon positions
    hexagons = [];
    for (let row = 0; row < rows; row++) {
        const offsetX = (row % 2 === 0) ? 0 : rowOffsetEven;
        const y = row * (hexHeightActual + rowSpacing + hexMarginTop) + hexHeightActual/2;

        for (let col = 0; col < hexPerRow; col++) {
            const x = col * (hexWidthActual * 0.75 + hexMarginLeft) + hexWidthActual/2 + offsetX + gridStartX;
            hexagons.push({ x, y, row, col });
        }
    }

    // Check if point is inside hexagon
    function isPointInHexagon(px, py, hx, hy, size) {
        const dx = Math.abs(px - hx);
        const dy = Math.abs(py - hy);
        const hexHeight = size * Math.sqrt(3) / 2;

        if (dx > size || dy > hexHeight) return false;

        return dy <= hexHeight - dx * Math.sqrt(3) / 2;
    }

    // Find hovered hexagon
    hoveredHex = null;
    for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];
        if (isPointInHexagon(mouseX, mouseY, hex.x, hex.y, hexSize)) {
            hoveredHex = i;
            break;
        }
    }

    // Draw glow effect only
    function drawGlow(x, y, size, isHovered, isAdjacent) {
        if (!isHovered && !isAdjacent) return;

        ctx.save();

        const glowRadius = size * (isHovered ? 4 : 2);

        if (isHovered) {
            // Draw rotating rainbow sectors
            const colors = [
                '#667eea', // Tím xanh
                '#8b5cf6', // Tím đậm
                '#a855f7', // Tím sáng
                '#ec4899', // Hồng
                '#f472b6', // Hồng sáng
                '#3b82f6', // Xanh dương
                '#60a5fa', // Xanh sáng
            ];

            const anglePerColor = (Math.PI * 2) / colors.length;

            colors.forEach((color, i) => {
                const startAngle = animationTime + (i * anglePerColor);

                // Create gradient from center to edge for each sector
                const midAngle = startAngle + anglePerColor / 2;
                const gradX = x + Math.cos(midAngle) * glowRadius * 0.7;
                const gradY = y + Math.sin(midAngle) * glowRadius * 0.7;

                const gradient = ctx.createRadialGradient(gradX, gradY, 0, gradX, gradY, glowRadius * 1.2);
                gradient.addColorStop(0, color + 'cc'); // 80% opacity
                gradient.addColorStop(0.6, color + '66'); // 40% opacity
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            });
        } else {
            // Simple cyan gradient for adjacent
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.5)');
            gradient.addColorStop(0.5, 'rgba(0, 153, 204, 0.3)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Draw hexagon shape only
    function drawHexagon(x, y, size, isHovered, isAdjacent) {
        const angle = Math.PI / 3;

        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const xPos = x + size * Math.cos(angle * i - Math.PI / 6);
            const yPos = y + size * Math.sin(angle * i - Math.PI / 6);
            if (i === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        ctx.closePath();

        // Fill
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Stroke
        if (isHovered) {
            ctx.strokeStyle = '#00d4ff';
        } else if (isAdjacent) {
            ctx.strokeStyle = '#0099cc';
        } else {
            ctx.strokeStyle = '#1a1a1a';
        }
        ctx.lineWidth = borderWidth;
        ctx.stroke();
    }

    // Calculate hover states for all hexagons
    const hexStates = hexagons.map((hex, i) => {
        const isHovered = i === hoveredHex;
        let isAdjacent = false;

        if (hoveredHex !== null) {
            const hoveredData = hexagons[hoveredHex];
            const rowDiff = Math.abs(hex.row - hoveredData.row);
            const colDiff = Math.abs(hex.col - hoveredData.col);

            if (rowDiff <= 1 && colDiff <= 1 && !isHovered) {
                isAdjacent = true;
            }
        }

        return { isHovered, isAdjacent };
    });

    // Pass 1: Draw all glow effects (background layer)
    for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];
        const { isHovered, isAdjacent } = hexStates[i];
        drawGlow(hex.x, hex.y, hexSize, isHovered, isAdjacent);
    }

    // Pass 2: Draw all hexagons (foreground layer)
    for (let i = 0; i < hexagons.length; i++) {
        const hex = hexagons[i];
        const { isHovered, isAdjacent } = hexStates[i];
        drawHexagon(hex.x, hex.y, hexSize, isHovered, isAdjacent);
    }
}

// Mouse tracking for canvas - listen on document to capture all mouse movements
function initCanvasMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });
}

// Animation loop for canvas
function animateCanvas() {
    renderHoneycombCanvas();
    requestAnimationFrame(animateCanvas);
}

// Load projects from MongoDB API or static templates
async function loadProjects() {
    // TODO: Khi backend MongoDB đã sẵn sàng, đổi USE_API_LOADING = true để load từ API
    if (!USE_API_LOADING) {
        console.log('📦 Loading projects from static templates (USE_API_LOADING = false)');
        
        // Load từ dữ liệu tĩnh
        projects = projectTemplates.map(p => ({
            ...p,
            id: p.apiFolder
        }));
        
        console.log('✅ Loaded', projects.length, 'projects:', projects.map(p => p.name).join(', '));
        return;
    }
    
    // Load từ MongoDB API
    try {
        console.log('🔄 Loading projects from MongoDB API...');
        const response = await fetch(`${API_BASE_URL}/projects?userId=default_user`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            console.log('✅ Loaded projects from MongoDB:', data.data.length);
            
            // Định nghĩa thứ tự ưu tiên: Kế toán (#1), Taco CMS (#2)
            const priorityOrder = ['ke-toan', 'taco-web-cms'];
            
            // Map MongoDB projects to UI format
            projects = data.data.map(p => ({
                _id: p._id,
                id: p._id, // Use MongoDB _id as id
                name: p.name,
                description: p.description || '',
                colorStart: p.color || '#667eea',
                colorEnd: p.color || '#764ba2',
                date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
                apiFolder: p.apiFolder
            }))
            // Sắp xếp theo thứ tự ưu tiên
            .sort((a, b) => {
                const indexA = priorityOrder.indexOf(a.apiFolder);
                const indexB = priorityOrder.indexOf(b.apiFolder);
                
                // Nếu cả 2 đều trong priority list, sắp xếp theo thứ tự trong list
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // Nếu chỉ A trong priority list, A lên đầu
                if (indexA !== -1) return -1;
                // Nếu chỉ B trong priority list, B lên đầu
                if (indexB !== -1) return 1;
                // Cả 2 không trong priority list, giữ nguyên thứ tự
                return 0;
            });
            
            console.log('📋 Sorted projects:', projects.map(p => p.apiFolder).join(', '));
        } else {
            console.log('⚠️ No projects in MongoDB, using templates');
            // Use templates if no projects in database
            projects = projectTemplates.map(p => ({
                ...p,
                id: p.apiFolder
            }));
        }
    } catch (error) {
        console.error('❌ Error loading projects from API:', error);
        console.log('⚠️ Fallback to static templates');
        
        // Fallback về dữ liệu tĩnh
        projects = projectTemplates.map(p => ({
            ...p,
            id: p.apiFolder
        }));
    }
}

function renderHoneycomb() {
    const honeycomb = document.getElementById('honeycomb');
    
    console.log('🎨 Rendering honeycomb with', projects.length, 'projects');
    
    if (!honeycomb) {
        console.error('❌ Honeycomb element not found!');
        return;
    }
    
    // Clear existing content
    honeycomb.innerHTML = '';

    // Create 3 rows for honeycomb pattern: 3-2-1
    const row1 = document.createElement('div');
    row1.className = 'hex-row';

    const row2 = document.createElement('div');
    row2.className = 'hex-row';

    const row3 = document.createElement('div');
    row3.className = 'hex-row';

    projects.forEach((project, index) => {
        console.log(`  📌 Rendering project ${index + 1}:`, project.name);
        const wrapper = document.createElement('div');
        wrapper.className = 'hexagon-wrapper';
        wrapper.style.setProperty('--color-start', project.colorStart);
        wrapper.style.setProperty('--color-end', project.colorEnd);

        wrapper.innerHTML = `
            <div class="hexagon">
                <div class="hexagon-border"></div>
                <div class="hexagon-inner">
                    <div class="hexagon-content">
                        <div class="project-icon">
                            <span class="project-number">${index + 1}</span>
                        </div>
                        <div class="project-name">${project.name}</div>
                        <div class="project-description">${project.description}</div>
                        <div class="project-date">
                            <i data-lucide="calendar"></i>
                            <span>${project.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click handler with proper event capture
        const hexagon = wrapper.querySelector('.hexagon');
        hexagon.style.cursor = 'pointer';
        
        hexagon.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('=== HEXAGON CLICKED ===');
            console.log('Project:', project.name);
            console.log('Index:', index);
            console.log('Project ID:', project.id, project._id);
            
            // Tạo object project đầy đủ với MongoDB _id
            const projectObj = {
                id: project._id || project.id, // Ưu tiên MongoDB _id
                name: project.name,
                description: project.description,
                apiFolder: project.apiFolder
            };
            
            // Dự án Kế toán - không cần mật khẩu
            if (index === 0) {
                console.log('>>> Redirecting to /index (Kế toán)...');
                localStorage.setItem('current_project_id', 'ke-toan');
                window.location = '/index';
            } 
            // Taco Web CMS - không cần mật khẩu, chỉ redirect
            else if (index === 1) {
                console.log('>>> Redirecting to /index (Taco Web CMS)...');
                localStorage.setItem('current_project_id', 'taco-web-cms');
                window.location = '/index';
            } 
            // Các dự án khác - cần mật khẩu
            else {
                console.log('>>> Checking password for:', project.name);
                // Sử dụng ProjectUnlockManager
                await projectUnlock.openProject(projectObj, {
                    setCurrentProject: (id) => {
                        return Promise.resolve();
                    }
                });
            }
        }, true);

        // Distribute to rows: 3-2-1 pattern
        if (index < 3) {
            row1.appendChild(wrapper);
        } else if (index < 5) {
            row2.appendChild(wrapper);
        } else {
            row3.appendChild(wrapper);
        }
    });

    honeycomb.appendChild(row1);
    honeycomb.appendChild(row2);
    honeycomb.appendChild(row3);

    lucide.createIcons();

    // Initialize lazy loading animation
    initLazyLoading();
}

// Lazy Loading Animation with Intersection Observer
function initLazyLoading() {
    const wrappers = document.querySelectorAll('.hexagon-wrapper');

    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Add stagger delay to each card
    wrappers.forEach((wrapper, index) => {
        wrapper.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(wrapper);
    });
}

// Control Panel Logic
function initControlPanel() {
    const root = document.documentElement;
    const panel = document.getElementById('controlPanel');
    const toggleBtn = document.getElementById('toggleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const panelToggleBtn = document.getElementById('panelToggleBtn');

    // Toggle panel visibility with floating button
    panelToggleBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        const icon = panelToggleBtn.querySelector('i');
        icon.setAttribute('data-lucide', panel.classList.contains('hidden') ? 'settings' : 'x');
        lucide.createIcons();
    });

    const controls = {
        hexGap: { slider: 'hexGapSlider', input: 'hexGapInput', cssVar: '--hex-gap', unit: 'px', default: 10 },
        rowSpacing: { slider: 'rowSpacingSlider', input: 'rowSpacingInput', cssVar: '--row-spacing', unit: 'px', default: -30 },
        row2Offset: { slider: 'row2OffsetSlider', input: 'row2OffsetInput', cssVar: '--row2-offset', unit: 'px', default: 165 },
        row3Offset: { slider: 'row3OffsetSlider', input: 'row3OffsetInput', cssVar: '--row3-offset', unit: 'px', default: 330 }
    };

    // Sync slider and input
    Object.values(controls).forEach(control => {
        const slider = document.getElementById(control.slider);
        const input = document.getElementById(control.input);

        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            input.value = value;
            root.style.setProperty(control.cssVar, value + control.unit);
        });

        input.addEventListener('input', (e) => {
            const value = e.target.value;
            slider.value = value;
            root.style.setProperty(control.cssVar, value + control.unit);
        });
    });

    // Toggle panel
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        const icon = toggleBtn.querySelector('i');
        icon.setAttribute('data-lucide', panel.classList.contains('collapsed') ? 'maximize-2' : 'minimize-2');
        lucide.createIcons();
    });

    // Reset to defaults
    resetBtn.addEventListener('click', () => {
        Object.values(controls).forEach(control => {
            const slider = document.getElementById(control.slider);
            const input = document.getElementById(control.input);
            slider.value = control.default;
            input.value = control.default;
            root.style.setProperty(control.cssVar, control.default + control.unit);
        });
    });

    // Copy CSS values
    copyBtn.addEventListener('click', () => {
        const cssText = `:root {
    --hex-gap: ${document.getElementById('hexGapInput').value}px;
    --row-spacing: ${document.getElementById('rowSpacingInput').value}px;
    --row2-offset: ${document.getElementById('row2OffsetInput').value}px;
    --row3-offset: ${document.getElementById('row3OffsetInput').value}px;
}`;

        navigator.clipboard.writeText(cssText).then(() => {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'copy-success';
            successMsg.innerHTML = '<i data-lucide="check-circle"></i><span>Đã copy CSS!</span>';
            document.body.appendChild(successMsg);
            lucide.createIcons();

            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        });
    });
}

// Create project from template
async function createProjectFromTemplate(projectId) {
    try {
        // Check if project already exists
        const checkResponse = await fetch(`${API_BASE_URL}/projects`);
        const projectsData = await checkResponse.json();
        
        // Find existing project by apiFolder
        const existingProject = projectsData.data?.find(p => p.apiFolder === projectId);
        
        if (existingProject) {
            console.log('Project already exists, redirecting...');
            localStorage.setItem('current_project_id', projectId);
            window.location.href = '/index';
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/init-project`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: projectId,
                projectName: 'Taco API Gateway',
                description: 'API cho dự án sushi Taco'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        const result = await response.json();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'copy-success';
        successMsg.innerHTML = '<i data-lucide="check-circle"></i><span>Đã tạo dự án Taco Web CMS!</span>';
        document.body.appendChild(successMsg);
        lucide.createIcons();

        setTimeout(() => {
            successMsg.remove();
            // Chuyển sang trang project
            localStorage.setItem('current_project_id', projectId);
            window.location.href = '/index';
        }, 1500);

    } catch (error) {
        console.error('Error creating project:', error);
        alert('Không thể tạo dự án. Vui lòng kiểm tra backend server.');
    }
}

// Initialize Project Unlock Manager
const projectUnlock = new ProjectUnlockManager({
    PatternLockClass: PatternLock,
    noPasswordProjects: ['Kế toán', 'Taco'], // Projects không cần password
    onUnlockSuccess: (projectId, projectManager) => {
        // Custom logic khi unlock thành công
        console.log('✓ Unlocked project:', projectId);
        localStorage.setItem('current_project_id', projectId);
        window.location.href = '/index';
    }
});

// Export để có thể gọi từ onclick
window.projectUnlock = projectUnlock;

// Initialize - Load projects then render
(async function init() {
    console.log('🚀 Initializing app...');
    await loadProjects();
    console.log('📦 Projects loaded:', projects.length);
    renderHoneycomb();
    initCanvasMouseTracking();
    initControlPanel();
    animateCanvas();  // Start animation loop instead of single render
    console.log('✅ App initialized');
})();

// Re-render khi resize (no need to call render, animation loop handles it)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Animation loop will handle re-rendering
    }, 100);
});
