import React, { useState } from 'react';
import { Play, Pause, Smartphone, Plus, Grid } from 'lucide-react';
import { PRESETS } from '../physics/presets';
import type { PresetName } from '../physics/presets';
import { clsx } from 'clsx';
import type { Body } from '../physics/rk4';

interface ControlsProps {
    preset: PresetName;
    setPreset: (p: PresetName) => void;
    paused: boolean;
    setPaused: (p: boolean) => void;
    speed: number;
    setSpeed: (s: number) => void;
    showEarth: boolean;
    setShowEarth: (s: boolean) => void;
    showGrid: boolean;
    setShowGrid: (s: boolean) => void;
    onAddBody: (b: Body) => void;
    spread: number;
    setSpread: (s: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    preset, setPreset, paused, setPaused, speed, setSpeed, showEarth, setShowEarth, showGrid, setShowGrid, onAddBody,
    spread, setSpread
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newBody, setNewBody] = useState({
        mass: 1,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        color: '#ffffff'
    });

    const handleAdd = () => {
        onAddBody({
            id: `custom-${Math.random()}`,
            mass: newBody.mass,
            position: { x: newBody.x, y: newBody.y, z: newBody.z },
            velocity: { x: newBody.vx, y: newBody.vy, z: newBody.vz },
            color: newBody.color,
            radius: Math.max(0.1, Math.min(0.5, newBody.mass * 0.1)) // simple radius scaling
        });
        setIsAdding(false);
    };

    return (
        <div className="absolute top-4 right-4 w-80 flex flex-col gap-2 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="glass-panel rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-cyan-500/20">
                <h1 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    3-Body Simulation
                </h1>

                <div className="space-y-6">
                    {/* Playback Controls */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setPaused(!paused)}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                        >
                            {paused ? <Play size={24} className="ml-1" /> : <Pause size={24} />}
                        </button>
                        <div className="flex flex-col flex-1 mx-4">
                            <label className="text-xs text-gray-400 mb-1">Time Scale: {speed.toFixed(1)}x</label>
                            <input
                                type="range"
                                min="0.1"
                                max="5"
                                step="0.1"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1">Initial Spread: {spread.toFixed(1)}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            value={spread}
                            onChange={(e) => setSpread(parseFloat(e.target.value))}
                            className="w-full accent-secondary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Preset Selection */}
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">System Configuration</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(PRESETS) as PresetName[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPreset(p)}
                                    className={clsx(
                                        "px-3 py-2 text-sm rounded-lg text-left transition-all",
                                        preset === p
                                            ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                            : "bg-white/5 hover:bg-white/10 border-transparent text-gray-300"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setShowEarth(!showEarth)}
                            className={clsx(
                                "p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border text-xs",
                                showEarth ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-white/5 border-white/10 text-gray-400"
                            )}
                        >
                            <Smartphone size={16} />
                            <span>Monitor</span>
                        </button>
                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={clsx(
                                "p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border text-xs",
                                showGrid ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "bg-white/5 border-white/10 text-gray-400"
                            )}
                        >
                            <Grid size={16} />
                            <span>Gravity Grid</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Body Panel */}
            <div className="glass-panel rounded-2xl p-4 text-white">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-full flex items-center justify-between text-gray-300 hover:text-white"
                >
                    <span className="font-display font-medium">Inject Celestial Body</span>
                    <Plus size={18} className={clsx("transition-transform", isAdding ? "rotate-45" : "")} />
                </button>

                {isAdding && (
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-500">Mass</label>
                                <input type="number" value={newBody.mass} onChange={e => setNewBody({ ...newBody, mass: parseFloat(e.target.value) })} className="w-full bg-white/5 rounded border border-white/10 px-2 py-1" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500">Color</label>
                                <input type="color" value={newBody.color} onChange={e => setNewBody({ ...newBody, color: e.target.value })} className="w-full h-7 bg-transparent cursor-pointer" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-500">Position (X, Y, Z)</label>
                            <div className="grid grid-cols-3 gap-1">
                                <input type="number" placeholder="X" value={newBody.x} onChange={e => setNewBody({ ...newBody, x: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                                <input type="number" placeholder="Y" value={newBody.y} onChange={e => setNewBody({ ...newBody, y: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                                <input type="number" placeholder="Z" value={newBody.z} onChange={e => setNewBody({ ...newBody, z: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-500">Velocity (VX, VY, VZ)</label>
                            <div className="grid grid-cols-3 gap-1">
                                <input type="number" placeholder="VX" value={newBody.vx} onChange={e => setNewBody({ ...newBody, vx: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                                <input type="number" placeholder="VY" value={newBody.vy} onChange={e => setNewBody({ ...newBody, vy: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                                <input type="number" placeholder="VZ" value={newBody.vz} onChange={e => setNewBody({ ...newBody, vz: parseFloat(e.target.value) })} className="bg-white/5 rounded px-1 py-1 text-xs" />
                            </div>
                        </div>

                        <button onClick={handleAdd} className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                            Inject Body
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
