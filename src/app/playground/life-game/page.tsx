"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";

/* ── Constants ─────────────────────────────────────────── */
const GOLD = "#d4af37";
const DEAD_DARK = "#080808";
const DEAD_LIGHT = "#ffffff";
const CELL_GAP = 0.5;
const DEFAULT_GRID_SIZE = 30;
const GRID_STEP = 10;
const DEFAULT_SPEED = 1;
const SPEED_STEP = 1;
const MAX_SPEED = 20;
const MIN_SPEED = 1;
const MIN_GRID = 10;
const MAX_GRID = 100;

/* ── Helpers ───────────────────────────────────────────── */
function createEmptyGrid(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array(size).fill(false) as boolean[]);
}

function createSoup(size: number): boolean[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.random() > 0.65)
  );
}

function countNeighbors(grid: boolean[][], row: number, col: number, size: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size && grid[r][c]) {
        count++;
      }
    }
  }
  return count;
}

function nextGeneration(grid: boolean[][], size: number): boolean[][] {
  return grid.map((row, r) =>
    row.map((alive, c) => {
      const n = countNeighbors(grid, r, c, size);
      if (alive) return n === 2 || n === 3;
      return n === 3;
    })
  );
}

function gridsEqual(a: boolean[][], b: boolean[][]): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function populationCount(grid: boolean[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

/* ── Detect theme ──────────────────────────────────────── */
function useTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    function detect() {
      const attr = document.documentElement.getAttribute("data-theme");
      setTheme(attr === "light" ? "light" : "dark");
    }
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/* ── Fade-up variant ───────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/* ══════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function LifeGamePage() {
  const theme = useTheme();
  const deadColor = theme === "light" ? DEAD_LIGHT : DEAD_DARK;

  /* ── State ─── */
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState<boolean[][]>(() => createEmptyGrid(DEFAULT_GRID_SIZE));
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [canvasHover, setCanvasHover] = useState(false);

  /* ── Refs ─── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasPixelSize, setCanvasPixelSize] = useState(500);

  const runningRef = useRef(running);
  runningRef.current = running;

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const gridSizeRef = useRef(gridSize);
  gridSizeRef.current = gridSize;

  /* ── Responsive canvas sizing ─── */
  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasPixelSize(Math.min(w, 700));
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ── Draw ─── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = gridSizeRef.current;
    const px = canvas.width;
    const cellSize = (px - CELL_GAP * (size - 1)) / size;

    ctx.clearRect(0, 0, px, px);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = c * (cellSize + CELL_GAP);
        const y = r * (cellSize + CELL_GAP);
        ctx.fillStyle = gridRef.current[r]?.[c] ? GOLD : deadColor;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }, [deadColor]);

  useEffect(() => {
    draw();
  }, [grid, canvasPixelSize, draw]);

  /* ── Game loop ─── */
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setGrid((prev) => {
        const size = gridSizeRef.current;
        const next = nextGeneration(prev, size);
        const pop = populationCount(next);

        if (pop === 0 || gridsEqual(prev, next)) {
          setRunning(false);
          return pop === 0 ? next : prev;
        }

        setGeneration((g) => g + 1);
        return next;
      });
    }, 1000 / speedRef.current);

    return () => clearInterval(interval);
  }, [running, speed]);

  /* ── Canvas click → toggle cell ─── */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      const size = gridSizeRef.current;
      const cellSize = (canvas.width - CELL_GAP * (size - 1)) / size;
      const col = Math.floor(mx / (cellSize + CELL_GAP));
      const row = Math.floor(my / (cellSize + CELL_GAP));

      if (row >= 0 && row < size && col >= 0 && col < size) {
        setGrid((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[row][col] = !copy[row][col];
          return copy;
        });
      }
    },
    []
  );

  /* ── Controls ─── */
  const handlePlayPause = useCallback(() => setRunning((r) => !r), []);

  const handleStep = useCallback(() => {
    setGrid((prev) => {
      const size = gridSizeRef.current;
      const next = nextGeneration(prev, size);
      setGeneration((g) => g + 1);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setGeneration(0);
    setGrid(createEmptyGrid(gridSizeRef.current));
  }, []);

  const handleSoup = useCallback(() => {
    setRunning(false);
    setGeneration(0);
    setGrid(createSoup(gridSizeRef.current));
  }, []);

  const handleGridSizeChange = useCallback((delta: number) => {
    setRunning(false);
    setGridSize((prev) => {
      const next = Math.max(MIN_GRID, Math.min(MAX_GRID, prev + delta));
      setGeneration(0);
      setGrid(createEmptyGrid(next));
      return next;
    });
  }, []);

  const handleSpeedChange = useCallback((delta: number) => {
    setSpeed((prev) => Math.max(MIN_SPEED, Math.min(MAX_SPEED, prev + delta)));
  }, []);

  /* ── Derived stats ─── */
  const pop = populationCount(grid);
  const totalCells = gridSize * gridSize;
  const density = totalCells > 0 ? ((pop / totalCells) * 100).toFixed(1) : "0.0";

  /* ── Render ─────────────────────────────────────────── */
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <header className="flex flex-col gap-3">
        <span className="section-label">Game</span>
        <h2 className="font-display text-h2 text-[var(--text-primary)]">
          Game of Life
        </h2>
        <p className="text-[var(--text-secondary)] max-w-xl leading-relaxed">
          Conway&apos;s cellular automaton. Click cells to seed life, then press
          play and watch complexity emerge from simple rules.
        </p>
      </header>

      {/* Main area: canvas + stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas */}
        <div className="flex-1 min-w-0" ref={containerRef}>
          <VoidPanel className="p-3" hoverable={false}>
            <canvas
              ref={canvasRef}
              width={canvasPixelSize}
              height={canvasPixelSize}
              onClick={handleCanvasClick}
              onMouseEnter={() => setCanvasHover(true)}
              onMouseLeave={() => setCanvasHover(false)}
              className="w-full cursor-crosshair transition-[border-color] duration-200"
              style={{
                display: "block",
                border: `1px solid ${canvasHover ? "var(--border-active)" : "var(--border)"}`,
                imageRendering: "pixelated",
              }}
            />
          </VoidPanel>
        </div>

        {/* Stats sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <VoidPanel className="relative overflow-hidden p-5 flex flex-col gap-5" hoverable={false}>
            {/* Gold accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
              }}
            />

            {/* Generation */}
            <div className="flex flex-col gap-1">
              <span className="section-label">Generation</span>
              <span className="font-display text-[2rem] font-bold leading-none text-gold">
                {generation}
              </span>
            </div>

            {/* Population */}
            <div className="flex flex-col gap-1">
              <span className="section-label">Population</span>
              <span className="font-display text-[2rem] font-bold leading-none text-gold">
                {pop}
              </span>
            </div>

            {/* Density */}
            <div className="flex flex-col gap-1">
              <span className="section-label">Density</span>
              <span className="font-display text-[2rem] font-bold leading-none text-gold">
                {density}%
              </span>
            </div>

            {/* Grid info */}
            <div className="flex flex-col gap-1 pt-3 border-t border-[var(--border)]">
              <span className="section-label">Grid</span>
              <span className="font-display text-sm text-[var(--text-secondary)]">
                {gridSize} &times; {gridSize} ({totalCells} cells)
              </span>
            </div>
          </VoidPanel>
        </div>
      </div>

      {/* Controls */}
      <VoidPanel className="p-4" hoverable={false}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Playback */}
          <div className="flex items-center gap-2">
            <Button variant="gold" onClick={handlePlayPause}>
              {running ? "Pause" : "Play"}
            </Button>
            <Button variant="ghost-gold" onClick={handleStep} disabled={running}>
              Step
            </Button>
            <Button variant="ghost-gold" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="ghost-gold" onClick={handleSoup}>
              Soup
            </Button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />

          {/* Grid size */}
          <div className="flex items-center gap-2">
            <span className="section-label whitespace-nowrap">Grid</span>
            <Button
              variant="ghost-gold"
              className="!px-3 !py-1"
              onClick={() => handleGridSizeChange(-GRID_STEP)}
              disabled={gridSize <= MIN_GRID}
            >
              &minus;
            </Button>
            <span className="font-display text-sm font-bold text-gold w-8 text-center">
              {gridSize}
            </span>
            <Button
              variant="ghost-gold"
              className="!px-3 !py-1"
              onClick={() => handleGridSizeChange(GRID_STEP)}
              disabled={gridSize >= MAX_GRID}
            >
              +
            </Button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="section-label whitespace-nowrap">Speed</span>
            <Button
              variant="ghost-gold"
              className="!px-3 !py-1"
              onClick={() => handleSpeedChange(-SPEED_STEP)}
              disabled={speed <= MIN_SPEED}
            >
              &minus;
            </Button>
            <span className="font-display text-sm font-bold text-gold w-8 text-center">
              {speed}
            </span>
            <Button
              variant="ghost-gold"
              className="!px-3 !py-1"
              onClick={() => handleSpeedChange(SPEED_STEP)}
              disabled={speed >= MAX_SPEED}
            >
              +
            </Button>
          </div>
        </div>
      </VoidPanel>
    </motion.div>
  );
}
