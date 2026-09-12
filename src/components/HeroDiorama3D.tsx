"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface HeroDiorama3DProps {
  level: number;
  xpProgress: number;
  avatarType?: string;
  gold: number;
}

/**
 * FallbackEye
 * High-fidelity 2.5D Celestial Eye of Karmaraj with mouse-tracking gaze
 * Used when WebGL is unavailable, disabled, or encounters context creation issues.
 */
function FallbackEye() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isDilation, setIsDilation] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    const maxOffset = 36;
    setPupilPos({
      x: Math.max(-maxOffset, Math.min(maxOffset, deltaX * maxOffset)),
      y: Math.max(-maxOffset, Math.min(maxOffset, deltaY * maxOffset)),
    });
  };

  const handleClick = () => {
    soundFx.play("spell");
    spawnCombatText("DIVINE GAZE RESONANCE!", "crit");
    setIsDilation(true);
    setTimeout(() => setIsDilation(false), 400);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-pointer select-none group overflow-hidden"
      title="The All-Seeing Anatomical Eye of Karmaraj. Move your mouse to guide its gaze!"
    >
      {/* Outer Radial Rune Halo */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent opacity-75 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />

      {/* Rotating Celestial Rings */}
      <div className="absolute w-56 h-56 rounded-full border border-dashed border-amber-500/30 animate-[spin_24s_linear_infinite] pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full border border-amber-400/20 animate-[spin_36s_linear_infinite_reverse] pointer-events-none" />

      {/* Sclera - Organic Anatomical Eyeball */}
      <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#fffef9] via-[#fef4e2] to-[#fed7aa] shadow-[inset_0_0_24px_rgba(217,119,6,0.35),0_10px_35px_rgba(0,0,0,0.6)] border-2 border-amber-300/40 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
        {/* Subtle Organic Vein Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
          <path d="M 5,50 Q 25,48 40,52" stroke="#dc2626" strokeWidth="0.75" fill="none" opacity="0.6" />
          <path d="M 95,50 Q 75,52 60,48" stroke="#dc2626" strokeWidth="0.75" fill="none" opacity="0.6" />
          <path d="M 50,5 Q 48,25 52,40" stroke="#ea580c" strokeWidth="0.7" fill="none" opacity="0.5" />
          <path d="M 50,95 Q 52,75 48,60" stroke="#ea580c" strokeWidth="0.7" fill="none" opacity="0.5" />
          <path d="M 12,20 Q 30,35 45,45" stroke="#ef4444" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M 88,80 Q 70,65 55,55" stroke="#ef4444" strokeWidth="0.5" fill="none" opacity="0.4" />
        </svg>

        {/* Iris & Pupil Tracking Group */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center transition-transform ease-out duration-75 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          style={{
            transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0) scale(${isDilation ? 1.15 : 1})`,
          }}
        >
          {/* Golden Fibrous Iris */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 shadow-inner border border-amber-200" />
          <div className="absolute inset-1 rounded-full bg-[radial-gradient(circle,#fef08a_0%,#d97706_60%,#78350f_100%)] opacity-90" />

          {/* Deep Obsidian Pupil */}
          <div className={`relative ${isDilation ? "w-12 h-12" : "w-9 h-9"} rounded-full bg-stone-950 shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] transition-all duration-300 flex items-center justify-center`}>
            {/* Core Specular Glint */}
            <div className="absolute top-1.5 left-2 w-2.5 h-2.5 rounded-full bg-white/95 blur-[0.4px]" />
            <div className="absolute bottom-2 right-2.5 w-1 h-1 rounded-full bg-amber-200/80" />
          </div>

          {/* Glowing Arc Runes around Iris */}
          <div className="absolute -inset-2 rounded-full border border-amber-400/40 animate-pulse pointer-events-none" />
        </div>

        {/* Cornea Gloss Dome */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest uppercase text-amber-300/80 pointer-events-none bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-md shadow-sm">
        Anatomical Eye • Reactive Gaze Active
      </div>
    </div>
  );
}

/**
 * SphericalCatmullRomCurve
 * Ensures all sampled points along the curve hug the sphere of radius R.
 */
class SphericalCatmullRomCurve extends THREE.Curve<THREE.Vector3> {
  private baseCurve: THREE.CatmullRomCurve3;
  private radius: number;

  constructor(controlPoints: THREE.Vector3[], radius: number) {
    super();
    this.baseCurve = new THREE.CatmullRomCurve3(controlPoints);
    this.radius = radius;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    this.baseCurve.getPoint(t, optionalTarget);
    optionalTarget.normalize().multiplyScalar(this.radius);
    return optionalTarget;
  }
}

export default function HeroDiorama3D({
  level,
}: HeroDiorama3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const [webGlFailed, setWebGlFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (typeof window === "undefined") return;

    const width = mount.clientWidth || 340;
    const height = mount.clientHeight || 300;

    let renderer: THREE.WebGLRenderer;
    try {
      const testCanvas = document.createElement("canvas");
      const hasGl = Boolean(testCanvas.getContext("webgl2") || testCanvas.getContext("webgl"));
      if (!hasGl) {
        setWebGlFailed(true);
        return;
      }

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.warn("WebGL initialization failed, falling back to 2.5D eye:", err);
      setWebGlFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // ==========================================
    // 1. Studio Lighting Setup
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 1.35);
    scene.add(ambientLight);

    // Primary High-Key Directional Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(-3.5, 4.5, 5);
    scene.add(keyLight);

    // Secondary Warm Soft Fill Light
    const secondaryKeyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    secondaryKeyLight.position.set(4, 3, 4);
    scene.add(secondaryKeyLight);

    // Crisp Specular Rim Light
    const rimLight = new THREE.PointLight(0xffffff, 4.0, 16);
    rimLight.position.set(-3.5, 3.2, -2.5);
    scene.add(rimLight);

    // Bottom Warm Bounce Light
    const bounceLight = new THREE.PointLight(0xfef08a, 1.8, 12);
    bounceLight.position.set(1.2, -3.8, 2.5);
    scene.add(bounceLight);

    // Master Eye Root Group
    const eyeRootGroup = new THREE.Group();
    scene.add(eyeRootGroup);

    // Eyeball group that rotates and follows mouse cursor
    const eyeballGroup = new THREE.Group();
    eyeRootGroup.add(eyeballGroup);

    // ==========================================
    // 2. Procedural Canvas Textures
    // ==========================================

    // SCLERA TEXTURE: Warm ivory with sub-surface organic capillaries
    const createScleraTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      // Base ivory/cream radial gradient
      const baseGrad = ctx.createRadialGradient(512, 256, 90, 512, 256, 512);
      baseGrad.addColorStop(0, "#fffef9");
      baseGrad.addColorStop(0.35, "#fef8ee");
      baseGrad.addColorStop(0.65, "#fef0d6");
      baseGrad.addColorStop(0.85, "#fed7aa");
      baseGrad.addColorStop(1, "#fbb473");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Warm organic fleshy wash
      const washGrad = ctx.createLinearGradient(0, 0, 1024, 512);
      washGrad.addColorStop(0, "rgba(251, 191, 36, 0.15)");
      washGrad.addColorStop(0.5, "rgba(244, 63, 94, 0.12)");
      washGrad.addColorStop(1, "rgba(217, 119, 6, 0.18)");
      ctx.fillStyle = washGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Recursive Sub-surface Capillary Branches
      const drawCapillary = (
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        width: number,
        depth: number
      ) => {
        if (depth <= 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 26;
        const midY = (startY + targetY) / 2 + (Math.random() - 0.5) * 22;
        ctx.quadraticCurveTo(midX, midY, targetX, targetY);

        const alpha = 0.2 + depth * 0.15;
        const redHue = depth > 2 ? "rgba(185, 28, 28, " : "rgba(234, 88, 12, ";
        ctx.strokeStyle = `${redHue}${alpha})`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();

        if (depth > 1) {
          const branches = Math.random() > 0.45 ? 2 : 1;
          for (let b = 0; b < branches; b++) {
            const angle =
              Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 0.95;
            const branchLen = 22 + Math.random() * 38;
            const endX = targetX + Math.cos(angle) * branchLen;
            const endY = targetY + Math.sin(angle) * branchLen;
            drawCapillary(targetX, targetY, endX, endY, width * 0.68, depth - 1);
          }
        }
      };

      const roots = [
        { x: 120, y: 150, angle: 0.18 },
        { x: 100, y: 260, angle: 0.02 },
        { x: 130, y: 380, angle: -0.2 },
        { x: 910, y: 140, angle: 2.95 },
        { x: 930, y: 260, angle: 3.14 },
        { x: 900, y: 380, angle: -2.95 },
        { x: 440, y: 50, angle: 1.45 },
        { x: 590, y: 50, angle: 1.68 },
        { x: 430, y: 460, angle: -1.45 },
        { x: 600, y: 460, angle: -1.68 },
      ];

      roots.forEach((root) => {
        const len = 80 + Math.random() * 70;
        const targetX = root.x + Math.cos(root.angle) * len;
        const targetY = root.y + Math.sin(root.angle) * len;
        drawCapillary(root.x, root.y, targetX, targetY, 2.2, 4);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // IRIS TEXTURE: Golden Sunburst with 54-tooth Starburst Collarette & Curved Studio Softbox Window Reflection
    const createIrisTexture = (pupilRatio: number = 0.32) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;
      const center = 512;
      const radius = 480;

      // Dark Limbal Outer Border
      const limbalGrad = ctx.createRadialGradient(center, center, radius * 0.82, center, center, radius);
      limbalGrad.addColorStop(0, "#b45309");
      limbalGrad.addColorStop(0.6, "#78350f");
      limbalGrad.addColorStop(0.9, "#291507");
      limbalGrad.addColorStop(1, "#0c0a09");
      ctx.fillStyle = limbalGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      // Golden Stroma Base
      const stromaGrad = ctx.createRadialGradient(center, center, radius * 0.3, center, center, radius * 0.88);
      stromaGrad.addColorStop(0, "#fef08a");
      stromaGrad.addColorStop(0.25, "#f59e0b");
      stromaGrad.addColorStop(0.6, "#d97706");
      stromaGrad.addColorStop(0.85, "#92400e");
      stromaGrad.addColorStop(1, "#451a03");
      ctx.fillStyle = stromaGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // 480 Layered Radial Fibers & Furrows
      ctx.save();
      ctx.translate(center, center);
      for (let i = 0; i < 480; i++) {
        ctx.rotate((Math.PI * 2) / 480);
        ctx.beginPath();
        const startR = radius * (pupilRatio + 0.02);
        const endR = radius * (0.92 + Math.random() * 0.06);
        ctx.moveTo(startR, 0);

        const wave = (Math.random() - 0.5) * 4.5;
        ctx.quadraticCurveTo(radius * 0.55, wave, endR, 0);

        const hue =
          i % 4 === 0
            ? "rgba(254, 240, 138, 0.75)"
            : i % 4 === 1
            ? "rgba(251, 191, 36, 0.65)"
            : i % 4 === 2
            ? "rgba(217, 119, 6, 0.45)"
            : "rgba(120, 53, 15, 0.5)";
        ctx.strokeStyle = hue;
        ctx.lineWidth = 1.0 + Math.random() * 1.8;
        ctx.stroke();
      }
      ctx.restore();

      // Undulating Golden Starburst Collarette (Exact match to reference image teeth)
      ctx.save();
      ctx.translate(center, center);
      const starTeeth = 54;
      ctx.beginPath();
      for (let s = 0; s < starTeeth; s++) {
        const a1 = (s / starTeeth) * Math.PI * 2;
        const a2 = ((s + 0.5) / starTeeth) * Math.PI * 2;
        const rInner = radius * (pupilRatio + 0.08);
        const rOuter = radius * (0.58 + (s % 2 === 0 ? 0.08 : -0.04));

        const x1 = Math.cos(a1) * rInner;
        const y1 = Math.sin(a1) * rInner;
        const x2 = Math.cos(a2) * rOuter;
        const y2 = Math.sin(a2) * rOuter;

        if (s === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(254, 240, 138, 0.6)";
      ctx.fill();
      ctx.strokeStyle = "rgba(253, 230, 138, 0.95)";
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.restore();

      // Deep Jet-Black Pupil
      const pupilRadius = radius * pupilRatio;
      const pupilGrad = ctx.createRadialGradient(
        center,
        center,
        pupilRadius * 0.6,
        center,
        center,
        pupilRadius
      );
      pupilGrad.addColorStop(0, "#000000");
      pupilGrad.addColorStop(0.85, "#040407");
      pupilGrad.addColorStop(1, "#18181b");
      ctx.fillStyle = pupilGrad;
      ctx.beginPath();
      ctx.arc(center, center, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Warm Pupil Ambient Bounce Light (Bottom reflection)
      const bounceGrad = ctx.createRadialGradient(
        center + pupilRadius * 0.35,
        center + pupilRadius * 0.45,
        10,
        center + pupilRadius * 0.35,
        center + pupilRadius * 0.45,
        pupilRadius * 0.7
      );
      bounceGrad.addColorStop(0, "rgba(217, 119, 6, 0.35)");
      bounceGrad.addColorStop(0.7, "rgba(180, 83, 9, 0.1)");
      bounceGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bounceGrad;
      ctx.beginPath();
      ctx.arc(center, center, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // CURVED STUDIO SOFTBOX GRID WINDOW REFLECTION
      ctx.save();
      const winX = center - pupilRadius * 0.72;
      const winY = center - pupilRadius * 0.68;
      const winW = pupilRadius * 0.78;
      const winH = pupilRadius * 0.65;

      ctx.translate(winX + winW / 2, winY + winH / 2);
      ctx.rotate(-0.35);

      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.roundRect(-winW / 2 - 8, -winH / 2 - 8, winW + 16, winH + 16, 12);
      ctx.fill();

      // 4-Pane Softbox Grid
      const paneW = winW * 0.44;
      const paneH = winH * 0.42;
      const gap = 3.5;

      const drawPane = (px: number, py: number) => {
        const paneGrad = ctx.createLinearGradient(px, py, px + paneW, py + paneH);
        paneGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
        paneGrad.addColorStop(0.6, "rgba(240, 245, 255, 0.9)");
        paneGrad.addColorStop(1, "rgba(220, 235, 255, 0.75)");
        ctx.fillStyle = paneGrad;
        ctx.beginPath();
        ctx.roundRect(px, py, paneW, paneH, 4);
        ctx.fill();
      };

      drawPane(-winW / 2, -winH / 2);
      drawPane(-winW / 2 + paneW + gap, -winH / 2);
      drawPane(-winW / 2, -winH / 2 + paneH + gap);
      drawPane(-winW / 2 + paneW + gap, -winH / 2 + paneH + gap);

      ctx.restore();

      return new THREE.CanvasTexture(canvas);
    };

    // ==========================================
    // 3. Eyeball Meshes Construction
    // ==========================================

    // A. Anatomical Sclera Sphere
    const scleraRadius = 1.48;
    const scleraGeo = new THREE.SphereGeometry(scleraRadius, 64, 64);
    const scleraMat = new THREE.MeshStandardMaterial({
      map: createScleraTexture(),
      roughness: 0.18,
      metalness: 0.04,
    });
    const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
    scleraMesh.rotation.y = Math.PI / 2;
    eyeballGroup.add(scleraMesh);

    // B. Detailed Golden Sunburst Iris Disc (Faces anterior pole +Z, prominently visible!)
    const irisGeo = new THREE.CircleGeometry(0.74, 64);
    const irisTexture = createIrisTexture(0.32);
    const irisMat = new THREE.MeshStandardMaterial({
      map: irisTexture,
      roughness: 0.22,
      metalness: 0.06,
      side: THREE.DoubleSide,
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    irisMesh.position.z = 1.485;
    eyeballGroup.add(irisMesh);

    // C. Anatomical Beveled Aperture Collar (The White Bezel Ring framing the iris)
    const collarGeo = new THREE.TorusGeometry(0.74, 0.055, 24, 64);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xfcfbf9,
      roughness: 0.28,
      metalness: 0.08,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.z = 1.488;
    eyeballGroup.add(collarMesh);

    // D. Glossy Convex Crystal Cornea Dome (Bulges forward with wet optical tear-film)
    const corneaGeo = new THREE.SphereGeometry(0.85, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.38);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.015,
      ior: 1.376,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
      depthWrite: false, // Ensures iris disc beneath is always rendered crisp and clear
    });
    const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
    corneaMesh.position.z = 1.05;
    eyeballGroup.add(corneaMesh);

    // ==========================================
    // 4. Real 3D Raised Tubular Surface Arteries
    // ==========================================
    const vesselGroup = new THREE.Group();
    eyeballGroup.add(vesselGroup);

    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.24,
      metalness: 0.12,
    });

    const vesselCurvesData = [
      // 1. Primary Lateral Arterial Trunk (Right side branching forward toward collar)
      {
        points: [
          new THREE.Vector3(1.25, -0.35, 0.35),
          new THREE.Vector3(1.15, -0.05, 0.68),
          new THREE.Vector3(1.05, 0.18, 0.88),
          new THREE.Vector3(0.82, 0.42, 1.08),
          new THREE.Vector3(0.55, 0.62, 1.22),
          new THREE.Vector3(0.32, 0.66, 1.32),
        ],
        radius: 0.034,
      },
      // 2. Lateral Trunk Lower Bifurcation
      {
        points: [
          new THREE.Vector3(1.05, 0.18, 0.88),
          new THREE.Vector3(0.92, -0.15, 1.02),
          new THREE.Vector3(0.75, -0.38, 1.15),
          new THREE.Vector3(0.48, -0.56, 1.28),
        ],
        radius: 0.026,
      },
      // 3. Lateral Trunk Upper Twig
      {
        points: [
          new THREE.Vector3(1.15, -0.05, 0.68),
          new THREE.Vector3(1.18, 0.28, 0.72),
          new THREE.Vector3(1.02, 0.52, 0.85),
          new THREE.Vector3(0.78, 0.68, 1.05),
        ],
        radius: 0.018,
      },
      // 4. Superior Vessel (Top pole creeping down over collar rim)
      {
        points: [
          new THREE.Vector3(-0.35, 1.32, 0.35),
          new THREE.Vector3(-0.18, 1.15, 0.72),
          new THREE.Vector3(-0.05, 0.95, 1.02),
          new THREE.Vector3(0.08, 0.72, 1.3),
        ],
        radius: 0.024,
      },
      // 5. Inferior Vessel (Bottom pole winding upward toward lower collar rim)
      {
        points: [
          new THREE.Vector3(-0.25, -1.35, 0.35),
          new THREE.Vector3(-0.08, -1.12, 0.75),
          new THREE.Vector3(0.12, -0.88, 1.05),
          new THREE.Vector3(0.22, -0.7, 1.3),
        ],
        radius: 0.025,
      },
      // 6. Left Lateral Branch (Left cheek curling forward)
      {
        points: [
          new THREE.Vector3(-1.22, 0.15, 0.45),
          new THREE.Vector3(-1.05, 0.32, 0.78),
          new THREE.Vector3(-0.82, 0.45, 1.08),
          new THREE.Vector3(-0.58, 0.46, 1.28),
        ],
        radius: 0.022,
      },
    ];

    vesselCurvesData.forEach(({ points, radius }) => {
      const sphericalCurve = new SphericalCatmullRomCurve(points, 1.486);
      const tubeGeo = new THREE.TubeGeometry(sphericalCurve, 42, radius, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, vesselMat);
      vesselGroup.add(tubeMesh);
    });

    // ==========================================
    // 5. Outer Crystal-Clear Glass Capsule Shell
    // ==========================================
    const glassCapsuleGeo = new THREE.SphereGeometry(1.62, 64, 64);
    const glassCapsuleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
      depthWrite: false,
    });
    const glassCapsuleMesh = new THREE.Mesh(glassCapsuleGeo, glassCapsuleMat);
    eyeballGroup.add(glassCapsuleMesh);

    // ==========================================
    // 6. Orbital Rune Circles (Kept per user request!)
    // ==========================================
    // Ring 1: Golden Celestial Torus Ring
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x92400e,
      emissiveIntensity: 0.5,
    });
    const ringGeo1 = new THREE.TorusGeometry(2.15, 0.035, 16, 120);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    eyeRootGroup.add(ring1);

    // Ring 2: Cyan Arcane Torus Ring
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.025, 16, 120);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    eyeRootGroup.add(ring2);

    // Cosmic Starlight Particles
    const particlesCount = 75;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 2.4 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      posArray[i] = radius * Math.cos(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi);
      posArray[i + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xfcd34d,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    eyeRootGroup.add(particleSystem);

    // ==========================================
    // 7. Highly Responsive Mouse Movement & Tracking
    // ==========================================
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Expanded responsive gaze tracking relative to window
      const deltaX = (e.clientX - centerX) / (window.innerWidth * 0.32);
      const deltaY = (e.clientY - centerY) / (window.innerHeight * 0.32);

      // Wide, expressive anatomical rotation angles (~65 degrees horizontal, ~50 degrees vertical)
      targetRotY = Math.max(-1.2, Math.min(1.2, deltaX * 1.4));
      targetRotX = Math.max(-0.9, Math.min(0.9, deltaY * 1.15));
    };

    const handleClick = () => {
      soundFx.play("spell");
      spawnCombatText("DIVINE GAZE RESONANCE!", "crit");

      // Dynamic pupillary dilation shockwave
      irisMesh.scale.set(1.22, 1.22, 1.22);
      setTimeout(() => {
        irisMesh.scale.set(1, 1, 1);
      }, 350);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    mount.addEventListener("click", handleClick);

    // ==========================================
    // 8. Main Render Loop
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Living biological microsaccades
      const saccadeJitterX = Math.sin(elapsed * 7.4) * Math.cos(elapsed * 13.7) * 0.005;
      const saccadeJitterY = Math.cos(elapsed * 9.1) * Math.sin(elapsed * 11.2) * 0.004;

      // Fast, snappy, and fluid tracking response (lerp 0.12)
      currentRotX += (targetRotX + saccadeJitterX - currentRotX) * 0.12;
      currentRotY += (targetRotY + saccadeJitterY - currentRotY) * 0.12;

      eyeballGroup.rotation.x = currentRotX;
      eyeballGroup.rotation.y = currentRotY;

      // Orbital Rune Rings Rotation
      ring1.rotation.z = elapsed * 0.25;
      ring2.rotation.y = -elapsed * 0.2;

      // Particle Drift
      particleSystem.rotation.y = elapsed * 0.06;
      particleSystem.rotation.x = elapsed * 0.03;

      // Subtle biological breathing pulse
      const pulse = 1 + Math.sin(elapsed * 1.6) * 0.008;
      eyeballGroup.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("click", handleClick);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      renderer.dispose();
      scleraGeo.dispose();
      scleraMat.dispose();
      collarGeo.dispose();
      collarMat.dispose();
      irisGeo.dispose();
      irisMat.dispose();
      corneaGeo.dispose();
      corneaMat.dispose();
      glassCapsuleGeo.dispose();
      glassCapsuleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      vesselMat.dispose();
      vesselGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [level]);

  if (webGlFailed) {
    return <FallbackEye />;
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-pointer select-none group"
      title="The All-Seeing Anatomical Eye of Karmaraj. Move your mouse to guide its gaze!"
    >
      {/* Studio Radial Soft Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest uppercase text-amber-300/80 pointer-events-none bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-md shadow-sm">
        Anatomical Eye • Reactive Gaze Active
      </div>
    </div>
  );
}
