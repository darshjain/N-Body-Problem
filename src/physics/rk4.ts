export type Vector3 = { x: number; y: number; z: number };

export interface Body {
  id: string;
  mass: number;
  position: Vector3;
  velocity: Vector3;
  color: string;
  radius: number;
  force?: Vector3;
}

export const G = 1.0;

const clone = (bodies: Body[]): Body[] => {
  return bodies.map(b => ({
    ...b,
    position: { ...b.position },
    velocity: { ...b.velocity }
  }));
};

const add = (v1: Vector3, v2: Vector3): Vector3 => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z });
const sub = (v1: Vector3, v2: Vector3): Vector3 => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const mul = (v: Vector3, s: number): Vector3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const magSq = (v: Vector3): number => v.x * v.x + v.y * v.y + v.z * v.z;

const getDerivatives = (bodies: Body[]): { dPos: Vector3[]; dVel: Vector3[] } => {
  const dPos: Vector3[] = [];
  const dVel: Vector3[] = [];

  for (let i = 0; i < bodies.length; i++) {
    dPos[i] = bodies[i].velocity;

    let acceleration = { x: 0, y: 0, z: 0 };
    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;

      const r_vec = sub(bodies[j].position, bodies[i].position);
      const distSq = magSq(r_vec);

      const softening = 0.05;
      const forceMag = (G * bodies[j].mass) / Math.pow(distSq + softening * softening, 1.5);

      acceleration = add(acceleration, mul(r_vec, forceMag));
    }
    dVel[i] = acceleration;
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
