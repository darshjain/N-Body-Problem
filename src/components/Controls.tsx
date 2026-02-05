import React, { useState } from 'react';
import { Play, Pause, Plus, Eye, Settings, Activity, Download, Globe } from 'lucide-react';
import { PRESETS } from '../physics/presets';
import type { PresetName } from '../physics/presets';
import { clsx } from 'clsx';
import type { Body } from '../physics/rk4';
import type { IntegratorType } from '../physics/integrators';
import { parseURLParams } from '../physics/urlParser';

interface ControlsProps {
    preset: PresetName | 'Custom';
    setPreset: (p: PresetName | 'Custom') => void;
    paused: boolean;
    setPaused: (p: boolean) => void;
    speed: number;
    setSpeed: (s: number) => void;
    spread: number;
    setSpread: (s: number) => void;
    showMonitor: boolean;
    setShowMonitor: (s: boolean) => void;
    showHelpers: boolean;
    setShowHelpers: (s: boolean) => void;
    onAddBody: (b: Body) => void;
    onLoadCustom: (config: { bodies: Body[], integrator: IntegratorType, dt: number }) => void;
    activeCount: number;
}

export const Controls: React.FC<ControlsProps> = ({
    preset, setPreset, paused, setPaused, speed, setSpeed,
    spread, setSpread, showMonitor, setShowMonitor, showHelpers, setShowHelpers,
    onAddBody, onLoadCustom, activeCount
}) => {
    const [activeTab, setActiveTab] = useState<'config' | 'view' | 'inject'>('config');
    const [urlInput, setUrlInput] = useState('');

    // Body Injection State
    const [newBody, setNewBody] = useState({
        mass: 1,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        color: '#3b82f6'
    });

    const handleInject = () => {
        onAddBody({
            id: `manual-${Math.random().toString(36).substr(2, 9)}`,
            mass: newBody.mass,
            position: { x: newBody.x, y: newBody.y, z: newBody.z },
            velocity: { x: newBody.vx, y: newBody.vy, z: newBody.vz },
            color: newBody.color,
            radius: Math.max(0.1, Math.min(0.5, newBody.mass * 0.1))
        });
    };

    const handleUrlImport = () => {
        try {
            // Extract query string if full URL provided
            const query = urlInput.includes('?') ? urlInput.split('?')[1] : urlInput;
            const config = parseURLParams(query);
            if (config) {
                onLoadCustom({
                    bodies: config.bodies,
                    integrator: config.integrator,
                    dt: config.timeStep
                });
                setUrlInput('');
            } else {
                alert('Invalid Parameters');
            }
        } catch (e) {
            alert('Error parsing URL');
        }
    };

    return (
        <div className="absolute top-4 right-4 w-96 flex flex-col gap-2 z-10 max-h-[90vh] text-gray-200 font-sans">
            <div className="bg-[#111]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">

                {/* Header / Tabs */}
                <div className="flex items-center gap-1 mb-6 border-b border-white/5 pb-2">
                    <TabButton icon={<Settings size={14} />} label="Config" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
                    <TabButton icon={<Eye size={14} />} label="View" active={activeTab === 'view'} onClick={() => setActiveTab('view')} />
                    <TabButton icon={<Plus size={14} />} label="Inject" active={activeTab === 'inject'} onClick={() => setActiveTab('inject')} />
                </div>

                {/* --- CONFIGURATION TAB --- */}
                {activeTab === 'config' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

                        {/* Playback */}
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                            <button
                                onClick={() => setPaused(!paused)}
                                className={clsx(
                                    "flex items-center justify-center w-10 h-10 rounded-full transition-all border",
                                    paused
                                        ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20"
                                        : "bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20"
                                )}
                            >
                                {paused ? <Play size={18} className="ml-1" /> : <Pause size={18} />}
                            </button>

                            <div className="flex-1 ml-4">
                                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                    <span>Time Dilation</span>
                                    <span>{speed.toFixed(2)}x</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="5" step="0.1"
                                    value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Presets */}
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">System Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(PRESETS) as PresetName[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPreset(p)}
                                        className={clsx(
                                            "px-3 py-2 text-xs font-mono text-left transition-all border rounded-md",
                                            preset === p
                                                ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                                                : "bg-transparent border-white/10 text-gray-400 hover:bg-white/5"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* URL Import */}
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">Import Configuration</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Paste trisolarchaos URL..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:border-blue-500/50 outline-none"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                                <button
                                    onClick={handleUrlImport}
                                    className="p-1 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW TAB --- */}
                {activeTab === 'view' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                <span>Initial Spread</span>
                                <span>{spread.toFixed(1)} AU</span>
                            </div>
                            <input
                                type="range" min="1" max="10" step="0.5"
                                value={spread} onChange={(e) => setSpread(parseFloat(e.target.value))}
                                className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Toggle label="System Monitor" active={showMonitor} onClick={() => setShowMonitor(!showMonitor)} icon={<Activity size={14} />} />
                            <Toggle label="Reference Grid & Axis" active={showHelpers} onClick={() => setShowHelpers(!showHelpers)} icon={<Globe size={14} />} />
                        </div>

                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] text-blue-400/80 leading-relaxed font-mono">
                            Rendering {activeCount} active bodies. <br />
                            Lighting calculated per-frame. <br />
                            Bloom effects disabled for accuracy.
                        </div>
                    </div>
                )}

                {/* --- INJECT TAB --- */}
                {activeTab === 'inject' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                            <InputGroup label="Mass (M☉)">
                                <input type="number" value={newBody.mass} onChange={e => setNewBody({ ...newBody, mass: parseFloat(e.target.value) })} className="input-scientific" />
                            </InputGroup>
                            <InputGroup label="Color">
                                <div className="flex items-center gap-2 h-full">
                                    <input type="color" value={newBody.color} onChange={e => setNewBody({ ...newBody, color: e.target.value })} className="h-6 w-full bg-transparent cursor-pointer" />
                                </div>
                            </InputGroup>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">Position (AU)</label>
                            <div className="grid grid-cols-3 gap-1">
                                <input type="number" placeholder="X" value={newBody.x} onChange={e => setNewBody({ ...newBody, x: parseFloat(e.target.value) })} className="input-scientific" />
                                <input type="number" placeholder="Y" value={newBody.y} onChange={e => setNewBody({ ...newBody, y: parseFloat(e.target.value) })} className="input-scientific" />
                                <input type="number" placeholder="Z" value={newBody.z} onChange={e => setNewBody({ ...newBody, z: parseFloat(e.target.value) })} className="input-scientific" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">Velocity (km/s)</label>
                            <div className="grid grid-cols-3 gap-1">
                                <input type="number" placeholder="VX" value={newBody.vx} onChange={e => setNewBody({ ...newBody, vx: parseFloat(e.target.value) })} className="input-scientific" />
                                <input type="number" placeholder="VY" value={newBody.vy} onChange={e => setNewBody({ ...newBody, vy: parseFloat(e.target.value) })} className="input-scientific" />
                                <input type="number" placeholder="VZ" value={newBody.vz} onChange={e => setNewBody({ ...newBody, vz: parseFloat(e.target.value) })} className="input-scientific" />
                            </div>
                        </div>

                        <button
                            onClick={handleInject}
                            className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded transition-all text-xs font-mono uppercase tracking-widest mt-4"
                        >
                            Inject Body
                        </button>
                    </div>
                )}

            </div>

            {/* CSS helper for inputs */}
            <style>{`
                .input-scientific {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                    color: #ddd;
                    font-family: monospace;
                    outline: none;
                }
                .input-scientific:focus {
                    border-color: rgba(59, 130, 246, 0.5);
                }
            `}</style>
        </div>
    );
};

// Subcomponents



const TabButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center",
            active ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Toggle = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full flex items-center justify-between p-2 rounded border transition-all text-xs",
            active ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
        )}
    >
        <div className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
        </div>
        <div className={clsx("w-2 h-2 rounded-full", active ? "bg-green-500" : "bg-gray-600")} />
    </button>
);

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="text-[10px] text-gray-500 uppercase mb-1 block">{label}</label>
        {children}
    </div>
);
