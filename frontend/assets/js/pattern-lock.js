// Pattern Lock Module
// Vẽ và xác thực pattern password như Android

export class PatternLock {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Options
        this.options = {
            rows: options.rows || 3,
            cols: options.cols || 3,
            dotRadius: options.dotRadius || 12,
            lineWidth: options.lineWidth || 4,
            activeColor: options.activeColor || '#06b6d4',
            errorColor: options.errorColor || '#f56565',
            successColor: options.successColor || '#10b981',
            dotColor: options.dotColor || 'rgba(255, 255, 255, 0.2)',
            dotActiveColor: options.dotActiveColor || '#06b6d4',
            ...options
        };

        // State
        this.pattern = [];
        this.currentPattern = [];
        this.isDrawing = false;
        this.currentPoint = null;
        this.dots = [];
        this.mode = 'input'; // 'input', 'verify', 'set'
        this.onComplete = null;

        this.init();
    }

    // Initialize canvas and dots
    init() {
        this.setupCanvas();
        this.calculateDots();
        this.setupEventListeners();
        this.draw();
    }

    // Setup canvas size
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    // Calculate dot positions
    calculateDots() {
        const padding = 60;
        const cols = this.options.cols;
        const rows = this.options.rows;
        
        const totalWidth = this.width - padding * 2;
        const totalHeight = this.height - padding * 2;
        
        const spacingX = totalWidth / (cols - 1);
        const spacingY = totalHeight / (rows - 1);

        this.dots = [];
        let id = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.dots.push({
                    id: id++,
                    x: padding + col * spacingX,
                    y: padding + row * spacingY,
                    active: false
                });
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleEnd.bind(this));

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Handle start drawing
    handleStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        this.currentPattern = [];
        this.resetDotsActive();
        
        const point = this.getMousePos(e);
        const dot = this.getDotAtPoint(point);
        
        if (dot) {
            this.addDotToPattern(dot);
        }
        
        this.draw();
    }

    // Handle move
    handleMove(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const point = this.getMousePos(e);
        this.currentPoint = point;
        
        const dot = this.getDotAtPoint(point);
        if (dot && !dot.active) {
            this.addDotToPattern(dot);
        }
        
        this.draw();
    }

    // Handle end drawing
    handleEnd(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        this.isDrawing = false;
        this.currentPoint = null;
        
        // Check pattern
        if (this.currentPattern.length > 0) {
            if (this.onComplete) {
                this.onComplete(this.currentPattern.map(d => d.id));
            }
        }
        
        this.draw();
    }

    // Get mouse/touch position relative to canvas
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }
        
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // Get dot at point
    getDotAtPoint(point) {
        for (let dot of this.dots) {
            const dx = point.x - dot.x;
            const dy = point.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.options.dotRadius * 2) {
                return dot;
            }
        }
        return null;
    }

    // Add dot to pattern
    addDotToPattern(dot) {
        if (!dot.active) {
            dot.active = true;
            this.currentPattern.push(dot);
        }
    }

    // Reset dots active state
    resetDotsActive() {
        this.dots.forEach(dot => dot.active = false);
    }

    // Draw everything
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw lines between active dots with rope effect
        if (this.currentPattern.length > 0) {
            // Draw each segment as straight line with glow and particles
            for (let i = 0; i < this.currentPattern.length; i++) {
                const startDot = this.currentPattern[i];
                let endDot;
                
                if (i < this.currentPattern.length - 1) {
                    endDot = this.currentPattern[i + 1];
                } else if (this.isDrawing && this.currentPoint) {
                    endDot = this.currentPoint;
                } else {
                    continue;
                }
                
                // Create gradient
                const gradient = this.ctx.createLinearGradient(
                    startDot.x, startDot.y,
                    endDot.x, endDot.y
                );
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
                gradient.addColorStop(0.5, 'rgba(8, 145, 178, 0.9)');
                gradient.addColorStop(1, 'rgba(6, 182, 212, 1)');
                
                // Draw outer glow layers
                for (let j = 3; j >= 1; j--) {
                    this.ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * j})`;
                    this.ctx.lineWidth = this.options.lineWidth + (j * 6);
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin = 'round';
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(startDot.x, startDot.y);
                    this.ctx.lineTo(endDot.x, endDot.y);
                    this.ctx.stroke();
                }
                
                // Draw main line with strong glow
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = this.options.lineWidth;
                this.ctx.lineCap = 'round';
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#06b6d4';
                
                this.ctx.beginPath();
                this.ctx.moveTo(startDot.x, startDot.y);
                this.ctx.lineTo(endDot.x, endDot.y);
                this.ctx.stroke();
                
                // Draw particles along the line
                this.drawParticlesAlongLine(startDot, endDot, 5);
                
                // Draw anchor point at start
                this.ctx.shadowBlur = 0;
                this.ctx.beginPath();
                this.ctx.arc(startDot.x, startDot.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
                this.ctx.fill();
                this.ctx.strokeStyle = 'rgba(16, 185, 129, 1)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }

        // Draw dots with glow effect
        this.dots.forEach(dot => {
            if (dot.active) {
                // Draw outer glow for active dots
                for (let i = 3; i >= 1; i--) {
                    this.ctx.beginPath();
                    this.ctx.arc(dot.x, dot.y, this.options.dotRadius + (i * 4), 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(6, 182, 212, ${0.15 * i})`;
                    this.ctx.fill();
                }
                
                // Main dot with shadow
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#06b6d4';
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, this.options.dotRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.options.dotActiveColor;
                this.ctx.fill();
                
                // Inner circle with glow
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, this.options.dotRadius - 4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#ffffff';
                this.ctx.fill();
                
                // Reset shadow
                this.ctx.shadowBlur = 0;
            } else {
                // Inactive dots with subtle style
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, this.options.dotRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.options.dotColor;
                this.ctx.fill();
                
                // Draw border
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }
    
    // Draw particles along straight line
    drawParticlesAlongLine(startDot, endDot, numParticles) {
        for (let i = 1; i < numParticles; i++) {
            const t = i / numParticles;
            
            // Linear interpolation
            const x = startDot.x + (endDot.x - startDot.x) * t;
            const y = startDot.y + (endDot.y - startDot.y) * t;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(16, 185, 129, ${1 - t * 0.5})`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
    }

    // Show error animation
    showError() {
        const originalColor = this.options.activeColor;
        this.options.activeColor = this.options.errorColor;
        this.options.dotActiveColor = this.options.errorColor;
        this.draw();
        
        // Shake animation
        this.canvas.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            this.options.activeColor = originalColor;
            this.options.dotActiveColor = originalColor;
            this.reset();
            this.canvas.style.animation = '';
        }, 500);
    }

    // Show success animation
    showSuccess() {
        const originalColor = this.options.activeColor;
        this.options.activeColor = this.options.successColor;
        this.options.dotActiveColor = this.options.successColor;
        this.draw();
        
        setTimeout(() => {
            this.options.activeColor = originalColor;
            this.options.dotActiveColor = originalColor;
            this.reset();
        }, 500);
    }

    // Reset pattern
    reset() {
        this.currentPattern = [];
        this.resetDotsActive();
        this.isDrawing = false;
        this.currentPoint = null;
        this.draw();
    }

    // Set pattern (for verification)
    setPattern(pattern) {
        this.pattern = pattern;
    }

    // Set mode
    setMode(mode) {
        this.mode = mode;
        this.reset();
    }

    // Set completion callback
    onPatternComplete(callback) {
        this.onComplete = callback;
    }

    // Resize canvas
    resize() {
        this.setupCanvas();
        this.calculateDots();
        this.draw();
    }

    // Destroy
    destroy() {
        this.canvas.removeEventListener('mousedown', this.handleStart);
        this.canvas.removeEventListener('mousemove', this.handleMove);
        this.canvas.removeEventListener('mouseup', this.handleEnd);
        this.canvas.removeEventListener('touchstart', this.handleStart);
        this.canvas.removeEventListener('touchmove', this.handleMove);
        this.canvas.removeEventListener('touchend', this.handleEnd);
    }
}
