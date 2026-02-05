import { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ThreeBody } from './components/ThreeBody';
import type { ThreeBodyHandle } from './components/ThreeBody';
import { Controls } from './components/Controls';
import { SystemMonitor } from './components/SystemMonitor';
import { GravityGrid } from './components/GravityGrid';
import type { PresetName } from './physics/presets';
import type { Body } from './physics/rk4';

function App() {
  const [preset, setPreset] = useState<PresetName>('Figure 8');
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [spread, setSpread] = useState(4.0);
  const [showMonitor, setShowMonitor] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [bodies, setBodies] = useState<Body[]>([]);

  const simulationRef = useRef<ThreeBodyHandle>(null);

  const handleAddBody = (body: Body) => {
    simulationRef.current?.addBody(body);
  };

  return (
    <div className="w-full h-screen bg-space-950 relative overflow-hidden text-white selection:bg-primary/30">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-space-800 via-space-950 to-black opacity-80 -z-10" />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas gl={{ antialias: true, toneMappingExposure: 1.5 }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 8 + spread]} fov={60} />
            <OrbitControls makeDefault enablePan={true} enableZoom={true} enableRotate={true} />

            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <ThreeBody
              ref={simulationRef}
              preset={preset}
              speed={paused ? 0 : speed}
              spread={spread}
              paused={paused}
              onUpdateMetrics={setBodies}
            />

            {showGrid && <GravityGrid bodies={bodies} />}

            <EffectComposer>
              <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Controls
        preset={preset}
        setPreset={setPreset}
        paused={paused}
        setPaused={setPaused}
        speed={speed}
        setSpeed={setSpeed}
        spread={spread}
        setSpread={setSpread}
        showEarth={showMonitor}
        setShowEarth={setShowMonitor}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onAddBody={handleAddBody}
      />

      <SystemMonitor
        bodies={bodies}
        visible={showMonitor}
      />

      {/* Title / Branding */}
      <div className="absolute top-6 left-8 pointer-events-none">
        <h1 className="text-4xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          THREE BODY
        </h1>
        <p className="text-primary font-mono text-xs tracking-[0.3em] uppercase opacity-80 ml-1">
          Gravitational Chaos Simulator
        </p>
      </div>

    </div>
  );
}

export default App;
