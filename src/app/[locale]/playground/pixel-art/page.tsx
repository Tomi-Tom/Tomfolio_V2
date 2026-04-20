"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Tool = "draw" | "erase" | "fill" | "pick";
type GridSize = 8 | 16 | 32;

const GRID_SIZES: GridSize[] = [8, 16, 32];
const MAX_HISTORY = 20;

const PRESET_COLORS = [
  "#000000", // black
  "#ffffff", // white
  "#d4af37", // gold
  "#e63946", // red
  "#f77f00", // orange
  "#fcbf49", // yellow
  "#2a9d8f", // green
  "#00b4d8", // cyan
  "#3a86ff", // blue
  "#7b2d8e", // purple
  "#ff6b9d", // pink
  "#8b5e3c", // brown
  "#555555", // dark gray
  "#bbbbbb", // light gray
  "#1b2838", // navy
  "#2d6a4f", // forest green
];

/* ------------------------------------------------------------------ */
/*  SVG tool icons                                                     */
/* ------------------------------------------------------------------ */

function PencilIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

function FillIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
      <path d="m5 2 5 5" />
      <path d="M2 13h15" />
      <path d="M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z" />
    </svg>
  );
}

function EyedropperIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9" />
      <path d="m15 6 3 3" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 0 1 15-6.7L21 9" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M21 13a9 9 0 0 0-15-6.7L3 9" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createEmptyGrid(size: GridSize): (string | null)[][] {
  return Array.from({ length: size }, () => Array.from<string | null>({ length: size }).fill(null));
}

function cloneGrid(grid: (string | null)[][]): (string | null)[][] {
  return grid.map((row) => [...row]);
}

/** BFS flood fill */
function floodFill(
  grid: (string | null)[][],
  startX: number,
  startY: number,
  fillColor: string
): (string | null)[][] {
  const size = grid.length;
  const target = grid[startY][startX];
  if (target === fillColor) return grid;

  const result = cloneGrid(grid);
  const queue: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  visited.add(key(startX, startY));

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    result[y][x] = fillColor;

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
      if (visited.has(key(nx, ny))) continue;
      if (result[ny][nx] !== target) continue;
      visited.add(key(nx, ny));
      queue.push([nx, ny]);
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PixelArtEditor() {
  const t = useTranslations("playground.pixelArt");
  const [gridSize, setGridSize] = useState<GridSize>(16);
  const [grid, setGrid] = useState<(string | null)[][]>(() => createEmptyGrid(16));
  const [tool, setTool] = useState<Tool>("draw");
  const [color, setColor] = useState("#d4af37");
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // History
  const [undoStack, setUndoStack] = useState<(string | null)[][][]>([]);
  const [redoStack, setRedoStack] = useState<(string | null)[][][]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- push history snapshot ---- */
  const pushHistory = useCallback((prevGrid: (string | null)[][]) => {
    setUndoStack((prev) => {
      const next = [...prev, cloneGrid(prevGrid)];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setRedoStack([]);
  }, []);

  /* ---- undo / redo ---- */
  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const stack = [...prev];
      const snapshot = stack.pop()!;
      setRedoStack((r) => [...r, cloneGrid(grid)]);
      setGrid(snapshot);
      return stack;
    });
  }, [grid]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const stack = [...prev];
      const snapshot = stack.pop()!;
      setUndoStack((u) => {
        const next = [...u, cloneGrid(grid)];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      setGrid(snapshot);
      return stack;
    });
  }, [grid]);

  /* ---- change grid size ---- */
  const changeGridSize = useCallback(
    (size: GridSize) => {
      if (size === gridSize) return;
      pushHistory(grid);
      setGridSize(size);
      setGrid(createEmptyGrid(size));
    },
    [gridSize, grid, pushHistory]
  );

  /* ---- clear canvas ---- */
  const clearCanvas = useCallback(() => {
    pushHistory(grid);
    setGrid(createEmptyGrid(gridSize));
    setConfirmClear(false);
  }, [grid, gridSize, pushHistory]);

  /* ---- pixel coordinates from mouse/touch ---- */
  const getPixelCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ("touches" in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = Math.floor(((clientX - rect.left) / rect.width) * gridSize);
      const y = Math.floor(((clientY - rect.top) / rect.height) * gridSize);
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
      return { x, y };
    },
    [gridSize]
  );

  /* ---- apply tool at pixel ---- */
  const applyTool = useCallback(
    (x: number, y: number, activeTool: Tool, saveHistory: boolean) => {
      setGrid((prev) => {
        if (activeTool === "draw") {
          if (prev[y][x] === color) return prev;
          if (saveHistory) pushHistory(prev);
          const next = cloneGrid(prev);
          next[y][x] = color;
          return next;
        }
        if (activeTool === "erase") {
          if (prev[y][x] === null) return prev;
          if (saveHistory) pushHistory(prev);
          const next = cloneGrid(prev);
          next[y][x] = null;
          return next;
        }
        if (activeTool === "fill") {
          if (saveHistory) pushHistory(prev);
          return floodFill(prev, x, y, color);
        }
        if (activeTool === "pick") {
          const picked = prev[y][x];
          if (picked) setColor(picked);
          setTool("draw");
          return prev;
        }
        return prev;
      });
    },
    [color, pushHistory]
  );

  /* ---- mouse / touch handlers ---- */
  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const coords = getPixelCoords(e);
      if (!coords) return;

      // Right-click → erase
      if (e.button === 2) {
        applyTool(coords.x, coords.y, "erase", true);
        setIsDrawing(true);
        return;
      }

      if (tool === "fill" || tool === "pick") {
        applyTool(coords.x, coords.y, tool, true);
        return;
      }

      applyTool(coords.x, coords.y, tool, true);
      setIsDrawing(true);
    },
    [getPixelCoords, applyTool, tool]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const coords = getPixelCoords(e);
      if (!coords) return;
      // While dragging, use current tool (or erase if right-click started it)
      const activeTool =
        e.buttons === 2 ? "erase" : tool === "draw" || tool === "erase" ? tool : "draw";
      applyTool(coords.x, coords.y, activeTool, false);
    },
    [isDrawing, getPixelCoords, tool, applyTool]
  );

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const coords = getPixelCoords(e);
      if (!coords) return;
      if (tool === "fill" || tool === "pick") {
        applyTool(coords.x, coords.y, tool, true);
        return;
      }
      applyTool(coords.x, coords.y, tool, true);
      setIsDrawing(true);
    },
    [getPixelCoords, applyTool, tool]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const coords = getPixelCoords(e);
      if (!coords) return;
      applyTool(coords.x, coords.y, tool === "draw" || tool === "erase" ? tool : "draw", false);
    },
    [isDrawing, getPixelCoords, tool, applyTool]
  );

  /* ---- prevent context menu on canvas ---- */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  /* ---- render canvas ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / gridSize;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background (void deep)
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, size, size);

    // Draw pixels
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const c = grid[y]?.[x];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Grid lines
    if (showGrid) {
      ctx.strokeStyle = "rgba(212,175,55,0.12)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridSize; i++) {
        const pos = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(size, pos);
        ctx.stroke();
      }
    }
  }, [grid, gridSize, showGrid]);

  /* ---- export PNG ---- */
  const exportPng = useCallback(() => {
    // Render a clean export canvas without grid lines
    const exportCanvas = document.createElement("canvas");
    const exportSize = gridSize * 32; // nice crisp pixels
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext("2d")!;
    const cellSize = exportSize / gridSize;

    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, exportSize, exportSize);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const c = grid[y]?.[x];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    const link = document.createElement("a");
    link.download = `pixel-art-${gridSize}x${gridSize}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }, [grid, gridSize]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ---- tool config ---- */
  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: "draw", label: t("tools.draw"), icon: <PencilIcon /> },
    { id: "erase", label: t("tools.erase"), icon: <EraserIcon /> },
    { id: "fill", label: t("tools.fill"), icon: <FillIcon /> },
    { id: "pick", label: t("tools.pick"), icon: <EyedropperIcon /> },
  ];

  return (
    <div className="min-h-screen bg-void-deep px-4 py-12 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-6xl"
      >
        {/* ---- Header ---- */}
        <header className="mb-8 text-center">
          <SectionLabel>{t("category")}</SectionLabel>
          <h2 className="mt-2 font-display text-display text-gold">{t("title")}</h2>
        </header>

        {/* ---- Main layout ---- */}
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center">
          {/* ---- Left toolbar ---- */}
          <VoidPanel hoverable={false} className="flex flex-row gap-2 p-3 lg:flex-col lg:gap-3">
            {tools.map((toolItem) => (
              <button
                key={toolItem.id}
                title={toolItem.label}
                onClick={() => setTool(toolItem.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-md transition-all ${
                  tool === toolItem.id
                    ? "bg-gold text-void-deep shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                    : "text-text-secondary hover:text-gold hover:bg-gold/10"
                }`}
              >
                {toolItem.icon}
              </button>
            ))}

            {/* Divider */}
            <div className="hidden h-px w-full bg-[var(--border)] lg:block" />
            <div className="block h-full w-px bg-[var(--border)] lg:hidden" />

            {/* Grid toggle */}
            <button
              title={showGrid ? t("hideGrid") : t("showGrid")}
              onClick={() => setShowGrid((s) => !s)}
              className={`flex h-10 w-10 items-center justify-center rounded-md transition-all ${
                showGrid
                  ? "text-gold bg-gold/10"
                  : "text-text-secondary hover:text-gold hover:bg-gold/10"
              }`}
            >
              <GridIcon />
            </button>
          </VoidPanel>

          {/* ---- Canvas ---- */}
          <div className="flex flex-col items-center gap-4">
            {/* Grid size pills */}
            <div className="flex gap-2">
              {GRID_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeGridSize(s)}
                  className={`rounded-full px-4 py-1.5 font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase transition-all ${
                    gridSize === s
                      ? "bg-gold text-void-deep shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      : "border border-[var(--border)] text-text-secondary hover:border-gold hover:text-gold"
                  }`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>

            <VoidPanel hoverable={false} className="p-2">
              <div
                ref={containerRef}
                className="relative"
                style={{ width: "min(500px, 85vw)", height: "min(500px, 85vw)" }}
              >
                <canvas
                  ref={canvasRef}
                  width={1024}
                  height={1024}
                  className="h-full w-full cursor-crosshair"
                  style={{ imageRendering: "pixelated" }}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handlePointerUp}
                  onContextMenu={handleContextMenu}
                />
              </div>
            </VoidPanel>

            {/* Action row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="ghost-gold"
                disabled={undoStack.length === 0}
                onClick={undo}
                className="gap-1.5 disabled:opacity-30"
              >
                <UndoIcon /> {t("undo")}
              </Button>
              <Button
                variant="ghost-gold"
                disabled={redoStack.length === 0}
                onClick={redo}
                className="gap-1.5 disabled:opacity-30"
              >
                <RedoIcon /> {t("redo")}
              </Button>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-red-400 transition-colors hover:text-red-300 px-4 py-2"
                >
                  {t("clear")}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-red-400 hover:text-red-300 px-3 py-2"
                  >
                    {t("confirm")}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-text-secondary hover:text-text-primary px-3 py-2"
                  >
                    {t("cancel")}
                  </button>
                </div>
              )}

              <Button variant="gold" onClick={exportPng} className="gap-1.5">
                <DownloadIcon /> {t("exportPng")}
              </Button>
            </div>
          </div>

          {/* ---- Right panel: palette ---- */}
          <VoidPanel hoverable={false} className="p-4">
            <p className="mb-3 font-display text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-text-secondary">
              {t("palette")}
            </p>

            {/* Color swatches — 4 columns */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    if (tool === "erase" || tool === "pick") setTool("draw");
                  }}
                  title={c}
                  className="relative transition-transform"
                  style={{ width: 28, height: 28 }}
                >
                  <span
                    className={`block h-full w-full rounded-sm border transition-all ${
                      color === c
                        ? "border-gold scale-110 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                        : "border-[var(--border)] hover:border-gold/50"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                </button>
              ))}
            </div>

            {/* Custom color */}
            <div className="mt-4 flex items-center gap-3">
              <label
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[var(--border)]"
                title={t("customColor")}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (tool === "erase" || tool === "pick") setTool("draw");
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span className="h-full w-full" style={{ backgroundColor: color }} />
              </label>
              <span className="font-mono text-xs text-text-secondary">{color.toUpperCase()}</span>
            </div>

            {/* Current color preview */}
            <div className="mt-4">
              <p className="mb-1.5 font-display text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-text-secondary">
                {t("active")}
              </p>
              <div
                className="h-8 w-full rounded-md border border-[var(--border)] shadow-inner"
                style={{ backgroundColor: color }}
              />
            </div>
          </VoidPanel>
        </div>
      </motion.div>
    </div>
  );
}
