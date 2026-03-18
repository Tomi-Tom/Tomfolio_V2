"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  SVG heart path (reused for main icon + particles)                 */
/* ------------------------------------------------------------------ */
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function HeartSvg({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
    >
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Particle = {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  drift: number;
};

/* ------------------------------------------------------------------ */
/*  Love quotes                                                       */
/* ------------------------------------------------------------------ */
const LOVE_QUOTES = [
  "Counting down to our cuddles!",
  "Soon we'll be together again!",
  "Distance is temporary, love is forever!",
  "Every second brings us closer!",
  "Can't wait to hug you tight!",
];

/* ------------------------------------------------------------------ */
/*  Time formatting                                                   */
/* ------------------------------------------------------------------ */
function formatTime(ms: number) {
  const total = Math.max(0, ms);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return {
    days,
    timeString: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Main inner component (needs useSearchParams -> wrapped in Suspense)*/
/* ------------------------------------------------------------------ */
function LoveTimerContent() {
  /* ---- Read config from search params ---- */
  const searchParams = useSearchParams();

  const targetDate = (() => {
    const raw = searchParams.get("date");
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
    // Default: 30 days from now
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  })();

  const title = searchParams.get("title") || "Countdown";
  const subtitle = searchParams.get("message") || "Every second counts";

  /* ---- State ---- */
  const [timeLeft, setTimeLeft] = useState(() => targetDate.getTime() - Date.now());
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const particleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrame = useRef<number>(0);
  const cursorPos = useRef({ x: 0, y: 0 });

  /* ---- Countdown tick ---- */
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(targetDate.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  /* ---- Particle physics via rAF ---- */
  useEffect(() => {
    let running = true;

    const tick = () => {
      if (!running) return;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.sin(Date.now() * 0.001 + p.drift) * p.speed * 0.4,
            y: p.y - p.speed,
            rotation: p.rotation + p.speed * 0.5,
          }))
          .filter((p) => p.y + p.size > -20)
      );
      animFrame.current = requestAnimationFrame(tick);
    };

    animFrame.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(animFrame.current);
    };
  }, []);

  /* ---- Click count easter egg ---- */
  useEffect(() => {
    if (clickCount >= 10 && !showMessage) {
      setShowMessage(true);
      const t = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(t);
    }
  }, [clickCount, showMessage]);

  /* ---- Particle helpers ---- */
  const addParticle = useCallback(() => {
    const p: Particle = {
      id: Math.random().toString(36).slice(2, 10),
      x: cursorPos.current.x - 12 + (Math.random() - 0.5) * 40,
      y: cursorPos.current.y - 12,
      size: 18 + Math.random() * 24,
      speed: 1.5 + Math.random() * 2.5,
      rotation: Math.random() * 360,
      drift: Math.random() * 100,
    };
    setParticles((prev) => [...prev, p]);
  }, []);

  const trackCursor = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      cursorPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const startCreatingParticles = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      trackCursor(e);
      setIsPressed(true);
      setClickCount((c) => c + 1);
      if (particleInterval.current) clearInterval(particleInterval.current);
      addParticle();
      particleInterval.current = setInterval(addParticle, 80);
    },
    [addParticle, trackCursor]
  );

  const stopCreatingParticles = useCallback(() => {
    setIsPressed(false);
    if (particleInterval.current) {
      clearInterval(particleInterval.current);
      particleInterval.current = null;
    }
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (isPressed) trackCursor(e);
    },
    [isPressed, trackCursor]
  );

  /* ---- Derived values ---- */
  const timer = formatTime(timeLeft);
  const currentQuote =
    subtitle !== "Every second counts"
      ? subtitle
      : LOVE_QUOTES[Math.abs(timer.days) % LOVE_QUOTES.length];

  const formattedTarget = targetDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* ---- Render ---- */
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void-deep">
      {/* Gold mesh pattern background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 6C20 6 15 17 15 17S10 6 0 6s4 14 15 26S30 52 30 52s4-8 15-20S60 6 50 6s-10 11-10 11S40 6 30 6z' fill='%23d4af37' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "100px",
        }}
      />

      {/* Radial gold glow behind card */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(700px, 90vw)",
          height: "min(700px, 90vh)",
          background:
            "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      {/* StatusBar-like header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-sm tracking-[0.3em] text-gold transition-opacity hover:opacity-80"
        >
          TBP.DEV
        </Link>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 pb-16">
        {/* Title */}
        <motion.h1
          className="mb-3 text-center font-display text-3xl font-bold sm:text-4xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-gold">{title}</span>
        </motion.h1>

        {/* Subtitle / quote */}
        <motion.p
          className="mb-8 max-w-lg text-center text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {currentQuote}
        </motion.p>

        {/* Countdown card */}
        <motion.div
          className="relative w-full max-w-2xl select-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Decorative gold pulsing circles */}
          <div className="absolute -left-4 -top-4 z-20 h-8 w-8">
            <motion.div
              className="h-full w-full rounded-full bg-gold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
          <div className="absolute -bottom-4 -right-4 z-20 h-8 w-8">
            <motion.div
              className="h-full w-full rounded-full bg-gold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                delay: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>

          <VoidPanel
            hoverable={false}
            className="cursor-pointer overflow-hidden rounded-2xl !p-0"
            onClick={() => {}}
          >
            {/* Gold top border */}
            <div className="h-1 bg-gold" />

            <motion.div
              className="p-6 sm:p-10"
              animate={isPressed ? { scale: 0.98 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onMouseDown={startCreatingParticles}
              onMouseUp={stopCreatingParticles}
              onMouseLeave={stopCreatingParticles}
              onMouseMove={handleMove}
              onTouchStart={startCreatingParticles}
              onTouchEnd={stopCreatingParticles}
              onTouchMove={handleMove}
            >
              <div className="flex flex-col items-center space-y-6">
                {/* SVG Heart with pulsing animation */}
                <div className="relative">
                  <motion.div
                    className="text-gold"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <HeartSvg size={96} />
                  </motion.div>

                  {/* Decorative orbiting mini hearts */}
                  <motion.div
                    className="absolute -right-2 -top-2 text-gold"
                    animate={{
                      rotate: [0, 20, 0, -20, 0],
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <HeartSvg size={24} />
                  </motion.div>
                  <motion.div
                    className="absolute -left-3 bottom-0 text-gold/50"
                    animate={{
                      rotate: [0, -15, 0, 15, 0],
                      x: [0, -3, 0, 3, 0],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <HeartSvg size={20} />
                  </motion.div>
                </div>

                {/* Countdown display */}
                <div className="grid w-full grid-cols-1 gap-8 py-6 md:grid-cols-2">
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="mb-2 font-display text-7xl font-bold text-gold md:text-8xl"
                      style={{
                        textShadow:
                          "0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.15)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {timer.days}
                    </motion.div>
                    <span className="hud-caption text-xs uppercase tracking-[0.25em] text-text-secondary">
                      DAYS
                    </span>
                  </div>

                  {/* HH:MM:SS */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="mb-2 font-display text-5xl font-bold text-gold md:text-6xl"
                      style={{
                        textShadow:
                          "0 0 15px rgba(212,175,55,0.25), 0 0 30px rgba(212,175,55,0.1)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {timer.timeString}
                    </motion.div>
                    <span className="hud-caption text-xs uppercase tracking-[0.25em] text-text-secondary">
                      HOURS : MINS : SECS
                    </span>
                  </div>
                </div>

                {/* Target date indicator */}
                <div className="flex items-center space-x-2 text-text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gold"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{formattedTarget}</span>
                </div>
              </div>
            </motion.div>
          </VoidPanel>
        </motion.div>

        {/* Click count easter egg */}
        <AnimatePresence>
          {showMessage && (
            <motion.p
              className="mt-6 text-center text-gold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              You really love clicking! {clickCount} clicks!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Hint text */}
        <motion.p
          className="mt-6 text-center text-sm text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Press and hold the card to show your love!
        </motion.p>
      </div>

      {/* Floating heart particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none fixed text-gold"
            style={{
              top: p.y,
              left: p.x,
              width: p.size,
              height: p.size,
            }}
            initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
            animate={{ opacity: 0.85, scale: 1, rotate: p.rotation }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="currentColor"
            >
              <path d={HEART_PATH} />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export with Suspense boundary for useSearchParams             */
/* ------------------------------------------------------------------ */
export default function LoveTimerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-void-deep">
          <span className="hud-caption animate-pulse text-gold tracking-[0.3em]">
            LOADING...
          </span>
        </div>
      }
    >
      <LoveTimerContent />
    </Suspense>
  );
}
