import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { step } from '../physics/integrators';
import type { IntegratorType } from '../physics/integrators';
import type { Body } from '../physics/rk4';
import { PRESETS } from '../physics/presets';
import type { PresetName } from '../physics/presets';

interface ThreeBodyProps {
    preset: PresetName | 'Custom';
    bodies?: Body[]; // For custom/URL loaded systems
    integrator?: IntegratorType;
    speed: number;
    spread: number;
    paused: boolean;
    showHelpers: boolean; // Axis and Plane
    onUpdateMetrics?: (bodies: Body[]) => void;
}

export interface ThreeBodyHandle {
    addBody: (body: Body) => void;
    reset: () => void;
}

export const ThreeBody = forwardRef<ThreeBodyHandle, ThreeBodyProps>(({
    preset, bodies: initialCustomBodies, integrator = 'rk4', speed, spread, paused, showHelpers, onUpdateMetrics
}, ref) => {

    // Initialize bodies based on preset or custom prop
    const getInitialState = () => {
        if (preset === 'Custom' && initialCustomBodies) {
            return initialCustomBodies;
        }
        return PRESETS[preset as PresetName](spread);
    };

    const bodiesRef = useRef<Body[]>(getInitialState());


    // Helper to keep state blindly synced for rendering if needed, 
    // but usually direct ref manipulation is better for physics loop performance.
    // We use a state just to trigger re-renders if the *number* of bodies changes or reset happens.
    const [version, setVersion] = useState(0);

    useImperativeHandle(ref, () => ({
        addBody: (body: Body) => {
            bodiesRef.current.push(body);
            setVersion(v => v + 1);
        },
        reset: () => {
            bodiesRef.current = getInitialState();
            setVersion(v => v + 1);
        }
    }));

    // Reset when preset/spread changes
    useEffect(() => {
        bodiesRef.current = getInitialState();
        setVersion(v => v + 1);
    }, [preset, spread, initialCustomBodies]);

    const meshRefs = useRef<THREE.Mesh[]>([]);

    useFrame((_, delta) => {
        if (paused) return;

        const steps = 4;
        const dt = (delta * speed) / steps;

        for (let i = 0; i < steps; i++) {
            bodiesRef.current = step(bodiesRef.current, dt, integrator);
        }

        // Direct visual update
        bodiesRef.current.forEach((body, i) => {
            const mesh = meshRefs.current[i];
            if (mesh) {
                mesh.position.set(body.position.x, body.position.y, body.position.z);
            }
        });

        if (onUpdateMetrics) {
            onUpdateMetrics(bodiesRef.current);
        }
    });

    return (
        <>
            {showHelpers && (
                <>
                    <axesHelper args={[50]} />
                    <gridHelper args={[100, 100, 0x444444, 0x222222]} />
                </>
            )}

            {bodiesRef.current.map((body, i) => (
                <group key={`${preset}-${version}-${body.id}`}>
                    <Trail
                        width={1}
                        length={50} // Shorter, cleaner trails
                        color={new THREE.Color(body.color)}
                        attenuation={(t) => t * t}
                        interval={2} // Less frequent updates for performance
                        target={undefined} // Fix for types if needed, or omit
                    >
                        <mesh
                            ref={(el) => (meshRefs.current[i] = el!)}
                            position={[body.position.x, body.position.y, body.position.z]}
                            castShadow
                            receiveShadow
                        >
                            <sphereGeometry args={[body.radius, 32, 32]} />
                            <meshStandardMaterial
                                color={body.color}
                                roughness={0.4}
                                metalness={0.6}
                                emissive={body.color}
                                emissiveIntensity={0.2} // Much lower emissive for realism
                            />
                        </mesh>
                    </Trail>
                </group>
            ))}

            {/* Lighting for realism */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
        </>
    );
});
