import { Minus, Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import type { PresetName } from '../physics/presets';
import type { IntegratorType } from '../physics/integrators';
import type { Body } from '../physics/rk4';

interface ControlsProps {
    preset: PresetName | 'Custom';
    setPreset: (p: PresetName | 'Custom') => void;
    paused: boolean;
    setPaused: (p: boolean) => void;
    speed: number;
    setSpeed: (s: number) => void;
    spread: number;
    setSpread: (s: number) => void;
    activeCount: number;
    activeBodies: Body[];

    showForceVectors: boolean;
    setShowForceVectors: (b: boolean) => void;
    showVelocityVectors: boolean;
    setShowVelocityVectors: (b: boolean) => void;
    showTrails: boolean;
    setShowTrails: (b: boolean) => void;
    showGrid: boolean;
    setShowGrid: (b: boolean) => void;
    showGravityPlane: boolean;
    setShowGravityPlane: (b: boolean) => void;
    anaglyph: boolean;
    setAnaglyph: (b: boolean) => void;

    trailLength: number;
    setTrailLength: (n: number) => void;
    trailThickness: number;
    setTrailThickness: (n: number) => void;
    bodySize: number;
    setBodySize: (n: number) => void;

    followTarget: string | null;
    setFollowTarget: (id: string | null) => void;
    cameraMode: 'free' | 'locked';
    setCameraMode: (m: 'free' | 'locked') => void;

    onAddBody: (b: Body) => void;
    onSpawnWormhole: () => void;
    onLoadCustom: (config: { bodies: Body[], integrator: IntegratorType, dt: number }) => void;
}

export const Controls = ({
    preset, setPreset,
    speed, setSpeed,
    activeCount, activeBodies,

    showForceVectors, setShowForceVectors,
    showVelocityVectors, setShowVelocityVectors,
    showTrails, setShowTrails,
    showGrid, setShowGrid,
    showGravityPlane, setShowGravityPlane,
    anaglyph, setAnaglyph,

    trailLength, setTrailLength,
    trailThickness, setTrailThickness,
    bodySize, setBodySize,

    followTarget, setFollowTarget,
    cameraMode, setCameraMode,

    onAddBody,
    onSpawnWormhole
}: ControlsProps) => {

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Configuration URL copied to clipboard!');
    };

    const addRandomBody = () => {
        onAddBody({
            id: `random - ${Math.random().toString(36).substr(2, 5)} `,
            mass: Math.random() * 2 + 0.5,
            position: { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 5 },
            velocity: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5, z: (Math.random() - 0.5) * 0.5 },
            radius: 0.5,
            color: '#ffffff'
        });
    };

    const [injectForm, setInjectForm] = useState({
        mass: 1,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        color: '#ff0000'
    });

    const handleInject = () => {
        onAddBody({
            id: `manual-${Math.random().toString(36).substr(2, 5)}`,
            mass: injectForm.mass,
            position: { x: injectForm.x, y: injectForm.y, z: injectForm.z },
            velocity: { x: injectForm.vx, y: injectForm.vy, z: injectForm.vz },
            radius: Math.pow(injectForm.mass, 1 / 3) * 0.5, // Scale radius by mass roughly
            color: injectForm.color
        });
    };

    const [activeTab, setActiveTab] = useState<'config' | 'view' | 'inject'>('config');

    return (
        <div className="absolute top-4 right-4 w-72 bg-black/90 text-gray-200 border border-gray-800 rounded-lg shadow-2xl backdrop-blur-md flex flex-col max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 select-none font-mono">

            {/* Header Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-900/50">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'config' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <div className="flex items-center justify-center gap-1"><span className="text-lg">⚙</span> Config</div>
                </button>
                <button
                    onClick={() => setActiveTab('view')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'view' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <div className="flex items-center justify-center gap-1"><span className="text-lg">👁</span> View</div>
                </button>
                <button
                    onClick={() => setActiveTab('inject')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'inject' ? 'text-white border-b-2 border-blue-500 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <div className="flex items-center justify-center gap-1"><Plus size={14} /> Inject</div>
                </button>
            </div>

            <div className="p-4 space-y-4">

                {/* CONFIG TAB */}
                {activeTab === 'config' && (
                    <>
                        {/* Simulation Controls */}
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Simulation</div>
                            <button onClick={() => setPreset('Random Chaos')} className="w-full bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-800/50 font-bold py-2 rounded text-xs transition-colors">
                                RESET ALL (RANDOM)
                            </button>
                            <button onClick={() => window.location.reload()} className="w-full bg-blue-900/50 hover:bg-blue-900/80 text-blue-200 border border-blue-800/50 font-bold py-2 rounded text-xs transition-colors">
                                RESTART
                            </button>
                            <button onClick={onSpawnWormhole} className="w-full bg-yellow-900/50 hover:bg-yellow-900/80 text-yellow-200 border border-yellow-800/50 font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2">
                                <Zap size={14} /> SPAWN WORMHOLE PAIR
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleShare} className="bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 border border-purple-800/50 font-bold py-2 rounded text-[10px] transition-colors">
                                    SHARE CONFIG
                                </button>
                                <button className="bg-green-900/50 hover:bg-green-900/80 text-green-200 border border-green-800/50 font-bold py-2 rounded text-[10px] transition-colors">
                                    LOAD PRESET
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 pt-4 border-t border-gray-800">
                            <label className="text-gray-500 text-[10px] uppercase">Current Preset</label>
                            <div className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center text-blue-300 text-xs">
                                {preset}
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4 pt-4 border-t border-gray-800">
                            {/* Speed */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Time Speed</span>
                                    <span className="text-blue-400 font-mono">{speed.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range" min="0" max="5" step="0.1"
                                    value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Bodies Count */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Total Bodies</span>
                                    <span className="text-blue-400 font-mono">{activeCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="bg-gray-800 p-1.5 rounded hover:bg-gray-700 transition-colors"><Minus size={12} /></button>
                                    <input
                                        type="range" min="1" max="100"
                                        value={activeCount}
                                        readOnly
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <button onClick={addRandomBody} className="bg-gray-800 p-1.5 rounded hover:bg-gray-700 transition-colors"><Plus size={12} /></button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* VIEW TAB */}
                {activeTab === 'view' && (
                    <div className="space-y-4">
                        {/* Camera */}
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Camera & View</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 uppercase">Target</span>
                                    <select
                                        value={followTarget || ''}
                                        onChange={(e) => setFollowTarget(e.target.value || null)}
                                        className="bg-gray-800 border-none text-xs rounded px-2 py-1.5 w-full focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">None (Free)</option>
                                        {activeBodies.map((b, i) => (
                                            <option key={b.id} value={b.id}>Body {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 uppercase">Mode</span>
                                    <select
                                        value={cameraMode}
                                        onChange={(e) => setCameraMode(e.target.value as 'free' | 'locked')}
                                        className="bg-gray-800 border-none text-xs rounded px-2 py-1.5 w-full focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="free">Orbital</option>
                                        <option value="locked">Locked</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2 pt-2 border-t border-gray-800">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Overlays</div>
                            <Toggle label="Force Vectors" checked={showForceVectors} onChange={setShowForceVectors} />
                            <Toggle label="Velocity Vectors" checked={showVelocityVectors} onChange={setShowVelocityVectors} />
                            <Toggle label="Orbital Trails" checked={showTrails} onChange={setShowTrails} />
                            <Toggle label="Reference Grid" checked={showGrid} onChange={setShowGrid} />
                            <Toggle label="Gravity Plane" checked={showGravityPlane} onChange={setShowGravityPlane} />
                            <Toggle label="Anaglyph 3D" checked={anaglyph} onChange={setAnaglyph} />
                        </div>

                        {/* Visual Sliders */}
                        <div className="space-y-3 pt-4 border-t border-gray-800">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Appearance</div>
                            <Slider label="Trail Length" value={trailLength} min={0.1} max={50} step={0.1} onChange={setTrailLength} />
                            <Slider label="Trail Thickness" value={trailThickness} min={0.1} max={5} step={0.1} onChange={setTrailThickness} />
                            <Slider label="Body Size" value={bodySize} min={0.1} max={3} step={0.1} onChange={setBodySize} />
                        </div>
                    </div>
                )}

                {/* INJECT TAB */}
                {activeTab === 'inject' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Mass & Color */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mass (M ☉)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={injectForm.mass}
                                    onChange={(e) => setInjectForm({ ...injectForm, mass: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Color</label>
                                <div className="flex h-[38px] w-full relative rounded overflow-hidden border border-gray-700">
                                    <input
                                        type="color"
                                        value={injectForm.color}
                                        onChange={(e) => setInjectForm({ ...injectForm, color: e.target.value })}
                                        className="absolute -top-2 -left-2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Position */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Position (AU)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="X" value={injectForm.x} onChange={(e) => setInjectForm({ ...injectForm, x: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                                <input type="number" placeholder="Y" value={injectForm.y} onChange={(e) => setInjectForm({ ...injectForm, y: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                                <input type="number" placeholder="Z" value={injectForm.z} onChange={(e) => setInjectForm({ ...injectForm, z: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                            </div>
                        </div>

                        {/* Velocity */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Velocity (KM/S)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="VX" value={injectForm.vx} onChange={(e) => setInjectForm({ ...injectForm, vx: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                                <input type="number" placeholder="VY" value={injectForm.vy} onChange={(e) => setInjectForm({ ...injectForm, vy: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                                <input type="number" placeholder="VZ" value={injectForm.vz} onChange={(e) => setInjectForm({ ...injectForm, vz: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:border-blue-500 focus:outline-none placeholder-gray-600" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleInject}
                                className="w-full bg-[#1a237e] hover:bg-[#283593] text-blue-100 font-bold py-3 rounded border border-blue-900 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Inject Body
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Helper for slider to clean up code
const Slider = ({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-gray-400">{label}</span>
            <span className="text-blue-400 font-mono">{value.toFixed(1)}</span>
        </div>
        <input
            type="range" min={min} max={max} step={step}
            value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
    </div>
);

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (b: boolean) => void }) => (
    <label className="flex items-center space-x-2 cursor-pointer select-none group" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-600 group-hover:border-gray-500'}`}>
            {checked && <div className="w-2 h-2 bg-white rounded-sm" />}
        </div>
        <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </label>
);
