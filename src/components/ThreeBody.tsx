import { useRef, useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Html } from '@react-three/drei';
import * as THREE from 'three';
import { step } from '../physics/integrators';
import type { IntegratorType } from '../physics/integrators';
import type { Body } from '../physics/rk4';
import { PRESETS } from '../physics/presets';
import type { PresetName } from '../physics/presets';

import { Wormhole } from './Wormhole';

interface WormholeData {
    id: string;
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
    color: string;
}

interface ThreeBodyProps {
    preset: PresetName | 'Custom';
    bodies?: Body[];
    integrator?: IntegratorType;
    speed: number;
    spread: number;
    paused: boolean;
    showHelpers: boolean;
    onUpdateMetrics?: (bodies: Body[]) => void;
    showForceVectors: boolean;
    showVelocityVectors: boolean;
    showTrails: boolean;
    trailLength: number;
    trailThickness: number;
    bodySize: number;
    followTarget: string | null;
}

export interface ThreeBodyHandle {
    addBody: (body: Body) => void;
    spawnWormholes: () => void;
    reset: () => void;
}

const calculateTimeDilation = (body: Body, allBodies: Body[]) => {
    let potential = 0;
    allBodies.forEach(other => {
        if (other.id !== body.id) {
            const dx = body.position.x - other.position.x;
            const dy = body.position.y - other.position.y;
            const dz = body.position.z - other.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001; // Avoid divide by zero
            potential += other.mass / dist;
        }
    });
    // Fake c^2 for visual effect, assume G=1. Lower cSq = more exaggeration.
    const cSq = 25.0;
    // T' = T * sqrt(1 - 2Phi/c^2) approx 1 - Phi/c^2
    // Phi is negative potential -GM/r. Here potential is sum(M/r). So Phi = -potential.
    // Factor = sqrt(1 - 2*(-potential)/cSq) = sqrt(1 + 2*potential/cSq)
    return Math.sqrt(1 + 2 * potential / cSq);
};

export const ThreeBody = forwardRef<ThreeBodyHandle, ThreeBodyProps>(({
    preset, bodies: initialCustomBodies, integrator = 'rk4', speed, spread, paused, showHelpers, onUpdateMetrics,
    showForceVectors, showVelocityVectors, showTrails, trailLength, trailThickness, bodySize, followTarget
}, ref) => {

    const getInitialState = useMemo(() => {
        return () => {
            console.log('Generating initial state for preset:', preset);
            if (preset === 'Custom') {
                if (initialCustomBodies) {
                    return initialCustomBodies.map(b => ({ ...b, position: { ...b.position }, velocity: { ...b.velocity } }));
                }
                console.warn('Custom preset selected but no bodies provided.');
                return []; // Return empty if Custom but no bodies
            }

            const generator = PRESETS[preset as PresetName];
            if (!generator) {
                console.error(`Preset "${preset}" not found! Available:`, Object.keys(PRESETS));
                return PRESETS['Figure 8'](spread); // Fallback
            }
            return generator(spread);
        };
    }, [preset, initialCustomBodies, spread]);

    const [renderedBodies, setRenderedBodies] = useState<Body[]>(getInitialState());
    const bodiesRef = useRef<Body[]>(renderedBodies);

    // Sync ref when state changes (e.g. from preset change)
    useEffect(() => {
        bodiesRef.current = renderedBodies;
    }, [renderedBodies]);

    // Reset when props change
    useEffect(() => {
        setRenderedBodies(getInitialState());
    }, [getInitialState]);

    const [wormholes, setWormholes] = useState<WormholeData[]>([]);

    useImperativeHandle(ref, () => ({
        addBody: (body: Body) => {
            setRenderedBodies(prev => {
                const next = [...prev, body];
                bodiesRef.current = next;
                return next;
            });
        },
        spawnWormholes: () => {
            const pos1 = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5);
            // Target is just a random point in space, no exit portal visual
            const target = new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5);
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

            setWormholes(prev => [
                ...prev,
                { id: `w-${Date.now()}`, position: pos1, targetPosition: target, color }
            ]);
        },
        reset: () => {
            setRenderedBodies(getInitialState());
            setWormholes([]);
        }
    }));

    const meshRefs = useRef<(THREE.Group | null)[]>([]);
    const velocityArrowRefs = useRef<(THREE.ArrowHelper | null)[]>([]);
    const forceArrowRefs = useRef<(THREE.ArrowHelper | null)[]>([]);

    useFrame((state, delta) => {
        if (!paused) {
            const steps = 4;
            const dt = (delta * speed) / steps;
            for (let i = 0; i < steps; i++) {
                // Apply Wormhole Gravity (Simple Impulse)
                // Treat wormholes as Mass ~ 5.0 fixed objects
                const WM = 5.0;
                bodiesRef.current.forEach(b => {
                    wormholes.forEach(w => {
                        const dx = w.position.x - b.position.x;
                        const dy = w.position.y - b.position.y;
                        const dz = w.position.z - b.position.z;
                        const distSq = dx * dx + dy * dy + dz * dz + 0.1; // Softener
                        const dist = Math.sqrt(distSq);
                        const force = WM / distSq; // G=1

                        // F = ma => a = F/m (but here we just add velocity for simplicity in this pre-step, or add to force if we had a force accumulator)
                        // Actually, let's just nudge velocity. 
                        // dv = a * dt = (F/m) * dt ?? No, standard gravity is independent of falling mass. a = GM/r^2.
                        // dv = (GM/r^2) * dt

                        const dv = (force * dt);
                        b.velocity.x += (dx / dist) * dv;
                        b.velocity.y += (dy / dist) * dv;
                        b.velocity.z += (dz / dist) * dv;
                    });
                });

                bodiesRef.current = step(bodiesRef.current, dt, integrator);
            }
        }

        bodiesRef.current.forEach((body, i) => {
            const group = meshRefs.current[i];
            if (group) {
                group.position.set(body.position.x, body.position.y, body.position.z);
            }

            if (followTarget && body.id === followTarget) {
                const controls = state.controls as unknown as { target: THREE.Vector3, update: () => void };
                if (controls) {
                    controls.target.lerp(new THREE.Vector3(body.position.x, body.position.y, body.position.z), 0.1);
                    controls.update();
                }
            }

            if (showVelocityVectors) {
                const arrow = velocityArrowRefs.current[i];
                if (arrow) {
                    const dir = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
                    const len = dir.length();
                    arrow.setDirection(dir.normalize());
                    arrow.setLength(len * 2);
                }
            }

            if (showForceVectors && body.force) {
                const arrow = forceArrowRefs.current[i];
                if (arrow) {
                    const dir = new THREE.Vector3(body.force.x, body.force.y, body.force.z);
                    const len = dir.length();
                    arrow.setDirection(dir.normalize());
                    arrow.setLength(len * 10);
                }
            }
        });

        if (onUpdateMetrics) {
            onUpdateMetrics(bodiesRef.current);
        }

        // Wormhole Logic
        wormholes.forEach(w => {
            bodiesRef.current.forEach(b => {
                const dx = b.position.x - w.position.x;
                const dy = b.position.y - w.position.y;
                const dz = b.position.z - w.position.z;
                const distSq = dx * dx + dy * dy + dz * dz;

                // Radius ~ 1.5 visually, logic radius 0.5 (tighter)
                if (distSq < 0.5) {
                    // Teleport
                    b.position.x = w.targetPosition.x + (Math.random() - 0.5) * 1.5; // Push out a bit
                    b.position.y = w.targetPosition.y + (Math.random() - 0.5) * 1.5;
                    b.position.z = w.targetPosition.z + (Math.random() - 0.5) * 1.5;

                    // Violent Ejection Velocity
                    const ejectionSpeed = 5.0;
                    // Random direction outwards
                    b.velocity.x = (Math.random() - 0.5) * ejectionSpeed;
                    b.velocity.y = (Math.random() - 0.5) * ejectionSpeed;
                    b.velocity.z = (Math.random() - 0.5) * ejectionSpeed;
                }
            });
        });
    });

    return (
        <>
            {wormholes.map(w => (
                <Wormhole key={w.id} position={[w.position.x, w.position.y, w.position.z]} color={w.color} />
            ))}

            {showHelpers && (
                <gridHelper args={[100, 100, 0x444444, 0x222222]} />
            )}

            {renderedBodies.map((body, i) => (
                <group key={`${preset}-${body.id}-${i}`}>
                    <group ref={(el) => { meshRefs.current[i] = el; }}>
                        {showTrails && (
                            <Trail
                                width={trailThickness}
                                length={trailLength}
                                color={new THREE.Color(body.color)}
                                attenuation={(t) => t * t}
                                interval={2}
                            >
                                <mesh visible={false} />
                            </Trail>
                        )}
                        <mesh castShadow receiveShadow>
                            <sphereGeometry args={[body.radius * bodySize, 32, 32]} />
                            <meshStandardMaterial
                                color={body.color}
                                roughness={0.4}
                                metalness={0.6}
                                emissive={body.color}
                                emissiveIntensity={0.2}
                            />
                        </mesh>

                        <Html position={[0, body.radius * bodySize + 0.5, 0]} center distanceFactor={10}>
                            <div className="pointer-events-none select-none text-[8px] font-mono text-green-400 bg-black/50 px-1 rounded backdrop-blur-sm whitespace-nowrap">
                                T-Dilation: {calculateTimeDilation(body, renderedBodies).toFixed(6)}x
                            </div>
                        </Html>

                        {showVelocityVectors && (
                            <arrowHelper
                                ref={(el) => { velocityArrowRefs.current[i] = el; }}
                                args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00]}
                            />
                        )}

                        {showForceVectors && (
                            <arrowHelper
                                ref={(el) => { forceArrowRefs.current[i] = el; }}
                                args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000]}
                            />
                        )}
                    </group>
                </group >
            ))}

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
        </>
    );
});
