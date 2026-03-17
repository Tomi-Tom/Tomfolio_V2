"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { createGears } from "./createGears";

interface GearSceneProps {
  progress?: number; // 0-1 scroll progress for rotation
}

export default function GearScene({ progress = 0 }: GearSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gearsRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create gears
    const gears = createGears();
    scene.add(gears);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    gearsRef.current = gears;

    // Continuous idle rotation for each gear
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;

      // Rotate each individual gear at its own speed
      gears.children.forEach((child) => {
        const dir = (child.userData.direction as number) ?? 1;
        const speed = (child.userData.rotSpeed as number) ?? 0.003;
        child.rotation.z += speed * dir;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update gear group rotation based on scroll progress
  useEffect(() => {
    if (gearsRef.current) {
      gearsRef.current.rotation.z = progress * Math.PI * 2;
      // Subtle y rotation for depth
      gearsRef.current.rotation.y = progress * Math.PI * 0.5;
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
