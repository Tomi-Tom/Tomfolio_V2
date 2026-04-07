"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Passages                                                          */
/* ------------------------------------------------------------------ */

const PASSAGES = [
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Design is not just what it looks like and feels like. Design is how it works.",
  "The best error message is the one that never shows up. Prevention is always better than cure in software design.",
  "Simplicity is the ultimate sophistication. In code and in design, removing the unnecessary is the hardest task.",
  "First, solve the problem. Then, write the code. Rushing to implementation is the root of all technical debt.",
  "Good design is as little design as possible. Less, but better, because it concentrates on the essential aspects.",
  "Code is like humor. When you have to explain it, it is bad. Strive for clarity above all else.",
  "The function of good software is to make the complex appear to be simple. That is the art of engineering.",
  "Talk is cheap. Show me the code. Actions speak louder than words in every pull request and every deploy.",
  "Make it work, make it right, make it fast. In that order. Premature optimization is the root of all evil.",
  "A user interface is like a joke. If you have to explain it, it is not that good. Intuition should guide the hand.",
  "The best way to predict the future is to invent it. Technology gives us the tools; imagination gives us the vision.",
  "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
  "Programs must be written for people to read, and only incidentally for machines to execute. Clarity is king.",
  "Every great design begins with an even better story. The narrative shapes the experience and gives it meaning.",
];

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Duration = 30 | 60 | 120;
type GameState = "idle" | "running" | "finished";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function pickPassage(exclude?: string): string {
  const pool = exclude ? PASSAGES.filter((p) => p !== exclude) : PASSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildText(duration: Duration): string {
  // Concatenate enough passages to fill the duration comfortably
  const target = duration === 30 ? 2 : duration === 60 ? 4 : 7;
  const parts: string[] = [];
  let last = "";
  for (let i = 0; i < target; i++) {
    const p = pickPassage(last);
    parts.push(p);
    last = p;
  }
  return parts.join(" ");
}

function loadBestWpm(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem("typing-test-best-wpm") || "0");
}

function saveBestWpm(wpm: number): void {
  if (typeof window === "undefined") return;
  const prev = loadBestWpm();
  if (wpm > prev) localStorage.setItem("typing-test-best-wpm", String(wpm));
}

/* ------------------------------------------------------------------ */
/*  Animated number                                                   */
/* ------------------------------------------------------------------ */

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function TypingTestPage() {
  /* state */
  const [duration, setDuration] = useState<Duration>(30);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [text, setText] = useState(() => buildText(30));
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [soundFx, setSoundFx] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [bestWpm, setBestWpm] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  /* load best on mount */
  useEffect(() => {
    setBestWpm(loadBestWpm());
  }, []);

  /* timer tick */
  useEffect(() => {
    if (gameState !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  /* derived stats */
  const correctChars = typed.split("").filter((c, i) => c === text[i]).length;
  const totalChars = typed.length;
  const elapsedSec = duration - timeLeft || 1;
  const wpm = Math.round((correctChars / 5) / (elapsedSec / 60));
  const accuracy = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);

  /* save best when finished */
  useEffect(() => {
    if (gameState === "finished") {
      saveBestWpm(wpm);
      setBestWpm(loadBestWpm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  /* key pulse effect */
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 120);
    return () => clearTimeout(t);
  }, [pulse]);

  /* handlers */
  const startGame = useCallback(
    (dur?: Duration) => {
      const d = dur ?? duration;
      const newText = buildText(d);
      setText(newText);
      setTyped("");
      setTimeLeft(d);
      setGameState("idle");
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [duration],
  );

  const changeDuration = useCallback(
    (d: Duration) => {
      setDuration(d);
      startGame(d);
    },
    [startGame],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (gameState === "finished") return;
      const value = e.target.value;

      // start on first keystroke
      if (gameState === "idle" && value.length === 1) {
        setGameState("running");
        startTimeRef.current = Date.now();
      }

      // don't exceed text length
      if (value.length > text.length) return;

      setTyped(value);
      if (soundFx) setPulse(true);

      // finished all text before time ran out
      if (value.length === text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState("finished");
      }
    },
    [gameState, text, soundFx],
  );

  const focusInput = () => inputRef.current?.focus();

  /* ---------------------------------------------------------------- */
  /*  Render helpers                                                  */
  /* ---------------------------------------------------------------- */

  const renderText = () => (
    <div
      className="font-mono text-base sm:text-lg leading-relaxed tracking-wide select-none cursor-text"
      onClick={focusInput}
    >
      {text.split("").map((char, i) => {
        const isCurrent = i === typed.length;
        const isTyped = i < typed.length;
        const isCorrect = isTyped && typed[i] === char;
        const isWrong = isTyped && typed[i] !== char;

        let cls = "text-[var(--text-dim)] transition-colors duration-75";
        if (isCorrect) cls = "text-[var(--gold)]";
        if (isWrong) cls = "text-red-400 bg-red-500/10 rounded-sm";
        if (isCurrent) cls += " border-b-2 border-[var(--gold)] animate-pulse";

        return (
          <span key={i} className={cls}>
            {char}
          </span>
        );
      })}
    </div>
  );

  const progressPct = gameState === "idle" ? 100 : (timeLeft / duration) * 100;

  /* ---------------------------------------------------------------- */
  /*  JSX                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] py-16 px-4 sm:px-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <SectionLabel>GAME</SectionLabel>
          <h2 className="font-display text-display text-[var(--text-primary)]">
            Typing Speed Test
          </h2>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {([30, 60, 120] as Duration[]).map((d) => (
            <Button
              key={d}
              variant={duration === d ? "gold" : "ghost-gold"}
              onClick={() => changeDuration(d)}
              className="min-w-[64px]"
            >
              {d}s
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSoundFx((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                soundFx ? "bg-[var(--gold)]" : "bg-[var(--border)]"
              }`}
              aria-label="Toggle keystroke feedback"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--bg-deep)] transition-transform duration-200 ${
                  soundFx ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-xs text-[var(--text-secondary)] tracking-wider uppercase font-display">
              Key FX
            </span>
          </div>
        </div>

        {/* Text display */}
        <VoidPanel
          hoverable={false}
          className={`p-6 sm:p-8 min-h-[200px] relative overflow-y-auto max-h-[320px] ${
            pulse ? "ring-1 ring-[var(--gold)]/30" : ""
          }`}
        >
          {gameState === "idle" && typed.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-dim)] font-display tracking-widest uppercase pointer-events-none"
            >
              Start typing to begin...
            </motion.p>
          )}
          {renderText()}
          {/* Hidden input */}
          <input
            ref={inputRef}
            value={typed}
            onChange={handleInput}
            className="absolute opacity-0 w-0 h-0"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={gameState === "finished"}
          />
        </VoidPanel>

        {/* Progress bar */}
        <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--gold)]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <VoidPanel hoverable={false} className="p-4 flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-secondary)] font-display tracking-widest uppercase">
              WPM
            </span>
            <span className="text-3xl font-display text-[var(--gold)]">
              <AnimatedNumber value={gameState === "idle" ? 0 : wpm} />
            </span>
          </VoidPanel>

          <VoidPanel hoverable={false} className="p-4 flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-secondary)] font-display tracking-widest uppercase">
              Accuracy
            </span>
            <span className="text-3xl font-display text-[var(--gold)]">
              <AnimatedNumber value={accuracy} />
              <span className="text-lg">%</span>
            </span>
          </VoidPanel>

          <VoidPanel hoverable={false} className="p-4 flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-secondary)] font-display tracking-widest uppercase">
              Time Left
            </span>
            <span className="text-3xl font-display text-[var(--gold)]">
              <AnimatedNumber value={timeLeft} />
              <span className="text-lg">s</span>
            </span>
          </VoidPanel>
        </div>

        {/* Characters typed (secondary stat) */}
        <div className="flex justify-center">
          <span className="text-xs text-[var(--text-dim)] font-display tracking-widest">
            {totalChars} characters typed
          </span>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------ */}
      {/*  End screen overlay                                          */}
      {/* ------------------------------------------------------------ */}
      <AnimatePresence>
        {gameState === "finished" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={focusInput}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <VoidPanel hoverable={false} className="p-8 sm:p-12 flex flex-col items-center gap-6 max-w-md w-full">
                <SectionLabel>RESULTS</SectionLabel>

                {/* Big WPM */}
                <div className="flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-7xl font-display text-[var(--gold)]"
                    style={{ textShadow: "0 0 32px rgba(212,175,55,0.4)" }}
                  >
                    {wpm}
                  </motion.span>
                  <span className="text-sm text-[var(--text-secondary)] font-display tracking-widest uppercase">
                    Words per Minute
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-display text-[var(--text-primary)]">
                      {accuracy}%
                    </span>
                    <span className="text-xs text-[var(--text-dim)] tracking-wider uppercase">
                      Accuracy
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-display text-[var(--text-primary)]">
                      {totalChars}
                    </span>
                    <span className="text-xs text-[var(--text-dim)] tracking-wider uppercase">
                      Characters
                    </span>
                  </div>
                </div>

                {/* Best score comparison */}
                <div className="w-full border-t border-[var(--border)] pt-4 text-center">
                  {wpm >= bestWpm && bestWpm > 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-[var(--gold)] font-display tracking-wider"
                    >
                      NEW PERSONAL BEST!
                    </motion.p>
                  ) : wpm >= bestWpm && bestWpm === 0 ? (
                    <p className="text-sm text-[var(--gold)] font-display tracking-wider">
                      FIRST SCORE RECORDED!
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-dim)] font-display tracking-wider">
                      Best: {bestWpm} WPM
                    </p>
                  )}
                </div>

                {/* New Game */}
                <Button
                  variant="gold"
                  onClick={() => startGame()}
                  className="mt-2 w-full"
                >
                  New Game
                </Button>
              </VoidPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
