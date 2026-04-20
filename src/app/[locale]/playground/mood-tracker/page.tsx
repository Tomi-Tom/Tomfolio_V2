"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  energy: number;
  focus: number;
  notes: string;
  tags: string[];
  activities: string[];
};

type DateData = {
  date: string;
  dayName: string;
  shortDate: string;
  isToday: boolean;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const activityOptions = [
  { id: "exercise", label: "Exercise", emoji: "\u{1F3C3}" },
  { id: "meditation", label: "Meditation", emoji: "\u{1F9D8}" },
  { id: "work", label: "Work/Study", emoji: "\u{1F4BC}" },
  { id: "social", label: "Social", emoji: "\u{1F465}" },
  { id: "nature", label: "Nature", emoji: "\u{1F333}" },
  { id: "reading", label: "Reading", emoji: "\u{1F4DA}" },
  { id: "gaming", label: "Gaming", emoji: "\u{1F3AE}" },
  { id: "music", label: "Music", emoji: "\u{1F3B5}" },
  { id: "creative", label: "Creative", emoji: "\u{1F3A8}" },
  { id: "sleep", label: "Good Sleep", emoji: "\u{1F634}" },
  { id: "meds", label: "Medication", emoji: "\u{1F48A}" },
  { id: "nutrition", label: "Nutrition", emoji: "\u{1F957}" },
];

const moodLevels = [
  { value: 1, label: "Very Low", emoji: "\u{1F622}" },
  { value: 2, label: "Low", emoji: "\u{1F61F}" },
  { value: 3, label: "Neutral", emoji: "\u{1F610}" },
  { value: 4, label: "Good", emoji: "\u{1F642}" },
  { value: 5, label: "Great", emoji: "\u{1F604}" },
];

const energyLevels = [
  { value: 1, label: "Exhausted", emoji: "\u{1F50B}" },
  { value: 2, label: "Low", emoji: "\u{1F50B}\u{1F50B}" },
  { value: 3, label: "Moderate", emoji: "\u{1F50B}\u{1F50B}\u{1F50B}" },
  { value: 4, label: "Energetic", emoji: "\u{1F50B}\u{1F50B}\u{1F50B}\u{1F50B}" },
  { value: 5, label: "Very High", emoji: "\u{1F50B}\u{1F50B}\u{1F50B}\u{1F50B}\u{1F50B}" },
];

const focusLevels = [
  { value: 1, label: "Very Distracted", emoji: "\u{1F9E0}" },
  { value: 2, label: "Distracted", emoji: "\u{1F9E0}\u{1F9E0}" },
  { value: 3, label: "Moderate", emoji: "\u{1F9E0}\u{1F9E0}\u{1F9E0}" },
  { value: 4, label: "Focused", emoji: "\u{1F9E0}\u{1F9E0}\u{1F9E0}\u{1F9E0}" },
  { value: 5, label: "Hyper-focused", emoji: "\u{1F9E0}\u{1F9E0}\u{1F9E0}\u{1F9E0}\u{1F9E0}" },
];

const tagOptions = [
  "Overwhelmed",
  "Anxious",
  "Creative",
  "Productive",
  "Calm",
  "Frustrated",
  "Motivated",
  "Tired",
  "Hyperfocus",
  "Distracted",
  "Procrastinating",
  "Happy",
  "Stressed",
  "Excited",
];

const ENTRIES_STORAGE_KEY = "adhd-mood-tracker-entries";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MoodTrackerPage() {
  // --------------- state ---------------
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"calendar" | "insights">("calendar");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const emptyEntry: MoodEntry = {
    id: "",
    date: new Date().toISOString().split("T")[0],
    mood: 3,
    energy: 3,
    focus: 3,
    notes: "",
    tags: [],
    activities: [],
  };

  const [newEntry, setNewEntry] = useState<MoodEntry>(emptyEntry);

  // --------------- localStorage persistence ---------------
  useEffect(() => {
    const saved = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  // --------------- date helpers ---------------
  const getDates = (): DateData[] => {
    const dates: DateData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push({
        date: d.toISOString().split("T")[0],
        dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d),
        shortDate: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(d),
        isToday: d.getTime() === today.getTime(),
      });
    }
    return dates;
  };

  const dates = getDates();

  // --------------- entry helpers ---------------
  const getEntriesForDate = (date: string) => entries.filter((e) => e.date === date);

  const selectedDateEntries = getEntriesForDate(selectedDate);

  const saveEntry = () => {
    if (editingEntry) {
      setEntries(
        entries.map((e) => (e.id === editingEntry.id ? { ...newEntry, id: editingEntry.id } : e))
      );
    } else {
      setEntries([...entries, { ...newEntry, id: Date.now().toString() }]);
    }
    setShowEntryForm(false);
    setEditingEntry(null);
    setNewEntry(emptyEntry);
  };

  const startEditEntry = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
    setShowEntryForm(true);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
  };

  const toggleTag = (tag: string) => {
    setNewEntry((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const toggleActivity = (id: string) => {
    setNewEntry((prev) => ({
      ...prev,
      activities: prev.activities.includes(id)
        ? prev.activities.filter((a) => a !== id)
        : [...prev.activities, id],
    }));
  };

  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --------------- calculations ---------------
  const getLevelInfo = (type: "mood" | "energy" | "focus", value: number) => {
    const levels = type === "mood" ? moodLevels : type === "energy" ? energyLevels : focusLevels;
    return levels.find((l) => l.value === value) || levels[2];
  };

  const getGoldOpacity = (value: number): string => {
    const o = ["0.15", "0.3", "0.5", "0.7", "1"];
    return o[value - 1] || "0.5";
  };

  const weekEntries = entries.filter((e) => dates.some((d) => d.date === e.date));

  const weeklyAverages = (() => {
    if (weekEntries.length === 0) return { mood: 0, energy: 0, focus: 0 };
    const t = weekEntries.reduce(
      (a, e) => ({ mood: a.mood + e.mood, energy: a.energy + e.energy, focus: a.focus + e.focus }),
      { mood: 0, energy: 0, focus: 0 }
    );
    const n = weekEntries.length;
    return {
      mood: Math.round((t.mood / n) * 100) / 100,
      energy: Math.round((t.energy / n) * 100) / 100,
      focus: Math.round((t.focus / n) * 100) / 100,
    };
  })();

  const activityFrequency = (() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => e.activities.forEach((a) => (counts[a] = (counts[a] || 0) + 1)));
    return activityOptions
      .map((a) => ({ ...a, count: counts[a.id] || 0 }))
      .filter((a) => a.count > 0)
      .sort((a, b) => b.count - a.count);
  })();

  const maxFrequency = activityFrequency.length > 0 ? activityFrequency[0].count : 1;

  // --------------- pattern insights ---------------
  const averages = (() => {
    if (entries.length === 0) return { mood: 0, energy: 0, focus: 0 };
    const t = entries.reduce(
      (a, e) => ({ mood: a.mood + e.mood, energy: a.energy + e.energy, focus: a.focus + e.focus }),
      { mood: 0, energy: 0, focus: 0 }
    );
    const n = entries.length;
    return {
      mood: Math.round((t.mood / n) * 100) / 100,
      energy: Math.round((t.energy / n) * 100) / 100,
      focus: Math.round((t.focus / n) * 100) / 100,
    };
  })();

  const activityImpacts = (() => {
    const impacts: Record<string, { count: number; mood: number; energy: number; focus: number }> =
      {};
    activityOptions.forEach((a) => (impacts[a.id] = { count: 0, mood: 0, energy: 0, focus: 0 }));
    entries.forEach((e) =>
      e.activities.forEach((id) => {
        if (impacts[id]) {
          impacts[id].count++;
          impacts[id].mood += e.mood;
          impacts[id].energy += e.energy;
          impacts[id].focus += e.focus;
        }
      })
    );
    return Object.keys(impacts)
      .map((id) => {
        const im = impacts[id];
        const act = activityOptions.find((a) => a.id === id);
        if (im.count === 0)
          return {
            id,
            label: act?.label || id,
            emoji: act?.emoji || "",
            count: 0,
            mood: 0,
            energy: 0,
            focus: 0,
          };
        return {
          id,
          label: act?.label || id,
          emoji: act?.emoji || "",
          count: im.count,
          mood: Math.round((im.mood / im.count) * 100) / 100,
          energy: Math.round((im.energy / im.count) * 100) / 100,
          focus: Math.round((im.focus / im.count) * 100) / 100,
        };
      })
      .sort((a, b) => b.count - a.count);
  })();

  const getPatternInsights = () => {
    if (entries.length < 3) return ["Add more entries to see patterns and insights"];
    const insights: string[] = [];
    const tagCounts: Record<string, number> = {};
    entries.forEach((e) => e.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t);
    if (topTags.length > 0) insights.push(`Your most common states are: ${topTags.join(", ")}`);
    const positiveActs = activityImpacts
      .filter(
        (a) =>
          a.count >= 2 &&
          (a.mood > averages.mood || a.energy > averages.energy || a.focus > averages.focus)
      )
      .slice(0, 3);
    if (positiveActs.length > 0)
      insights.push(
        `Activities that seem to improve your well-being: ${positiveActs.map((a) => `${a.emoji} ${a.label}`).join(", ")}`
      );
    const lowE = entries.filter((e) => e.energy <= 2).length;
    const highE = entries.filter((e) => e.energy >= 4).length;
    if (lowE > highE && lowE >= 3)
      insights.push(
        "You appear to have more low-energy days. Consider energy management strategies."
      );
    if (averages.focus < 3)
      insights.push(
        "Your focus scores tend to be on the lower side. Explore strategies to support your attention."
      );
    if (insights.length < 2)
      insights.push("Consistent tracking will reveal more patterns and insights over time");
    return insights;
  };

  // ================================================================
  //  RENDER
  // ================================================================

  return (
    <div className="min-h-screen bg-[var(--color-void)] px-4 pb-32 pt-24">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ---------- header ---------- */}
        <div className="mb-10 text-center">
          <SectionLabel className="mb-3">ADHD TOOL</SectionLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-gold)] sm:text-4xl">
            Mood &amp; Energy Tracker
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            Track your daily mood, energy, and focus levels to identify patterns and gain insights
            that can help manage ADHD symptoms.
          </p>

          {/* view toggle */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant={currentView === "calendar" ? "gold" : "ghost-gold"}
              onClick={() => setCurrentView("calendar")}
            >
              Calendar
            </Button>
            <Button
              variant={currentView === "insights" ? "gold" : "ghost-gold"}
              onClick={() => setCurrentView("insights")}
            >
              Insights
            </Button>
          </div>
        </div>

        {/* ================================================================ */}
        {/*  CALENDAR VIEW                                                    */}
        {/* ================================================================ */}
        {currentView === "calendar" && (
          <div className="space-y-8">
            {/* ---- weekly calendar bar ---- */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <VoidPanel hoverable={false} className="overflow-x-auto rounded-xl p-4">
                <div className="flex min-w-max gap-2">
                  {dates.map((d) => {
                    const hasEntry = getEntriesForDate(d.date).length > 0;
                    const isSelected = selectedDate === d.date;
                    return (
                      <motion.button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className="flex min-w-[72px] flex-col items-center rounded-lg px-3 py-3 transition-colors"
                        style={{
                          background: isSelected
                            ? "var(--color-gold)"
                            : d.isToday
                              ? "rgba(212,175,55,0.12)"
                              : "var(--color-void-surface)",
                          color: isSelected ? "#000" : "var(--color-text-secondary)",
                          border: d.isToday
                            ? "2px solid var(--color-gold-dim)"
                            : "1px solid var(--color-border)",
                        }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {d.dayName}
                        </span>
                        <span className="text-xl font-bold">{d.shortDate}</span>
                        {hasEntry && (
                          <span className="mt-1 text-lg">
                            {
                              moodLevels.find((m) => m.value === getEntriesForDate(d.date)[0].mood)
                                ?.emoji
                            }
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </VoidPanel>
            </motion.div>

            {/* ---- selected date header ---- */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--color-gold)]">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <Button
                  variant="gold"
                  onClick={() => {
                    setEditingEntry(null);
                    setNewEntry({ ...emptyEntry, date: selectedDate });
                    setShowEntryForm(true);
                  }}
                >
                  + Add Entry
                </Button>
              </div>
            </motion.div>

            {/* ---- entries list ---- */}
            {selectedDateEntries.length === 0 ? (
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <VoidPanel hoverable={false} className="rounded-xl p-8 text-center">
                  <p className="text-[var(--color-text-secondary)]">No entries for this date.</p>
                  <Button
                    variant="gold"
                    className="mt-4"
                    onClick={() => {
                      setEditingEntry(null);
                      setNewEntry({ ...emptyEntry, date: selectedDate });
                      setShowEntryForm(true);
                    }}
                  >
                    Add Entry
                  </Button>
                </VoidPanel>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {selectedDateEntries.map((entry, idx) => {
                  const isExpanded = expandedEntries.has(entry.id);
                  return (
                    <motion.div
                      key={entry.id}
                      custom={idx + 2}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -12 }}
                    >
                      <VoidPanel className="rounded-xl">
                        {/* collapsed summary */}
                        <button
                          className="flex w-full items-center justify-between p-5 text-left"
                          onClick={() => toggleExpanded(entry.id)}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">
                              {getLevelInfo("mood", entry.mood).emoji}
                            </span>
                            <div className="flex gap-3">
                              {(["mood", "energy", "focus"] as const).map((type) => (
                                <span
                                  key={type}
                                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                                  style={{
                                    background: `rgba(212,175,55,${getGoldOpacity(entry[type])})`,
                                    color: entry[type] >= 3 ? "#000" : "var(--color-gold)",
                                  }}
                                >
                                  {type[0].toUpperCase()}: {entry[type]}
                                </span>
                              ))}
                            </div>
                          </div>
                          <motion.span
                            className="text-[var(--color-gold-dim)]"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                          >
                            &#9662;
                          </motion.span>
                        </button>

                        {/* expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4">
                                {/* metrics row */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  {(["mood", "energy", "focus"] as const).map((type) => (
                                    <div
                                      key={type}
                                      className="rounded-lg p-4"
                                      style={{
                                        background: "var(--color-void-surface)",
                                        borderLeft: `3px solid rgba(212,175,55,${getGoldOpacity(entry[type])})`,
                                      }}
                                    >
                                      <p className="text-xs uppercase tracking-wider text-[var(--color-gold-dim)]">
                                        {type}
                                      </p>
                                      <div className="mt-1 flex items-center gap-2">
                                        <span className="text-2xl">
                                          {getLevelInfo(type, entry[type]).emoji}
                                        </span>
                                        <div>
                                          <p className="font-bold text-[var(--color-gold)]">
                                            {getLevelInfo(type, entry[type]).label}
                                          </p>
                                          <p className="text-xs text-[var(--color-text-secondary)]">
                                            Level {entry[type]}/5
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* notes */}
                                {entry.notes && (
                                  <div className="mt-4">
                                    <p className="text-xs uppercase tracking-wider text-[var(--color-gold-dim)]">
                                      Notes
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                      {entry.notes}
                                    </p>
                                  </div>
                                )}

                                {/* tags */}
                                {entry.tags.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {entry.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full px-3 py-1 text-xs"
                                        style={{
                                          background: "var(--color-gold-ghost)",
                                          color: "var(--color-gold)",
                                          border: "1px solid var(--color-gold-dim)",
                                        }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* activities */}
                                {entry.activities.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {entry.activities.map((aId) => {
                                      const act = activityOptions.find((a) => a.id === aId);
                                      return (
                                        <span
                                          key={aId}
                                          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                                          style={{
                                            background: "var(--color-gold-ghost)",
                                            color: "var(--color-gold)",
                                            border: "1px solid var(--color-gold-dim)",
                                          }}
                                        >
                                          {act?.emoji} {act?.label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* actions */}
                                <div className="mt-5 flex justify-end gap-3">
                                  <Button
                                    variant="ghost-gold"
                                    onClick={() => startEditEntry(entry)}
                                  >
                                    Edit
                                  </Button>
                                  <motion.button
                                    onClick={() => setDeleteConfirmId(entry.id)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium"
                                    style={{ background: "rgba(220,38,38,0.15)", color: "#ef4444" }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Delete
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </VoidPanel>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {/* ---- weekly averages panel ---- */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <VoidPanel hoverable={false} className="relative overflow-hidden rounded-xl">
                {/* gold gradient top strip */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-gold-dim), var(--color-gold), var(--color-gold-dim))",
                  }}
                />
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-[var(--color-gold)]">
                    Weekly Averages
                  </h3>
                  {weekEntries.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      No entries this week yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {(
                        [
                          { key: "mood" as const, label: "Mood", emoji: "\u{1F642}" },
                          { key: "energy" as const, label: "Energy", emoji: "\u26A1" },
                          { key: "focus" as const, label: "Focus", emoji: "\u{1F3AF}" },
                        ] as const
                      ).map((m) => (
                        <div key={m.key}>
                          <p className="text-xs uppercase tracking-wider text-[var(--color-gold-dim)]">
                            {m.label}
                          </p>
                          <p className="mt-1 text-3xl font-bold text-[var(--color-gold)]">
                            {weeklyAverages[m.key].toFixed(1)}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">{m.emoji} /5</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </VoidPanel>
            </motion.div>

            {/* ---- activity frequency bar chart ---- */}
            {activityFrequency.length > 0 && (
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <VoidPanel hoverable={false} className="rounded-xl p-6">
                  <h3 className="mb-4 text-lg font-bold text-[var(--color-gold)]">
                    Activity Frequency
                  </h3>
                  <div className="space-y-3">
                    {activityFrequency.map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <span className="w-24 flex-shrink-0 truncate text-sm text-[var(--color-text-secondary)]">
                          {a.emoji} {a.label}
                        </span>
                        <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-[var(--color-void-surface)]">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: "var(--color-gold)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(a.count / maxFrequency) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-bold text-[var(--color-gold)]">
                          {a.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </VoidPanel>
              </motion.div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/*  INSIGHTS VIEW                                                    */}
        {/* ================================================================ */}
        {currentView === "insights" && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* averages */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <VoidPanel className="rounded-xl p-6">
                <h3 className="mb-4 text-xl font-bold text-[var(--color-gold)]">Your Averages</h3>
                {entries.length === 0 ? (
                  <p className="text-[var(--color-text-secondary)]">
                    No entries yet. Add some daily records to see insights.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(
                      [
                        { key: "mood" as const, lo: "Low", mid: "Neutral", hi: "High" },
                        { key: "energy" as const, lo: "Low", mid: "Moderate", hi: "High" },
                        { key: "focus" as const, lo: "Distracted", mid: "Moderate", hi: "Focused" },
                      ] as const
                    ).map((m, i) => (
                      <div key={m.key}>
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-[var(--color-text-secondary)]">
                            Average {m.key}
                          </span>
                          <span className="text-[var(--color-gold)]">
                            {averages[m.key].toFixed(1)}/5
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-void-surface)]">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: "var(--color-gold)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(averages[m.key] / 5) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-secondary)]">
                          <span>{m.lo}</span>
                          <span>{m.mid}</span>
                          <span>{m.hi}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </VoidPanel>
            </motion.div>

            {/* patterns */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <VoidPanel className="rounded-xl p-6">
                <h3 className="mb-4 text-xl font-bold text-[var(--color-gold)]">
                  Patterns &amp; Insights
                </h3>
                {entries.length < 3 ? (
                  <div className="flex h-40 flex-col items-center justify-center">
                    <p className="mb-4 text-center text-[var(--color-text-secondary)]">
                      Add at least 3 entries to see patterns and insights.
                    </p>
                    <Button
                      variant="gold"
                      onClick={() => {
                        setCurrentView("calendar");
                        setEditingEntry(null);
                        setNewEntry({ ...emptyEntry, date: selectedDate });
                        setShowEntryForm(true);
                      }}
                    >
                      Add Entry
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {getPatternInsights().map((insight, i) => (
                      <motion.li
                        key={i}
                        className="flex"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.4 }}
                      >
                        <span className="mr-2 text-[var(--color-gold)]">-</span>
                        <span className="text-[var(--color-text-secondary)]">{insight}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </VoidPanel>
            </motion.div>

            {/* activity impact table */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="md:col-span-2"
            >
              <VoidPanel className="rounded-xl p-6">
                <h3 className="mb-4 text-xl font-bold text-[var(--color-gold)]">Activity Impact</h3>
                {entries.length === 0 ? (
                  <p className="text-[var(--color-text-secondary)]">
                    No entries yet. Add some daily records with activities to see their impact.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="border-b border-[var(--color-border)]">
                          <th className="pb-3 text-left text-sm font-medium text-[var(--color-gold-dim)]">
                            Activity
                          </th>
                          <th className="pb-3 text-center text-sm font-medium text-[var(--color-gold-dim)]">
                            Count
                          </th>
                          <th className="pb-3 text-center text-sm font-medium text-[var(--color-gold-dim)]">
                            Mood
                          </th>
                          <th className="pb-3 text-center text-sm font-medium text-[var(--color-gold-dim)]">
                            Energy
                          </th>
                          <th className="pb-3 text-center text-sm font-medium text-[var(--color-gold-dim)]">
                            Focus
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityImpacts
                          .filter((im) => im.count > 0)
                          .map((im) => (
                            <tr key={im.id} className="border-b border-[var(--color-border)]">
                              <td className="py-3">
                                <span className="mr-2 text-xl">{im.emoji}</span>
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                  {im.label}
                                </span>
                              </td>
                              <td className="py-3 text-center text-[var(--color-gold)]">
                                {im.count}
                              </td>
                              {(["mood", "energy", "focus"] as const).map((k) => (
                                <td key={k} className="py-3 text-center">
                                  <span
                                    className="rounded-full px-2 py-0.5 text-xs"
                                    style={{
                                      background:
                                        im[k] > averages[k]
                                          ? "var(--color-gold-ghost)"
                                          : "var(--color-void-surface)",
                                      color:
                                        im[k] > averages[k]
                                          ? "var(--color-gold)"
                                          : "var(--color-text-secondary)",
                                    }}
                                  >
                                    {im[k].toFixed(1)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        {activityImpacts.filter((im) => im.count > 0).length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-[var(--color-text-secondary)]"
                            >
                              No activities recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </VoidPanel>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* ================================================================ */}
      {/*  ADD / EDIT ENTRY MODAL                                          */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showEntryForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEntryForm(false)}
          >
            <motion.div
              className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-void)] p-6 sm:p-8"
              style={{ boxShadow: "0 0 60px rgba(212,175,55,0.08)" }}
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[var(--color-gold)]">
                {editingEntry ? "Edit Entry" : "New Entry"} &mdash;{" "}
                {new Date(newEntry.date + "T12:00:00").toLocaleDateString()}
              </h2>
              <div className="my-4 h-px bg-[var(--color-border)]" />

              <div className="space-y-8">
                {/* ---- mood / energy / focus selectors ---- */}
                {(
                  [
                    { key: "mood" as const, label: "Mood", levels: moodLevels },
                    { key: "energy" as const, label: "Energy", levels: energyLevels },
                    { key: "focus" as const, label: "Focus", levels: focusLevels },
                  ] as const
                ).map((metric) => (
                  <div key={metric.key}>
                    <label className="mb-3 block text-sm font-medium uppercase tracking-wider text-[var(--color-gold-dim)]">
                      {metric.label}
                    </label>
                    <div className="flex justify-between gap-2">
                      {metric.levels.map((level) => {
                        const isActive = newEntry[metric.key] === level.value;
                        return (
                          <motion.button
                            key={level.value}
                            type="button"
                            onClick={() =>
                              setNewEntry((p) => ({ ...p, [metric.key]: level.value }))
                            }
                            className="flex flex-1 flex-col items-center rounded-lg px-1 py-3 transition-colors"
                            style={{
                              background: isActive ? "var(--color-gold-ghost)" : "transparent",
                              border: isActive
                                ? "2px solid var(--color-gold)"
                                : "1px solid var(--color-border)",
                            }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="text-2xl">{level.emoji}</span>
                            <span
                              className="mt-1 text-[10px] sm:text-xs"
                              style={{
                                color: isActive
                                  ? "var(--color-gold)"
                                  : "var(--color-text-secondary)",
                              }}
                            >
                              {level.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* ---- tags ---- */}
                <div>
                  <label className="mb-3 block text-sm font-medium uppercase tracking-wider text-[var(--color-gold-dim)]">
                    Tags &mdash; How did you feel?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => {
                      const active = newEntry.tags.includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="rounded-full px-3 py-1 text-sm transition-colors"
                          style={{
                            background: active ? "var(--color-gold)" : "transparent",
                            color: active ? "#000" : "var(--color-text-secondary)",
                            border: active
                              ? "1px solid var(--color-gold)"
                              : "1px solid var(--color-border)",
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tag}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ---- activities ---- */}
                <div>
                  <label className="mb-3 block text-sm font-medium uppercase tracking-wider text-[var(--color-gold-dim)]">
                    Activities &mdash; What did you do?
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {activityOptions.map((act) => {
                      const active = newEntry.activities.includes(act.id);
                      return (
                        <motion.button
                          key={act.id}
                          type="button"
                          onClick={() => toggleActivity(act.id)}
                          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors"
                          style={{
                            background: active ? "var(--color-gold-ghost)" : "transparent",
                            color: active ? "var(--color-gold)" : "var(--color-text-secondary)",
                            border: active
                              ? "1px solid var(--color-gold-dim)"
                              : "1px solid var(--color-border)",
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="text-lg">{act.emoji}</span>
                          <span>{act.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ---- notes ---- */}
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-[var(--color-gold-dim)]">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any additional thoughts about your day..."
                    className="h-24 w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-void-surface)] p-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-gold-dim)]"
                  />
                </div>

                {/* ---- form actions ---- */}
                <div className="flex justify-end gap-4 pt-2">
                  <Button variant="ghost-gold" onClick={() => setShowEntryForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="gold" onClick={saveEntry}>
                    {editingEntry ? "Update" : "Save"} Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  DELETE CONFIRMATION MODAL                                        */}
      {/* ================================================================ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-void)] p-8"
              style={{ boxShadow: "0 0 40px rgba(212,175,55,0.1)" }}
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-2xl font-bold text-[var(--color-gold)]">Delete Entry?</h2>
              <div className="my-3 h-px bg-[var(--color-border)]" />
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <Button variant="ghost-gold" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <motion.button
                  onClick={() => deleteEntry(deleteConfirmId)}
                  className="rounded-lg px-6 py-2.5 text-sm font-medium"
                  style={{ background: "rgba(220,38,38,0.3)", color: "#ef4444" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
