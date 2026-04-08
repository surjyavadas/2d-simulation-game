import { Physics } from './physics.js';

export class Car {
    constructor(x, y) {
        // Dynamic properties
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.angularVelocity = 0;
        
        // Chassis properties
        this.width = 110;
        this.height = 30;
        
        // Wheel setup
        this.wheelRadius = 18;
        this.wheelBase = 45; // Distance from center
        
        // Suspension setup
        this.suspensionRestLength = 40;
        this.suspensionStiffness = 0.55;
        this.suspensionDamping = 0.7; // Lower is more damped locally depending on formula
        
        // Live suspension state
        this.rearLength = this.suspensionRestLength;
        this.frontLength = this.suspensionRestLength;
        this.rearWheelAngle = 0;
        this.frontWheelAngle = 0;
        
        // Input and gameplay state
        this.input = { accelerate: false, brake: false };
        this.isFlipped = false;
        this.fuel = 100;
        this.engineForce = 0.7;
        this.brakeForce = 0.5;
        
        this.bindEvents();
    }
    
    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.accelerate = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.brake = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.accelerate = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.brake = false;
        });
    }
    
    update(terrain) {
        if (this.isFlipped) {
            // Give car dead gravity tumble
            this.vy += Physics.GRAVITY;
            this.x += this.vx;
            this.y += this.vy;
            const groundY = terrain.getHeightAt(this.x);
            if (this.y + this.height/2 > groundY) {
                this.y = groundY - this.height/2;
                this.vy *= -0.5;
                this.vx *= 0.9;
            }
            return;
        }

        // Fuel system
        if (this.fuel > 0) {
            this.fuel -= 0.015;
            if (this.input.accelerate) {
                this.fuel -= 0.04;
            }
        }
        if (this.fuel <= 0) {
            this.fuel = 0;
            this.input.accelerate = false;
        }

        const cosA = Math.cos(this.angle);
        const sinA = Math.sin(this.angle);
        
        // Calculate mount points (where suspension attaches to chassis)
        const rearMountX = this.x - this.wheelBase * cosA;
        const rearMountY = this.y - this.wheelBase * sinA;
        const frontMountX = this.x + this.wheelBase * cosA;
        const frontMountY = this.y + this.wheelBase * sinA;
        
        // Check terrain explicitly underneath the mount points
        const rearGroundY = terrain.getHeightAt(rearMountX);
        const frontGroundY = terrain.getHeightAt(frontMountX);
        
        // Calculate vertical distance to ground
        const currentRearLength = rearGroundY - rearMountY - this.wheelRadius;
        const currentFrontLength = frontGroundY - frontMountY - this.wheelRadius;

        let rearForce = 0;
        let frontForce = 0;
        let rearContact = false;
        let frontContact = false;

        // Apply suspension physics for Rear Wheel
        if (currentRearLength < this.suspensionRestLength) {
            rearContact = true;
            // Formula: compression = restLength - currentLength
            const compression = this.suspensionRestLength - currentRearLength;
            
            // Formula: damperForce = velocity * damping
            const velocityY = (currentRearLength - this.rearLength); // roughly proportional to vertical speed
            
            // Formula: springForce = compression * stiffness
            const springForce = compression * this.suspensionStiffness;
            const damperForce = velocityY * this.suspensionDamping;
            
            rearForce = Math.max(0, springForce - damperForce);
            this.rearLength = currentRearLength;
        } else {
            this.rearLength = this.suspensionRestLength;
        }

        // Apply suspension physics for Front Wheel
        if (currentFrontLength < this.suspensionRestLength) {
            frontContact = true;
            const compression = this.suspensionRestLength - currentFrontLength;
            const velocityY = (currentFrontLength - this.frontLength);
            
            const springForce = compression * this.suspensionStiffness;
            const damperForce = velocityY * this.suspensionDamping;
            
            frontForce = Math.max(0, springForce - damperForce);
            this.frontLength = currentFrontLength;
        } else {
            this.frontLength = this.suspensionRestLength;
        }

        const totalUpwardForce = rearForce + frontForce;

        // Apply Engine & Controls
        if (this.input.accelerate && (rearContact || frontContact)) {
            // Apply force along car's facing angle
            this.vx += Math.cos(this.angle) * this.engineForce;
            this.vy += Math.sin(this.angle) * this.engineForce;
            this.rearWheelAngle += 0.2;
            this.frontWheelAngle += 0.2;
        }
        if (this.input.brake) {
            if (rearContact || frontContact) {
                // Brake / reverse
                this.vx -= Math.cos(this.angle) * this.brakeForce;
                this.rearWheelAngle -= 0.1;
                this.frontWheelAngle -= 0.1;
            }
        }

        // Handle Airborne rotation vs Grounded Alignment
        if (!rearContact && !frontContact) {
            // Mid-air pitch controls (rotates body)
            if (this.input.accelerate) this.angularVelocity -= 0.005; 
            if (this.input.brake) this.angularVelocity += 0.005;
        } else if (rearContact || frontContact) {
            // Align to slope when grounded
            // Estimate slope angle between wheels
            const targetAngle = Math.atan2(frontGroundY - rearGroundY, frontMountX - rearMountX);
            
            // Natural torque caused by unequal suspension compression
            const torque = (frontForce - rearForce) * 0.0015;
            this.angularVelocity -= torque;
            
            // Soft constraints pulling to slope
            const angleDiff = targetAngle - this.angle;
            this.angularVelocity += angleDiff * 0.03;
            
            // Wheel spin matching velocity roughly
            this.rearWheelAngle += this.vx * 0.05;
            this.frontWheelAngle += this.vx * 0.05;
        }

        // Apply standard physics
        this.vy += Physics.GRAVITY;
        this.vy -= totalUpwardForce * 0.06; // Translate spring force to body lift
        
        this.vx *= Physics.FRICTION;
        this.vy *= 0.99;
        this.angularVelocity *= Physics.ANGULAR_DRAG;
        
        // Speed limits
        this.vx = Math.max(-15, Math.min(this.vx, 15));
        this.vy = Math.max(-15, Math.min(this.vy, 15));

        // Integration step
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularVelocity;

        // Crash conditions
        if (!this.isFlipped) {
            if (Math.abs(this.angle) > 1.65) {
                this.isFlipped = true;
                window.dispatchEvent(new Event('gameOver'));
            } else if (this.fuel <= 0 && Math.abs(this.vx) < 0.5 && (rearContact || frontContact)) {
                // Out of fuel and came to a stop
                window.dispatchEvent(new Event('gameOver'));
            }
        }
    }
}
