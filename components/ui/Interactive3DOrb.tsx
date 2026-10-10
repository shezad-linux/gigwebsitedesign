"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, ShieldCheck, CheckCircle2, Cpu } from "lucide-react";

export const Interactive3DOrb: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6.2;

    // 2. Renderer Setup
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      console.warn("WebGL not supported or initialization failed:", e);
      return;
    }

    // 3. 3D Model Elements: AI Neural Core
    const group = new THREE.Group();
    scene.add(group);

    // A. Outer Hologram Icosahedron Lattice
    const outerGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const outerWireframe = new THREE.WireframeGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({
      color: 0xffffff, // Pure white wireframe
      transparent: true,
      opacity: 0.45,
      linewidth: 1,
    });
    const outerMesh = new THREE.LineSegments(outerWireframe, outerMat);
    group.add(outerMesh);

    // B. Inner Glowing Sphere (AI Core)
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White core
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // C. Orbiting Rings (Data Calibration Streams)
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.02, 16, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.015, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd4d4d8,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = -Math.PI / 5;
    group.add(ring2);

    // D. Swarm of Floating Neural Nodes (Particles)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.6 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // 4. Mouse / Touch Interaction Controls
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      setIsInteracting(true);
      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) {
        // Subtle tilt when hovering
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY = normX * 0.6;
        targetRotationX = -normY * 0.4;
        return;
      }

      const deltaX = clientX - previousPointerX;
      const deltaY = clientY - previousPointerY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    // Mouse listeners
    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    // Touch listeners (Mobile responsive)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // 5. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && renderer) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Constant ambient spin
      group.rotation.y += 0.005;
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;
      innerMesh.rotation.y -= 0.007;

      // Gentle pulsating breath on inner core
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.06;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Smooth inertia interpolation towards user interaction
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.06;
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.06;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      outerGeo.dispose();
      outerWireframe.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center bg-black border border-neutral-800 shadow-2xl backdrop-blur-xl"
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating Telemetry Cards */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-white shadow-lg flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-semibold tracking-wide text-[11px] text-white">
            AI Matching Neural Core
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-white shadow-lg flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="font-bold text-white">96.8% Precision</span>
        </div>
      </div>

      {/* Floating Bottom Live Signal Pill */}
      <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-2 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-white shadow-lg flex items-center gap-2 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-white" />
          <span className="text-neutral-400 hidden sm:inline">Calibrating Skills:</span>
          <span className="font-medium text-white">Python · Java · RLHF · QA</span>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-neutral-300 text-[10px] font-semibold tracking-wider uppercase">
          {isInteracting ? "Interacting" : "Touch / Drag to Rotate"}
        </div>
      </div>
    </div>
  );
};
