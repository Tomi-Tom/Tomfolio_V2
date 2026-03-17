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
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleSpeedsRef = useRef<Float32Array | null>(null);
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

    // Create gold particle system
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.002 + Math.random() * 0.003;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.03,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    gearsRef.current = gears;
    particlesRef.current = particles;
    particleSpeedsRef.current = speeds;

    // Continuous idle rotation for each gear + particle animation
    let time = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;
      time += 0.016;

      // Rotate each individual gear at its own speed
      gears.children.forEach((child) => {
        const dir = (child.userData.direction as number) ?? 1;
        const speed = (child.userData.rotSpeed as number) ?? 0.003;
        child.rotation.z += speed * dir;
      });

      // Animate particles
      const posAttr = particles.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;

        pos[ix] += Math.sin(time + i) * 0.001;
        pos[iy] += speeds[i];

        if (pos[iy] > 10) {
          pos[iy] = -10;
          pos[ix] = (Math.random() - 0.5) * 20;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      posAttr.needsUpdate = true;

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
      particles.geometry.dispose();
      (particles.material as THREE.PointsMaterial).dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update gear group rotation based on scroll progress
  useEffect(() => {
    if (gearsRef.current) {
      gearsRef.current.rotation.x = progress * Math.PI;
      // Subtle y rotation for depth
      gearsRef.current.rotation.y = progress * Math.PI * 0.3;
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
