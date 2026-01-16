/**
 * Home Button Drag Effect với dây đàn hồi
 * Hiệu ứng kéo nút home sang phải để chuyển trang
 */

class HomeButtonDrag {
    constructor() {
        this.button = null;
        this.canvas = null;
        this.ctx = null;
        this.overlay = null;
        this.transition = null;
        
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.buttonRect = null;
        this.originPos = { x: 0, y: 0 };
        
        // Ngưỡng kéo để trigger chuyển trang (pixels)
        this.dragThreshold = 150;
        
        // Animation frame ID
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Đợi DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Lấy nút home
        this.button = document.getElementById('floatingHomeBtn');
        if (!this.button) {
            console.warn('Home button not found');
            return;
        }
        
        // Tạo canvas cho dây đàn hồi
        this.createCanvas();
        
        // Tạo overlay
        this.createOverlay();
        
        // Tạo transition element
        this.createTransition();
        
        // Lưu vị trí gốc
        this.updateOriginPos();
        
        // Bind events
        this.bindEvents();
        
        console.log('Home button drag effect initialized');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'homeButtonRope';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas khi window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.updateOriginPos();
        });
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'drag-overlay';
        document.body.appendChild(this.overlay);
    }
    
    createTransition() {
        this.transition = document.createElement('div');
        this.transition.className = 'page-transition';
        
        // Tạo iframe để load trang chủ thật
        this.transition.innerHTML = `
            <iframe src="/" class="page-transition-frame"></iframe>
        `;
        document.body.appendChild(this.transition);
    }
    
    updateOriginPos() {
        const rect = this.button.getBoundingClientRect();
        this.originPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    bindEvents() {
        // Mouse events
        this.button.addEventListener('mousedown', (e) => this.onDragStart(e));
        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));
        
        // Touch events cho mobile
        this.button.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0]), { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.onDragMove(e.touches[0]);
            }
        }, { passive: false });
        document.addEventListener('touchend', (e) => this.onDragEnd(e.changedTouches[0]));
        
        // Prevent click navigation
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    onDragStart(e) {
        this.isDragging = true;
        this.startPos = { x: e.clientX, y: e.clientY };
        this.currentPos = { x: e.clientX, y: e.clientY };
        
        this.button.classList.add('dragging');
        this.overlay.classList.add('active');
        
        // Update origin position
        this.updateOriginPos();
        
        // Start animation loop
        this.animate();
    }
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
        this.currentPos = { x: e.clientX, y: e.clientY };
        
        // Tính khoảng cách kéo
        const deltaX = this.currentPos.x - this.originPos.x;
        const deltaY = this.currentPos.y - this.originPos.y;
        
        // Giới hạn chỉ kéo sang phải và hơi xuống
        const clampedX = Math.max(0, deltaX);
        const clampedY = deltaY * 0.3; // Giảm độ di chuyển theo trục Y
        
        // Áp dụng resistance (càng kéo xa càng khó)
        const distance = Math.sqrt(clampedX * clampedX + clampedY * clampedY);
        const resistance = Math.min(1, distance / 300);
        const easedX = clampedX * (1 - resistance * 0.5);
        const easedY = clampedY * (1 - resistance * 0.5);
        
        // Di chuyển nút
        this.button.style.transform = `translate(${easedX}px, ${easedY}px) scale(1.1)`;
    }
    
    onDragEnd(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentPos.x - this.originPos.x;
        
        // Check nếu kéo đủ xa thì chuyển trang
        if (deltaX >= this.dragThreshold) {
            this.triggerPageTransition();
        } else {
            this.returnToOrigin();
        }
        
        this.isDragging = false;
        this.button.classList.remove('dragging');
        this.overlay.classList.remove('active');
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isDragging) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Vẽ dây đàn hồi
        this.drawRope();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawRope() {
        const deltaX = this.currentPos.x - this.originPos.x;
        const deltaY = this.currentPos.y - this.originPos.y;
        
        // Tính toán vị trí hiện tại của nút (sau resistance)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const resistance = Math.min(1, distance / 300);
        const easedX = Math.max(0, deltaX) * (1 - resistance * 0.5);
        const easedY = deltaY * 0.3 * (1 - resistance * 0.5);
        
        const buttonX = this.originPos.x + easedX;
        const buttonY = this.originPos.y + easedY;
        
        // Vẽ đường cong Bezier cho dây
        this.ctx.beginPath();
        
        // Điểm control để tạo đường cong
        const controlOffset = Math.min(distance * 0.5, 100);
        const controlX = this.originPos.x + easedX * 0.3;
        const controlY = this.originPos.y + controlOffset;
        
        // Gradient cho dây (màu xanh)
        const gradient = this.ctx.createLinearGradient(
            this.originPos.x, this.originPos.y,
            buttonX, buttonY
        );
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)'); // Green
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.9)'); // Blue
        gradient.addColorStop(1, 'rgba(37, 99, 235, 1)');
        
        // Độ dày dây cố định (không phụ thuộc vào khoảng cách)
        const thickness = 3;
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        
        // Vẽ đường cong
        this.ctx.moveTo(this.originPos.x, this.originPos.y);
        this.ctx.quadraticCurveTo(
            controlX, controlY,
            buttonX, buttonY
        );
        this.ctx.stroke();
        
        // Vẽ điểm gốc (anchor)
        this.ctx.beginPath();
        this.ctx.arc(this.originPos.x, this.originPos.y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Vẽ particles dọc theo dây
        this.drawParticles(buttonX, buttonY);
    }
    
    drawParticles(buttonX, buttonY) {
        const numParticles = 5;
        
        for (let i = 1; i < numParticles; i++) {
            const t = i / numParticles;
            
            // Tính vị trí trên đường cong
            const controlOffset = Math.min(Math.sqrt(
                Math.pow(buttonX - this.originPos.x, 2) +
                Math.pow(buttonY - this.originPos.y, 2)
            ) * 0.5, 100);
            const controlX = this.originPos.x + (buttonX - this.originPos.x) * 0.3;
            const controlY = this.originPos.y + controlOffset;
            
            // Quadratic Bezier formula
            const x = Math.pow(1 - t, 2) * this.originPos.x +
                     2 * (1 - t) * t * controlX +
                     Math.pow(t, 2) * buttonX;
            const y = Math.pow(1 - t, 2) * this.originPos.y +
                     2 * (1 - t) * t * controlY +
                     Math.pow(t, 2) * buttonY;
            
            // Vẽ particle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(34, 197, 94, ${1 - t * 0.5})`;
            this.ctx.fill();
        }
    }
    
    returnToOrigin() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Animation quay về
        this.button.classList.add('returning');
        this.button.style.transform = '';
        
        setTimeout(() => {
            this.button.classList.remove('returning');
        }, 500);
    }
    
    triggerPageTransition() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ẩn nút
        this.button.style.opacity = '0';
        this.button.style.transform = `translateX(${window.innerWidth}px)`;
        
        // Hiện transition với iframe
        setTimeout(() => {
            this.transition.classList.add('active');
        }, 100);
        
        // Chuyển trang thật sau khi animation gần hoàn thành
        // Giảm thời gian xuống để chuyển trang ngay khi slide gần xong
        setTimeout(() => {
            // Chuyển trang trực tiếp, không cần fade thêm
            window.location.href = '/';
        }, 500);
    }
}

// Initialize khi load trang
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HomeButtonDrag();
    });
} else {
    new HomeButtonDrag();
}

// Export for module usage
export default HomeButtonDrag;
