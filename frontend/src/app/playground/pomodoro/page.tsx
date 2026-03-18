"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface Settings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const LONG_BREAK_INTERVAL = 4;
const CIRCLE_RADIUS = 140;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getDurationSeconds(mode: TimerMode, settings: Settings): number {
  return settings[mode] * 60;
}

/* ------------------------------------------------------------------ */
/*  Settings Modal                                                     */
/* ------------------------------------------------------------------ */

function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Settings>({ ...settings });

  const update = (key: keyof Settings, value: string) => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n > 0 && n <= 120) {
      setDraft((prev) => ({ ...prev, [key]: n }));
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void-deep/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        <VoidPanel hoverable={false} className="p-8 space-y-6">
          <div>
            <SectionLabel>SETTINGS</SectionLabel>
            <h3 className="text-xl font-display font-bold text-text-primary mt-2">
              Timer Durations
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Set duration in minutes (1 &ndash; 120)
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Focus Duration"
              type="number"
              min={1}
              max={120}
              value={draft.focus}
              onChange={(e) => update("focus", e.target.value)}
            />
            <Input
              label="Short Break"
              type="number"
              min={1}
              max={120}
              value={draft.shortBreak}
              onChange={(e) => update("shortBreak", e.target.value)}
            />
            <Input
              label="Long Break"
              type="number"
              min={1}
              max={120}
              value={draft.longBreak}
              onChange={(e) => update("longBreak", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="gold"
              className="flex-1"
              onClick={() => {
                onSave(draft);
                onClose();
              }}
            >
              Save
            </Button>
            <Button variant="ghost-gold" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </VoidPanel>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gear Icon (SVG)                                                    */
/* ------------------------------------------------------------------ */

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PomodoroPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(getDurationSeconds("focus", DEFAULT_SETTINGS));
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Total duration for the current mode (used for progress calc)
  const totalDuration = getDurationSeconds(mode, settings);
  const progress = 1 - timeLeft / totalDuration;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  /* ---- Next mode logic ------------------------------------------- */

  const getNextMode = useCallback((): TimerMode => {
    if (mode === "focus") {
      // Every LONG_BREAK_INTERVAL-th completed pomodoro triggers a long break
      const upcoming = completedPomodoros + 1;
      return upcoming % LONG_BREAK_INTERVAL === 0 ? "longBreak" : "shortBreak";
    }
    return "focus";
  }, [mode, completedPomodoros]);

  const switchMode = useCallback(
    (next: TimerMode) => {
      setMode(next);
      setTimeLeft(getDurationSeconds(next, settings));
      setIsRunning(false);
    },
    [settings],
  );

  /* ---- Countdown effect ------------------------------------------ */

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(interval);

          if (mode === "focus") {
            setCompletedPomodoros((c) => c + 1);
          }

          const next = mode === "focus"
            ? (completedPomodoros + 1) % LONG_BREAK_INTERVAL === 0
              ? "longBreak"
              : "shortBreak"
            : "focus";

          // Auto-switch after a tiny delay so state settles
          setTimeout(() => switchMode(next), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, completedPomodoros, switchMode]);

  /* ---- Handlers -------------------------------------------------- */

  const handleStartPause = () => setIsRunning((r) => !r);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDurationSeconds(mode, settings));
  };

  const handleSkip = () => {
    if (mode === "focus") {
      setCompletedPomodoros((c) => c + 1);
    }
    switchMode(getNextMode());
  };

  const handleModeSelect = (m: TimerMode) => {
    setIsRunning(false);
    setMode(m);
    setTimeLeft(getDurationSeconds(m, settings));
  };

  const handleSaveSettings = (next: Settings) => {
    setSettings(next);
    setIsRunning(false);
    setTimeLeft(getDurationSeconds(mode, next));
  };

  /* ---- Total estimated time -------------------------------------- */

  const totalEstimateMin =
    settings.focus * 4 +
    settings.shortBreak * 3 +
    settings.longBreak;

  /* ---- Animations ------------------------------------------------ */

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <motion.div {...fadeUp} className="space-y-10">
        {/* Header */}
        <div>
          <SectionLabel>UTILITY</SectionLabel>
          <h2 className="text-display mt-3">Pomodoro Timer</h2>
          <p className="text-text-secondary mt-2 max-w-xl">
            Stay focused and productive with timed work sessions and scheduled
            breaks. Complete four focus rounds for a long break.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-3">
          {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "gold" : "ghost-gold"}
              onClick={() => handleModeSelect(m)}
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center">
          <motion.div
            className="relative"
            style={{ width: 320, height: 320 }}
            animate={isRunning ? { scale: [1, 1.01, 1] } : { scale: 1 }}
            transition={
              isRunning
                ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            {/* SVG Rings */}
            <svg
              width="320"
              height="320"
              viewBox="0 0 320 320"
              className="absolute inset-0"
              style={
                isRunning
                  ? { filter: "drop-shadow(0 0 20px rgba(212,175,55,0.2))" }
                  : undefined
              }
            >
              {/* Background circle */}
              <circle
                cx="160"
                cy="160"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="var(--void-surface, #1a1a2e)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="160"
                cy="160"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="var(--gold, #D4AF37)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 160 160)"
                style={{ transition: "stroke-dashoffset 0.35s ease" }}
              />
            </svg>

            {/* Inner circle background */}
            <div
              className="absolute rounded-full bg-[var(--void-elevated,#1e1e36)] flex flex-col items-center justify-center"
              style={{
                top: 320 / 2 - CIRCLE_RADIUS + 12,
                left: 320 / 2 - CIRCLE_RADIUS + 12,
                width: (CIRCLE_RADIUS - 12) * 2,
                height: (CIRCLE_RADIUS - 12) * 2,
              }}
            >
              {/* Time */}
              <span className="text-6xl font-bold font-display text-gold select-none">
                {formatTime(timeLeft)}
              </span>
              {/* Mode label */}
              <span className="text-text-secondary text-sm mt-2 font-display tracking-wider uppercase">
                {MODE_LABELS[mode]}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button variant="gold" onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="ghost-gold" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="ghost-gold" onClick={handleSkip}>
            Skip
          </Button>
        </div>

        {/* Bottom Grid: Stats + Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <VoidPanel hoverable={false} className="p-6 space-y-4">
            <SectionLabel>STATS</SectionLabel>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-5xl font-bold font-display text-gold">
                {completedPomodoros}
              </span>
              <span className="text-text-secondary text-sm">
                pomodoro{completedPomodoros !== 1 ? "s" : ""} completed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Current Mode
                </p>
                <p className="text-text-primary font-display font-semibold mt-1">
                  {MODE_LABELS[mode]}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Full Cycle
                </p>
                <p className="text-text-primary font-display font-semibold mt-1">
                  ~{totalEstimateMin} min
                </p>
              </div>
            </div>
          </VoidPanel>

          {/* Settings Preview */}
          <VoidPanel hoverable={false} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionLabel>SETTINGS</SectionLabel>
              <button
                onClick={() => setShowSettings(true)}
                className="text-text-secondary hover:text-gold transition-colors cursor-pointer"
                aria-label="Open settings"
              >
                <GearIcon />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Focus
                </p>
                <p className="text-gold font-display font-bold text-lg mt-1">
                  {settings.focus}m
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Short
                </p>
                <p className="text-gold font-display font-bold text-lg mt-1">
                  {settings.shortBreak}m
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Long
                </p>
                <p className="text-gold font-display font-bold text-lg mt-1">
                  {settings.longBreak}m
                </p>
              </div>
            </div>

            <p className="text-text-secondary text-xs pt-1">
              Long break every {LONG_BREAK_INTERVAL} focus sessions
            </p>
          </VoidPanel>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
