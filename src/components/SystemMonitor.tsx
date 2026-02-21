import React from 'react';

import type { Body } from '../physics/rk4';
import { clsx } from 'clsx';

interface SystemMonitorProps {
    bodies: Body[];
    visible: boolean;
}

const getStabilityStatus = (body: Body, others: Body[]) => {
    // Calculate total gravitational force magnitude acting on this body

    let minDistance = Infinity;

    others.forEach(other => {
        const dx = body.position.x - other.position.x;
        const dy = body.position.y - other.position.y;
        const dz = body.position.z - other.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < minDistance) minDistance = dist;


    });

    // Heuristics for "Era"
    // If force is extremely high, we are in a chaotic close encounter.
    // If force is moderate and stable (hard to measure stability without history), we guess.
    // We'll use distance thresholds for visual flair.

    // In many simulations, r < 0.5 is very close for mass ~ 1.
    if (minDistance < 0.6) return { label: 'CHAOTIC ERA', color: 'text-red-500 animate-pulse', type: 'chaotic' };
    if (minDistance < 1.5) return { label: 'TRANSITIONAL', color: 'text-yellow-400', type: 'transitional' };
    return { label: 'STABLE ERA', color: 'text-primary', type: 'stable' };
};

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ bodies, visible }) => {
    if (!visible || bodies.length === 0) return null;

    return (
        <div className="absolute bottom-10 left-10 pointer-events-none flex flex-col gap-4">
            {bodies.map((body, index) => {
                const others = bodies.filter(b => b.id !== body.id);
                const status = getStabilityStatus(body, others);

                return (
                    <div key={body.id} className="glass-panel p-4 rounded-xl border border-white/10 w-64 backdrop-blur-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: body.color, boxShadow: `0 0 10px ${body.color}` }} />
                                <span className="font-display font-bold text-gray-300 text-sm">BODY {index + 1}</span>
                            </div>
                            <span className="font-mono text-xs text-gray-500">M: {body.mass.toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">CIVILIZATION STATE</span>
                            </div>
                            <div className={clsx("text-lg font-bold font-mono tracking-tight", status.color)}>
                                {status.label}
                            </div>

                            {/* Velocity Bar */}
                            <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>VELOCITY</span>
                                    <span>
                                        {Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2).toFixed(2)} u/s
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                                    <div
                                        className="h-full bg-white/50"
                                        style={{ width: `${Math.min(Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2) * 20, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
