"use client";

import { ArrowLeft, Camera, Hand, Images, Music, Pause, Sparkles, TreePine, Upload } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";

import type { GestureRecognizer } from "@mediapipe/tasks-vision";
import type { InteractiveMemory } from "@/lib/data";
import { cn } from "@/lib/utils";

type TreeMode = "TREE" | "SCATTER" | "FOCUS";

type ParticleDatum = {
  current: THREE.Vector3;
  tree: THREE.Vector3;
  scatter: THREE.Vector3;
  focus: THREE.Vector3;
  color: THREE.Color;
  scale: number;
};

type PhotoObject = {
  group: THREE.Group;
  tree: THREE.Vector3;
  scatter: THREE.Vector3;
  focus: THREE.Vector3;
  spin: number;
};

type LightDatum = {
  position: THREE.Vector3;
  scale: number;
  pulse: number;
};

type SnowDatum = {
  position: THREE.Vector3;
  speed: number;
  drift: number;
  phase: number;
};

const MODE_LABELS: Record<TreeMode, string> = {
  TREE: "聚合成树",
  SCATTER: "散开照片",
  FOCUS: "聚焦回忆",
};

const DESKTOP_MAGIC_DUST_COUNT = 900;
const MOBILE_MAGIC_DUST_COUNT = 520;
const DESKTOP_NEEDLE_COUNT = 1350;
const MOBILE_NEEDLE_COUNT = 760;
const DESKTOP_SNOW_COUNT = 260;
const MOBILE_SNOW_COUNT = 140;
const MODEL_URL = "/vendor/mediapipe/gesture_recognizer.task";
const WASM_URL = "/vendor/mediapipe/wasm";

// Migration inspiration: https://github.com/xuzijan/gemini3-gesture-interactive-Christmas-tree
function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function treeRadiusAt(y: number) {
  const treeBottom = -4.25;
  const treeTop = 4.55;
  const normalized = THREE.MathUtils.clamp((y - treeBottom) / (treeTop - treeBottom), 0, 1);
  return (1 - normalized) * 3.65 + 0.2;
}

export function InteractiveChristmasTree({
  memories,
  musicSrc,
}: {
  memories: InteractiveMemory[];
  musicSrc: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const modeRef = useRef<TreeMode>("TREE");
  const gestureEnabledRef = useRef(false);
  const objectUrlsRef = useRef<string[]>([]);
  const addPhotoRef = useRef<(source: string, label?: string) => void>(() => undefined);
  const applyModeRef = useRef<(nextMode: TreeMode, source?: string) => void>(() => undefined);

  const [mode, setMode] = useState<TreeMode>("TREE");
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [isGestureLoading, setIsGestureLoading] = useState(false);
  const [photoCount, setPhotoCount] = useState(memories.length);
  const [status, setStatus] = useState("按钮可用，点击后再请求摄像头权限。");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  function playMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0;
    audio
      .play()
      .then(() => {
        setIsMusicPlaying(true);
        gsap.to(audio, { duration: 1.2, volume: 0.42 });
      })
      .catch(() => {
        setIsMusicPlaying(false);
        setStatus("音乐未能播放，但互动树可以继续使用。");
      });
  }

  function pauseMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    gsap.to(audio, {
      duration: 0.45,
      volume: 0,
      onComplete: () => {
        audio.pause();
        setIsMusicPlaying(false);
      },
    });
  }

  function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      pauseMusic();
      return;
    }

    playMusic();
  }

  function applyMode(nextMode: TreeMode, source = "button") {
    modeRef.current = nextMode;
    startTransition(() => setMode(nextMode));
    setStatus(source === "gesture" ? `手势识别：${MODE_LABELS[nextMode]}` : `已切换：${MODE_LABELS[nextMode]}`);
    playMusic();
  }

  useEffect(() => {
    applyModeRef.current = applyMode;
  });

  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args: Parameters<typeof console.error>) => {
      const message = args.map((arg) => (typeof arg === "string" ? arg : "")).join(" ");

      if (message.includes("Created TensorFlow Lite XNNPACK delegate for CPU")) {
        return;
      }

      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    gestureEnabledRef.current = false;
    setIsGestureEnabled(false);
  }

  async function enableGestures() {
    if (gestureEnabledRef.current || isGestureLoading) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("当前浏览器不支持摄像头手势，按钮控制仍可使用。");
      return;
    }

    setCameraError(null);
    setIsGestureLoading(true);
    setStatus("正在加载手势模型和摄像头...");

    try {
      if (!recognizerRef.current) {
        const { FilesetResolver, GestureRecognizer } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            delegate: "CPU",
            modelAssetPath: MODEL_URL,
          },
          numHands: 1,
          runningMode: "VIDEO",
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          height: { ideal: 540 },
          width: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      gestureEnabledRef.current = true;
      setIsGestureEnabled(true);
      setStatus("手势已开启：握拳成树，张掌散开，V 手势聚焦。");
      playMusic();
    } catch (error) {
      stopCamera();
      setCameraError(
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : "摄像头或手势模型初始化失败。",
      );
      setStatus("手势未开启，按钮控制仍可使用。");
    } finally {
      setIsGestureLoading(false);
    }
  }

  function toggleGestures() {
    if (isGestureEnabled) {
      stopCamera();
      setStatus("手势已关闭，摄像头已释放。");
      return;
    }

    void enableGestures();
  }

  function handleUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .forEach((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        addPhotoRef.current(url, file.name.replace(/\.[^.]+$/, ""));
      });

    setPhotoCount((count) => count + files.length);
    applyMode("TREE");
  }

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const host = container;
    const isCompact = window.matchMedia("(max-width: 768px)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#03110d", 0.028);

    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 120);
    camera.position.set(0, 2.2, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.35 : 1.65));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(host.clientWidth, host.clientHeight),
        0.34,
        0.28,
        0.78,
      ),
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxDistance = 24;
    controls.minDistance = 7;
    controls.target.set(0, 0.4, 0);

    const ambient = new THREE.AmbientLight(0xd7ead2, 0.92);
    const key = new THREE.PointLight(0xffd37c, 2.35, 34);
    const cool = new THREE.PointLight(0x8de7ff, 1.45, 30);
    const warmFill = new THREE.PointLight(0xffb15f, 2.25, 28);
    key.position.set(4, 5, 7);
    cool.position.set(-5, 1, -6);
    warmFill.position.set(-3, -2, 5);
    scene.add(ambient, key, cool, warmFill);

    const dummy = new THREE.Object3D();
    const treeGroup = new THREE.Group();
    const treeFadableMaterials: THREE.Material[] = [];
    scene.add(treeGroup);

    function registerFadable(material: THREE.Material) {
      material.transparent = true;
      treeFadableMaterials.push(material);
      return material;
    }

    function createRealisticTree() {
      const up = new THREE.Vector3(0, 1, 0);
      const trunkMaterial = registerFadable(
        new THREE.MeshStandardMaterial({
          color: "#5c371c",
          metalness: 0.02,
          roughness: 0.82,
          emissive: "#1c0f07",
          emissiveIntensity: 0.08,
        }),
      );
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.5, 8.5, 14), trunkMaterial);
      trunk.position.set(0, -0.55, 0);
      treeGroup.add(trunk);

      const branchMatrices: THREE.Matrix4[] = [];
      const branchColors: THREE.Color[] = [];
      const layerCount = isCompact ? 21 : 30;

      for (let layer = 0; layer < layerCount; layer += 1) {
        const progress = layer / Math.max(layerCount - 1, 1);
        const y = -4.15 + progress * 8.25;
        const radius = treeRadiusAt(y);
        const branchesInLayer = Math.max(5, Math.floor(radius * (isCompact ? 4.4 : 6.1)));

        for (let branch = 0; branch < branchesInLayer; branch += 1) {
          const seed = layer * 97 + branch * 17;
          const angle = (branch / branchesInLayer) * Math.PI * 2 + progress * 1.9 + seededNoise(seed + 1) * 0.28;
          const length = radius * (0.74 + seededNoise(seed + 2) * 0.28);
          const droop = -0.34 - (1 - progress) * 0.22;
          const direction = new THREE.Vector3(Math.cos(angle), droop, Math.sin(angle)).normalize();
          const start = new THREE.Vector3(Math.cos(angle) * radius * 0.18, y, Math.sin(angle) * radius * 0.18);
          const position = start.clone().add(direction.clone().multiplyScalar(length * 0.54));
          const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
          const thickness = 0.82 + (1 - progress) * 1.55;
          const scale = new THREE.Vector3(thickness, length, thickness);
          const matrix = new THREE.Matrix4().compose(position, quaternion, scale);

          branchMatrices.push(matrix);
          branchColors.push(new THREE.Color().setHSL(0.28 + seededNoise(seed + 3) * 0.05, 0.5, 0.2 + seededNoise(seed + 4) * 0.12));
        }
      }

      const branchMaterial = registerFadable(
        new THREE.MeshStandardMaterial({
          color: "#15331f",
          emissive: "#102516",
          emissiveIntensity: 0.16,
          metalness: 0.02,
          roughness: 0.78,
          vertexColors: true,
        }),
      );
      const branchMesh = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.018, 0.075, 1, 6),
        branchMaterial,
        branchMatrices.length,
      );
      branchMatrices.forEach((matrix, index) => {
        branchMesh.setMatrixAt(index, matrix);
        branchMesh.setColorAt(index, branchColors[index]);
      });
      branchMesh.instanceMatrix.needsUpdate = true;
      treeGroup.add(branchMesh);

      const needleCount = isCompact ? MOBILE_NEEDLE_COUNT : DESKTOP_NEEDLE_COUNT;
      const needleMaterial = registerFadable(
        new THREE.MeshStandardMaterial({
          color: "#23492e",
          emissive: "#173b23",
          emissiveIntensity: 0.2,
          metalness: 0.04,
          roughness: 0.68,
          vertexColors: true,
        }),
      );
      const needleMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.075, 0.46, 5), needleMaterial, needleCount);

      for (let index = 0; index < needleCount; index += 1) {
        const y = -4.0 + seededNoise(index + 201) * 8.05;
        const radius = treeRadiusAt(y) * (0.3 + seededNoise(index + 202) * 0.72);
        const angle = index * 2.399 + seededNoise(index + 203) * 0.45;
        const direction = new THREE.Vector3(Math.cos(angle), -0.36 - seededNoise(index + 204) * 0.22, Math.sin(angle)).normalize();
        const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        const scale = 0.72 + seededNoise(index + 205) * 1.45;

        dummy.position.copy(position);
        dummy.quaternion.copy(quaternion);
        dummy.scale.set(scale * 0.75, scale, scale * 0.75);
        dummy.updateMatrix();
        needleMesh.setMatrixAt(index, dummy.matrix);
        needleMesh.setColorAt(
          index,
          new THREE.Color().setHSL(0.31 + seededNoise(index + 206) * 0.08, 0.54, 0.24 + seededNoise(index + 207) * 0.16),
        );
      }

      needleMesh.instanceMatrix.needsUpdate = true;
      treeGroup.add(needleMesh);

      const groundMaterial = registerFadable(
        new THREE.MeshBasicMaterial({
          color: "#06120e",
          opacity: 0.72,
          transparent: true,
        }),
      );
      const ground = new THREE.Mesh(new THREE.CircleGeometry(6.2, 72), groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -4.58;
      treeGroup.add(ground);
    }

    function createLightGarland() {
      const lightCount = isCompact ? 76 : 118;
      const lightGeometry = new THREE.SphereGeometry(0.065, 10, 8);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: "#ffe4a5",
        emissive: "#ffc15a",
        emissiveIntensity: 1.55,
        metalness: 0,
        roughness: 0.2,
        vertexColors: true,
      });
      const lightMesh = new THREE.InstancedMesh(lightGeometry, lightMaterial, lightCount);
      const lightData: LightDatum[] = [];

      for (let index = 0; index < lightCount; index += 1) {
        const progress = index / Math.max(lightCount - 1, 1);
        const y = 4.18 - progress * 7.65;
        const angle = progress * Math.PI * 12.6;
        const radius = treeRadiusAt(y) * (0.78 + Math.sin(progress * Math.PI * 7) * 0.05);
        const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        const scale = 0.72 + seededNoise(index + 301) * 0.9;

        lightData.push({ position, pulse: seededNoise(index + 302) * Math.PI * 2, scale });
        dummy.position.copy(position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        lightMesh.setMatrixAt(index, dummy.matrix);
        lightMesh.setColorAt(index, new THREE.Color().setHSL(0.1 + seededNoise(index + 303) * 0.04, 0.9, 0.68));
      }

      lightMesh.instanceMatrix.needsUpdate = true;
      treeGroup.add(lightMesh);
      return { lightData, lightMesh };
    }

    function createSnowField() {
      const snowCount = isCompact ? MOBILE_SNOW_COUNT : DESKTOP_SNOW_COUNT;
      const snowGeometry = new THREE.SphereGeometry(0.025, 6, 4);
      const snowMaterial = new THREE.MeshBasicMaterial({
        color: "#f8fff7",
        opacity: 0.68,
        transparent: true,
      });
      const snowMesh = new THREE.InstancedMesh(snowGeometry, snowMaterial, snowCount);
      const snowData: SnowDatum[] = [];

      for (let index = 0; index < snowCount; index += 1) {
        const position = new THREE.Vector3(
          (seededNoise(index + 401) - 0.5) * 18,
          -4.2 + seededNoise(index + 402) * 11,
          (seededNoise(index + 403) - 0.5) * 14,
        );
        snowData.push({
          drift: 0.12 + seededNoise(index + 404) * 0.3,
          phase: seededNoise(index + 405) * Math.PI * 2,
          position,
          speed: 0.006 + seededNoise(index + 406) * 0.012,
        });
        dummy.position.copy(position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(0.72 + seededNoise(index + 407) * 1.6);
        dummy.updateMatrix();
        snowMesh.setMatrixAt(index, dummy.matrix);
      }

      snowMesh.instanceMatrix.needsUpdate = true;
      scene.add(snowMesh);
      return { snowData, snowMesh };
    }

    function createMagicDust() {
      const dustCount = isCompact ? MOBILE_MAGIC_DUST_COUNT : DESKTOP_MAGIC_DUST_COUNT;
      const particles: ParticleDatum[] = [];
      const sparkleGeometry = new THREE.IcosahedronGeometry(0.043, 1);
      const sparkleMaterial = new THREE.MeshStandardMaterial({
        emissive: "#f0b85f",
        emissiveIntensity: 0.72,
        metalness: 0.05,
        opacity: 0.88,
        roughness: 0.35,
        transparent: true,
        vertexColors: true,
      });
      const sparkleMesh = new THREE.InstancedMesh(sparkleGeometry, sparkleMaterial, dustCount);

      for (let index = 0; index < dustCount; index += 1) {
        const y = -4.25 + seededNoise(index + 501) * 8.85;
        const radius = treeRadiusAt(y) * (0.48 + seededNoise(index + 502) * 0.58);
        const angle = index * 0.34 + seededNoise(index + 503) * 0.8;
        const tree = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        const scatter = new THREE.Vector3(
          (seededNoise(index + 504) - 0.5) * 21,
          (seededNoise(index + 505) - 0.5) * 13,
          (seededNoise(index + 506) - 0.5) * 17,
        );
        const focus = new THREE.Vector3(
          Math.sin(index * 0.09) * 1.9,
          (seededNoise(index + 507) - 0.5) * 4.2,
          Math.cos(index * 0.11) * 1.9,
        );
        const color = new THREE.Color().setHSL(
          seededNoise(index + 508) > 0.55 ? 0.12 : 0.33,
          0.62,
          0.48 + seededNoise(index + 509) * 0.24,
        );
        const scale = 0.55 + seededNoise(index + 510) * 1.45;

        particles.push({ color, current: tree.clone(), focus, scale, scatter, tree });
        sparkleMesh.setColorAt(index, color);
      }

      sparkleMesh.instanceMatrix.needsUpdate = true;
      scene.add(sparkleMesh);
      return { particles, sparkleMesh };
    }

    createRealisticTree();
    const { lightData, lightMesh } = createLightGarland();
    const { snowData, snowMesh } = createSnowField();
    const { particles, sparkleMesh } = createMagicDust();

    const starGroup = new THREE.Group();
    const star = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.68, 0),
      new THREE.MeshStandardMaterial({
        color: "#fff1a6",
        emissive: "#ffd166",
        emissiveIntensity: 1.45,
        metalness: 0.2,
        roughness: 0.25,
      }),
    );
    starGroup.position.set(0, 5.05, 0);
    starGroup.add(star);
    scene.add(starGroup);

    const photoObjects: PhotoObject[] = [];
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    function assignPhotoTargets() {
      const total = Math.max(photoObjects.length, 1);

      photoObjects.forEach((photo, index) => {
        const turn = (index / total) * Math.PI * 4.2 + index * 0.38;
        const layer = index % 8;
        const y = 3.55 - layer * 0.92;
        const treeRadius = treeRadiusAt(y) * (1.06 + (layer % 2) * 0.08);
        photo.tree.set(Math.cos(turn) * treeRadius, y, Math.sin(turn) * treeRadius);

        const scatterAngle = (index / total) * Math.PI * 2;
        photo.scatter.set(
          Math.cos(scatterAngle) * (7.5 + (index % 4)),
          ((index % 5) - 2) * 1.8,
          Math.sin(scatterAngle) * (6.5 + (index % 3)),
        );

        const galleryOffset = index - (total - 1) / 2;
        photo.focus.set(galleryOffset * 1.45, (index % 2) * -0.55 + 0.7, -1.75 - Math.abs(galleryOffset) * 0.08);
      });
    }

    function createPhoto(source: string, label?: string) {
      textureLoader.load(
        source,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

          const image = texture.image as HTMLImageElement | ImageBitmap;
          const imageWidth = "width" in image ? image.width : 1;
          const imageHeight = "height" in image ? image.height : 1;
          const aspect = Math.max(0.65, Math.min(1.55, imageWidth / Math.max(imageHeight, 1)));
          const frame = new THREE.Group();
          const geometry = new THREE.PlaneGeometry(1.22 * aspect, 1.22);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            color: "#f4eddf",
            opacity: 0.96,
            transparent: true,
            toneMapped: true,
          });
          const photoMesh = new THREE.Mesh(geometry, material);
          photoMesh.renderOrder = 10;
          frame.add(photoMesh);
          frame.userData.label = label;
          frame.position.set(
            (seededNoise(photoObjects.length + 101) - 0.5) * 6,
            1 + seededNoise(photoObjects.length + 111) * 3,
            (seededNoise(photoObjects.length + 121) - 0.5) * 4,
          );
          frame.scale.setScalar(0.88);

          const photoObject: PhotoObject = {
            focus: new THREE.Vector3(),
            group: frame,
            scatter: new THREE.Vector3(),
            spin: seededNoise(photoObjects.length + 131) * Math.PI * 2,
            tree: new THREE.Vector3(),
          };

          photoObjects.push(photoObject);
          assignPhotoTargets();
          scene.add(frame);
        },
        undefined,
        () => {
          setStatus("有一张照片加载失败，互动树已跳过它。");
        },
      );
    }

    addPhotoRef.current = createPhoto;
    memories.forEach((memory) => createPhoto(memory.photoUrl, memory.title));

    const clock = new THREE.Clock();
    let lastGestureAt = 0;
    let hasReportedRecognitionError = false;

    function predictGesture(now: number) {
      const recognizer = recognizerRef.current;
      const video = videoRef.current;

      if (!gestureEnabledRef.current || !recognizer || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      if (now - lastGestureAt < 260) {
        return;
      }

      lastGestureAt = now;
      let result: ReturnType<GestureRecognizer["recognizeForVideo"]>;

      try {
        result = recognizer.recognizeForVideo(video, now);
      } catch (error) {
        if (!hasReportedRecognitionError) {
          hasReportedRecognitionError = true;
          setCameraError(error instanceof Error ? `${error.name}: ${error.message}` : "手势识别运行失败。");
          setStatus("手势识别已暂停，按钮控制仍可使用。");
        }

        stopCamera();
        return;
      }

      const gesture = result.gestures?.[0]?.[0];

      if (!gesture || gesture.score < 0.55) {
        return;
      }

      if (gesture.categoryName === "Closed_Fist") {
        applyModeRef.current("TREE", "gesture");
      } else if (gesture.categoryName === "Open_Palm") {
        applyModeRef.current("SCATTER", "gesture");
      } else if (gesture.categoryName === "Victory" || gesture.categoryName === "Thumb_Up") {
        applyModeRef.current("FOCUS", "gesture");
      }
    }

    function animate(now: number) {
      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;
      const lerpAmount = currentMode === "SCATTER" ? 0.028 : 0.045;

      particles.forEach((particle, index) => {
        const target = currentMode === "TREE" ? particle.tree : currentMode === "SCATTER" ? particle.scatter : particle.focus;
        particle.current.lerp(target, lerpAmount);
        dummy.position.copy(particle.current);
        dummy.scale.setScalar(particle.scale * (1 + Math.sin(elapsed * 2.1 + index) * 0.08));
        dummy.updateMatrix();
        sparkleMesh.setMatrixAt(index, dummy.matrix);
      });

      sparkleMesh.instanceMatrix.needsUpdate = true;
      sparkleMesh.rotation.y += currentMode === "SCATTER" ? 0.0008 : 0.0016;
      treeGroup.rotation.y += currentMode === "SCATTER" ? 0.00045 : 0.0009;
      const treeOpacityTarget = currentMode === "FOCUS" ? 0.48 : 1;
      treeFadableMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, treeOpacityTarget, 0.045);
      });

      lightData.forEach((light, index) => {
        const pulse = light.scale * (0.86 + Math.sin(elapsed * 2.4 + light.pulse) * 0.18);
        dummy.position.copy(light.position);
        dummy.quaternion.identity();
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        lightMesh.setMatrixAt(index, dummy.matrix);
      });
      lightMesh.instanceMatrix.needsUpdate = true;

      snowData.forEach((snow, index) => {
        snow.position.y -= snow.speed;

        if (snow.position.y < -4.7) {
          snow.position.y = 6.2;
        }

        dummy.position.set(
          snow.position.x + Math.sin(elapsed * 0.45 + snow.phase) * snow.drift,
          snow.position.y,
          snow.position.z + Math.cos(elapsed * 0.35 + snow.phase) * snow.drift,
        );
        dummy.quaternion.identity();
        dummy.scale.setScalar(0.72 + seededNoise(index + 407) * 1.6);
        dummy.updateMatrix();
        snowMesh.setMatrixAt(index, dummy.matrix);
      });
      snowMesh.instanceMatrix.needsUpdate = true;
      star.rotation.y += 0.018;
      star.rotation.x = Math.sin(elapsed * 1.3) * 0.18;

      photoObjects.forEach((photo) => {
        const target = currentMode === "TREE" ? photo.tree : currentMode === "SCATTER" ? photo.scatter : photo.focus;
        photo.group.position.lerp(target, currentMode === "FOCUS" ? 0.065 : 0.045);
        photo.group.lookAt(camera.position);
        photo.group.rotation.z += Math.sin(elapsed + photo.spin) * 0.0008;
      });

      controls.update();
      predictGesture(now);
      composer.render();
      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    animationFrameRef.current = window.requestAnimationFrame(animate);

    function handleResize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      stopCamera();
      recognizerRef.current?.close();
      recognizerRef.current = null;
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return;
        }

        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if ("map" in material && material.map instanceof THREE.Texture) {
            material.map.dispose();
          }

          material.dispose();
        });
      });
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
      addPhotoRef.current = () => undefined;
    };
  }, [memories]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#030605] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,221,138,0.22),transparent_34%),radial-gradient(circle_at_15%_75%,rgba(28,123,91,0.28),transparent_34%),linear-gradient(180deg,#07100c_0%,#030605_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div ref={containerRef} className="absolute inset-0" />

      <header className="absolute left-4 right-4 top-4 z-10 flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 backdrop-blur-xl md:left-6 md:right-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/app/tree"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/18"
            aria-label="返回成长树"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f7c96b]">Interactive Tree</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">沉浸式互动圣诞树</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">{MODE_LABELS[mode]}</span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">{photoCount} 张照片</span>
        </div>
      </header>

      <aside className="absolute bottom-4 left-4 right-4 z-10 rounded-[1.75rem] border border-white/10 bg-black/35 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:w-[22rem]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[#f7c96b]/20 p-3 text-[#f7c96b]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">成长记忆互动模式</h2>
            <p className="mt-1 text-sm leading-6 text-white/62">{status}</p>
          </div>
        </div>

        {cameraError ? (
          <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">
            {cameraError}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {(["TREE", "SCATTER", "FOCUS"] as TreeMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => applyMode(item)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-xs font-semibold transition hover:-translate-y-0.5",
                mode === item
                  ? "border-[#f7c96b]/70 bg-[#f7c96b] text-black"
                  : "border-white/10 bg-white/10 text-white hover:bg-white/16",
              )}
            >
              {MODE_LABELS[item]}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={toggleGestures}
            disabled={isGestureLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGestureEnabled ? <Camera className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
            {isGestureEnabled ? "关闭手势" : isGestureLoading ? "加载中..." : "启用手势"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/16"
          >
            <Upload className="h-4 w-4" />
            临时上传
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={toggleMusic}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            {isMusicPlaying ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
            {isMusicPlaying ? "暂停音乐" : "播放音乐"}
          </button>
          <div className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 text-sm text-white/60">
            <Images className="h-4 w-4" />
            刷新不保存临时图
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-white/45">
          手势建议在桌面 Chrome/Edge 使用。第一版只读取已有成长照片和本地临时上传，不会把临时图片写回 Supabase。
        </p>
      </aside>

      <div className="absolute left-4 top-[8.5rem] z-10 hidden max-w-[18rem] rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/58 backdrop-blur-xl md:block">
        <div className="mb-2 inline-flex items-center gap-2 text-white">
          <TreePine className="h-4 w-4 text-[#f7c96b]" />
          <span className="font-semibold">手势映射</span>
        </div>
        <p>握拳：聚合成树。张开手掌：照片散开。V 手势或点赞：聚焦回忆。</p>
      </div>

      {isGestureEnabled ? (
        <video
          ref={videoRef}
          className="absolute bottom-[18rem] right-6 z-10 hidden h-28 w-40 rounded-2xl border border-white/15 bg-black object-cover opacity-80 shadow-2xl md:block"
          muted
          playsInline
        />
      ) : (
        <video ref={videoRef} className="hidden" muted playsInline />
      )}

      {!photoCount ? (
        <div className="pointer-events-none absolute inset-x-6 top-1/2 z-10 mx-auto max-w-sm -translate-y-1/2 rounded-[2rem] border border-white/10 bg-black/35 p-6 text-center backdrop-blur-xl">
          <Images className="mx-auto h-8 w-8 text-[#f7c96b]" />
          <h2 className="mt-3 text-xl font-semibold">还没有可展示的照片</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">可以先在成长树新增带照片的记忆，或在这里临时上传几张图片试玩。</p>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleUpload(event.currentTarget.files)}
      />
      <audio
        ref={audioRef}
        src={musicSrc}
        loop
        preload="auto"
        onPause={() => setIsMusicPlaying(false)}
        onPlay={() => setIsMusicPlaying(true)}
      />
    </div>
  );
}
