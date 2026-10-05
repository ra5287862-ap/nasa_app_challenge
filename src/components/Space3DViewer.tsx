import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  RotateCcw,
  Play,
  Pause,
  Upload,
  Layers,
  Sparkles,
  Maximize2,
  Box,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Space3DViewerProps {
  initialModelUrl?: string;
  className?: string;
}

export function Space3DViewer({
  initialModelUrl = "/models/spacecraft.glb",
  className = "",
}: Space3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modelSource, setModelSource] = useState<string>(initialModelUrl);
  const [modelType, setModelType] = useState<"glb" | "procedural">("procedural");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [hasAnimations, setHasAnimations] = useState<boolean>(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);

  // References to three.js objects for interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animationActionsRef = useRef<THREE.AnimationAction[]>([]);
  const proceduralPartsRef = useRef<{
    solarWings?: THREE.Group;
    thrusterRing?: THREE.Mesh;
    antennaDish?: THREE.Mesh;
  }>({});

  // Build high-tech procedural sci-fi probe if GLB is not loaded or not found
  const createProceduralSpacecraft = () => {
    const group = new THREE.Group();

    // Central command hull (faceted cylinder / cone)
    const hullGeo = new THREE.CylinderGeometry(0.8, 1.2, 3, 8);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x243242,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0;
    group.add(hull);

    // Avionics nose dome
    const noseGeo = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 1.5;
    group.add(nose);

    // Solar panel array wings (Left & Right)
    const wingsGroup = new THREE.Group();
    const panelGeo = new THREE.BoxGeometry(2.5, 0.05, 0.9);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x075985,
      emissiveIntensity: 0.4,
    });

    const leftWing = new THREE.Mesh(panelGeo, panelMat);
    leftWing.position.set(2.4, 0.3, 0);
    wingsGroup.add(leftWing);

    const rightWing = new THREE.Mesh(panelGeo, panelMat);
    rightWing.position.set(-2.4, 0.3, 0);
    wingsGroup.add(rightWing);

    // Wing truss mounts
    const trussGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const leftTruss = new THREE.Mesh(trussGeo, trussMat);
    leftTruss.rotation.z = Math.PI / 2;
    leftTruss.position.set(1.0, 0.3, 0);
    wingsGroup.add(leftTruss);

    const rightTruss = new THREE.Mesh(trussGeo, trussMat);
    rightTruss.rotation.z = Math.PI / 2;
    rightTruss.position.set(-1.0, 0.3, 0);
    wingsGroup.add(rightTruss);

    group.add(wingsGroup);
    proceduralPartsRef.current.solarWings = wingsGroup;

    // Glowing Ion Thruster at bottom
    const thrusterGeo = new THREE.CylinderGeometry(0.7, 0.4, 0.8, 16);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.position.y = -1.8;
    group.add(thruster);

    // Ion engine glow cone
    const glowGeo = new THREE.ConeGeometry(0.5, 1.2, 16, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = Math.PI;
    glow.position.y = -2.6;
    group.add(glow);

    // Orbital telemetry sensor ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 8, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    proceduralPartsRef.current.thrusterRing = ring;

    // High-gain communications dish
    const dishGeo = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0.8, 1.1);
    dish.rotation.x = Math.PI / 3;
    group.add(dish);
    proceduralPartsRef.current.antennaDish = dish;

    return group;
  };

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 7);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(10, 15, 10);
    scene.add(sunLight);

    // Sci-fi accent lights
    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 20);
    cyanLight.position.set(-6, 2, -4);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2, 20);
    goldLight.position.set(6, -3, 4);
    scene.add(goldLight);

    // 6. Floating Star dust / particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Load Model (GLB or fallback procedural)
    let isDisposed = false;
    const loader = new GLTFLoader();

    setLoading(true);
    setLoadError(null);

    const cleanupPreviousModel = () => {
      if (currentModelGroupRef.current) {
        scene.remove(currentModelGroupRef.current);
        currentModelGroupRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else if (mesh.material) {
              mesh.material.dispose();
            }
          }
        });
        currentModelGroupRef.current = null;
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      animationActionsRef.current = [];
    };

    const attachModel = (modelGroup: THREE.Group, isGlb: boolean) => {
      cleanupPreviousModel();
      currentModelGroupRef.current = modelGroup;
      scene.add(modelGroup);

      // Apply initial wireframe state
      modelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.wireframe = wireframe;
          }
        }
      });

      // Fit camera to model
      const box = new THREE.Box3().setFromObject(modelGroup);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 3.5 / maxDim : 1;
      modelGroup.scale.setScalar(scale);

      // Center it
      modelGroup.position.x = -center.x * scale;
      modelGroup.position.y = -center.y * scale;
      modelGroup.position.z = -center.z * scale;

      setModelType(isGlb ? "glb" : "procedural");
      setLoading(false);
    };

    // Try to load the GLB from URL
    loader.load(
      modelSource,
      (gltf) => {
        if (isDisposed) return;
        const root = gltf.scene;

        // Check for embedded animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(root);
          mixerRef.current = mixer;
          setHasAnimations(true);

          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            animationActionsRef.current.push(action);
          });
        } else {
          setHasAnimations(false);
        }

        attachModel(root, true);
        setLoadError(null);
      },
      undefined,
      (error) => {
        if (isDisposed) return;
        console.warn(`[Space3DViewer] Could not load GLB from "${modelSource}". Falling back to procedural space probe.`, error);
        setLoadError(`Custom GLB file not found at "${modelSource}". Showing default NASA Deep Space probe preview.`);
        const procedural = createProceduralSpacecraft();
        setHasAnimations(false);
        attachModel(procedural, false);
      }
    );

    // 8. Animation & Render Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Controls update (handles auto-rotate)
      controls.update();

      // GLB Mixer animations
      if (mixerRef.current && isPlayingAnimation) {
        mixerRef.current.update(delta);
      }

      // Procedural animations if active
      if (modelType === "procedural" && currentModelGroupRef.current) {
        // Slow float wave
        currentModelGroupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.15;
        // Slow rotation of solar panels
        if (proceduralPartsRef.current.solarWings) {
          proceduralPartsRef.current.solarWings.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
        }
        // Pulse ring
        if (proceduralPartsRef.current.thrusterRing) {
          proceduralPartsRef.current.thrusterRing.rotation.z += delta * 0.5;
        }
      }

      // Star particles slow drift
      particles.rotation.y += delta * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      cleanupPreviousModel();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelSource]);

  // Synchronize autoRotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Synchronize wireframe toggle
  useEffect(() => {
    if (currentModelGroupRef.current) {
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.wireframe = wireframe;
          }
        }
      });
    }
  }, [wireframe]);

  // Toggle animation playback
  const toggleAnimation = () => {
    const nextState = !isPlayingAnimation;
    setIsPlayingAnimation(nextState);
    animationActionsRef.current.forEach((action) => {
      action.paused = !nextState;
    });
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4, 3, 7);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".glb") && !file.name.toLowerCase().endsWith(".gltf")) {
      alert("Please upload a .glb or .gltf 3D file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setModelSource(objectUrl);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl border border-border/80 bg-panel/70 backdrop-blur-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Box className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-wide">
                AURORA 3D Telemetry Canvas
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  modelType === "glb"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-primary/20 text-primary border border-primary/30"
                }`}
              >
                {modelType === "glb" ? (
                  <>
                    <CheckCircle2 className="size-3" /> Custom .GLB Active
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" /> Procedural Probe Mode
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              WebGL interactive viewer · Drag to rotate · Pinch / Scroll to zoom
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto-Rotation"
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
              autoRotate
                ? "border-primary/50 bg-primary/20 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCcw className={`size-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
            Orbit
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Hologram / Wireframe Mode"
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
              wireframe
                ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            Hologram
          </button>

          {hasAnimations && (
            <button
              onClick={toggleAnimation}
              title={isPlayingAnimation ? "Pause 3D Animation" : "Play 3D Animation"}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                isPlayingAnimation
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isPlayingAnimation ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              Anim
            </button>
          )}

          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
          >
            <Maximize2 className="size-3.5" />
            Reset
          </button>

          {/* Quick upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Preview local .glb file"
            className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Upload className="size-3.5" />
            Test .GLB
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative min-h-[380px] sm:min-h-[460px] w-full flex-1">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-3 font-display text-xs tracking-wider text-muted-foreground uppercase">
              Initializing 3D Telemetry Environment…
            </p>
          </div>
        )}

        {/* Three.js Canvas Mount */}
        <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

        {/* Floating Sci-fi HUD overlay markers */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-[11px] font-mono text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            RENDERER: WEBGL2_ACES_FILMIC
          </span>
          <span>ORBIT RATIO: 1.2 RPM</span>
        </div>

        {/* Hint Notification if fallback active */}
        {loadError && (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm rounded-xl border border-warning/30 bg-background/90 p-3 text-xs backdrop-blur-md shadow-lg">
            <div className="flex items-start gap-2 text-warning">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice: Default Preview Active</p>
                <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                  To view your custom 3D model, place your file in:
                  <br />
                  <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono">
                    public/models/spacecraft.glb
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
