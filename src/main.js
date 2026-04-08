import { Terrain } from './terrain.js';
import { Car } from './car.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const renderer = new Renderer(canvas, ctx);

let width, height;
let terrain;
let car;
let ui;

// Game Systems State
window.gameState = 'idle'; // 'idle', 'playing', 'over'
let cameraX = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    if (terrain) {
        terrain.canvasWidth = width;
        terrain.canvasHeight = height;
    }
}

window.addEventListener('resize', resize);
resize();

// Init Base State
terrain = new Terrain(width, height);
car = new Car(width / 2, height / 2 - 200);
ui = new UI(canvas, ctx);

// Event Listeners for Game State Management
window.addEventListener('startGame', () => {
    window.gameState = 'playing';
});

window.addEventListener('gameOver', () => {
    if (window.gameState === 'playing') {
        window.gameState = 'over';
        ui.checkBestDistance(car.x);
    }
});

window.addEventListener('retryGame', () => {
    // Re-initialize for new run
    terrain = new Terrain(width, height);
    car = new Car(width / 2, height / 2 - 200);
    cameraX = 0;
    window.gameState = 'playing';
});

const FIXED_TIMESTEP = 1000 / 60; // 60 FPS update
let lastTime = performance.now();
let accumulator = 0;

function update() {
    if (window.gameState === 'playing' || window.gameState === 'over') {
        car.update(terrain);
        
        // Smooth camera follow
        cameraX = car.x - 180;
        
        // Expand terrain chunks dynamically
        terrain.update(cameraX);
    }
}

function draw() {
    renderer.clear();
    renderer.drawBackground();
    
    if (terrain) renderer.drawTerrain(terrain, cameraX);
    if (car) renderer.drawCar(car, cameraX);
    
    // Draw overlays based on game state
    ui.draw(window.gameState, car);
}

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    if (deltaTime > 50) deltaTime = 50; 
    
    lastTime = timestamp;
    accumulator += deltaTime;

    while (accumulator >= FIXED_TIMESTEP) {
        update();
        accumulator -= FIXED_TIMESTEP;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
