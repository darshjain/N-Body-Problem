import { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { ThreeBody } from './components/ThreeBody';
import type { ThreeBodyHandle } from './components/ThreeBody';
import { Controls } from './components/Controls';
import { SystemMonitor } from './components/SystemMonitor';
import type { PresetName } from './physics/presets';
import type { Body } from './physics/rk4';
import { parseURLParams } from './physics/urlParser';
import type { IntegratorType } from './physics/integrators';

function App() {
  const [preset, setPreset] = useState<PresetName | 'Custom'>('Figure 8');
  const [customBodies, setCustomBodies] = useState<Body[] | undefined>(undefined);
  const [integrator, setIntegrator] = useState<IntegratorType>('rk4');

  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [spread, setSpread] = useState(4.0);

  const [showMonitor, setShowMonitor] = useState(true);
  const [showHelpers, setShowHelpers] = useState(true); // Default to on for scientific look

  const [activeBodies, setActiveBodies] = useState<Body[]>([]);
  const simulationRef = useRef<ThreeBodyHandle>(null);

  // Parse URL on mount
  useEffect(() => {
    const params = window.location.search;
    if (params) {
      const config = parseURLParams(params);
      if (config) {
        setPreset('Custom');
        setCustomBodies(config.bodies);
        setIntegrator(config.integrator);
        setSpeed(config.timeStep * 100);
      }
    }
  }, []);

  const handleAddBody = (body: Body) => {
    simulationRef.current?.addBody(body);
  };

  const handleLoadCustom = (config: { bodies: Body[], integrator: IntegratorType, dt: number }) => {
    setPreset('Custom');
    setCustomBodies(config.bodies);
    setIntegrator(config.integrator);
    if (simulationRef.current) {
      simulationRef.current.reset();
    }
  };

  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden text-gray-200 selection:bg-blue-500/30 font-sans">

      {/* Background - Clean, deep space, no nebulae/noise */}
      <div className="absolute inset-0 bg-[#020202] text-white -z-20" />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas gl={{ antialias: true, toneMappingExposure: 1.0 }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={45} />
            <OrbitControls makeDefault enablePan={true} enableZoom={true} enableRotate={true} />

            <ambientLight intensity={0.4} />
            <pointLight position={[20, 20, 20]} intensity={1.5} />
            <pointLight position={[-20, -10, -10]} intensity={0.5} color="#ccccff" />

            <Stars radius={200} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

            <ThreeBody
              ref={simulationRef}
              preset={preset}
              bodies={customBodies}
              integrator={integrator}
              speed={paused ? 0 : speed}
              spread={spread}
              paused={paused}
              showHelpers={showHelpers}
              onUpdateMetrics={setActiveBodies}
            />
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
        showMonitor={showMonitor}
        setShowMonitor={setShowMonitor}
        showHelpers={showHelpers}
        setShowHelpers={setShowHelpers}
        onAddBody={handleAddBody}
        onLoadCustom={handleLoadCustom}
        activeCount={activeBodies.length}
      />

      <SystemMonitor
        bodies={activeBodies}
        visible={showMonitor}
      />

      {/* Title / Branding - Scientific */}
      <div className="absolute top-6 left-8 pointer-events-none select-none">
        <h1 className="text-3xl font-light tracking-[0.2em] text-gray-100 border-b border-gray-800 pb-2 mb-1">
          N-BODY <span className="text-gray-500 font-bold">CHAOS</span>
        </h1>
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-gray-500 font-mono uppercase">
          <span>Integrator: {integrator.toUpperCase()}</span>
          <span>|</span>
          <span>Bodies: {activeBodies.length}</span>
          <span>|</span>
          <span>FPS: 60</span>
        </div>
      </div>

    </div>
  );
}

export default App;

