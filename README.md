# 2D Hill Climb Simulation Game

A robust, physics-based 2D driving game built entirely from scratch using HTML5 Canvas and Vanilla JavaScript. Navigate through infinitely generated procedural terrain, manage your fuel, and balance your vehicle using custom rigid body physics.

## Features

- **Custom Physics Engine**: Built from the ground up featuring rigid body mechanics, gravity, independent suspension (spring and damper equations), and angular velocity based on friction and ground contact.
- **Procedural Terrain Generation**: Infinitely generates rolling hills utilizing multi-layered sine-harmonics and smooth Catmull-Rom spline interpolation.
- **Responsive Controls**: Supports mobile Touch controls and PC Keyboard inputs.
- **Game State Management**: Includes HUD elements, distance tracking, fuel mechanics, and interactive crash states.
- **Zero Dependencies**: Entirely hand-coded without any external frameworks, physics libraries, or engines.

## Getting Started

Because this project utilizes ES6 Modules, it must be accessed via a static web server instead of directly opening the HTML file.

### Prerequisites

You need [Node.js](https://nodejs.org/) or [Python](https://www.python.org/) installed to easily run a local web server.

### Installation & Running

1. Clone the repository:
   ```bash
   git clone https://github.com/surjyavadas/2d-simulation-game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd 2d-simulation-game
   ```
3. Run a static server. For example, using Node's `serve`:
   ```bash
   npx serve -l 8080
   ```
   *(Alternatively, use Python: `python -m http.server 8080`)*
4. Open your web browser and navigate to `http://localhost:8080`.

## Controls

- **Desktop**: Use `Arrow Right` or `D` to Accelerate. Use `Arrow Left` or `A` to Brake / Reverse in mid-air to balance your vehicle.
- **Mobile**: Tap and hold the **RIGHT** half of the screen to Accelerate, and the **LEFT** half to Brake.

## Project Structure

- `index.html`: Entry point containing the HTML5 Canvas.
- `src/main.js`: The core Game Loop utilizing a fixed timestep physics accumulator.
- `src/car.js`: The complex mathematics tying the rigid body rotation and independent wheel suspension together.
- `src/terrain.js`: Handles dynamic procedural generation and terrain chunking.
- `src/ui.js` & `src/renderer.js`: Specialized canvas rendering classes for the environments, entities, and HUD.
- `src/physics.js`: Shared physics definitions.

## License

This project is licensed under the MIT License.
