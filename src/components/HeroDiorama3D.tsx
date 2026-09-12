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

/**
 * SphericalCatmullRomCurve
 * Ensures all sampled points of the Catmull-Rom spline lie precisely on a sphere of radius R.
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

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // ==========================================
    // 1. Studio Lighting Setup (Matching Reference Render)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.3);
    scene.add(ambientLight);

    // Primary High-Key Directional Light (Top-Left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(-4, 5, 4.5);
    scene.add(keyLight);

    // Secondary Warm Soft Key Light (Top-Right)
    const secondaryKeyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    secondaryKeyLight.position.set(4.5, 3.5, 3.5);
    scene.add(secondaryKeyLight);

    // Crisp Specular Rim Light (Creating the glass shell perimeter highlights)
    const rimLight = new THREE.PointLight(0xffffff, 4.2, 16);
    rimLight.position.set(-3.8, 3.2, -2.5);
    scene.add(rimLight);

    // Bottom Warm Bounce Fill Light (Under-eye organic bounce)
    const bounceLight = new THREE.PointLight(0xfef08a, 1.8, 12);
    bounceLight.position.set(1.2, -4, 2.5);
    scene.add(bounceLight);

    // Master Eye Root Group
    const eyeRootGroup = new THREE.Group();
    // Default 3/4 hero presentation angle matching reference image
    eyeRootGroup.rotation.y = 0.38;
    eyeRootGroup.rotation.x = -0.12;
    eyeRootGroup.rotation.z = -0.05;
    scene.add(eyeRootGroup);

    // Eyeball group that reacts to mouse gaze tracking
    const eyeballGroup = new THREE.Group();
    eyeRootGroup.add(eyeballGroup);

    // ==========================================
    // 2. Procedural Canvas Textures
    // ==========================================

    // SCLERA TEXTURE: Warm ivory base with sub-surface capillaries & organic undertones
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
      baseGrad.addColorStop(1, "#fdba74");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Warm organic fleshy washes
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

      // Capillary root points radiating across sclera
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

      // Subtle warm junction shadow around the anterior aperture collar
      const junctionGrad = ctx.createRadialGradient(512, 256, 80, 512, 256, 140);
      junctionGrad.addColorStop(0, "rgba(69, 26, 3, 0.4)");
      junctionGrad.addColorStop(0.6, "rgba(180, 83, 9, 0.2)");
      junctionGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = junctionGrad;
      ctx.beginPath();
      ctx.arc(512, 256, 140, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // IRIS TEXTURE: Golden Sunburst with Starburst Collarette & Curved Studio Window Reflection
    const createIrisTexture = (pupilRatio: number = 0.32) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;
      const center = 512;
      const radius = 480;

      // Dark Limbal Border
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
      ctx.fillStyle = "rgba(254, 240, 138, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(253, 230, 138, 0.9)";
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.restore();

      // Deep Black Pupil
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

      // CURVED STUDIO SOFTBOX GRID WINDOW REFLECTION (Signature highlight from reference image)
      ctx.save();
      // Upper-left quadrant reflection over the pupil and cornea
      const winX = center - pupilRadius * 0.72;
      const winY = center - pupilRadius * 0.68;
      const winW = pupilRadius * 0.78;
      const winH = pupilRadius * 0.65;

      // Rotate window to align with spherical curvature
      ctx.translate(winX + winW / 2, winY + winH / 2);
      ctx.rotate(-0.35);

      // Soft white specular outer aura
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
    const scleraRadius = 1.46;
    const scleraGeo = new THREE.SphereGeometry(scleraRadius, 64, 64);
    const scleraMat = new THREE.MeshStandardMaterial({
      map: createScleraTexture(),
      roughness: 0.18,
      metalness: 0.04,
    });
    const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
    // Align texture poles so aperture faces forward (+Z)
    scleraMesh.rotation.y = Math.PI / 2;
    eyeballGroup.add(scleraMesh);

    // B. Anatomical Beveled Aperture Collar (The White Bezel Ring from Reference Image)
    // Major radius = 0.77, tube radius = 0.062, positioned right at Z = 1.25
    const collarGeo = new THREE.TorusGeometry(0.77, 0.062, 24, 64);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xfcfbf9,
      roughness: 0.28,
      metalness: 0.08,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.z = 1.25;
    eyeballGroup.add(collarMesh);

    // C. Detailed Golden Sunburst Iris Disc (Recessed inside the collar)
    const irisGeo = new THREE.CircleGeometry(0.75, 64);
    const irisTexture = createIrisTexture(0.32);
    const irisMat = new THREE.MeshStandardMaterial({
      map: irisTexture,
      roughness: 0.22,
      metalness: 0.06,
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    irisMesh.position.z = 1.24;
    eyeballGroup.add(irisMesh);

    // D. Glossy Convex Crystal Cornea Dome (Optical wet tear film bulging outward)
    const corneaGeo = new THREE.SphereGeometry(0.82, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.015,
      ior: 1.376, // Exact biological cornea refractive index
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
      depthWrite: false,
    });
    const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
    corneaMesh.position.z = 0.86;
    eyeballGroup.add(corneaMesh);

    // ==========================================
    // 4. Real 3D Raised Tubular Surface Arteries (Tier 1 Surface Vessels)
    // ==========================================
    const vesselGroup = new THREE.Group();
    eyeballGroup.add(vesselGroup);

    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x881337, // Rich deep arterial crimson
      roughness: 0.24,
      metalness: 0.12,
    });

    // Curvature definitions hugging the sphere surface (radius = 1.482)
    const vesselCurvesData = [
      // 1. Primary Lateral Arterial Trunk (Right side, branching forward across equator)
      {
        points: [
          new THREE.Vector3(1.25, -0.35, 0.35),
          new THREE.Vector3(1.15, -0.05, 0.68),
          new THREE.Vector3(1.05, 0.18, 0.88),
          new THREE.Vector3(0.82, 0.42, 1.08),
          new THREE.Vector3(0.55, 0.62, 1.22),
          new THREE.Vector3(0.28, 0.74, 1.28),
        ],
        radius: 0.034,
      },
      // 2. Lateral Trunk Lower Bifurcation
      {
        points: [
          new THREE.Vector3(1.05, 0.18, 0.88),
          new THREE.Vector3(0.92, -0.15, 1.02),
          new THREE.Vector3(0.75, -0.38, 1.15),
          new THREE.Vector3(0.48, -0.58, 1.24),
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
          new THREE.Vector3(0.08, 0.78, 1.25),
        ],
        radius: 0.024,
      },
      // 5. Inferior Vessel (Bottom pole winding upward toward lower collar rim)
      {
        points: [
          new THREE.Vector3(-0.25, -1.35, 0.35),
          new THREE.Vector3(-0.08, -1.12, 0.75),
          new THREE.Vector3(0.12, -0.88, 1.05),
          new THREE.Vector3(0.22, -0.74, 1.25),
        ],
        radius: 0.025,
      },
      // 6. Left Lateral Branch (Left cheek curling forward)
      {
        points: [
          new THREE.Vector3(-1.22, 0.15, 0.45),
          new THREE.Vector3(-1.05, 0.32, 0.78),
          new THREE.Vector3(-0.82, 0.45, 1.08),
          new THREE.Vector3(-0.62, 0.52, 1.22),
        ],
        radius: 0.022,
      },
    ];

    vesselCurvesData.forEach(({ points, radius }) => {
      const sphericalCurve = new SphericalCatmullRomCurve(points, 1.482);
      const tubeGeo = new THREE.TubeGeometry(sphericalCurve, 42, radius, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, vesselMat);
      vesselGroup.add(tubeMesh);
    });

    // ==========================================
    // 5. Outer Crystal-Clear Glass Capsule Shell (Encapsulating Capsule)
    // ==========================================
    const glassCapsuleGeo = new THREE.SphereGeometry(1.62, 64, 64);
    const glassCapsuleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.5, // Optical crown glass / clear resin
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
      depthWrite: false, // Prevents depth-sorting occlusion of the inner vessels and iris
    });
    const glassCapsuleMesh = new THREE.Mesh(glassCapsuleGeo, glassCapsuleMat);
    eyeballGroup.add(glassCapsuleMesh);

    // ==========================================
    // 6. Mouse Tracking, Microsaccades & Interactions
    // ==========================================
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Responsive gaze tracking relative to viewport
      const deltaX = (e.clientX - centerX) / (window.innerWidth * 0.42);
      const deltaY = (e.clientY - centerY) / (window.innerHeight * 0.42);

      // Clamped anatomical excursion angles (~30 degrees)
      targetRotY = Math.max(-0.55, Math.min(0.55, deltaX * 0.6));
      targetRotX = Math.max(-0.4, Math.min(0.4, deltaY * 0.5));
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
    // 7. Render Loop
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Living biological microsaccades (subtle micro-jitter mimicking human fixation)
      const saccadeJitterX = Math.sin(elapsed * 7.4) * Math.cos(elapsed * 13.7) * 0.005;
      const saccadeJitterY = Math.cos(elapsed * 9.1) * Math.sin(elapsed * 11.2) * 0.004;

      // Damped gaze tracking lerp
      currentRotX += (targetRotX + saccadeJitterX - currentRotX) * 0.075;
      currentRotY += (targetRotY + saccadeJitterY - currentRotY) * 0.075;

      eyeballGroup.rotation.x = currentRotX;
      eyeballGroup.rotation.y = currentRotY;

      // Subtle biological pulse
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

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-pointer select-none group"
      title="The All-Seeing Anatomical Eye of Karmaraj. Click to focus divine gaze!"
    >
      {/* Studio Radial Soft Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest uppercase text-amber-300/80 pointer-events-none bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-md shadow-sm">
        Anatomical Eye • Living Gaze Active
      </div>
    </div>
  );
}
