"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";

interface HeroDiorama3DProps {
  level: number;
  xpProgress: number;
  avatarType?: string;
  gold: number;
}

export default function HeroDiorama3D({
  level,
}: HeroDiorama3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.3);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    keyLight.position.set(3.5, 4.5, 5);
    scene.add(keyLight);

    const rimGoldLight = new THREE.PointLight(0xf59e0b, 3.5, 12);
    rimGoldLight.position.set(-3.5, 2.5, -2);
    scene.add(rimGoldLight);

    const cyanFillLight = new THREE.PointLight(0x38bdf8, 2.2, 10);
    cyanFillLight.position.set(2.5, -2.5, 2.5);
    scene.add(cyanFillLight);

    // Root Group
    const eyeRootGroup = new THREE.Group();
    scene.add(eyeRootGroup);

    // 1. Procedural Sclera with Anatomical Vascular Nerves & Capillaries
    const createScleraTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      // Base Sclera: Off-white ivory with warm biological tissue undertone
      const baseGrad = ctx.createRadialGradient(512, 256, 120, 512, 256, 500);
      baseGrad.addColorStop(0, "#fcfbf9");
      baseGrad.addColorStop(0.6, "#f4eee6");
      baseGrad.addColorStop(0.85, "#ebd9d0");
      baseGrad.addColorStop(1, "#dfc6bd");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Helper function to draw organic branching vascular nerves
      const drawVascularBranch = (
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

        // Curvature jitter
        const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 28;
        const midY = (startY + targetY) / 2 + (Math.random() - 0.5) * 24;

        ctx.quadraticCurveTo(midX, midY, targetX, targetY);

        // Vessel color: deep arterial crimson with subtle transparency
        const alpha = 0.25 + depth * 0.18;
        ctx.strokeStyle = `rgba(185, 28, 28, ${alpha})`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.restore();

        // Branch out children
        if (depth > 1) {
          const numBranches = Math.random() > 0.4 ? 2 : 1;
          for (let b = 0; b < numBranches; b++) {
            const angle = Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 0.9;
            const branchLen = 20 + Math.random() * 32;
            const endX = targetX + Math.cos(angle) * branchLen;
            const endY = targetY + Math.sin(angle) * branchLen;
            drawVascularBranch(targetX, targetY, endX, endY, width * 0.65, depth - 1);
          }
        }
      };

      // Generate realistic capillary trees radiating from peripheral sides toward center
      const vesselRoots = [
        // Temporal / Medial roots
        { x: 140, y: 160, angle: 0.2 },
        { x: 120, y: 260, angle: 0.05 },
        { x: 150, y: 360, angle: -0.2 },
        { x: 880, y: 150, angle: 3.0 },
        { x: 900, y: 250, angle: 3.14 },
        { x: 870, y: 350, angle: -3.0 },
        // Superior / Inferior roots
        { x: 420, y: 60, angle: 1.4 },
        { x: 600, y: 60, angle: 1.7 },
        { x: 430, y: 450, angle: -1.4 },
        { x: 590, y: 450, angle: -1.7 },
      ];

      vesselRoots.forEach((root) => {
        const len = 70 + Math.random() * 60;
        const targetX = root.x + Math.cos(root.angle) * len;
        const targetY = root.y + Math.sin(root.angle) * len;
        drawVascularBranch(root.x, root.y, targetX, targetY, 2.2, 4);
      });

      // Subtle fine micro-capillary web
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        // Keep clear of the direct center cornea pole
        const distToCenter = Math.hypot(x - 512, y - 256);
        if (distToCenter > 110 && distToCenter < 400) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75 + Math.random() * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(220, 38, 38, 0.18)";
          ctx.fill();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // 2. Procedural Anatomical Iris with Limbal Ring & Crypts of Fuchs
    const createIrisTexture = (pupilScale: number = 0.28) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const center = 256;
      const radius = 240;

      // Outer Deep Limbal Ring (Crucial for human realism)
      const limbalGrad = ctx.createRadialGradient(center, center, radius * 0.75, center, center, radius);
      limbalGrad.addColorStop(0, "#78350f");
      limbalGrad.addColorStop(0.7, "#291507");
      limbalGrad.addColorStop(0.95, "#0c0a09");
      limbalGrad.addColorStop(1, "#1c1917");
      ctx.fillStyle = limbalGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      // Base Stroma Radial Texture
      const stromaGrad = ctx.createRadialGradient(center, center, radius * 0.3, center, center, radius * 0.85);
      stromaGrad.addColorStop(0, "#fbbf24");
      stromaGrad.addColorStop(0.35, "#d97706");
      stromaGrad.addColorStop(0.75, "#92400e");
      stromaGrad.addColorStop(1, "#451a03");
      ctx.fillStyle = stromaGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.94, 0, Math.PI * 2);
      ctx.fill();

      // 360 Layered Dense Iris Fibers
      ctx.save();
      ctx.translate(center, center);
      for (let i = 0; i < 360; i++) {
        ctx.rotate((Math.PI * 2) / 360);
        ctx.beginPath();
        const startR = radius * (pupilScale + 0.02);
        const endR = radius * (0.92 + Math.random() * 0.05);
        ctx.moveTo(startR, 0);

        // Natural wavy fiber stroke
        const wave = (Math.random() - 0.5) * 3;
        ctx.quadraticCurveTo(radius * 0.55, wave, endR, 0);

        const hue =
          i % 3 === 0
            ? "rgba(251, 191, 36, 0.7)"
            : i % 3 === 1
            ? "rgba(245, 158, 11, 0.5)"
            : "rgba(217, 119, 6, 0.4)";
        ctx.strokeStyle = hue;
        ctx.lineWidth = 0.8 + Math.random() * 1.4;
        ctx.stroke();
      }
      ctx.restore();

      // Collarette Undulating Golden Ridge
      ctx.save();
      ctx.translate(center, center);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.08) {
        const rColl = radius * (0.48 + Math.sin(a * 12) * 0.04);
        const px = Math.cos(a) * rColl;
        const py = Math.sin(a) * rColl;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(253, 230, 138, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Crypts of Fuchs (Darker pigment pits)
      for (let c = 0; c < 30; c++) {
        const pitAngle = Math.random() * Math.PI * 2;
        const pitDist = radius * (0.55 + Math.random() * 0.3);
        const px = center + Math.cos(pitAngle) * pitDist;
        const py = center + Math.sin(pitAngle) * pitDist;
        ctx.beginPath();
        ctx.ellipse(px, py, 2.5 + Math.random() * 3, 1.5 + Math.random() * 2, pitAngle, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(69, 26, 3, 0.6)";
        ctx.fill();
      }

      // Deep Void Pupil with soft organic feathered margin
      const pupilGrad = ctx.createRadialGradient(
        center,
        center,
        radius * (pupilScale * 0.7),
        center,
        center,
        radius * pupilScale
      );
      pupilGrad.addColorStop(0, "#000000");
      pupilGrad.addColorStop(0.9, "#040406");
      pupilGrad.addColorStop(1, "#18181b");
      ctx.fillStyle = pupilGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius * pupilScale, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    // Eyeball Mesh Group
    const eyeballGroup = new THREE.Group();
    eyeRootGroup.add(eyeballGroup);

    // Anatomical Sclera Sphere
    const scleraGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const scleraMat = new THREE.MeshStandardMaterial({
      map: createScleraTexture(),
      roughness: 0.12,
      metalness: 0.04,
    });
    const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
    // Rotate sclera so texture poles align anatomically
    scleraMesh.rotation.y = Math.PI / 2;
    eyeballGroup.add(scleraMesh);

    // Iris Disc
    const irisGeo = new THREE.CircleGeometry(0.74, 64);
    const irisTexture = createIrisTexture(0.28);
    const irisMat = new THREE.MeshStandardMaterial({
      map: irisTexture,
      roughness: 0.25,
      metalness: 0.08,
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    irisMesh.position.z = 1.48;
    eyeballGroup.add(irisMesh);

    // Wet Optical Glass Cornea (Refractive Tear Film)
    const corneaGeo = new THREE.SphereGeometry(0.86, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.015,
      ior: 1.376, // Exact biological cornea refractive index
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
    });
    const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
    corneaMesh.position.z = 1.06;
    eyeballGroup.add(corneaMesh);

    // Orbital Celestial Rune Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x92400e,
      emissiveIntensity: 0.45,
    });
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.035, 16, 120);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    eyeRootGroup.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.025, 16, 120);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    eyeRootGroup.add(ring2);

    // Cosmic Starlight Particles
    const particlesCount = 85;
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

    // Mouse Tracking Targets & Microsaccades
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Screen-wide responsive gaze tracking
      const deltaX = (e.clientX - centerX) / (window.innerWidth * 0.45);
      const deltaY = (e.clientY - centerY) / (window.innerHeight * 0.45);

      // Anatomically clamped eyeball limits (~35 degrees)
      targetRotY = Math.max(-0.6, Math.min(0.6, deltaX * 0.65));
      targetRotX = Math.max(-0.45, Math.min(0.45, deltaY * 0.55));
    };

    const handleClick = () => {
      soundFx.play("spell");
      spawnCombatText("DIVINE GAZE RESONANCE!", "crit");

      // Dynamic pupillary dilation shockwave
      irisMesh.scale.set(1.3, 1.3, 1.3);
      setTimeout(() => {
        irisMesh.scale.set(1, 1, 1);
      }, 350);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    mount.addEventListener("click", handleClick);

    // Main Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Biological microsaccades: subtle micro-jitter mimicking living fixation drifts
      const saccadeJitterX = Math.sin(elapsed * 7.4) * Math.cos(elapsed * 13.7) * 0.006;
      const saccadeJitterY = Math.cos(elapsed * 9.1) * Math.sin(elapsed * 11.2) * 0.005;

      // Smooth gaze damping with lerp
      currentRotX += (targetRotX + saccadeJitterX - currentRotX) * 0.08;
      currentRotY += (targetRotY + saccadeJitterY - currentRotY) * 0.08;

      eyeballGroup.rotation.x = currentRotX;
      eyeballGroup.rotation.y = currentRotY;

      // Orbital Rings Rotation
      ring1.rotation.z = elapsed * 0.22;
      ring2.rotation.y = -elapsed * 0.18;

      // Particle Constellation Drift
      particleSystem.rotation.y = elapsed * 0.06;
      particleSystem.rotation.x = elapsed * 0.03;

      // Subtle biological breathing scale
      const breath = 1 + Math.sin(elapsed * 1.8) * 0.015;
      eyeballGroup.scale.set(breath, breath, breath);

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
      irisGeo.dispose();
      irisMat.dispose();
      corneaGeo.dispose();
      corneaMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [level]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-pointer select-none group"
      title="The All-Seeing Cosmic Eye of Karmaraj. Click to focus divine gaze!"
    >
      {/* Dynamic ambient halo */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest uppercase text-amber-400/70 pointer-events-none bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/20 backdrop-blur-sm">
        Cosmic Iris • Gaze Active
      </div>
    </div>
  );
}
