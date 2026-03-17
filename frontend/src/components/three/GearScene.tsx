"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { createGears } from "./createGears";

interface GearSceneProps {
  progress?: number;
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

    // ─── Gears ───
    const gears = createGears();
    scene.add(gears);

    // ─── Particle Layer 1: Floating dust (many, small, slow) ───
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustSpeeds = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      dustSpeeds[i] = 0.001 + Math.random() * 0.003;
      dustPhases[i] = Math.random() * Math.PI * 2;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.025,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ─── Particle Layer 2: Bright sparks (fewer, larger, brighter) ───
    const sparkCount = 80;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkSpeeds = new Float32Array(sparkCount);
    const sparkPhases = new Float32Array(sparkCount);
    const sparkSizes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 25;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sparkSpeeds[i] = 0.003 + Math.random() * 0.006;
      sparkPhases[i] = Math.random() * Math.PI * 2;
      sparkSizes[i] = 0.04 + Math.random() * 0.06;
    }

    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute("size", new THREE.BufferAttribute(sparkSizes, 1));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // ─── Particle Layer 3: Slow drifting nebula (very large, very faint) ───
    const nebulaCount = 30;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaPhases = new Float32Array(nebulaCount);

    for (let i = 0; i < nebulaCount; i++) {
      nebulaPos[i * 3] = (Math.random() - 0.5) * 20;
      nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      nebulaPos[i * 3 + 2] = -5 + Math.random() * -10;
      nebulaPhases[i] = Math.random() * Math.PI * 2;
    }

    nebulaGeo.setAttribute("position", new THREE.BufferAttribute(nebulaPos, 3));

    const nebulaMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.4,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // ─── Ambient light lines (subtle gold streaks) ───
    const lineCount = 8;
    const lines: THREE.Line[] = [];
    for (let i = 0; i < lineCount; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 16;
      const startY = (Math.random() - 0.5) * 16;
      const startZ = -2 + Math.random() * -5;
      const length = 1 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      points.push(new THREE.Vector3(startX, startY, startZ));
      points.push(
        new THREE.Vector3(
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length,
          startZ,
        ),
      );
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.06,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData.phase = Math.random() * Math.PI * 2;
      lines.push(line);
      scene.add(line);
    }

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    gearsRef.current = gears;

    // ─── Animation loop ───
    let time = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;
      time += 0.016;

      // Gear idle rotation
      gears.children.forEach((child) => {
        const dir = (child.userData.direction as number) ?? 1;
        const speed = (child.userData.rotSpeed as number) ?? 0.003;
        child.rotation.z += speed * dir;
      });

      // Dust particles — slow float up with drift
      const dustAttr = dust.geometry.getAttribute("position") as THREE.BufferAttribute;
      const dPos = dustAttr.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        dPos[ix] += Math.sin(time * 0.5 + dustPhases[i]) * 0.0008;
        dPos[iy] += dustSpeeds[i];
        // Gentle z oscillation
        dPos[i * 3 + 2] += Math.cos(time * 0.3 + dustPhases[i]) * 0.0003;

        if (dPos[iy] > 15) {
          dPos[iy] = -15;
          dPos[ix] = (Math.random() - 0.5) * 30;
          dPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }
      }
      dustAttr.needsUpdate = true;

      // Spark particles — faster, twinkle via opacity variation
      const sparkAttr = sparks.geometry.getAttribute("position") as THREE.BufferAttribute;
      const sPos = sparkAttr.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        sPos[ix] += Math.sin(time + sparkPhases[i]) * 0.002;
        sPos[iy] += sparkSpeeds[i];
        sPos[i * 3 + 2] += Math.sin(time * 0.7 + sparkPhases[i]) * 0.001;

        if (sPos[iy] > 13) {
          sPos[iy] = -13;
          sPos[ix] = (Math.random() - 0.5) * 25;
          sPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      sparkAttr.needsUpdate = true;
      // Twinkle sparks
      sparkMat.opacity = 0.35 + Math.sin(time * 2) * 0.15;

      // Nebula — very slow drift
      const nebulaAttr = nebula.geometry.getAttribute("position") as THREE.BufferAttribute;
      const nPos = nebulaAttr.array as Float32Array;
      for (let i = 0; i < nebulaCount; i++) {
        nPos[i * 3] += Math.sin(time * 0.1 + nebulaPhases[i]) * 0.0005;
        nPos[i * 3 + 1] += Math.cos(time * 0.08 + nebulaPhases[i]) * 0.0005;
      }
      nebulaAttr.needsUpdate = true;
      nebulaMat.opacity = 0.05 + Math.sin(time * 0.5) * 0.03;

      // Light lines — pulse opacity
      lines.forEach((line) => {
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = 0.03 + Math.sin(time * 0.4 + (line.userData.phase as number)) * 0.04;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      dustGeo.dispose();
      dustMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      lines.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.LineBasicMaterial).dispose();
      });
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Scroll-driven gear rotation
  useEffect(() => {
    if (gearsRef.current) {
      gearsRef.current.rotation.x = progress * Math.PI;
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
