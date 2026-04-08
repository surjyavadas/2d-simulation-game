export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#e0f6ff'); // Lighter horizon
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTerrain(terrain, cameraX) {
        terrain.draw(this.ctx, cameraX, this.canvas.width, this.canvas.height);
    }

    drawCar(car, cameraX) {
        this.ctx.save();
        
        // Translate to car's world center relative to camera
        this.ctx.translate(car.x - cameraX, car.y);
        this.ctx.rotate(car.angle);
        
        // 1. Draw Suspension lines BEFORE chassis so they disappear 'inside' it
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        
        // Rear suspension
        this.ctx.beginPath();
        this.ctx.moveTo(-car.wheelBase, 0); 
        this.ctx.lineTo(-car.wheelBase, car.rearLength);
        this.ctx.stroke();
        
        // Front suspension
        this.ctx.beginPath();
        this.ctx.moveTo(car.wheelBase, 0);
        this.ctx.lineTo(car.wheelBase, car.frontLength);
        this.ctx.stroke();

        // 2. Draw Chassis (Rounded Rectangle)
        this.ctx.fillStyle = '#D32F2F'; // Rich Red
        this.ctx.strokeStyle = '#B71C1C';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        if (this.ctx.roundRect) {
            this.ctx.roundRect(-car.width/2, -car.height/2, car.width, car.height, 10);
        } else {
            // Polyfill approach if roundRect unsupported
            this.ctx.rect(-car.width/2, -car.height/2, car.width, car.height);
        }
        
        this.ctx.fill();
        this.ctx.stroke();
        
        // Roof block just for decoration
        this.ctx.fillStyle = '#212121';
        this.ctx.beginPath();
        this.ctx.roundRect(-car.width/4, -car.height, car.width/2.5, car.height/1.2, 5);
        this.ctx.fill();

        this.ctx.restore();

        // 3. Draw Wheels at their correct global endpoints
        const rearWheelX = car.x - cameraX - car.wheelBase * Math.cos(car.angle) - car.rearLength * Math.sin(car.angle);
        const rearWheelY = car.y - car.wheelBase * Math.sin(car.angle) + car.rearLength * Math.cos(car.angle);
        
        const frontWheelX = car.x - cameraX + car.wheelBase * Math.cos(car.angle) - car.frontLength * Math.sin(car.angle);
        const frontWheelY = car.y + car.wheelBase * Math.sin(car.angle) + car.frontLength * Math.cos(car.angle);

        this.drawWheel(rearWheelX, rearWheelY, car.wheelRadius, car.rearWheelAngle);
        this.drawWheel(frontWheelX, frontWheelY, car.wheelRadius, car.frontWheelAngle);
    }
    
    drawWheel(x, y, radius, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // Thick Black Tire
        this.ctx.fillStyle = '#1A1A1A';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Metallic Rim
        this.ctx.fillStyle = '#9E9E9E';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 4 Spokes cross
        this.ctx.strokeStyle = '#424242';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(-radius * 0.6, 0);
        this.ctx.lineTo(radius * 0.6, 0);
        this.ctx.moveTo(0, -radius * 0.6);
        this.ctx.lineTo(0, radius * 0.6);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawHUD(car) {
        if (car.isFlipped) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 60px Impact';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("CRASHED!", this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '30px Arial';
            this.ctx.fillText("Refresh to retry", this.canvas.width/2, this.canvas.height/2 + 50);
        }
    }
}
