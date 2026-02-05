import { Body } from './rk4';
import { IntegratorType } from './integrators';

export interface SystemConfig {
    bodies: Body[];
    integrator: IntegratorType;
    timeStep: number; // dt
    cameraPosition?: [number, number, number];
    cameraTarget?: [number, number, number];
}

const COLORS = ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#FF69B4', '#00FFFF'];

export const parseURLParams = (queryString: string): SystemConfig | null => {
    const params = new URLSearchParams(queryString);

    if (!params.has('n') || !params.has('m') || !params.has('p') || !params.has('v')) {
        return null;
    }

    const n = parseInt(params.get('n') || '3');
    const masses = params.get('m')?.split(',').map(parseFloat) || [];
    const positions = params.get('p')?.split(',').map(parseFloat) || [];
    const velocities = params.get('v')?.split(',').map(parseFloat) || [];

    // Integrator
    const im = params.get('im') === 'verlet' ? 'verlet' : 'rk4';
    const dt = parseFloat(params.get('dt') || '0.01');

    // Camera
    const cp = params.get('cp')?.split(',').map(parseFloat);
    const ct = params.get('ct')?.split(',').map(parseFloat);

    const bodies: Body[] = [];

    for (let i = 0; i < n; i++) {
        bodies.push({
            id: `imported-${i}`,
            mass: masses[i] || 1,
            position: {
                x: positions[i * 3 + 0] || 0,
                y: positions[i * 3 + 1] || 0,
                z: positions[i * 3 + 2] || 0,
            },
            velocity: {
                x: velocities[i * 3 + 0] || 0,
                y: velocities[i * 3 + 1] || 0,
                z: velocities[i * 3 + 2] || 0,
            },
            radius: Math.max(0.2, (masses[i] || 1) * 0.1), // Heuristic radius
            color: COLORS[i % COLORS.length]
        });
    }

    return {
        bodies,
        integrator: im,
        timeStep: dt,
        cameraPosition: cp && cp.length === 3 ? [cp[0], cp[1], cp[2]] : undefined,
        cameraTarget: ct && ct.length === 3 ? [ct[0], ct[1], ct[2]] : undefined,
    };
};
