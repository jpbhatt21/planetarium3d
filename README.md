
[![logo](./public/logo.png)](https://p3d.bhatt.jp/)    

### Planetarium 3D is an interactive simulator that models the gravitational dynamics of celestial bodies in a fully 3D environment, enabling real-time visualization and analysis of orbits.

#### Try planetarium3d [here](https://p3d.bhatt.jp/).

## Features
- Real-time N-body gravitational simulation  
- Customizable initial conditions (mass,radius, position, velocity)  
- Interactive camera controls (zoom, pan, rotate)  
- Orbital trails and forecast

## Technologies
- react-three/drei for 3D rendering 
- Jotai for state management
- Tailwind CSS for styling

## Installation
1. Clone the repo:  
   ```bash
   git clone https://github.com/jpbhatt21/planetarium3d.git
   cd planetarium3d
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```

## Usage
```bash
npm run dev
```
Use the GUI to set simulation parameters, then press **Space** to launch the simulation.

## Configuration
Edit Universal Variables to adjust:  
- `Time Step`: simulation delta-t  
- `Gravitational Constant`: simulation G
- `Elastic Constant`: simulation k
- `Forecast Limit` : number of steps to forecast
- `Trail Limit`: number of steps to show in the trail
- `Anchor` : anchor body for the camera
- `Background`: background texture for skybox
- `Texture Quality`: quality of the background texture
- `Ambient Light & Intensity` : ambient light settings
- `Bloom & Intensity` : bloom settings

Export & Import simulation settings via JSON files.

## Examples of Use
- **Solar System Demo**: Preloaded Sun, Earth, Mars, Jupiter  
- **Custom Scenarios**: Create your own scenarios by adding celestial bodies with custom mass, radius, position, and velocity.

## License
Distributed under the MIT License.

