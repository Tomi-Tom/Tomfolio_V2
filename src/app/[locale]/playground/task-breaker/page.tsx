"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = {
  id: string;
  text: string;
  isCompleted: boolean;
};

type Task = {
  id: string;
  title: string;
  steps: Step[];
  createdAt: string;
  completedAt: string | null;
  isExpanded: boolean;
};

type Filter = "all" | "active" | "completed";

// ---------------------------------------------------------------------------
// Confetti particle
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = ["#d4af37", "#c9a227", "#b8960f", "#e6c550", "#f0d870", "#dbb840"];

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  rotation: number;
  delay: number;
  size: number;
}

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.8,
    size: Math.random() * 8 + 4,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "adhd-task-breaker-tasks";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function isTaskCompleted(task: Task): boolean {
  return task.steps.length > 0 && task.steps.every((s) => s.isCompleted);
}

function completionPercent(task: Task): number {
  if (task.steps.length === 0) return 0;
  return Math.round((task.steps.filter((s) => s.isCompleted).length / task.steps.length) * 100);
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TaskBreakerPage() {
  const t = useTranslations("playground.taskBreaker");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  // Modal state: new task
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Modal state: add steps
  const [showAddSteps, setShowAddSteps] = useState(false);
  const [stepMode, setStepMode] = useState<"single" | "bulk">("single");
  const [singleStepText, setSingleStepText] = useState("");
  const [bulkStepText, setBulkStepText] = useState("");

  // Confetti
  const [confetti, setConfetti] = useState<ConfettiParticle[] | null>(null);

  // Hydrate from localStorage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) saveTasks(tasks);
  }, [tasks, hydrated]);

  // Derived
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;

  const filteredTasks = tasks.filter((task) => {
    const done = isTaskCompleted(task);
    if (filter === "active") return !done;
    if (filter === "completed") return done;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(isTaskCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ----- Task CRUD -----

  function createTask() {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: uid(),
      title: newTitle.trim(),
      steps: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      isExpanded: true,
    };
    setTasks((prev) => [task, ...prev]);
    setSelectedId(task.id);
    setNewTitle("");
    setShowNewTask(false);
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // ----- Steps -----

  function addSteps() {
    if (!selectedTask) return;
    let newSteps: Step[] = [];
    if (stepMode === "single" && singleStepText.trim()) {
      newSteps = [{ id: uid(), text: singleStepText.trim(), isCompleted: false }];
    } else if (stepMode === "bulk" && bulkStepText.trim()) {
      newSteps = bulkStepText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ id: uid(), text, isCompleted: false }));
    }
    if (newSteps.length === 0) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id ? { ...t, steps: [...t.steps, ...newSteps], completedAt: null } : t
      )
    );
    setSingleStepText("");
    setBulkStepText("");
    setShowAddSteps(false);
  }

  function toggleStep(taskId: string, stepId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSteps = t.steps.map((s) =>
          s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.isCompleted);
        const wasAlreadyComplete = isTaskCompleted(t);
        if (allDone && !wasAlreadyComplete) {
          // Trigger confetti
          setConfetti(generateConfetti());
          setTimeout(() => setConfetti(null), 2500);
        }
        return {
          ...t,
          steps: updatedSteps,
          completedAt: allDone ? new Date().toISOString() : null,
        };
      })
    );
  }

  function deleteStep(taskId: string, stepId: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSteps = t.steps.filter((s) => s.id !== stepId);
        const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.isCompleted);
        return {
          ...t,
          steps: updatedSteps,
          completedAt: allDone ? (t.completedAt ?? new Date().toISOString()) : null,
        };
      })
    );
  }

  function moveStep(taskId: string, stepId: string, dir: "up" | "down") {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const idx = t.steps.findIndex((s) => s.id === stepId);
        if (idx < 0) return t;
        const swapIdx = dir === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= t.steps.length) return t;
        const newSteps = [...t.steps];
        [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
        return { ...t, steps: newSteps };
      })
    );
  }

  // ----- Render -----

  if (!hydrated) return null;

  return (
    <section className="relative min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Confetti overlay */}
      <AnimatePresence>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confetti.map((p) => (
              <motion.div
                key={p.id}
                initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
                animate={{
                  y: "110vh",
                  rotate: p.rotation + 720,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, delay: p.delay, ease: "easeIn" }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="mb-10 text-center">
        <SectionLabel className="mb-2">{t("category")}</SectionLabel>
        <h2 className="text-display text-3xl sm:text-4xl font-display text-gold mb-3">
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto text-sm">
          {t("description")}
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-text-secondary">
        <span>{t("tasksCompleted", { completed: completedTasks, total: totalTasks })}</span>
        <span>{t("completionRate", { rate: completionRate })}</span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* -------- Left: task list -------- */}
        <div className="md:col-span-4">
          <VoidPanel hoverable={false} className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-text-primary text-sm tracking-widest uppercase">
                {t("myTasks")}
              </h3>
              <Button
                variant="gold"
                className="text-[0.65rem] px-3 py-1.5"
                onClick={() => setShowNewTask(true)}
              >
                {t("newTask")}
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex rounded-md overflow-hidden mb-4 bg-[var(--void-surface,rgba(255,255,255,0.03))]">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 text-[0.65rem] uppercase tracking-wider py-2 transition-colors ${
                    filter === f
                      ? "text-gold border-b-2 border-gold"
                      : "text-text-secondary hover:text-text-primary border-b-2 border-transparent"
                  }`}
                >
                  {t(`filters.${f}`)}
                </button>
              ))}
            </div>

            {/* Task cards */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10 text-text-secondary text-xs"
                  >
                    <p className="mb-3">{t("noTasks")}</p>
                    <Button
                      variant="ghost-gold"
                      className="text-[0.6rem]"
                      onClick={() => setShowNewTask(true)}
                    >
                      {t("createFirstTask")}
                    </Button>
                  </motion.div>
                ) : (
                  filteredTasks.map((task) => {
                    const done = isTaskCompleted(task);
                    const selected = selectedId === task.id;
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VoidPanel
                          hoverable
                          className={`p-3 cursor-pointer transition-colors ${
                            selected ? "border border-[var(--gold-dim,rgba(212,175,55,0.4))]" : ""
                          }`}
                          onClick={() => setSelectedId(task.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Completion dot */}
                            <span
                              className={`mt-1 w-3 h-3 rounded-full shrink-0 border-2 transition-colors ${
                                done
                                  ? "bg-gold border-gold"
                                  : "border-[var(--border)] bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  done ? "line-through text-text-secondary" : "text-text-primary"
                                }`}
                              >
                                {task.title}
                              </p>
                              {/* Step preview: first 3 */}
                              {task.steps.length > 0 && (
                                <ul className="mt-1.5 space-y-0.5">
                                  {task.steps.slice(0, 3).map((s) => (
                                    <li
                                      key={s.id}
                                      className={`text-[0.65rem] truncate ${
                                        s.isCompleted
                                          ? "text-text-secondary line-through"
                                          : "text-text-secondary"
                                      }`}
                                    >
                                      {s.isCompleted ? "✓ " : "○ "}
                                      {s.text}
                                    </li>
                                  ))}
                                  {task.steps.length > 3 && (
                                    <li className="text-[0.6rem] text-text-secondary">
                                      {t("moreSteps", { count: task.steps.length - 3 })}
                                    </li>
                                  )}
                                </ul>
                              )}
                              {/* Progress micro-bar */}
                              {task.steps.length > 0 && (
                                <div className="mt-2 h-1 rounded bg-[var(--void-surface,rgba(255,255,255,0.06))]">
                                  <motion.div
                                    className="h-full rounded bg-gold"
                                    initial={false}
                                    animate={{
                                      width: `${completionPercent(task)}%`,
                                    }}
                                    transition={{ duration: 0.4 }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </VoidPanel>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </VoidPanel>
        </div>

        {/* -------- Right: task detail -------- */}
        <div className="md:col-span-8">
          {selectedTask ? (
            <VoidPanel hoverable={false} className="p-6">
              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-lg font-display text-text-primary truncate">
                    {selectedTask.title}
                  </h3>
                  {isTaskCompleted(selectedTask) && (
                    <span className="shrink-0 text-[0.6rem] uppercase tracking-wider bg-gold/20 text-gold px-2 py-0.5 rounded">
                      {t("completed")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost-gold"
                    className="text-[0.6rem] px-2 py-1"
                    onClick={() => {
                      setShowAddSteps(true);
                      setStepMode("single");
                    }}
                  >
                    {t("addSteps")}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-[0.6rem] px-2 py-1 hover:border-red-500 hover:text-red-400"
                    onClick={() => deleteTask(selectedTask.id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[0.65rem] text-text-secondary mb-1">
                  <span>{t("progress")}</span>
                  <span className="text-gold">{completionPercent(selectedTask)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--void-surface,rgba(255,255,255,0.06))] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    initial={false}
                    animate={{
                      width: `${completionPercent(selectedTask)}%`,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-2 mb-8 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {selectedTask.steps.length === 0 ? (
                    <motion.div
                      key="no-steps"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12 text-text-secondary text-xs"
                    >
                      <p className="mb-3">{t("noStepsYet")}</p>
                      <Button
                        variant="ghost-gold"
                        className="text-[0.6rem]"
                        onClick={() => {
                          setShowAddSteps(true);
                          setStepMode("bulk");
                        }}
                      >
                        {t("addStepsCta")}
                      </Button>
                    </motion.div>
                  ) : (
                    selectedTask.steps.map((step, idx) => (
                      <motion.div
                        key={step.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VoidPanel hoverable={false} className="px-4 py-3 flex items-center gap-3">
                          {/* Checkbox circle */}
                          <button
                            onClick={() => toggleStep(selectedTask.id, step.id)}
                            className="shrink-0 group"
                            aria-label={step.isCompleted ? t("markIncompleteAria") : t("markCompleteAria")}
                          >
                            <span
                              className={`block w-5 h-5 rounded-full border-2 transition-colors ${
                                step.isCompleted
                                  ? "bg-gold border-gold"
                                  : "border-[var(--border)] group-hover:border-gold"
                              }`}
                            >
                              {step.isCompleted && (
                                <svg viewBox="0 0 20 20" className="w-full h-full text-void-deep">
                                  <path
                                    d="M6 10l3 3 5-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>

                          {/* Text */}
                          <span
                            className={`flex-1 text-sm ${
                              step.isCompleted
                                ? "line-through text-text-secondary"
                                : "text-text-primary"
                            }`}
                          >
                            {step.text}
                          </span>

                          {/* Reorder + delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => moveStep(selectedTask.id, step.id, "up")}
                              disabled={idx === 0}
                              className="p-1 text-text-secondary hover:text-gold disabled:opacity-25 transition-colors"
                              aria-label={t("moveUpAria")}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M8 12V4M4 7l4-4 4 4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveStep(selectedTask.id, step.id, "down")}
                              disabled={idx === selectedTask.steps.length - 1}
                              className="p-1 text-text-secondary hover:text-gold disabled:opacity-25 transition-colors"
                              aria-label={t("moveDownAria")}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M8 4v8M4 9l4 4 4-4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteStep(selectedTask.id, step.id)}
                              className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                              aria-label={t("deleteStepAria")}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M4 4l8 8M12 4l-8 8" />
                              </svg>
                            </button>
                          </div>
                        </VoidPanel>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Tips section */}
              <div className="border-t border-[var(--border)] pt-5">
                <h4 className="text-[0.65rem] uppercase tracking-widest text-text-secondary mb-3 font-display">
                  {t("tipsHeading")}
                </h4>
                <ul className="space-y-1.5 text-[0.7rem] text-text-secondary leading-relaxed">
                  {(["smallSteps", "easiestFirst", "breakDownFurther", "celebrate", "reorder"] as const).map(
                    (key) => (
                      <li key={key}>
                        <span className="text-gold mr-1">&#9672;</span> {t(`tips.${key}`)}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </VoidPanel>
          ) : (
            <VoidPanel hoverable={false} className="p-6">
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-text-secondary text-sm mb-4">
                  {t("selectTaskHint")}
                </p>
                <Button
                  variant="gold"
                  className="text-[0.65rem]"
                  onClick={() => setShowNewTask(true)}
                >
                  {t("createTask")}
                </Button>
              </div>
            </VoidPanel>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Modal: New Task                                                     */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showNewTask && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNewTask(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-md"
            >
              <VoidPanel hoverable={false} className="p-6 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
                <h3 className="font-display text-text-primary text-sm tracking-widest uppercase mb-5">
                  {t("newTaskModal.title")}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createTask();
                  }}
                >
                  <Input
                    label={t("newTaskModal.taskTitleLabel")}
                    placeholder={t("newTaskModal.taskTitlePlaceholder")}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowNewTask(false);
                        setNewTitle("");
                      }}
                    >
                      {t("newTaskModal.cancel")}
                    </Button>
                    <Button variant="gold" type="submit" disabled={!newTitle.trim()}>
                      {t("newTaskModal.create")}
                    </Button>
                  </div>
                </form>
              </VoidPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* Modal: Add Steps                                                    */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showAddSteps && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddSteps(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-md"
            >
              <VoidPanel hoverable={false} className="p-6 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
                <h3 className="font-display text-text-primary text-sm tracking-widest uppercase mb-5">
                  {t("addStepsModal.title")}
                </h3>

                {/* Mode toggle */}
                <div className="flex rounded-md overflow-hidden mb-5 bg-[var(--void-surface,rgba(255,255,255,0.03))]">
                  {(["single", "bulk"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setStepMode(m)}
                      className={`flex-1 text-[0.65rem] uppercase tracking-wider py-2 transition-colors ${
                        stepMode === m
                          ? "text-gold border-b-2 border-gold"
                          : "text-text-secondary hover:text-text-primary border-b-2 border-transparent"
                      }`}
                    >
                      {m === "single" ? t("addStepsModal.single") : t("addStepsModal.bulk")}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSteps();
                  }}
                >
                  {stepMode === "single" ? (
                    <Input
                      label={t("addStepsModal.stepLabel")}
                      placeholder={t("addStepsModal.stepPlaceholder")}
                      value={singleStepText}
                      onChange={(e) => setSingleStepText(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="space-y-1">
                      <label className="section-label">{t("addStepsModal.stepsLabel")}</label>
                      <textarea
                        className="input-void w-full min-h-[120px] resize-y"
                        placeholder={t("addStepsModal.stepsPlaceholder")}
                        value={bulkStepText}
                        onChange={(e) => setBulkStepText(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowAddSteps(false);
                        setSingleStepText("");
                        setBulkStepText("");
                      }}
                    >
                      {t("addStepsModal.cancel")}
                    </Button>
                    <Button
                      variant="gold"
                      type="submit"
                      disabled={
                        stepMode === "single" ? !singleStepText.trim() : !bulkStepText.trim()
                      }
                    >
                      {t("addStepsModal.add")}
                    </Button>
                  </div>
                </form>
              </VoidPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
