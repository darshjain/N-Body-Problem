import type { Body } from './rk4';

export type PresetName = 'Figure 8' | 'Random Chaos' | 'Sun Earth Moon' | 'Pythagorean' | 'Lagrange';

const COLORS = ['#00f3ff', '#7000ff', '#ff003c'];

export const PRESETS: Record<PresetName, (scale?: number) => Body[]> = {
    'Figure 8': (scale = 4) => {
        const s = scale;
        const vS = 1 / Math.sqrt(s); // Velocity scaling to preserve orbit shape
        return [
            {
                id: '1',
                mass: 1,
                position: { x: 0.97000436 * s, y: -0.24308753 * s, z: 0 },
                velocity: { x: 0.4662036850 * vS, y: 0.4323657300 * vS, z: 0 },
                radius: 0.2, // Visual radius doesn't strictly need scaling, but maybe slightly?
                color: COLORS[0]
            },
            {
                id: '2',
                mass: 1,
                position: { x: -0.97000436 * s, y: 0.24308753 * s, z: 0 },
                velocity: { x: 0.4662036850 * vS, y: 0.4323657300 * vS, z: 0 },
                radius: 0.2,
                color: COLORS[1]
            },
            {
                id: '3',
                mass: 1,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: -2 * 0.4662036850 * vS, y: -2 * 0.4323657300 * vS, z: 0 },
                radius: 0.2,
                color: COLORS[2]
            }
        ];
    },
    'Random Chaos': (scale = 4) => {
        // Random usage: scale defines the bounding box
        const r = () => (Math.random() - 0.5) * 2 * scale;
        const v = () => (Math.random() - 0.5) * 0.5; // Velocity somewhat independent but could scale
        return [
            { id: '1', mass: 1 + Math.random(), position: { x: r(), y: r(), z: r() }, velocity: { x: v(), y: v(), z: v() }, radius: 0.3, color: COLORS[0] },
            { id: '2', mass: 1 + Math.random(), position: { x: r(), y: r(), z: r() }, velocity: { x: v(), y: v(), z: v() }, radius: 0.3, color: COLORS[1] },
            { id: '3', mass: 1 + Math.random(), position: { x: r(), y: r(), z: r() }, velocity: { x: v(), y: v(), z: v() }, radius: 0.3, color: COLORS[2] },
        ];
    },
    'Sun Earth Moon': (scale = 4) => {
        // This is a specific system, "Scale" might just mean zoom, but let's apply physics scaling
        // Original scale was ~4 for Earth x.
        // Let's treat the inputs as "Base" and just apply `scale/4` ratio if we want to honor the slider?
        // Or just apply scale directly. 
        // Let's apply scale relative to "default" 1.
        // Note: The preset bodies were defined with hardcoded positions like x=4.
        // If we want "scale=10" to be bigger, we just multiply.
        // But "Sun Earth Moon" relies on specific G=1 distances.
        // Let's just scale everything by `scale` (assuming default passed in is meaningful).
        // Actually, let's treat "scale" as a multiplier for these specific systems?
        // No, uniform "Spread" slider.
        // Let's use `scale` as the multiplier. Default slider 4.
        // So `x: 4 * scale`? No that's huge.
        // Let's treat the slider as the "Characteristic Length".
        // For Figure 8, char length is ~1. So slider=4 makes it 4x bigger.
        // For Sun Earth, char length is ~4. So slider=4 makes it... same?
        // Let's just multiply by (scale / 2) to keep defaults sane?
        // User asked for "Higher default".
        // Let's just use `s = scale` directly.
        const s = scale * 0.5; // Reduce sensitivity
        const vS = 1 / Math.sqrt(s);
        return [
            { id: 'Sun', mass: 10, position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, radius: 0.8, color: '#fbbf24' },
            { id: 'Earth', mass: 0.1, position: { x: 4 * s, y: 0, z: 0 }, velocity: { x: 0, y: 1.58 * vS, z: 0 }, radius: 0.2, color: '#3b82f6' },
            { id: 'Moon', mass: 0.001, position: { x: 4.5 * s, y: 0, z: 0.1 * s }, velocity: { x: 0, y: (1.58 + 0.44) * vS, z: 0 }, radius: 0.05, color: '#9ca3af' }
        ];
    },
    'Pythagorean': (scale = 4) => {
        const s = scale * 0.5;
        // Pythagorean is a specific 3-4-5 instant, velocities are zero initially
        return [
            { id: '1', mass: 3, position: { x: 1 * s, y: 3 * s, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, radius: 0.4, color: COLORS[0] },
            { id: '2', mass: 4, position: { x: -2 * s, y: -1 * s, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, radius: 0.5, color: COLORS[1] },
            { id: '3', mass: 5, position: { x: 1 * s, y: -1 * s, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, radius: 0.6, color: COLORS[2] }
        ];
    },
    'Lagrange': (scale = 4) => {
        const s = scale;
        const vS = 1 / Math.sqrt(s);
        return [
            { id: '1', mass: 1, position: { x: 1 * s, y: 0, z: 0 }, velocity: { x: 0, y: 0.8 * vS, z: 0 }, radius: 0.3, color: COLORS[0] },
            { id: '2', mass: 1, position: { x: -0.5 * s, y: 0.866 * s, z: 0 }, velocity: { x: -0.866 * 0.8 * vS, y: -0.5 * 0.8 * vS, z: 0 }, radius: 0.3, color: COLORS[1] },
            { id: '3', mass: 1, position: { x: -0.5 * s, y: -0.866 * s, z: 0 }, velocity: { x: 0.866 * 0.8 * vS, y: -0.5 * 0.8 * vS, z: 0 }, radius: 0.3, color: COLORS[2] }
        ];
    }
};
