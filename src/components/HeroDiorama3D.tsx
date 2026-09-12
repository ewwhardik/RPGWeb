"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { soundFx } from "@/lib/audio";

interface HeroDiorama3DProps {
  level: number;
  xpProgress: number;
  avatarType?: string;
  gold: number;
}

export default function HeroDiorama3D({
  level,
  xpProgress,
  avatarType = "warrior",
  gold,
}: HeroDiorama3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, 5.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Ambient and Point Lights (Warm Amber Gold & Forest Emerald tones, NO purple)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 12);
    goldLight.position.set(2, 3, 2);
    scene.add(goldLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 1.8, 10);
    emeraldLight.position.set(-2, 1.5, -1);
    scene.add(emeraldLight);

    // Group for the entire floating diorama
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // Pedestal Base (Obsidian Stone Disc)
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x121822,
      roughness: 0.5,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.8;
    dioramaGroup.add(baseMesh);

    // Gold Trim Ring around pedestal
    const ringGeo = new THREE.TorusGeometry(1.65, 0.05, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.7;
    dioramaGroup.add(ringMesh);

    // Central Floating RPG Monolith / Relic
    const relicGeo = new THREE.OctahedronGeometry(0.85, 0);
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false,
    });
    const relicMesh = new THREE.Mesh(relicGeo, relicMat);
    relicMesh.position.y = 0.5;
    dioramaGroup.add(relicMesh);

    // Inner Glowing Core (Amber Gold)
    const coreGeo = new THREE.DodecahedronGeometry(0.45, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.5;
    dioramaGroup.add(coreMesh);

    // Orbiting Satellites (Level Runes)
    const satellites: THREE.Mesh[] = [];
    const numOrbits = Math.min(6, Math.max(2, level));

    for (let i = 0; i < numOrbits; i++) {
      const satGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0x10b981,
        metalness: 0.8,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satellites.push(satMesh);
      dioramaGroup.add(satMesh);
    }

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 1.5;
      mouseY = y * 0.8;
    };

    mount.addEventListener("mousemove", handleMouseMove);

    // Click to spin animation
    let spinVelocity = 0;
    const handleClick = () => {
      soundFx.playClick();
      spinVelocity = 0.25;
    };
    mount.addEventListener("click", handleClick);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse tracking tilt
      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.4;
      dioramaGroup.rotation.y += (targetRotationY - dioramaGroup.rotation.y) * 0.05;
      dioramaGroup.rotation.x += (targetRotationX - dioramaGroup.rotation.x) * 0.05;

      // Base idle rotation + spin boost
      relicMesh.rotation.y += 0.01 + spinVelocity;
      relicMesh.rotation.x += 0.007;
      coreMesh.rotation.y -= 0.015;

      // Floating bobbing effect
      relicMesh.position.y = 0.5 + Math.sin(elapsedTime * 2) * 0.08;
      coreMesh.position.y = 0.5 + Math.sin(elapsedTime * 2) * 0.08;

      // Orbit satellites around relic
      satellites.forEach((sat, i) => {
        const angle = elapsedTime * 1.2 + (i * Math.PI * 2) / numOrbits;
        const radius = 1.35;
        sat.position.x = Math.cos(angle) * radius;
        sat.position.z = Math.sin(angle) * radius;
        sat.position.y = 0.5 + Math.sin(elapsedTime * 3 + i) * 0.15;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Decay spin velocity
      if (spinVelocity > 0.001) {
        spinVelocity *= 0.94;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      mount.removeEventListener("mousemove", handleMouseMove);
      mount.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [level, xpProgress, avatarType, gold]);

  return (
    <div className="relative w-full h-[340px] diorama-box flex items-center justify-center cursor-pointer select-none group overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10 pointer-events-none">
        <span className="wax-stamp text-[9px] py-0.5 px-2 border-amber-400 text-amber-300 bg-amber-950/40">
          DIORAMA SANCTUM
        </span>
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] text-amber-200/80 bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-amber-800/40 opacity-70 group-hover:opacity-100 transition-opacity">
        Interactive 3D Artifact (Click to Spin)
      </div>
    </div>
  );
}
