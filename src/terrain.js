export class Terrain {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.segmentWidth = 8;
        this.keypointSpacing = 200;
        
        this.points = []; // Stores Y values sampled every 8px
        this.keypoints = []; // Stores Y values sampled every 200px
        
        // Procedural generation parameters
        this.amplitude = 150;
        
        // Pad keypoints to allow Catmull-Rom interpolation from index 0
        this.keypoints.push(this.getNoise(-1)); // Keypoint 0 representing X = -200
        this.keypoints.push(this.getNoise(0));  // Keypoint 1 representing X = 0
        this.keypoints.push(this.getNoise(1));  // Keypoint 2 representing X = 200
        
        this.generateUntil(this.canvasWidth * 2);
    }
    
    // Pseudo-random noise generation
    getNoise(index) {
        // Mix a few sine waves for organic look
        const x = index * 100;
        let y = Math.sin(x * 0.01) * this.amplitude;
        y += Math.sin(x * 0.035) * (this.amplitude * 0.5);
        y += Math.sin(x * 0.1) * (this.amplitude * 0.1);
        
        // Base terrain line is at roughly 60% of screen height
        return y + (this.canvasHeight * 0.6);
    }
    
    // Smooth Catmull-Rom spline interpolation
    catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    }
    
    generateUntil(worldX) {
        const targetK = Math.ceil(worldX / this.keypointSpacing) + 1;
        const targetKeypointIndex = targetK + 2;
        
        while (this.keypoints.length <= targetKeypointIndex) {
            const idx = this.keypoints.length;
            const actualNoiseIndex = idx - 1; 
            this.keypoints.push(this.getNoise(actualNoiseIndex));
            
            // If we have at least 4 keypoints, we can interpolate a segment
            if (this.keypoints.length >= 4) {
                const p0 = this.keypoints[idx - 3];
                const p1 = this.keypoints[idx - 2];
                const p2 = this.keypoints[idx - 1];
                const p3 = this.keypoints[idx];
                
                const segmentStartIndex = (idx - 3) * (this.keypointSpacing / this.segmentWidth);
                const steps = this.keypointSpacing / this.segmentWidth;
                
                for (let i = 0; i < steps; i++) {
                    const t = i / steps;
                    const y = this.catmullRom(p0, p1, p2, p3, t);
                    this.points[segmentStartIndex + i] = y;
                }
            }
        }
    }
    
    update(cameraX) {
        // Expand terrain as we move right
        this.generateUntil(cameraX + this.canvasWidth * 2);
    }
    
    getHeightAt(x) {
        // Return Y coordinate of terrain at given world X
        if (x < 0) return this.canvasHeight * 0.6; // Fail-safe for negative coordinates
        
        const index = Math.floor(x / this.segmentWidth);
        const t = (x % this.segmentWidth) / this.segmentWidth;
        
        const y1 = this.points[index] || 0;
        const y2 = this.points[index + 1] || y1;
        
        // Linear interpolate within the tiny 8px segment for precision
        return y1 + (y2 - y1) * t;
    }
    
    draw(ctx, cameraX, canvasWidth, canvasHeight) {
        // Render optimization: only draw visible segments
        const startIdx = Math.max(0, Math.floor(cameraX / this.segmentWidth));
        const endIdx = startIdx + Math.ceil(canvasWidth / this.segmentWidth) + 1;
        
        // 1. Draw solid dirt chunk
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        let firstX = startIdx * this.segmentWidth - cameraX;
        ctx.moveTo(firstX, canvasHeight); // Bottom left vertex
        
        for (let i = startIdx; i <= endIdx; i++) {
            if (this.points[i] !== undefined) {
                const screenX = i * this.segmentWidth - cameraX;
                ctx.lineTo(screenX, this.points[i]);
            }
        }
        
        let lastX = endIdx * this.segmentWidth - cameraX;
        ctx.lineTo(lastX, canvasHeight); // Bottom right vertex
        ctx.closePath();
        ctx.fill();
        
        // 2. Draw grass stroke
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 12; // Thick grass line
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        for (let i = startIdx; i <= endIdx; i++) {
            if (this.points[i] !== undefined) {
                const screenX = i * this.segmentWidth - cameraX;
                // Move half the line width down so half of it blends into the dirt
                if (i === startIdx) {
                    ctx.moveTo(screenX, this.points[i] + 4);
                } else {
                    ctx.lineTo(screenX, this.points[i] + 4);
                }
            }
        }
        ctx.stroke();
    }
}
