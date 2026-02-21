import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface WormholeProps {
    position: [number, number, number];
    color: string;
    label?: string;
}

export const Wormhole: React.FC<WormholeProps> = ({ position, color, label }) => {
    const groupRef = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.elapsedTime * 0.5;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        }
        if (innerRef.current) {
            innerRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        }
    });

    return (
        <group position={position}>
            {label && (
                <Text
                    position={[0, 3, 0]}
                    fontSize={0.4}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/GeistMono-Regular.ttf" // Optional, fallback to default if not present
                >
                    {label}
                </Text>
            )}
            <group ref={groupRef}>
                {/* Event Horizon (Black Hole Center) */}
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>

                {/* Accretion Disk (Inner Glow) */}
                <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.85, 1.4, 64]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={3}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Outer Accretion Disk (Fading) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 2.2, 64]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={1}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.3}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Vertical Jets (Optional, stylish) */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
                    <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>
        </group>
    );
};
