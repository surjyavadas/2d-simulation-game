export class UI {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bestDistance = parseInt(localStorage.getItem('hc_best_distance')) || 0;
        this.leftPressed = false;
        this.rightPressed = false;
        this.setupInput();
    }
    
    setupInput() {
        const handleClick = (e) => {
            if (e) e.preventDefault();
            if (window.gameState === 'idle') {
                window.dispatchEvent(new Event('startGame'));
            } else if (window.gameState === 'over') {
                window.dispatchEvent(new Event('retryGame'));
            }
        };
        
        this.canvas.addEventListener('mousedown', handleClick);
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (window.gameState !== 'playing') {
                handleClick(e);
            } else {
                e.preventDefault(); // Prevent scrolling
                for(let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.clientX < this.canvas.width / 2) {
                        this.leftPressed = true;
                        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
                    } else {
                        this.rightPressed = true;
                        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
                    }
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (window.gameState === 'playing') {
                e.preventDefault();
                for(let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.clientX < this.canvas.width / 2) {
                        this.leftPressed = false;
                        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
                    } else {
                        this.rightPressed = false;
                        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
                    }
                }
            }
        }, { passive: false });
        
        window.addEventListener('keydown', (e) => {
             if (e.code === 'Space' || e.code === 'Enter') handleClick();
        });
    }
    
    checkBestDistance(x) {
        const dist = Math.floor(x / 100);
        if (dist > this.bestDistance) {
            this.bestDistance = dist;
            localStorage.setItem('hc_best_distance', this.bestDistance);
        }
    }
    
    draw(gameState, car) {
        if (gameState === 'idle') {
            this.drawStartScreen();
        } else if (gameState === 'playing') {
            this.drawHUD(car);
            this.drawMobileControls();
        } else if (gameState === 'over') {
            this.drawHUD(car);
            this.drawGameOver(car);
        }
    }
    
    drawHUD(car) {
        const dist = Math.max(0, Math.floor(car.x / 100));
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 36px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${dist} m`, 30, 50);
        
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(`Best: ${this.bestDistance} m`, 30, 80);
        
        const barWidth = Math.min(300, this.canvas.width * 0.4);
        const barHeight = 25;
        const x = this.canvas.width / 2 - barWidth / 2;
        const y = 30;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        const fuelPct = Math.max(0, car.fuel / 100);
        this.ctx.fillStyle = fuelPct > 0.2 ? '#4CAF50' : '#F44336';
        this.ctx.fillRect(x, y, barWidth * fuelPct, barHeight);
        
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`FUEL`, this.canvas.width / 2, y + 18);
    }
    
    drawMobileControls() {
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isTouch) return;
        
        const btnSize = 100;
        const padding = 30;
        const y = this.canvas.height - btnSize - padding;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        
        if (this.leftPressed) this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(padding, y, btnSize, btnSize, 15);
        } else {
            this.ctx.rect(padding, y, btnSize, btnSize);
        }
        this.ctx.fill(); this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 22px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("BRAKE", padding + btnSize/2, y + btnSize/2 + 8);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        if (this.rightPressed) this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        
        const xRight = this.canvas.width - padding - btnSize;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(xRight, y, btnSize, btnSize, 15);
        } else {
            this.ctx.rect(xRight, y, btnSize, btnSize);
        }
        this.ctx.fill(); this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText("GAS", xRight + btnSize/2, y + btnSize/2 + 8);
    }
    
    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 80px sans-serif';
        this.ctx.fillText("HILL CLIMB", this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = '30px sans-serif';
        // Add subtle pulse effect to text
        this.ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() / 500));
        this.ctx.fillText("Click or Press Enter to START", this.canvas.width/2, this.canvas.height/2 + 30);
        this.ctx.globalAlpha = 1.0;
    }
    
    drawGameOver(car) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.textAlign = 'center';
        
        this.ctx.font = 'bold 70px sans-serif';
        this.ctx.fillStyle = car.fuel <= 0 ? '#FFC107' : '#F44336';
        let title = car.fuel <= 0 ? "OUT OF FUEL" : "CRASHED!";
        this.ctx.fillText(title, this.canvas.width/2, this.canvas.height/2 - 60);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '30px sans-serif';
        const dist = Math.max(0, Math.floor(car.x / 100));
        this.ctx.fillText(`Distance Reached: ${dist} m`, this.canvas.width/2, this.canvas.height/2 + 10);
        
        this.ctx.font = '24px sans-serif';
        this.ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() / 500));
        this.ctx.fillText("Click to RETRY", this.canvas.width/2, this.canvas.height/2 + 70);
        this.ctx.globalAlpha = 1.0;
    }
}
