"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

interface SectionCanvasProps {
  variant: "grid" | "rings" | "wave" | "constellation";
  className?: string;
}

const GOLD = 0xd4af37;

// ─── Grid variant: rotating wireframe grid ───
function setupGrid(scene: THREE.Scene): { update: (t: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const size = 10;
  const divisions = 16;
  const material = new THREE.LineBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.6,
  });

  const geometries: THREE.BufferGeometry[] = [];

  // Create grid lines along X
  for (let i = 0; i <= divisions; i++) {
    const t = (i / divisions) * size - size / 2;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(t, 0, -size / 2),
      new THREE.Vector3(t, 0, size / 2),
    ]);
    geometries.push(geo);
    group.add(new THREE.Line(geo, material));
  }

  // Create grid lines along Z
  for (let i = 0; i <= divisions; i++) {
    const t = (i / divisions) * size - size / 2;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-size / 2, 0, t),
      new THREE.Vector3(size / 2, 0, t),
    ]);
    geometries.push(geo);
    group.add(new THREE.Line(geo, material));
  }

  group.rotation.x = -0.6;
  scene.add(group);

  return {
    update(t: number) {
      group.rotation.z = t * 0.08;
      group.rotation.x = -0.6 + Math.sin(t * 0.15) * 0.1;
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      material.dispose();
      scene.remove(group);
    },
  };
}

// ─── Rings variant: concentric pulsing rings ───
function setupRings(scene: THREE.Scene): { update: (t: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const ringCount = 5;
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.LineBasicMaterial[] = [];
  const rings: THREE.LineLoop[] = [];

  for (let i = 0; i < ringCount; i++) {
    const radius = 1 + i * 0.8;
    const segments = 64;
    const points: THREE.Vector3[] = [];
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.5 - i * 0.07,
    });
    const ring = new THREE.LineLoop(geo, mat);
    ring.position.z = -i * 0.4;
    geometries.push(geo);
    materials.push(mat);
    rings.push(ring);
    group.add(ring);
  }

  // Orbiting dot
  const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: GOLD });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  group.add(dot);

  scene.add(group);

  return {
    update(t: number) {
      rings.forEach((ring, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        ring.rotation.z = t * 0.05 * dir;
        const scale = 1 + Math.sin(t * 0.3 + i * 0.5) * 0.05;
        ring.scale.set(scale, scale, 1);
      });
      // Orbiting dot on the second ring
      const orbitRadius = 1.8;
      dot.position.x = Math.cos(t * 0.4) * orbitRadius;
      dot.position.y = Math.sin(t * 0.4) * orbitRadius;
      dot.position.z = -0.4;
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      dotGeo.dispose();
      dotMat.dispose();
      scene.remove(group);
    },
  };
}

// ─── Wave variant: undulating wireframe terrain ───
function setupWave(scene: THREE.Scene): { update: (t: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const gridW = 24;
  const gridH = 24;
  const spacing = 0.4;
  const material = new THREE.LineBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.5,
  });

  const geometries: THREE.BufferGeometry[] = [];

  // Row lines
  for (let z = 0; z < gridH; z++) {
    const points: THREE.Vector3[] = [];
    for (let x = 0; x < gridW; x++) {
      points.push(
        new THREE.Vector3(
          (x - gridW / 2) * spacing,
          0,
          (z - gridH / 2) * spacing,
        ),
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geometries.push(geo);
    group.add(new THREE.Line(geo, material));
  }

  // Column lines
  for (let x = 0; x < gridW; x++) {
    const points: THREE.Vector3[] = [];
    for (let z = 0; z < gridH; z++) {
      points.push(
        new THREE.Vector3(
          (x - gridW / 2) * spacing,
          0,
          (z - gridH / 2) * spacing,
        ),
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geometries.push(geo);
    group.add(new THREE.Line(geo, material));
  }

  group.rotation.x = -0.7;
  group.position.y = 1;
  scene.add(group);

  return {
    update(t: number) {
      // Update row lines
      for (let z = 0; z < gridH; z++) {
        const line = group.children[z] as THREE.Line;
        const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let x = 0; x < gridW; x++) {
          const wx = (x - gridW / 2) * spacing;
          const wz = (z - gridH / 2) * spacing;
          arr[x * 3 + 1] = Math.sin(wx * 0.5 + t * 0.5) * 0.3 + Math.cos(wz * 0.4 + t * 0.3) * 0.2;
        }
        attr.needsUpdate = true;
      }
      // Update column lines
      for (let x = 0; x < gridW; x++) {
        const line = group.children[gridH + x] as THREE.Line;
        const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let z = 0; z < gridH; z++) {
          const wx = (x - gridW / 2) * spacing;
          const wz = (z - gridH / 2) * spacing;
          arr[z * 3 + 1] = Math.sin(wx * 0.5 + t * 0.5) * 0.3 + Math.cos(wz * 0.4 + t * 0.3) * 0.2;
        }
        attr.needsUpdate = true;
      }
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      material.dispose();
      scene.remove(group);
    },
  };
}

// ─── Constellation variant: drifting connected points ───
function setupConstellation(scene: THREE.Scene): {
  update: (t: number) => void;
  dispose: () => void;
} {
  const pointCount = 60;
  const connectionDist = 2.5;

  // Point positions and velocities
  const positions = new Float32Array(pointCount * 3);
  const velocities = new Float32Array(pointCount * 3);
  const phases = new Float32Array(pointCount);

  for (let i = 0; i < pointCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    velocities[i * 3] = (Math.random() - 0.5) * 0.003;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const pointsMat = new THREE.PointsMaterial({
    color: GOLD,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  // Lines for connections — pre-allocate max possible lines
  const maxLines = (pointCount * (pointCount - 1)) / 2;
  const linePositions = new Float32Array(maxLines * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let flashTimer = 0;

  return {
    update(t: number) {
      // Move points
      for (let i = 0; i < pointCount; i++) {
        const ix = i * 3;
        positions[ix] += velocities[ix];
        positions[ix + 1] += velocities[ix + 1];
        positions[ix + 2] += velocities[ix + 2];

        // Bounce at bounds
        if (Math.abs(positions[ix]) > 5) velocities[ix] *= -1;
        if (Math.abs(positions[ix + 1]) > 4) velocities[ix + 1] *= -1;
        if (Math.abs(positions[ix + 2]) > 2) velocities[ix + 2] *= -1;
      }
      pointsGeo.getAttribute("position").needsUpdate = true;

      // Bright flash on a random point
      flashTimer += 0.016;
      if (flashTimer > 2.0) {
        flashTimer = 0;
        // flashIndex randomized (visual-only, no side effect)
      }
      pointsMat.size = 0.08;

      // Update connections
      let lineIdx = 0;
      for (let i = 0; i < pointCount; i++) {
        for (let j = i + 1; j < pointCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < connectionDist) {
            const base = lineIdx * 6;
            linePositions[base] = positions[i * 3];
            linePositions[base + 1] = positions[i * 3 + 1];
            linePositions[base + 2] = positions[i * 3 + 2];
            linePositions[base + 3] = positions[j * 3];
            linePositions[base + 4] = positions[j * 3 + 1];
            linePositions[base + 5] = positions[j * 3 + 2];
            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      lineGeo.getAttribute("position").needsUpdate = true;

      // Flash effect — pulse opacity
      lineMat.opacity = 0.15 + Math.sin(t * 0.8) * 0.05;
    },
    dispose() {
      pointsGeo.dispose();
      pointsMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      scene.remove(points);
      scene.remove(lines);
    },
  };
}

const VARIANT_SETUP = {
  grid: setupGrid,
  rings: setupRings,
  wave: setupWave,
  constellation: setupConstellation,
} as const;

export default function SectionCanvas({ variant, className }: SectionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── Three.js setup ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ─── Set up variant ───
    const variantObj = VARIANT_SETUP[variant](scene);

    // ─── IntersectionObserver to pause when off-screen ───
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(container);

    // ─── ResizeObserver ───
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // ─── Animation loop ───
    let time = 0;
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible || document.hidden) return;
      time += 0.016;
      variantObj.update(time);
      renderer.render(scene, camera);
    };
    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObserver.disconnect();
      variantObj.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.15,
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}
