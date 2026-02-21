import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { ThreeBody } from './components/ThreeBody';
import type { ThreeBodyHandle } from './components/ThreeBody';
import { Controls } from './components/Controls';
import { SystemMonitor } from './components/SystemMonitor';
import { GravityPlane } from './components/GravityPlane';
import type { PresetName } from './physics/presets';
import type { Body } from './physics/rk4';
import { parseURLParams } from './physics/urlParser';
import type { IntegratorType } from './physics/integrators';

function App() {
  // Parse URL on init
  const initialConfig = useMemo(() => {
    const params = window.location.search;
    return params ? parseURLParams(params) : null;
  }, []);

  const [preset, setPreset] = useState<PresetName | 'Custom'>(initialConfig ? 'Custom' : 'Figure 8');
  const [customBodies, setCustomBodies] = useState<Body[] | undefined>(initialConfig?.bodies);
  const [integrator, setIntegrator] = useState<IntegratorType>(initialConfig?.integrator || 'rk4');
  const [speed, setSpeed] = useState(initialConfig ? initialConfig.timeStep * 100 : 1.0);
  const [spread, setSpread] = useState(4.0);
  const [paused, setPaused] = useState(false);

  // Visual State
  const [showForceVectors, setShowForceVectors] = useState(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showGrid, setShowGrid] = useState(false); // Default off in screenshot
  const [showGravityPlane, setShowGravityPlane] = useState(false);
  const [anaglyph, setAnaglyph] = useState(false);

  // Visual Sliders
  const [trailLength, setTrailLength] = useState(1.0); // 0 to 1 scale
  const [trailThickness, setTrailThickness] = useState(1);
  const [bodySize, setBodySize] = useState(0.5);

  // Camera
  const [followTarget, setFollowTarget] = useState<string | null>(null); // Body ID
  const [cameraMode, setCameraMode] = useState<'free' | 'locked'>('free'); // 'free' or 'locked' relative to target

  const [activeBodies, setActiveBodies] = useState<Body[]>([]);
  const simulationRef = useRef<ThreeBodyHandle>(null);


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
        <Canvas gl={{ antialias: true, toneMappingExposure: 1.0 }} shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={45} />
            <OrbitControls makeDefault enablePan={true} enableZoom={true} enableRotate={true} />

            {/* Anaglyph Effect Wrapper would go here if we had it, for now just pass prop to ThreeBody to maybe handle camera stereo? 
                Actually standard three.js AnaglyphEffect is a post-processing pass. 
                We can add it later.
            */}

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
              showHelpers={showGrid} // Grid/Axes
              showForceVectors={showForceVectors}
              showVelocityVectors={showVelocityVectors}
              showTrails={showTrails}
              trailLength={trailLength}
              trailThickness={trailThickness}
              bodySize={bodySize}
              followTarget={followTarget}
              onUpdateMetrics={setActiveBodies}
            />

            <GravityPlane bodies={activeBodies} visible={showGravityPlane} />

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
        activeCount={activeBodies.length}
        activeBodies={activeBodies} // Pass full list for Follow dropdown

        // Visual Props
        showForceVectors={showForceVectors}
        setShowForceVectors={setShowForceVectors}
        showVelocityVectors={showVelocityVectors}
        setShowVelocityVectors={setShowVelocityVectors}
        showTrails={showTrails}
        setShowTrails={setShowTrails}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showGravityPlane={showGravityPlane}
        setShowGravityPlane={setShowGravityPlane}
        anaglyph={anaglyph}
        setAnaglyph={setAnaglyph}

        trailLength={trailLength}
        setTrailLength={setTrailLength}
        trailThickness={trailThickness}
        setTrailThickness={setTrailThickness}
        bodySize={bodySize}
        setBodySize={setBodySize}

        followTarget={followTarget}
        setFollowTarget={setFollowTarget}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}

        onAddBody={handleAddBody}
        onSpawnWormhole={() => simulationRef.current?.spawnWormholes()}
        onLoadCustom={handleLoadCustom}
      />

      <SystemMonitor
        bodies={activeBodies}
        visible={true}
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

