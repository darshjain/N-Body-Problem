import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Body } from '../physics/rk4';
import { G } from '../physics/rk4';

interface GravityGridProps {
    bodies: Body[];
}

export const GravityGrid: React.FC<GravityGridProps> = ({ bodies }) => {
    const gridRef = useRef<THREE.Points>(null);
    const count = 50;
    const spacing = 0.5;

    const particles = useMemo(() => {
        const temp = [];
        for (let x = -count / 2; x < count / 2; x++) {
            for (let y = -count / 2; y < count / 2; y++) {
                temp.push(x * spacing, y * spacing, 0);
            }
        }
        return new Float32Array(temp);
    }, []);

    useFrame(() => {
        if (!gridRef.current || bodies.length === 0) return;

        const positions = gridRef.current.geometry.attributes.position.array as Float32Array;
        const colors = gridRef.current.geometry.attributes.color.array as Float32Array;

        let i3 = 0;
        for (let x = -count / 2; x < count / 2; x++) {
            for (let y = -count / 2; y < count / 2; y++) {
                const px = x * spacing;
                const py = y * spacing;

                let potential = 0;
                bodies.forEach(b => {
                    const dx = px - b.position.x;
                    const dy = py - b.position.y;
                    const dz = 0 - b.position.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
                    potential += (G * b.mass) / dist;
                });

                const z = -potential * 0.5;

                positions[i3] = px;
                positions[i3 + 1] = py;
                positions[i3 + 2] = z;

                const color = new THREE.Color().setHSL(0.6 - Math.min(potential * 0.1, 0.6), 1, 0.5);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                i3 += 3;
            }
        }
        gridRef.current.geometry.attributes.position.needsUpdate = true;
        gridRef.current.geometry.attributes.color.needsUpdate = true;
    });

    return (
        <points ref={gridRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    args={[particles, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.length / 3}
                    args={[new Float32Array(particles.length), 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
