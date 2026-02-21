import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Body } from '../physics/rk4';
import { G } from '../physics/rk4';

interface GravityPlaneProps {
    bodies: Body[];
    visible: boolean;
    scale?: number;
}

export const GravityPlane = ({ bodies, visible, scale = 100 }: GravityPlaneProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const planeGeo = useMemo(() => new THREE.PlaneGeometry(scale, scale, 128, 128), [scale]);


    useFrame(() => {
        if (!visible || !meshRef.current) return;

        const geometry = meshRef.current.geometry;
        const positions = geometry.attributes.position;
        const count = positions.count;

        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            // Calculate potential at this point (x, y, 0)
            let potential = 0;



            for (const body of bodies) {
                const dx = x - body.position.x;
                const dy = y - body.position.z; // Plane Y maps to World Z
                const distSq = dx * dx + dy * dy;

                const dist = Math.sqrt(distSq + 0.5); // Softening

                // Potential V = -GM/r
                // We want a dip, so negative Y.
                potential -= (G * body.mass) / dist;
            }

            // Apply displacement
            // Scale potential for visual effect
            positions.setZ(i, potential * 2.0);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    });

    if (!visible) return null;

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -5, 0]} // Sit below the system slightly? Or at 0? 0 cuts through bodies. -10 is safer bottom.
            geometry={planeGeo}
        >
            <meshStandardMaterial
                color="#4488ff"
                wireframe
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
