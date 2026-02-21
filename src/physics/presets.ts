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
        // Schematic representation: Not to scale but stable orbits.
        // Scale input roughly controls "Spread".
        const s = scale * 0.5; // Base distance unit

        // Masses
        const M_sun = 100;
        const M_earth = 1;
        const M_moon = 0.01;

        // Distances
        const r_earth = 10 * s;
        const r_moon = 1 * s; // Distance from Earth

        // G implied = 1 (from Integrators)
        // Velocities for Circular Orbits: v = sqrt(GM/r)

        // Earth orbits Sun
        const v_earth = Math.sqrt(1 * (M_sun) / r_earth); // Neglecting M_earth for simplicity or use (M+m)

        // Moon orbits Earth
        const v_moon_local = Math.sqrt(1 * (M_earth) / r_moon);

        return [
            {
                id: 'Sun',
                mass: M_sun,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                radius: 1.5,
                color: '#fbbf24' // warm sun
            },
            {
                id: 'Earth',
                mass: M_earth,
                position: { x: r_earth, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: v_earth }, // Orbit in X-Z plane? Or X-Y?
                // Preset logic usually X-Y plane? 
                // Let's stick to X-Y plane for 2D screens, Z is up/down?
                // Wait, in ThreeJS Y is up. 
                // Previous preset had Y velocity. So orbit is in X-Z? 
                // Previous preset: pos x, vel y. -> Orbit in X-Y plane.
                // Let's do X-Y plane orbit.
                // So pos x=R, vel y=V.

                // Correction: previous code pos: { x: 4*s, y: 0, z: 0 }, vel: { x: 0, y: v, z: 0 }
                // So Earth starts at X, moves in Y. Orbit in XY plane.
                radius: 0.4,
                color: '#3b82f6' // blue earth
            },
            {
                id: 'Moon',
                mass: M_moon,
                position: { x: r_earth + r_moon, y: 0, z: 0 },
                velocity: { x: 0, y: v_earth + v_moon_local, z: 0 },
                radius: 0.1,
                color: '#9ca3af' // grey moon
            }
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
