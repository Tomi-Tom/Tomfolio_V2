import * as THREE from "three";

/**
 * Creates a single wireframe gear using line-based geometry.
 * Ported from tomfolio-frontend GearUniverse style.
 */
function createGear(
  outerRadius: number,
  innerRadius: number,
  hubRadius: number,
  teethCount: number,
  teethHeight: number,
  opacity: number,
): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: 0xd4af37,
    opacity,
    transparent: true,
  });

  function addCircle(r: number, segs = 64) {
    const pts: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.Line(geo, mat));
  }

  // Outer ring, inner ring, hub
  addCircle(outerRadius);
  addCircle(innerRadius);
  addCircle(hubRadius, 32);

  // Teeth
  const toothHalfAngle = ((Math.PI * 2) / teethCount) * 0.3;
  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const a1 = angle - toothHalfAngle;
    const a2 = angle + toothHalfAngle;
    const r1 = outerRadius;
    const r2 = outerRadius + teethHeight;
    const pts = new Float32Array([
      Math.cos(a1) * r1, Math.sin(a1) * r1, 0,
      Math.cos(a1) * r2, Math.sin(a1) * r2, 0,
      Math.cos(a2) * r2, Math.sin(a2) * r2, 0,
      Math.cos(a2) * r1, Math.sin(a2) * r1, 0,
      Math.cos(a1) * r1, Math.sin(a1) * r1, 0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.Line(geo, mat));
  }

  // Spokes connecting hub to inner ring
  const spokeCount = teethCount > 10 ? 8 : 6;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const pts = new Float32Array([
      Math.cos(angle) * hubRadius, Math.sin(angle) * hubRadius, 0,
      Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.Line(geo, mat));
  }

  return group;
}

/**
 * Gear configuration:
 * [x, y, z, outerRadius, innerRadius, hubRadius, teethCount, teethHeight, opacity, direction]
 */
type GearConfig = [number, number, number, number, number, number, number, number, number, 1 | -1];

const GEAR_CONFIGS: GearConfig[] = [
  // Large central gear
  [0, 0, 0, 2.0, 1.4, 0.5, 16, 0.3, 0.4, 1],
  // Medium gear, upper-right, interlocking
  [2.6, 1.8, -0.5, 1.3, 0.9, 0.35, 12, 0.25, 0.35, -1],
  // Small gear, lower-left
  [-2.2, -1.5, -0.3, 0.9, 0.6, 0.25, 10, 0.18, 0.3, 1],
  // Medium gear, lower-right
  [2.0, -2.0, -0.8, 1.1, 0.75, 0.3, 12, 0.2, 0.3, -1],
  // Small gear, upper-left
  [-2.8, 1.2, -0.6, 0.7, 0.5, 0.2, 8, 0.15, 0.25, 1],
];

export interface GearEntry {
  group: THREE.Group;
  rotSpeed: number;
  direction: 1 | -1;
}

/**
 * Creates a group of interlocking wireframe gears in gold color.
 * Returns a Three.js Group and an array of individual gear entries for animation.
 */
export function createGears(): THREE.Group {
  const container = new THREE.Group();

  GEAR_CONFIGS.forEach(
    ([x, y, z, outerR, innerR, hubR, teeth, teethH, opacity, dir]) => {
      const gear = createGear(outerR, innerR, hubR, teeth, teethH, opacity);
      gear.position.set(x, y, z);
      // Store direction and speed as userData for animation
      gear.userData.direction = dir;
      gear.userData.rotSpeed = outerR > 1.5 ? 0.002 : outerR > 1.0 ? 0.004 : 0.006;
      container.add(gear);
    },
  );

  return container;
}
