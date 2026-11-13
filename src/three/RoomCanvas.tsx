import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCigaretteButtsCluster, buildSadMan } from './buildSadMan';
import { buildRoomObjects } from './buildRoomObjects';

export interface CameraFocusRequest {
  pos: [number, number, number];
  target: [number, number, number];
  nonce: number;
}

interface RoomCanvasProps {
  onSelectObject: (objectId: string) => void;
  focusRequest: CameraFocusRequest | null;
}

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export default function RoomCanvas({ onSelectObject, focusRequest }: RoomCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelectObject);
  onSelectRef.current = onSelectObject;

  const transitionRef = useRef<{
    active: boolean;
    pos: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    pos: [0.05, 1.38, 2.05],
    target: [0, 1.05, -0.35],
  });

  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (!focusRequest) return;
    transitionRef.current = {
      active: true,
      pos: focusRequest.pos,
      target: focusRequest.target,
    };
  }, [focusRequest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b1e24);
    scene.fog = new THREE.FogExp2(0x1b1e24, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 30);
    camera.position.set(0.05, 1.38, 2.05);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, -0.2);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 0.72;
    controls.maxDistance = 2.35;
    controls.minPolarAngle = 0.42;
    controls.maxPolarAngle = Math.PI * 0.515;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.7;
    controls.update();

    const cancelTransition = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', cancelTransition);

    // =========================================================
    // WARM MELANCHOLIC LIGHTING (NO FLICKER, NO HORROR)
    // =========================================================
    const hemiLight = new THREE.HemisphereLight(0x8fa2bd, 0x3b3129, 0.96);
    scene.add(hemiLight);

    // Cool twilight directional key from window
    const windowLight = new THREE.DirectionalLight(0x8fa9cc, 1.2);
    windowLight.position.set(-0.65, 2.1, -2.05);
    windowLight.target.position.set(0, 0.9, -0.2);
    scene.add(windowLight.target);
    windowLight.castShadow = !isSoftwareGl;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    windowLight.shadow.camera.near = 0.3;
    windowLight.shadow.camera.far = 7.5;
    windowLight.shadow.camera.left = -2.4;
    windowLight.shadow.camera.right = 2.4;
    windowLight.shadow.camera.top = 2.4;
    windowLight.shadow.camera.bottom = -2.4;
    windowLight.shadow.bias = -0.0005;
    windowLight.shadow.normalBias = 0.02;
    scene.add(windowLight);

    // Warm steady floor lamp light (NO flicker!)
    const lampLight = new THREE.PointLight(0xf0b26d, 4.4, 7.5, 1.6);
    lampLight.position.set(1.75, 1.56, -1.45);
    lampLight.castShadow = !isSoftwareGl;
    lampLight.shadow.mapSize.width = 1024;
    lampLight.shadow.mapSize.height = 1024;
    lampLight.shadow.bias = -0.002;
    scene.add(lampLight);

    // Gentle front fill so the man's sad face, ojeras, beard & shirt are always legible
    const frontFill = new THREE.DirectionalLight(0xdcc3a6, 0.78);
    frontFill.position.set(0.5, 1.65, 2.1);
    frontFill.target.position.set(0, 1.15, -0.2);
    scene.add(frontFill.target);
    scene.add(frontFill);

    // =========================================================
    // BUILD 3D CHARACTER, CIGARETTE BUTTS & ROOM OBJECTS
    // =========================================================
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const sadMan = buildSadMan(anisotropy);
    sadMan.group.position.set(0, 0, -0.2);
    scene.add(sadMan.group);

    const butts = buildCigaretteButtsCluster(0, -0.2, 34);
    scene.add(butts.group);

    const roomObjects = buildRoomObjects(anisotropy);
    scene.add(roomObjects.group);

    const allClickables: THREE.Object3D[] = [
      ...sadMan.hitProxies,
      butts.hitProxy,
      ...roomObjects.interactables,
    ];

    // Gentle dust motes floating in the warm dim room
    const dustCount = 85;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 4.1;
      dustPositions[i * 3 + 1] = 0.25 + Math.random() * 2.1;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.1;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xe6cda8,
      size: 0.018,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================
    // RAYCASTING (CLICK + THROTTLED HOVER)
    // =========================================================
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverCheck = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 8) return; // Was a drag, not a tap/click

      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(allClickables, false);
      if (hits.length > 0) {
        const objectId = hits[0].object.userData?.objectId as string | undefined;
        if (objectId) {
          onSelectRef.current(objectId);
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;

      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(allClickables, false);
      if (hits.length > 0) {
        const objectId = hits[0].object.userData?.objectId as string | null;
        renderer.domElement.style.cursor = objectId ? 'pointer' : 'grab';
        roomObjects.setHighlight(objectId);
      } else {
        renderer.domElement.style.cursor = 'grab';
        roomObjects.setHighlight(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // =========================================================
    // ANIMATION LOOP (PACED FOR SOFTWARE WEBGL)
    // =========================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      sadMan.update(elapsed, camera);
      roomObjects.update(elapsed);

      // Drift dust motes gently
      dustPoints.rotation.y = elapsed * 0.015;

      // Smooth exponential camera preset transition
      if (transitionRef.current.active) {
        _desiredPos.set(...transitionRef.current.pos);
        _desiredTarget.set(...transitionRef.current.target);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 5.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 5.5, delta);

        if (
          camera.position.distanceTo(_desiredPos) < 0.025 &&
          controls.target.distanceTo(_desiredTarget) < 0.025
        ) {
          transitionRef.current.active = false;
        }
      }

      controls.update();

      // Keep camera comfortably inside the 4.8m x 4.8m walls
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2.05, 2.05);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2.05, 2.05);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.35, 2.35);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', cancelTransition);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      controls.dispose();
      sadMan.dispose();
      butts.dispose();
      roomObjects.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#181b20] p-6 text-center">
        <p className="font-display text-2xl text-[#f3efe6]">
          La vista 3D no pudo iniciarse en este navegador
        </p>
        <p className="mt-3 max-w-md text-base text-[#a3aab5]">
          Puedes explorar los 13 elementos de la habitación directamente usando los botones de la
          parte inferior.
        </p>
      </div>
    );
  }

  return <div ref={mountRef} className="h-full w-full" />;
}
