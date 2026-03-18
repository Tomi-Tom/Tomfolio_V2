"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HarmonyMode =
  | "Random"
  | "Analogous"
  | "Complementary"
  | "Triadic"
  | "Monochromatic";

interface PaletteColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  locked: boolean;
}

type Palette = PaletteColor[];

// ---------------------------------------------------------------------------
// Color math helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Relative luminance for contrast check */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function textColorForBg(hex: string): string {
  return luminance(hex) > 0.35 ? "#1A1A2E" : "#FFFFFF";
}

// ---------------------------------------------------------------------------
// Approximate color name
// ---------------------------------------------------------------------------

const COLOR_NAMES: [string, number, number, number][] = [
  ["Red", 0, 80, 50],
  ["Crimson", 348, 80, 47],
  ["Rose", 330, 70, 60],
  ["Pink", 340, 80, 75],
  ["Hot Pink", 330, 90, 60],
  ["Magenta", 300, 80, 55],
  ["Fuchsia", 292, 75, 55],
  ["Purple", 270, 60, 40],
  ["Violet", 270, 70, 60],
  ["Indigo", 260, 55, 35],
  ["Blue", 220, 75, 50],
  ["Royal Blue", 225, 80, 48],
  ["Sky Blue", 200, 70, 65],
  ["Cyan", 180, 80, 50],
  ["Teal", 175, 60, 40],
  ["Aquamarine", 160, 60, 60],
  ["Green", 120, 60, 40],
  ["Lime", 90, 75, 50],
  ["Emerald", 140, 55, 42],
  ["Olive", 80, 40, 40],
  ["Yellow", 55, 85, 55],
  ["Gold", 45, 80, 50],
  ["Amber", 38, 85, 50],
  ["Orange", 25, 85, 55],
  ["Coral", 16, 80, 60],
  ["Salmon", 6, 75, 65],
  ["Brown", 20, 50, 30],
  ["Maroon", 0, 60, 25],
  ["Beige", 40, 40, 80],
  ["Ivory", 50, 50, 90],
  ["White", 0, 0, 100],
  ["Silver", 0, 0, 75],
  ["Gray", 0, 0, 50],
  ["Charcoal", 0, 0, 30],
  ["Black", 0, 0, 5],
  ["Navy", 230, 60, 25],
  ["Midnight", 240, 50, 15],
  ["Lavender", 270, 50, 75],
  ["Peach", 25, 70, 75],
  ["Mint", 150, 55, 75],
];

function approximateName(h: number, s: number, l: number): string {
  // Low saturation -> grayscale names
  if (s < 10) {
    if (l > 90) return "White";
    if (l > 70) return "Silver";
    if (l > 40) return "Gray";
    if (l > 20) return "Charcoal";
    return "Black";
  }

  let best = "Unknown";
  let bestDist = Infinity;
  for (const [name, nh, ns, nl] of COLOR_NAMES) {
    // Hue distance on circular scale
    let dh = Math.abs(h - nh);
    if (dh > 180) dh = 360 - dh;
    const ds = Math.abs(s - ns);
    const dl = Math.abs(l - nl);
    const dist = dh * 1.2 + ds * 0.6 + dl * 0.8;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }

  // Add lightness qualifier
  if (l > 75 && best !== "White" && best !== "Ivory" && best !== "Beige")
    return `Light ${best}`;
  if (l < 25 && best !== "Black" && best !== "Midnight" && best !== "Maroon")
    return `Dark ${best}`;
  return best;
}

// ---------------------------------------------------------------------------
// Palette generation
// ---------------------------------------------------------------------------

function randomColor(): PaletteColor {
  return {
    h: Math.floor(Math.random() * 360),
    s: Math.floor(randRange(40, 95)),
    l: Math.floor(randRange(25, 75)),
    locked: false,
  };
}

function generatePalette(mode: HarmonyMode, current: Palette): Palette {
  const base = Math.floor(Math.random() * 360);

  const generators: Record<HarmonyMode, () => Palette> = {
    Random: () =>
      Array.from({ length: 5 }, (_, i) =>
        current[i]?.locked ? current[i] : randomColor()
      ),

    Analogous: () => {
      const hues = [-30, -15, 0, 15, 30].map((d) => (base + d + 360) % 360);
      return hues.map((h, i) =>
        current[i]?.locked
          ? current[i]
          : {
              h,
              s: Math.floor(randRange(50, 85)),
              l: Math.floor(randRange(35, 70)),
              locked: false,
            }
      );
    },

    Complementary: () => {
      const hues = [
        base,
        (base + 15) % 360,
        (base + 180) % 360,
        (base + 195) % 360,
        (base + 345) % 360,
      ];
      return hues.map((h, i) =>
        current[i]?.locked
          ? current[i]
          : {
              h,
              s: Math.floor(randRange(50, 90)),
              l: Math.floor(randRange(30, 70)),
              locked: false,
            }
      );
    },

    Triadic: () => {
      const hues = [
        base,
        (base + 120) % 360,
        (base + 240) % 360,
        (base + 30) % 360,
        (base + 150) % 360,
      ];
      return hues.map((h, i) =>
        current[i]?.locked
          ? current[i]
          : {
              h,
              s: Math.floor(randRange(50, 85)),
              l: Math.floor(randRange(35, 65)),
              locked: false,
            }
      );
    },

    Monochromatic: () => {
      const sats = [85, 70, 55, 40, 75];
      const lights = [30, 42, 55, 68, 80];
      return sats.map((s, i) =>
        current[i]?.locked
          ? current[i]
          : { h: base, s, l: lights[i], locked: false }
      );
    },
  };

  return generators[mode]();
}

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "color-palette-history";

function loadHistory(): Palette[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: Palette[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 5)));
  } catch {
    // ignore quota errors
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const MODES: HarmonyMode[] = [
  "Random",
  "Analogous",
  "Complementary",
  "Triadic",
  "Monochromatic",
];

const stripVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function ColorPalettePage() {
  const [mode, setMode] = useState<HarmonyMode>("Random");
  const [palette, setPalette] = useState<Palette>(() =>
    generatePalette("Random", Array(5).fill(null))
  );
  const [history, setHistory] = useState<Palette[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [genKey, setGenKey] = useState(0); // for re-triggering stagger animation

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const copyText = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
    },
    [showToast]
  );

  const generate = useCallback(() => {
    const next = generatePalette(mode, palette);
    setPalette(next);
    setGenKey((k) => k + 1);
  }, [mode, palette]);

  const savePalette = useCallback(() => {
    const next = [palette, ...history].slice(0, 5);
    setHistory(next);
    saveHistory(next);
    showToast("Palette saved!");
  }, [palette, history, showToast]);

  const restorePalette = useCallback((p: Palette) => {
    setPalette(p.map((c) => ({ ...c, locked: false })));
    setGenKey((k) => k + 1);
  }, []);

  const toggleLock = useCallback((index: number) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  }, []);

  const exportCSS = useCallback(() => {
    const lines = palette.map((c, i) => {
      const hex = hslToHex(c.h, c.s, c.l);
      return `  --palette-${i + 1}: ${hex};`;
    });
    const css = `:root {\n${lines.join("\n")}\n}`;
    navigator.clipboard.writeText(css).then(() => showToast("CSS copied!"));
  }, [palette, showToast]);

  // Spacebar shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        generate();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [generate]);

  return (
    <div className="min-h-screen bg-void-deep py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel>DESIGN TOOL</SectionLabel>
          <h2 className="mt-3 text-display text-3xl sm:text-4xl font-display text-text-primary">
            Color Palette Generator
          </h2>
        </motion.div>

        {/* Harmony mode selector */}
        <motion.div
          className="mb-6 flex flex-wrap items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                rounded-full px-4 py-1.5 text-xs font-display uppercase tracking-widest
                transition-all duration-200 border cursor-pointer
                ${
                  mode === m
                    ? "bg-gold/20 border-gold text-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                    : "border-[var(--border)] text-text-secondary hover:border-gold/50 hover:text-text-primary"
                }
              `}
            >
              {m}
            </button>
          ))}
        </motion.div>

        {/* Palette strips */}
        <VoidPanel className="p-3 sm:p-4 mb-6" hoverable={false}>
          <div className="flex gap-2 sm:gap-3" key={genKey}>
            {palette.map((color, i) => {
              const hex = hslToHex(color.h, color.s, color.l);
              const rgb = hexToRgb(hex);
              const textColor = textColorForBg(hex);
              const name = approximateName(color.h, color.s, color.l);

              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stripVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative flex-1 cursor-pointer rounded-lg overflow-hidden group"
                  style={{ backgroundColor: hex }}
                  onClick={() => copyText(hex)}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 8px 30px ${hex}55`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="h-48 sm:h-64 flex flex-col justify-end p-3 relative">
                    {/* Lock button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(i);
                      }}
                      className={`
                        absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 cursor-pointer
                        ${
                          color.locked
                            ? "text-gold bg-black/30 shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                            : "text-white/40 hover:text-white/80 bg-black/20 opacity-0 group-hover:opacity-100"
                        }
                      `}
                      title={color.locked ? "Unlock" : "Lock"}
                    >
                      <LockIcon locked={color.locked} />
                    </button>

                    {/* Color info */}
                    <div
                      className="space-y-0.5 select-none"
                      style={{ color: textColor }}
                    >
                      <p className="text-[0.65rem] uppercase tracking-wider opacity-70 font-display">
                        {name}
                      </p>
                      <p className="text-sm sm:text-base font-bold font-display tracking-wider">
                        {hex}
                      </p>
                      <p className="text-[0.6rem] opacity-60 font-mono">
                        {rgb.r}, {rgb.g}, {rgb.b}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </VoidPanel>

        {/* Controls */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="gold" className="px-8 py-3 text-sm" onClick={generate}>
            Generate
          </Button>
          <Button variant="ghost-gold" onClick={savePalette}>
            Save Palette
          </Button>
          <Button variant="ghost-gold" onClick={exportCSS}>
            Export CSS
          </Button>
        </motion.div>

        {/* Keyboard hint */}
        <p className="text-center text-text-secondary text-[0.65rem] uppercase tracking-[0.2em] font-display mb-10 opacity-50">
          Press SPACE to generate
        </p>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-8 left-1/2 z-50 flex items-center gap-2 rounded-lg
                         bg-gold/10 border border-gold/30 px-5 py-2.5
                         text-gold font-display text-sm tracking-wider
                         shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
              initial={{ opacity: 0, y: 20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 10, x: "-50%" }}
              transition={{ duration: 0.25 }}
            >
              <CheckIcon />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-text-secondary font-display text-xs uppercase tracking-[0.2em] mb-3">
              Saved Palettes
            </h3>
            <div className="flex flex-col gap-2">
              {history.map((saved, hi) => (
                <motion.button
                  key={hi}
                  className="flex h-10 rounded-lg overflow-hidden border border-[var(--border)]
                             hover:border-gold/40 transition-colors cursor-pointer"
                  onClick={() => restorePalette(saved)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {saved.map((c, ci) => (
                    <div
                      key={ci}
                      className="flex-1"
                      style={{
                        backgroundColor: hslToHex(c.h, c.s, c.l),
                      }}
                    />
                  ))}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
