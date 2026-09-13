"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { soundFx } from "@/lib/audio";
import { spawnCombatText } from "./FloatingCombatText";
import { Sparkles, RotateCw, Eye, Flame, Compass } from "lucide-react";

interface ChronoHumanoid3DProps {
  className?: string;
}

const CHAKRA_PHASES = [
  { name: "Sahasrara (Crown)", hue: 0.78, colorName: "Astral Violet", desc: "Pure Enlightenment" },
  { name: "Ajna (Third Eye)", hue: 0.64, colorName: "Cosmic Indigo", desc: "Intuition & Vision" },
  { name: "Vishuddha (Throat)", hue: 0.52, colorName: "Aether Cyan", desc: "Absolute Truth" },
  { name: "Anahata (Heart)", hue: 0.36, colorName: "Emerald Prana", desc: "Harmonic Discipline" },
  { name: "Manipura (Solar)", hue: 0.13, colorName: "Golden Tejas", desc: "Willpower & Fire" },
  { name: "Svadhishthana (Sacral)", hue: 0.07, colorName: "Solar Amber", desc: "Creative Flow" },
  { name: "Muladhara (Root)", hue: 0.98, colorName: "Crimson Tapas", desc: "Grounding Focus" },
];

export default function ChronoHumanoid3D({ className = "" }: ChronoHumanoid3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentChakra, setCurrentChakra] = useState(CHAKRA_PHASES[0]);
  const [isMeditating, setIsMeditating] = useState(true);
  const [rotationSpeedMultiplier, setRotationSpeedMultiplier] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 340;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e1217, 0.08);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 3.6);

    // 3. Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0xf59e0b, 2.5, 4);
    corePointLight.position.set(0, 0.2, 0);
    scene.add(corePointLight);

    // 5. Humanoid Astral Model Construction
    const humanoidGroup = new THREE.Group();
    scene.add(humanoidGroup);

    // Shifting Dynamic Material
    const humanoidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: false,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // A. Head & Third Eye
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);

    const headGeo = new THREE.DodecahedronGeometry(0.24, 1);
    const headMesh = new THREE.Mesh(headGeo, humanoidMaterial);
    const headWire = new THREE.Mesh(headGeo, wireframeMaterial);
    headGroup.add(headMesh);
    headGroup.add(headWire);

    // Third eye jewel / forehead crystal
    const jewelGeo = new THREE.OctahedronGeometry(0.06);
    const jewelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    jewelMesh.position.set(0, 0.06, 0.22);
    jewelMesh.scale.set(0.6, 1.2, 0.6);
    headGroup.add(jewelMesh);

    humanoidGroup.add(headGroup);

    // B. Neck & Upper Torso
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.5, 0);

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.14, 8);
    const neckMesh = new THREE.Mesh(neckGeo, humanoidMaterial);
    neckMesh.position.set(0, 0.46, 0);
    torsoGroup.add(neckMesh);

    // Chest (V-tapered prism)
    const chestGeo = new THREE.ConeGeometry(0.36, 0.5, 6);
    chestGeo.rotateX(Math.PI);
    const chestMesh = new THREE.Mesh(chestGeo, humanoidMaterial);
    const chestWire = new THREE.Mesh(chestGeo, wireframeMaterial);
    chestMesh.position.set(0, 0.2, 0);
    chestWire.position.set(0, 0.2, 0);
    torsoGroup.add(chestMesh);
    torsoGroup.add(chestWire);

    // Core Heart Reactor / Anahata Jewel
    const heartGeo = new THREE.IcosahedronGeometry(0.1, 1);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0, 0.22, 0.16);
    torsoGroup.add(heartMesh);

    // Abdomen & Waist
    const waistGeo = new THREE.CylinderGeometry(0.2, 0.16, 0.28, 6);
    const waistMesh = new THREE.Mesh(waistGeo, humanoidMaterial);
    waistMesh.position.set(0, -0.16, 0);
    torsoGroup.add(waistMesh);

    // Pelvis
    const pelvisGeo = new THREE.DodecahedronGeometry(0.2, 0);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, humanoidMaterial);
    pelvisMesh.position.set(0, -0.36, 0);
    torsoGroup.add(pelvisMesh);

    humanoidGroup.add(torsoGroup);

    // C. Shoulders & Arms in Meditation Dhyana Mudra
    const armMaterial = humanoidMaterial;

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 0.65, 0);

    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), armMaterial);
    leftArmGroup.add(shoulderL);

    const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.35, 6), armMaterial);
    upperArmL.position.set(-0.08, -0.18, 0.06);
    upperArmL.rotation.set(0.3, 0, 0.4);
    leftArmGroup.add(upperArmL);

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 6), armMaterial);
    forearmL.position.set(0.08, -0.38, 0.22);
    forearmL.rotation.set(-0.8, -0.6, 0.8);
    leftArmGroup.add(forearmL);

    humanoidGroup.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 0.65, 0);

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), armMaterial);
    rightArmGroup.add(shoulderR);

    const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.35, 6), armMaterial);
    upperArmR.position.set(0.08, -0.18, 0.06);
    upperArmR.rotation.set(0.3, 0, -0.4);
    rightArmGroup.add(upperArmR);

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 6), armMaterial);
    forearmR.position.set(-0.08, -0.38, 0.22);
    forearmR.rotation.set(-0.8, 0.6, -0.8);
    rightArmGroup.add(forearmR);

    humanoidGroup.add(rightArmGroup);

    // Joined Hands in Lap
    const handsGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const handsMesh = new THREE.Mesh(handsGeo, armMaterial);
    handsMesh.position.set(0, 0.16, 0.3);
    handsMesh.scale.set(1.4, 0.7, 0.9);
    humanoidGroup.add(handsMesh);

    // D. Crossed Legs (Lotus Meditation Stance)
    const legsGroup = new THREE.Group();
    legsGroup.position.set(0, 0.06, 0);

    // Left Thigh
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.44, 6), armMaterial);
    thighL.position.set(-0.25, -0.06, 0.14);
    thighL.rotation.set(1.4, 0.5, -1.2);
    legsGroup.add(thighL);

    // Right Thigh
    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.44, 6), armMaterial);
    thighR.position.set(0.25, -0.06, 0.14);
    thighR.rotation.set(1.4, -0.5, 1.2);
    legsGroup.add(thighR);

    // Left Shin Folded
    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.44, 6), armMaterial);
    shinL.position.set(0.08, -0.18, 0.32);
    shinL.rotation.set(0, 0, Math.PI / 2 + 0.1);
    legsGroup.add(shinL);

    // Right Shin Folded
    const shinR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.44, 6), armMaterial);
    shinR.position.set(-0.08, -0.22, 0.34);
    shinR.rotation.set(0, 0, -Math.PI / 2 - 0.1);
    legsGroup.add(shinR);

    humanoidGroup.add(legsGroup);

    // E. Floating Cosmic Dharma Rings
    const ringGeo1 = new THREE.TorusGeometry(0.68, 0.012, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    ring1.position.y = 0.5;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.85, 0.008, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2.8;
    ring2.rotation.y = Math.PI / 6;
    ring2.position.y = 0.5;
    scene.add(ring2);

    // F. Swirling Astral Chakra Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.4 + Math.random() * 0.9;
      const angle = Math.random() * Math.PI * 2;
      const y = -0.2 + Math.random() * 1.6;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particleSpeeds[i] = 0.3 + Math.random() * 0.7;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xfef08a,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // G. Expanding Click Pulse Ring
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.16, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0.5, 0.2);
    scene.add(shockwaveMesh);

    // 6. Interactive Mouse & Drag Controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let mouseHoverX = 0;
    let mouseHoverY = 0;
    let clickImpulse = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseHoverX = x;
      mouseHoverY = y;

      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        targetRotationY += deltaX * 0.012;
        targetRotationX += deltaY * 0.008;
        targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleClickInteraction = () => {
      soundFx.playTempleBell();
      clickImpulse = 1.0;
      spawnCombatText("🧘 CHRONO FOCUS RESONANCE!", "vedic");
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("click", handleClickInteraction);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Time-based smooth continuous color transition across spectrum
      // Cycles every 18 seconds through the chakra spectrum
      const cycleDuration = 18;
      const cycleProgress = (elapsedTime % cycleDuration) / cycleDuration;
      const activeHue = cycleProgress;

      const dynamicColor = new THREE.Color().setHSL(activeHue, 0.88, 0.58);
      const emissiveColor = new THREE.Color().setHSL(activeHue, 0.95, 0.4);

      humanoidMaterial.color.copy(dynamicColor);
      humanoidMaterial.emissive.copy(emissiveColor);
      wireframeMaterial.color.copy(dynamicColor);
      corePointLight.color.copy(dynamicColor);
      ringMat1.color.copy(dynamicColor);
      particleMat.color.copy(dynamicColor);

      // Determine active chakra name for the UI label
      const chakraIndex = Math.floor(cycleProgress * CHAKRA_PHASES.length) % CHAKRA_PHASES.length;
      setCurrentChakra(CHAKRA_PHASES[chakraIndex]);

      // Meditation Floating & Breathing Motion
      const breathing = Math.sin(elapsedTime * 1.8) * 0.04;
      humanoidGroup.position.y = breathing;
      chestMesh.scale.set(1 + breathing * 0.5, 1 + breathing * 0.3, 1 + breathing * 0.5);

      // Head subtly tracks the user's cursor
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, mouseHoverX * 0.35, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -mouseHoverY * 0.25, 0.08);

      // Auto-rotation around Y axis + user drag inertia
      if (!isDragging) {
        targetRotationY += 0.006 * rotationSpeedMultiplier;
      }

      currentRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.08);
      currentRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.08);

      humanoidGroup.rotation.y = currentRotationY;
      humanoidGroup.rotation.x = currentRotationX;

      // Rotate cosmic dharma rings in opposite directions
      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.008;
      ring1.position.y = 0.5 + breathing * 0.5;
      ring2.position.y = 0.5 + breathing * 0.5;

      // Swirling particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        let y = positions[i * 3 + 1];
        y += particleSpeeds[i] * 0.008;
        if (y > 1.8) y = -0.2;
        positions[i * 3 + 1] = y;

        // Swirl around Y axis
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const angle = 0.015;
        positions[i * 3] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i * 3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Click shockwave expansion
      if (clickImpulse > 0) {
        clickImpulse -= delta * 1.5;
        const scale = (1 - clickImpulse) * 6;
        shockwaveMesh.scale.set(scale, scale, scale);
        shockwaveMat.opacity = Math.max(0, clickImpulse * 0.9);
        shockwaveMat.color.copy(dynamicColor);
      } else {
        shockwaveMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("click", handleClickInteraction);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [rotationSpeedMultiplier]);

  return (
    <div
      className={`relative w-full bg-[#0e1217] border border-stone-800/90 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col overflow-hidden select-none group ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold font-title text-amber-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Chrono Astral Guardian</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setRotationSpeedMultiplier((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 0.4 : 1));
            }}
            className="p-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-[10px] font-mono text-stone-300 hover:text-amber-300 transition-colors"
            title="Toggle Rotation Speed"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-64 sm:h-72 cursor-grab active:cursor-grabbing relative flex items-center justify-center overflow-hidden rounded-xl bg-radial from-stone-900/60 via-[#0e1217] to-[#0a0d11]"
        title="Interactive 3D Astral Humanoid. Click to resonate, drag with mouse to rotate 360°!"
      />

      {/* Dynamic Chakra Phase Status Badge */}
      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500"
            style={{
              backgroundColor: `hsl(${currentChakra.hue * 360}, 90%, 60%)`,
              color: `hsl(${currentChakra.hue * 360}, 90%, 60%)`,
            }}
          />
          <span className="text-stone-200 font-bold truncate max-w-[130px]">
            {currentChakra.name}
          </span>
        </div>

        <span
          className="text-[10px] font-bold tracking-wide uppercase transition-colors duration-500"
          style={{ color: `hsl(${currentChakra.hue * 360}, 90%, 65%)` }}
        >
          {currentChakra.colorName}
        </span>
      </div>

      <div className="mt-1 text-[10px] text-stone-500 text-center font-mono">
        👆 Drag to rotate 360° • Click to pulse prana
      </div>
    </div>
  );
}
