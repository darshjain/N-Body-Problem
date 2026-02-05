import { Body, G, Vector3 } from './rk4';

export type IntegratorType = 'rk4' | 'verlet';

// Deep clone helper
const clone = (bodies: Body[]): Body[] => {
    return bodies.map(b => ({
        ...b,
        position: { ...b.position },
        velocity: { ...b.velocity },
    }));
};

const add = (v1: Vector3, v2: Vector3): Vector3 => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z });
const sub = (v1: Vector3, v2: Vector3): Vector3 => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const mul = (v: Vector3, s: number): Vector3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const magSq = (v: Vector3): number => v.x * v.x + v.y * v.y + v.z * v.z;

const calculateAccelerations = (bodies: Body[]): Vector3[] => {
    const accels: Vector3[] = new Array(bodies.length).fill({ x: 0, y: 0, z: 0 });

    for (let i = 0; i < bodies.length; i++) {
        let acceleration = { x: 0, y: 0, z: 0 };
        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;

            const r_vec = sub(bodies[j].position, bodies[i].position);
            const distSq = magSq(r_vec);
            const softening = 0.05;
            const forceMag = (G * bodies[j].mass) / Math.pow(distSq + softening * softening, 1.5);

            acceleration = add(acceleration, mul(r_vec, forceMag));
        }
        accels[i] = acceleration;
    }
    return accels;
};

// --- RK4 Implementation ---
const getDerivatives = (bodies: Body[]): { dPos: Vector3[]; dVel: Vector3[] } => {
    const dPos: Vector3[] = [];
    const dVel = calculateAccelerations(bodies);

    for (let i = 0; i < bodies.length; i++) {
        dPos[i] = bodies[i].velocity;
    }

    return { dPos, dVel };
};

export const stepRK4 = (bodies: Body[], dt: number): Body[] => {
    const s1 = bodies;
    const k1 = getDerivatives(s1);

    const s2 = clone(bodies).map((b, i) => {
        b.position = add(s1[i].position, mul(k1.dPos[i], dt * 0.5));
        b.velocity = add(s1[i].velocity, mul(k1.dVel[i], dt * 0.5));
        return b;
    });
    const k2 = getDerivatives(s2);

    const s3 = clone(bodies).map((b, i) => {
        b.position = add(s1[i].position, mul(k2.dPos[i], dt * 0.5));
        b.velocity = add(s1[i].velocity, mul(k2.dVel[i], dt * 0.5));
        return b;
    });
    const k3 = getDerivatives(s3);

    const s4 = clone(bodies).map((b, i) => {
        b.position = add(s1[i].position, mul(k3.dPos[i], dt));
        b.velocity = add(s1[i].velocity, mul(k3.dVel[i], dt));
        return b;
    });
    const k4 = getDerivatives(s4);

    return clone(bodies).map((b, i) => {
        const dPosAcc = add(k1.dPos[i], add(mul(k2.dPos[i], 2), add(mul(k3.dPos[i], 2), k4.dPos[i])));
        const dVelAcc = add(k1.dVel[i], add(mul(k2.dVel[i], 2), add(mul(k3.dVel[i], 2), k4.dVel[i])));

        b.position = add(b.position, mul(dPosAcc, dt / 6.0));
        b.velocity = add(b.velocity, mul(dVelAcc, dt / 6.0));
        return b;
    });
};

// --- Velocity Verlet Implementation ---
export const stepVerlet = (bodies: Body[], dt: number): Body[] => {
    const nextBodies = clone(bodies);
    const accels = calculateAccelerations(bodies);

    // 1. Half step velocity
    for (let i = 0; i < nextBodies.length; i++) {
        nextBodies[i].velocity = add(nextBodies[i].velocity, mul(accels[i], 0.5 * dt));
    }

    // 2. Full step position
    for (let i = 0; i < nextBodies.length; i++) {
        nextBodies[i].position = add(nextBodies[i].position, mul(nextBodies[i].velocity, dt));
    }

    // 3. New forces
    const nextAccels = calculateAccelerations(nextBodies);

    // 4. Half step velocity (finish)
    for (let i = 0; i < nextBodies.length; i++) {
        nextBodies[i].velocity = add(nextBodies[i].velocity, mul(nextAccels[i], 0.5 * dt));
    }

    return nextBodies;
};

export const step = (bodies: Body[], dt: number, type: IntegratorType = 'rk4'): Body[] => {
    switch (type) {
        case 'verlet': return stepVerlet(bodies, dt);
        case 'rk4':
        default: return stepRK4(bodies, dt);
    }
};
