"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { soundFx } from "@/lib/audio";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, 5.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const isLightMode = theme === "light";
    
    // Lighting shifts based on level milestone (e.g. intensity increases slightly, or color warms up)
    const intensityMod = 1 + (Math.floor(level / 5) * 0.1);

    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 1.2 : 0.7);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf59e0b, isLightMode ? 2.0 : 2.5 * intensityMod, 12);
    goldLight.position.set(2, 3, 2);
    scene.add(goldLight);

    const emeraldLight = new THREE.PointLight(0x10b981, isLightMode ? 1.5 : 1.8 * intensityMod, 10);
    emeraldLight.position.set(-2, 1.5, -1);
    scene.add(emeraldLight);

    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // Voxel-style Base
    const baseGeo = new THREE.BoxGeometry(3.2, 0.6, 3.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0xe2e8f0 : 0x121822,
      roughness: 0.8,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.8;
    dioramaGroup.add(baseMesh);

    // Voxel Gold Trim
    const trimGeo = new THREE.BoxGeometry(3.4, 0.1, 3.4);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.6;
    dioramaGroup.add(trimMesh);

    // Central Floating RPG Monolith
    const relicGeo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const relicMat = new THREE.MeshStandardMaterial({
      color: isLightMode ? 0xcbd5e1 : 0x1a2332,
      roughness: 0.4,
      metalness: 0.6,
    });
    const relicMesh = new THREE.Mesh(relicGeo, relicMat);
    relicMesh.position.y = 0.5;
    dioramaGroup.add(relicMesh);

    // Inner Glowing Core (Amber Gold)
    const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0xd97706,
      emissiveIntensity: isLightMode ? 0.3 : 0.6 + (level * 0.05),
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.5;
    dioramaGroup.add(coreMesh);

    // Orbiting Satellites (Level Runes)
    const satellites: THREE.Mesh[] = [];
    const numOrbits = Math.min(8, Math.max(2, level));

    for (let i = 0; i < numOrbits; i++) {
      const satGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0x10b981,
        metalness: 0.8,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satellites.push(satMesh);
      dioramaGroup.add(satMesh);
    }

    // Particle System (Embers/Dust)
    const particleCount = 150;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleMesh = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleMesh);

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

    let spinVelocity = 0;
    const handleClick = () => {
      soundFx.playClick();
      spinVelocity = 0.35;
    };
    mount.addEventListener("click", handleClick);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.4;
      dioramaGroup.rotation.y += (targetRotationY - dioramaGroup.rotation.y) * 0.05;
      dioramaGroup.rotation.x += (targetRotationX - dioramaGroup.rotation.x) * 0.05;

      relicMesh.rotation.y += 0.01 + spinVelocity;
      relicMesh.rotation.x += 0.007;
      coreMesh.rotation.y -= 0.015;

      relicMesh.position.y = 0.5 + Math.sin(elapsedTime * 2) * 0.08;
      coreMesh.position.y = 0.5 + Math.sin(elapsedTime * 2) * 0.08;

      satellites.forEach((sat, i) => {
        const angle = elapsedTime * (1.2 + (level * 0.02)) + (i * Math.PI * 2) / numOrbits;
        const radius = 1.6;
        sat.position.x = Math.cos(angle) * radius;
        sat.position.z = Math.sin(angle) * radius;
        sat.position.y = 0.5 + Math.sin(elapsedTime * 3 + i) * 0.2;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Animate particles (floating up slowly)
      const positions = particleMesh.geometry.attributes.position.array as Float32Array;
      for(let i=1; i < particleCount * 3; i+=3) {
        positions[i] += 0.01;
        if(positions[i] > 2.5) {
          positions[i] = -2.5;
        }
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
      particleMesh.rotation.y = elapsedTime * 0.05;

      if (spinVelocity > 0.001) {
        spinVelocity *= 0.94;
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, [level, xpProgress, avatarType, gold, theme]);

  return (
    <div className="relative w-full h-[340px] diorama-box flex items-center justify-center cursor-pointer select-none group overflow-hidden rounded-2xl">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10 pointer-events-none">
        <span className="wax-stamp text-[9px] py-0.5 px-2 border-amber-500 text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40">
          DIORAMA SANCTUM
        </span>
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] text-amber-700 dark:text-amber-200/80 bg-slate-100/70 dark:bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800/40 opacity-70 group-hover:opacity-100 transition-opacity">
        Interactive 3D Artifact (Click to Spin)
      </div>
    </div>
  );
}
