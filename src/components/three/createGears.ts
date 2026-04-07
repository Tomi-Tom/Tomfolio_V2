import * as THREE from "three";

// ─── Premium gold materials with varying intensities ───

function goldMat(opacity: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0xd4af37,
    opacity,
    transparent: true,
  });
}

function goldMatBright(opacity: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0xffd700,
    opacity: opacity * 0.6,
    transparent: true,
  });
}

function goldMatDim(opacity: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0xb8960c,
    opacity: opacity * 0.4,
    transparent: true,
  });
}

// ─── Geometry helpers ───

function createCircle(radius: number, segments = 64): Float32Array {
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  return new Float32Array(pts);
}

function createDashedCircle(
  radius: number,
  segments = 64,
  dashRatio = 0.6,
): Float32Array[] {
  const dashes: Float32Array[] = [];
  const totalGroups = 12;
  const segsPerGroup = Math.floor(segments / totalGroups);
  const dashPerGroup = Math.floor(segsPerGroup * dashRatio);

  for (let g = 0; g < totalGroups; g++) {
    const pts: number[] = [];
    const startIdx = g * segsPerGroup;
    for (let i = 0; i <= dashPerGroup; i++) {
      const a = ((startIdx + i) / segments) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    }
    dashes.push(new Float32Array(pts));
  }
  return dashes;
}

// ─── Premium gear creation ───

function createGear(
  outerRadius: number,
  innerRadius: number,
  hubRadius: number,
  teethCount: number,
  teethHeight: number,
  opacity: number,
): THREE.Group {
  const group = new THREE.Group();
  const primary = goldMat(opacity);
  const highlight = goldMatBright(opacity);
  const dim = goldMatDim(opacity);

  // ─── Multi-ring system ───

  // Main outer ring (bright)
  const outerGeo = new THREE.BufferGeometry();
  outerGeo.setAttribute("position", new THREE.BufferAttribute(createCircle(outerRadius, 128), 3));
  group.add(new THREE.Line(outerGeo, primary));

  // Outer glow ring (slightly larger, very faint)
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(createCircle(outerRadius + teethHeight * 0.15, 128), 3),
  );
  group.add(new THREE.Line(glowGeo, dim));

  // Inner ring
  const innerGeo = new THREE.BufferGeometry();
  innerGeo.setAttribute("position", new THREE.BufferAttribute(createCircle(innerRadius, 96), 3));
  group.add(new THREE.Line(innerGeo, primary));

  // Secondary inner ring (detail)
  const innerDetail = new THREE.BufferGeometry();
  innerDetail.setAttribute(
    "position",
    new THREE.BufferAttribute(createCircle(innerRadius * 0.92, 96), 3),
  );
  group.add(new THREE.Line(innerDetail, dim));

  // Dashed mid ring (between inner and hub — decorative precision ring)
  const midRadius = (innerRadius + hubRadius) * 0.55;
  const midDashes = createDashedCircle(midRadius, 64, 0.5);
  midDashes.forEach((dash) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(dash, 3));
    group.add(new THREE.Line(geo, dim));
  });

  // Hub outer ring
  const hubOuterGeo = new THREE.BufferGeometry();
  hubOuterGeo.setAttribute("position", new THREE.BufferAttribute(createCircle(hubRadius, 48), 3));
  group.add(new THREE.Line(hubOuterGeo, primary));

  // Hub inner ring (small center detail)
  const hubInnerGeo = new THREE.BufferGeometry();
  hubInnerGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(createCircle(hubRadius * 0.4, 32), 3),
  );
  group.add(new THREE.Line(hubInnerGeo, highlight));

  // Hub center dot ring
  const hubDotGeo = new THREE.BufferGeometry();
  hubDotGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(createCircle(hubRadius * 0.15, 16), 3),
  );
  group.add(new THREE.Line(hubDotGeo, primary));

  // ─── Premium teeth with beveled edges ───

  const toothHalfAngle = ((Math.PI * 2) / teethCount) * 0.3;
  const toothBevel = teethHeight * 0.15;

  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const a1 = angle - toothHalfAngle;
    const a2 = angle + toothHalfAngle;
    const aM1 = angle - toothHalfAngle * 0.7; // beveled inner corners
    const aM2 = angle + toothHalfAngle * 0.7;
    const r1 = outerRadius;
    const r2 = outerRadius + teethHeight;
    const rBevel = outerRadius + toothBevel;

    // Beveled tooth profile: base → bevel → top → bevel → base
    const pts = new Float32Array([
      Math.cos(a1) * r1,
      Math.sin(a1) * r1,
      0,
      Math.cos(a1) * rBevel,
      Math.sin(a1) * rBevel,
      0,
      Math.cos(aM1) * r2,
      Math.sin(aM1) * r2,
      0,
      Math.cos(aM2) * r2,
      Math.sin(aM2) * r2,
      0,
      Math.cos(a2) * rBevel,
      Math.sin(a2) * rBevel,
      0,
      Math.cos(a2) * r1,
      Math.sin(a2) * r1,
      0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    group.add(new THREE.Line(geo, primary));

    // Tooth top highlight (bright accent on tooth tip)
    const tipPts = new Float32Array([
      Math.cos(aM1) * r2,
      Math.sin(aM1) * r2,
      0,
      Math.cos(aM2) * r2,
      Math.sin(aM2) * r2,
      0,
    ]);
    const tipGeo = new THREE.BufferGeometry();
    tipGeo.setAttribute("position", new THREE.BufferAttribute(tipPts, 3));
    group.add(new THREE.Line(tipGeo, highlight));
  }

  // ─── Premium spokes (double lines with cross-bracing) ───

  const spokeCount = teethCount > 12 ? 8 : 6;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const offsetAngle = 0.03; // small offset for double-line effect

    // Main spoke
    const mainPts = new Float32Array([
      Math.cos(angle) * hubRadius,
      Math.sin(angle) * hubRadius,
      0,
      Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius,
      0,
    ]);
    const mainGeo = new THREE.BufferGeometry();
    mainGeo.setAttribute("position", new THREE.BufferAttribute(mainPts, 3));
    group.add(new THREE.Line(mainGeo, primary));

    // Parallel spoke (offset)
    const parPts = new Float32Array([
      Math.cos(angle + offsetAngle) * hubRadius,
      Math.sin(angle + offsetAngle) * hubRadius,
      0,
      Math.cos(angle + offsetAngle) * innerRadius,
      Math.sin(angle + offsetAngle) * innerRadius,
      0,
    ]);
    const parGeo = new THREE.BufferGeometry();
    parGeo.setAttribute("position", new THREE.BufferAttribute(parPts, 3));
    group.add(new THREE.Line(parGeo, dim));

    // Cross brace (diagonal between the two spoke lines at midpoint)
    const midR = (hubRadius + innerRadius) * 0.5;
    const bracePts = new Float32Array([
      Math.cos(angle) * midR * 0.85,
      Math.sin(angle) * midR * 0.85,
      0,
      Math.cos(angle + offsetAngle) * midR * 1.15,
      Math.sin(angle + offsetAngle) * midR * 1.15,
      0,
    ]);
    const braceGeo = new THREE.BufferGeometry();
    braceGeo.setAttribute("position", new THREE.BufferAttribute(bracePts, 3));
    group.add(new THREE.Line(braceGeo, dim));
  }

  // ─── Decorative micro-marks between teeth (precision engineering feel) ───

  const markCount = teethCount * 2;
  for (let i = 0; i < markCount; i++) {
    const angle = (i / markCount) * Math.PI * 2;
    const r1 = outerRadius - teethHeight * 0.05;
    const r2 = outerRadius + teethHeight * 0.03;
    const pts = new Float32Array([
      Math.cos(angle) * r1,
      Math.sin(angle) * r1,
      0,
      Math.cos(angle) * r2,
      Math.sin(angle) * r2,
      0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    group.add(new THREE.Line(geo, dim));
  }

  return group;
}

// ─── Gear configurations ───
// [x, y, z, outerRadius, innerRadius, hubRadius, teethCount, teethHeight, opacity, direction]
type GearConfig = [number, number, number, number, number, number, number, number, number, 1 | -1];

const GEAR_CONFIGS: GearConfig[] = [
  // Hero: large central gear
  [0, 0, 0, 2.2, 1.5, 0.5, 18, 0.3, 0.45, 1],
  // Upper-right: medium interlocking
  [2.9, 1.9, -0.5, 1.4, 1.0, 0.35, 14, 0.25, 0.38, -1],
  // Lower-left: medium
  [-2.5, -1.7, -0.3, 1.1, 0.75, 0.28, 12, 0.2, 0.32, 1],
  // Lower-right: medium
  [2.2, -2.2, -0.8, 1.2, 0.85, 0.3, 13, 0.22, 0.3, -1],
  // Upper-left: small accent
  [-3.0, 1.4, -0.6, 0.8, 0.55, 0.2, 10, 0.16, 0.28, 1],
  // Far right: tiny detail gear
  [4.0, 0.2, -1.0, 0.55, 0.38, 0.15, 8, 0.12, 0.2, -1],
  // Far left bottom: tiny detail
  [-3.8, -2.8, -1.2, 0.5, 0.35, 0.13, 8, 0.1, 0.18, 1],
];

export function createGears(): THREE.Group {
  const container = new THREE.Group();

  GEAR_CONFIGS.forEach(
    ([x, y, z, outerR, innerR, hubR, teeth, teethH, opacity, dir]) => {
      const gear = createGear(outerR, innerR, hubR, teeth, teethH, opacity);
      gear.position.set(x, y, z);
      gear.userData.direction = dir;
      gear.userData.rotSpeed = outerR > 1.5 ? 0.0015 : outerR > 1.0 ? 0.003 : 0.005;
      container.add(gear);
    },
  );

  return container;
}
