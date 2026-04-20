"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ───────── constants ───────── */
const GRID = 20;
const BASE_SPEED = 150; // ms per tick at level 1
const SPEED_STEP = 8; // ms reduction per level
const POINTS_PER_LEVEL = 5;
const TRAIL_FRAMES = 3;
const GOLD = "#d4af37";
const GOLD_BRIGHT = "#f0d060";
const GOLD_DIM = "#a08520";
const VOID_DEEP = "#0a0a0f";
const GRID_LINE = "rgba(255,255,255,0.04)";

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };
type GameState = "idle" | "playing" | "paused" | "over";

/* helpers */
const eq = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const opposite: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

function randomFood(snake: Pos[]): Pos {
  let p: Pos;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => eq(s, p)));
  return p;
}

/* ───────── component ───────── */
export default function SnakePage() {
  /* refs */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTickRef = useRef<number>(0);
  const dirRef = useRef<Dir>("RIGHT");
  const nextDirRef = useRef<Dir>("RIGHT");
  const snakeRef = useRef<Pos[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Pos>(randomFood(snakeRef.current));
  const trailRef = useRef<Pos[][]>([]);
  const stateRef = useRef<GameState>("idle");
  const scoreRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  /* state (for UI re-renders) */
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [canvasSize, setCanvasSize] = useState(500);

  /* sync ref helpers */
  const syncState = useCallback((s: GameState) => {
    stateRef.current = s;
    setGameState(s);
  }, []);

  /* ── responsive canvas ── */
  useEffect(() => {
    const resize = () => setCanvasSize(Math.min(500, Math.round(window.innerWidth * 0.9)));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ── load best score ── */
  useEffect(() => {
    const stored = localStorage.getItem("snake-best-score");
    if (stored) setBest(Number(stored));
  }, []);

  /* ── speed from score ── */
  const levelFromScore = (s: number) => Math.floor(s / POINTS_PER_LEVEL) + 1;
  const intervalFromLevel = (lvl: number) => Math.max(50, BASE_SPEED - (lvl - 1) * SPEED_STEP);

  /* ── reset game ── */
  const resetGame = useCallback(() => {
    const start: Pos[] = [{ x: 10, y: 10 }];
    snakeRef.current = start;
    foodRef.current = randomFood(start);
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    trailRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setSpeed(1);
    lastTickRef.current = 0;
  }, []);

  /* ── start / restart ── */
  const startGame = useCallback(() => {
    resetGame();
    syncState("playing");
  }, [resetGame, syncState]);

  /* ── toggle pause ── */
  const togglePause = useCallback(() => {
    if (stateRef.current === "playing") {
      syncState("paused");
    } else if (stateRef.current === "paused") {
      lastTickRef.current = 0;
      syncState("playing");
    }
  }, [syncState]);

  /* ── direction change ── */
  const changeDir = useCallback((d: Dir) => {
    if (opposite[d] !== dirRef.current) {
      nextDirRef.current = d;
    }
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT",
      };
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (stateRef.current === "idle" || stateRef.current === "over") startGame();
        else togglePause();
        return;
      }
      if (map[e.key]) {
        e.preventDefault();
        changeDir(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startGame, togglePause, changeDir]);

  /* ── touch swipe ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };
    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 20) {
        // tap
        if (stateRef.current === "idle" || stateRef.current === "over") startGame();
        else togglePause();
        touchStartRef.current = null;
        return;
      }
      if (absDx > absDy) changeDir(dx > 0 ? "RIGHT" : "LEFT");
      else changeDir(dy > 0 ? "DOWN" : "UP");
      touchStartRef.current = null;
    };
    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [startGame, togglePause, changeDir]);

  /* ── game loop (tick + draw) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const foodPulseStart = Date.now();

    const tick = () => {
      const snake = snakeRef.current;
      const dir = nextDirRef.current;
      dirRef.current = dir;

      const head = snake[0];
      const next: Pos = {
        x: head.x + (dir === "RIGHT" ? 1 : dir === "LEFT" ? -1 : 0),
        y: head.y + (dir === "DOWN" ? 1 : dir === "UP" ? -1 : 0),
      };

      // collision: wall
      if (next.x < 0 || next.x >= GRID || next.y < 0 || next.y >= GRID) {
        syncState("over");
        const s = scoreRef.current;
        const stored = Number(localStorage.getItem("snake-best-score") || "0");
        if (s > stored) {
          localStorage.setItem("snake-best-score", String(s));
          setBest(s);
        }
        return;
      }
      // collision: self
      if (snake.some((seg) => eq(seg, next))) {
        syncState("over");
        const s = scoreRef.current;
        const stored = Number(localStorage.getItem("snake-best-score") || "0");
        if (s > stored) {
          localStorage.setItem("snake-best-score", String(s));
          setBest(s);
        }
        return;
      }

      // store trail
      trailRef.current.unshift([...snake]);
      if (trailRef.current.length > TRAIL_FRAMES) trailRef.current.pop();

      const ate = eq(next, foodRef.current);
      const newSnake = [next, ...snake];
      if (!ate) newSnake.pop();
      snakeRef.current = newSnake;

      if (ate) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        const lvl = levelFromScore(scoreRef.current);
        setSpeed(lvl);
        foodRef.current = randomFood(newSnake);
      }
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const c = w / GRID;

      // clear
      ctx.fillStyle = VOID_DEEP;
      ctx.fillRect(0, 0, w, h);

      // grid lines
      ctx.strokeStyle = GRID_LINE;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * c, 0);
        ctx.lineTo(i * c, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * c);
        ctx.lineTo(w, i * c);
        ctx.stroke();
      }

      // trail
      trailRef.current.forEach((trail, ti) => {
        const alpha = 0.12 - ti * 0.035;
        if (alpha <= 0) return;
        ctx.fillStyle = `rgba(212,175,55,${alpha})`;
        trail.forEach((seg) => {
          const r = c * 0.38;
          ctx.beginPath();
          ctx.roundRect(
            seg.x * c + (c - r * 2) / 2,
            seg.y * c + (c - r * 2) / 2,
            r * 2,
            r * 2,
            r * 0.4
          );
          ctx.fill();
        });
      });

      // snake body
      const snake = snakeRef.current;
      snake.forEach((seg, i) => {
        const t = i / Math.max(snake.length - 1, 1);
        const r = c * 0.42;
        const x = seg.x * c + (c - r * 2) / 2;
        const y = seg.y * c + (c - r * 2) / 2;

        // gradient per segment: head brighter, tail dimmer
        const grad = ctx.createLinearGradient(x, y, x + r * 2, y + r * 2);
        if (i === 0) {
          grad.addColorStop(0, GOLD_BRIGHT);
          grad.addColorStop(1, GOLD);
        } else {
          const mix = 1 - t * 0.5;
          const hexLerp = (a: number, b: number) => Math.round(a + (b - a) * mix);
          const rr = hexLerp(160, 212),
            gg = hexLerp(133, 175),
            bb = hexLerp(32, 55);
          grad.addColorStop(0, `rgb(${rr},${gg},${bb})`);
          grad.addColorStop(1, GOLD_DIM);
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, r * 2, r * 2, r * 0.45);
        ctx.fill();

        // head eyes
        if (i === 0) {
          const dir = dirRef.current;
          const cx = seg.x * c + c / 2;
          const cy = seg.y * c + c / 2;
          const eyeOff = c * 0.14;
          const eyeR = c * 0.06;
          const fwd =
            dir === "UP"
              ? { x: 0, y: -1 }
              : dir === "DOWN"
                ? { x: 0, y: 1 }
                : dir === "LEFT"
                  ? { x: -1, y: 0 }
                  : { x: 1, y: 0 };
          const perp = { x: -fwd.y, y: fwd.x };

          ctx.fillStyle = VOID_DEEP;
          // left eye
          ctx.beginPath();
          ctx.arc(
            cx + fwd.x * eyeOff + perp.x * eyeOff,
            cy + fwd.y * eyeOff + perp.y * eyeOff,
            eyeR,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // right eye
          ctx.beginPath();
          ctx.arc(
            cx + fwd.x * eyeOff - perp.x * eyeOff,
            cy + fwd.y * eyeOff - perp.y * eyeOff,
            eyeR,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      // food with pulse + glow
      const food = foodRef.current;
      const elapsed = (Date.now() - foodPulseStart) / 1000;
      const pulse = 1 + Math.sin(elapsed * 4) * 0.12;
      const fr = c * 0.32 * pulse;
      const fx = food.x * c + c / 2;
      const fy = food.y * c + c / 2;

      // glow
      const glow = ctx.createRadialGradient(fx, fy, fr * 0.2, fx, fy, fr * 2.5);
      glow.addColorStop(0, "rgba(212,175,55,0.35)");
      glow.addColorStop(1, "rgba(212,175,55,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx, fy, fr * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // solid circle
      const foodGrad = ctx.createRadialGradient(fx - fr * 0.3, fy - fr * 0.3, fr * 0.1, fx, fy, fr);
      foodGrad.addColorStop(0, GOLD_BRIGHT);
      foodGrad.addColorStop(1, GOLD);
      ctx.fillStyle = foodGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (ts: number) => {
      if (stateRef.current === "playing") {
        const lvl = levelFromScore(scoreRef.current);
        const interval = intervalFromLevel(lvl);
        if (!lastTickRef.current) lastTickRef.current = ts;
        if (ts - lastTickRef.current >= interval) {
          lastTickRef.current = ts;
          tick();
        }
      }
      draw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, syncState]);

  /* ── mobile direction buttons ── */
  const DirButton = ({ dir, label }: { dir: Dir; label: string }) => (
    <Button variant="ghost-gold" className="w-14 h-14 text-xl p-0" onClick={() => changeDir(dir)}>
      {label}
    </Button>
  );

  return (
    <motion.main
      className="min-h-screen bg-void-deep flex flex-col items-center justify-center px-4 py-12 gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* header */}
      <div className="text-center space-y-2">
        <SectionLabel>GAME</SectionLabel>
        <h2 className="text-display font-display text-3xl md:text-4xl text-gold">Snake</h2>
      </div>

      {/* stats */}
      <div className="flex gap-3">
        {[
          { label: "Score", value: score },
          { label: "Best", value: best },
          { label: "Speed", value: speed },
        ].map((s) => (
          <VoidPanel key={s.label} hoverable={false} className="px-4 py-2 text-center min-w-[80px]">
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-text-secondary font-display">
              {s.label}
            </p>
            <p className="text-gold text-lg font-display font-bold">{s.value}</p>
          </VoidPanel>
        ))}
      </div>

      {/* canvas wrapper */}
      <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
        <VoidPanel hoverable={false} className="p-0 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="block"
            style={{ width: canvasSize, height: canvasSize }}
          />
        </VoidPanel>

        {/* start overlay */}
        {gameState === "idle" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-void-deep/80 backdrop-blur-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gold font-display text-lg mb-2">Press SPACE or tap to start</p>
            <p className="text-text-secondary text-xs font-display">Arrow keys / WASD to move</p>
          </motion.div>
        )}

        {/* paused overlay */}
        {gameState === "paused" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-void-deep/60 backdrop-blur-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gold font-display text-2xl">Paused</p>
          </motion.div>
        )}

        {/* game over overlay */}
        {gameState === "over" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-void-deep/80 backdrop-blur-md z-10 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-gold font-display text-2xl">Game Over</p>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-display">
                  Score
                </p>
                <p className="text-gold text-3xl font-display font-bold">{score}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-display">
                  Best
                </p>
                <p className="text-gold text-3xl font-display font-bold">{best}</p>
              </div>
            </div>
            <Button variant="gold" onClick={startGame}>
              Play Again
            </Button>
          </motion.div>
        )}
      </div>

      {/* mobile controls - only visible on touch devices via media query */}
      <div className="flex flex-col items-center gap-1 md:hidden">
        <DirButton dir="UP" label="\u25B2" />
        <div className="flex gap-1">
          <DirButton dir="LEFT" label="\u25C0" />
          <Button
            variant="ghost-gold"
            className="w-14 h-14 text-[0.6rem] p-0 font-display"
            onClick={togglePause}
          >
            {gameState === "paused" ? "PLAY" : "PAUSE"}
          </Button>
          <DirButton dir="RIGHT" label="\u25B6" />
        </div>
        <DirButton dir="DOWN" label="\u25BC" />
      </div>

      {/* footer hint */}
      <p className="text-text-secondary text-xs font-display tracking-wide">
        SPACE to pause &middot; Arrow keys or WASD to steer
      </p>
    </motion.main>
  );
}
