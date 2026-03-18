"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface Channel {
  id: string;
  name: string;
  emoji: string;
  volume: number; // 0–100
  /** Base frequency multiplier for the waveform visualizer */
  freq: number;
}

interface Preset {
  name: string;
  label: string;
  volumes: Record<string, number>;
}

interface SavedMix {
  name: string;
  volumes: Record<string, number>;
  masterVolume: number;
}

const INITIAL_CHANNELS: Channel[] = [
  { id: "rain", name: "Rain", emoji: "\u{1F327}\uFE0F", volume: 0, freq: 1.2 },
  { id: "thunder", name: "Thunder", emoji: "\u26C8\uFE0F", volume: 0, freq: 0.4 },
  { id: "ocean", name: "Ocean Waves", emoji: "\u{1F30A}", volume: 0, freq: 0.7 },
  { id: "forest", name: "Forest", emoji: "\u{1F332}", volume: 0, freq: 1.8 },
  { id: "fire", name: "Fire Crackling", emoji: "\u{1F525}", volume: 0, freq: 2.4 },
  { id: "wind", name: "Wind", emoji: "\u{1F4A8}", volume: 0, freq: 0.9 },
  { id: "birds", name: "Birds", emoji: "\u{1F426}", volume: 0, freq: 3.2 },
  { id: "coffee", name: "Coffee Shop", emoji: "\u2615", volume: 0, freq: 1.5 },
];

const PRESETS: Preset[] = [
  {
    name: "deep-focus",
    label: "Deep Focus",
    volumes: { rain: 60, thunder: 20, ocean: 0, forest: 0, fire: 0, wind: 0, birds: 0, coffee: 40 },
  },
  {
    name: "rainy-day",
    label: "Rainy Day",
    volumes: { rain: 80, thunder: 45, ocean: 0, forest: 0, fire: 30, wind: 20, birds: 0, coffee: 0 },
  },
  {
    name: "nature-walk",
    label: "Nature Walk",
    volumes: { rain: 0, thunder: 0, ocean: 0, forest: 70, fire: 0, wind: 40, birds: 60, coffee: 0 },
  },
  {
    name: "cozy-evening",
    label: "Cozy Evening",
    volumes: { rain: 40, thunder: 0, ocean: 0, forest: 0, fire: 70, wind: 0, birds: 0, coffee: 50 },
  },
];

const TIMER_OPTIONS = [15, 30, 45, 60] as const;

const STORAGE_KEY = "ambient-mixes";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function loadMixes(): SavedMix[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMixes(mixes: SavedMix[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
}

/* ------------------------------------------------------------------ */
/*  Audio Engine                                                       */
/* ------------------------------------------------------------------ */

function generateNoiseBuffer(
  ctx: AudioContext,
  duration: number,
  type: "white" | "pink" | "brown",
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "pink") {
    // Paul Kellet's pink noise algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + white * 0.02) / 1.02;
      data[i] = last * 3.5; // boost gain
    }
  }

  return buffer;
}

interface ChannelNodes {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  filters: BiquadFilterNode[];
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

function buildChannelGraph(
  ctx: AudioContext,
  id: string,
  masterGain: GainNode,
): ChannelNodes {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(masterGain);

  let buffer: AudioBuffer;
  const filters: BiquadFilterNode[] = [];
  let lfo: OscillatorNode | undefined;
  let lfoGain: GainNode | undefined;

  switch (id) {
    case "rain": {
      // Brown noise through lowpass 400Hz
      buffer = generateNoiseBuffer(ctx, 4, "brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 400;
      filters.push(lp);
      break;
    }
    case "thunder": {
      // Very low brown noise, lowpass 100Hz, high gain
      buffer = generateNoiseBuffer(ctx, 4, "brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 100;
      filters.push(lp);
      break;
    }
    case "ocean": {
      // Brown noise with slow LFO amplitude modulation
      buffer = generateNoiseBuffer(ctx, 4, "brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 500;
      filters.push(lp);
      // LFO for wave-like swooshing
      lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.1;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      break;
    }
    case "forest": {
      // Pink noise, bandpass 800-2000Hz
      buffer = generateNoiseBuffer(ctx, 4, "pink");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1400;
      bp.Q.value = 0.5;
      filters.push(bp);
      break;
    }
    case "fire": {
      // White noise, bandpass 1000-4000Hz with fast random amplitude modulation
      buffer = generateNoiseBuffer(ctx, 4, "white");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2500;
      bp.Q.value = 0.5;
      filters.push(bp);
      // Fast LFO for crackle effect
      lfo = ctx.createOscillator();
      lfo.type = "sawtooth";
      lfo.frequency.value = 15;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      break;
    }
    case "wind": {
      // Brown noise with slow LFO on filter frequency 200-600Hz
      buffer = generateNoiseBuffer(ctx, 4, "brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 400;
      filters.push(lp);
      // LFO modulating filter frequency
      lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.15;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(lp.frequency);
      lfo.start();
      break;
    }
    case "birds": {
      // Filtered white noise, high bandpass 2000-6000Hz, random chirp amplitude
      buffer = generateNoiseBuffer(ctx, 4, "white");
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 4000;
      bp.Q.value = 1.0;
      filters.push(bp);
      // Chirpy amplitude modulation
      lfo = ctx.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = 6;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      break;
    }
    case "coffee": {
      // Pink noise, gentle lowpass 3000Hz
      buffer = generateNoiseBuffer(ctx, 4, "pink");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 3000;
      filters.push(lp);
      break;
    }
    default:
      buffer = generateNoiseBuffer(ctx, 4, "white");
  }

  // Wire: source -> filters -> gain -> masterGain
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  let node: AudioNode = source;
  for (const f of filters) {
    node.connect(f);
    node = f;
  }
  node.connect(gain);

  source.start();

  return { source, gainNode: gain, filters, lfo, lfoGain };
}

function useAudioEngine(
  channels: Channel[],
  masterVolume: number,
  isPlaying: boolean,
): void {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const channelNodesRef = useRef<Map<string, ChannelNodes>>(new Map());
  const initializedRef = useRef(false);

  // Initialize AudioContext and all channel graphs lazily on first play
  const ensureInit = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = masterVolume / 100;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    for (const ch of INITIAL_CHANNELS) {
      const nodes = buildChannelGraph(ctx, ch.id, master);
      channelNodesRef.current.set(ch.id, nodes);
    }
  }, []); // masterVolume intentionally excluded — only used for initial value

  // Handle play/stop
  useEffect(() => {
    if (isPlaying) {
      ensureInit();
      const ctx = ctxRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    } else {
      const ctx = ctxRef.current;
      if (ctx && ctx.state === "running") {
        ctx.suspend();
      }
    }
  }, [isPlaying, ensureInit]);

  // Update individual channel gains
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    for (const ch of channels) {
      const nodes = channelNodesRef.current.get(ch.id);
      if (!nodes) continue;
      const target = ch.volume / 100;
      nodes.gainNode.gain.cancelScheduledValues(now);
      nodes.gainNode.gain.setValueAtTime(nodes.gainNode.gain.value, now);
      nodes.gainNode.gain.linearRampToValueAtTime(target, now + 0.1);
    }
  }, [channels]);

  // Update master volume
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const target = masterVolume / 100;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + 0.1);
  }, [masterVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Array.from(channelNodesRef.current.values()).forEach((nodes) => {
        try { nodes.source.stop(); } catch { /* already stopped */ }
        if (nodes.lfo) try { nodes.lfo.stop(); } catch { /* already stopped */ }
      });
      channelNodesRef.current.clear();
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      initializedRef.current = false;
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Waveform Visualizer                                                */
/* ------------------------------------------------------------------ */

function WaveformVisualizer({
  channels,
  masterVolume,
  isPlaying,
}: {
  channels: Channel[];
  masterVolume: number;
  isPlaying: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const buildPath = useCallback(
    (t: number) => {
      const width = 800;
      const height = 120;
      const mid = height / 2;
      const points: string[] = [`M 0 ${mid}`];

      const activeChannels = channels.filter((c) => c.volume > 0);
      const master = masterVolume / 100;

      for (let x = 0; x <= width; x += 2) {
        let y = 0;
        if (isPlaying && activeChannels.length > 0) {
          for (const ch of activeChannels) {
            const amp = (ch.volume / 100) * master * (mid * 0.7);
            const freq = ch.freq;
            // Each channel contributes a sine wave with unique phase offset
            y += amp * Math.sin((x / width) * Math.PI * 2 * freq + t * (0.5 + freq * 0.3));
          }
          // Normalize so it doesn't clip with many channels
          y = y / Math.max(activeChannels.length * 0.6, 1);
        }
        points.push(`L ${x} ${mid + y}`);
      }

      return points.join(" ");
    },
    [channels, masterVolume, isPlaying],
  );

  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;
      timeRef.current += 0.04;
      if (pathRef.current) {
        pathRef.current.setAttribute("d", buildPath(timeRef.current));
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [buildPath]);

  return (
    <VoidPanel className="p-0 overflow-hidden" hoverable={false}>
      <svg
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        className="w-full h-[120px] block"
      >
        {/* Subtle grid lines */}
        {[30, 60, 90].map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={800}
            y2={y}
            stroke="rgba(212,175,55,0.06)"
            strokeWidth={0.5}
          />
        ))}
        <path
          ref={pathRef}
          d={`M 0 60 L 800 60`}
          fill="none"
          stroke="rgba(212,175,55,0.8)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glow duplicate */}
        <path
          ref={(el) => {
            // Mirror the main path for a glow effect
            if (!el) return;
            const observer = new MutationObserver(() => {
              if (pathRef.current) {
                el.setAttribute("d", pathRef.current.getAttribute("d") || "");
              }
            });
            if (pathRef.current) {
              observer.observe(pathRef.current, { attributes: true, attributeFilter: ["d"] });
            }
            return () => observer.disconnect();
          }}
          d={`M 0 60 L 800 60`}
          fill="none"
          stroke="rgba(212,175,55,0.15)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </VoidPanel>
  );
}

/* ------------------------------------------------------------------ */
/*  Channel Card                                                       */
/* ------------------------------------------------------------------ */

function ChannelCard({
  channel,
  onChange,
}: {
  channel: Channel;
  onChange: (id: string, volume: number) => void;
}) {
  const active = channel.volume > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <VoidPanel
        className={`p-5 transition-shadow duration-300 ${
          active ? "shadow-[0_0_20px_rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.3)]" : ""
        }`}
        hoverable={false}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Emoji icon */}
          <motion.span
            className="text-4xl select-none"
            animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={active ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
          >
            {channel.emoji}
          </motion.span>

          {/* Name */}
          <span className="font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
            {channel.name}
          </span>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={100}
            value={channel.volume}
            onChange={(e) => onChange(channel.id, parseInt(e.target.value, 10))}
            className="ambient-slider w-full"
            aria-label={`${channel.name} volume`}
          />

          {/* Volume percentage */}
          <span
            className={`text-xs font-mono tabular-nums ${
              active ? "text-gold" : "text-[var(--text-muted)]"
            }`}
          >
            {channel.volume}%
          </span>
        </div>
      </VoidPanel>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Save Mix Modal                                                     */
/* ------------------------------------------------------------------ */

function SaveModal({
  onSave,
  onClose,
}: {
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <VoidPanel className="p-6" hoverable={false}>
          <h3 className="font-display text-[0.8rem] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)] mb-4">
            Save Mix
          </h3>
          <input
            type="text"
            placeholder="Mix name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="w-full bg-[var(--void-deep)] border border-[var(--border)] text-[var(--text-primary)] rounded px-3 py-2 text-sm font-mono focus:border-gold focus:outline-none mb-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) onSave(name.trim());
            }}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost-gold" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={() => name.trim() && onSave(name.trim())}
              disabled={!name.trim()}
            >
              Save
            </Button>
          </div>
        </VoidPanel>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function WhiteNoisePage() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [masterVolume, setMasterVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Audio engine
  useAudioEngine(channels, masterVolume, isPlaying);

  // Load saved mixes from localStorage on mount
  useEffect(() => {
    setSavedMixes(loadMixes());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || timerSeconds <= 0) return;

    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setTimerMinutes(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying, timerSeconds]);

  const handleChannelVolume = useCallback((id: string, volume: number) => {
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, volume } : ch)));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setChannels((prev) =>
      prev.map((ch) => ({ ...ch, volume: preset.volumes[ch.id] ?? 0 })),
    );
    setActivePreset(preset.name);
    setIsPlaying(true);
  }, []);

  const handlePlayStop = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleTimerSelect = useCallback(
    (minutes: number) => {
      if (timerMinutes === minutes) {
        // Deselect
        setTimerMinutes(null);
        setTimerSeconds(0);
      } else {
        setTimerMinutes(minutes);
        setTimerSeconds(minutes * 60);
      }
    },
    [timerMinutes],
  );

  const handleSaveMix = useCallback(
    (name: string) => {
      const volumes: Record<string, number> = {};
      channels.forEach((ch) => {
        volumes[ch.id] = ch.volume;
      });
      const mix: SavedMix = { name, volumes, masterVolume };
      const updated = [...savedMixes, mix];
      setSavedMixes(updated);
      saveMixes(updated);
      setShowSaveModal(false);
    },
    [channels, masterVolume, savedMixes],
  );

  const handleLoadMix = useCallback((mix: SavedMix) => {
    setChannels((prev) =>
      prev.map((ch) => ({ ...ch, volume: mix.volumes[ch.id] ?? 0 })),
    );
    setMasterVolume(mix.masterVolume);
    setActivePreset(null);
    setIsPlaying(true);
  }, []);

  const handleDeleteMix = useCallback(
    (index: number) => {
      const updated = savedMixes.filter((_, i) => i !== index);
      setSavedMixes(updated);
      saveMixes(updated);
    },
    [savedMixes],
  );

  const activeCount = channels.filter((ch) => ch.volume > 0).length;

  return (
    <>
      {/* Custom slider styles */}
      <style jsx global>{`
        .ambient-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .ambient-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
          transition: box-shadow 0.2s;
        }
        .ambient-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.6);
        }
        .ambient-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
        }
        .ambient-slider::-moz-range-track {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
        }
        .ambient-master-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: linear-gradient(
            to right,
            rgba(212, 175, 55, 0.3),
            rgba(212, 175, 55, 0.8)
          );
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }
        .ambient-master-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
        }
        .ambient-master-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
        }
        .ambient-master-slider::-moz-range-track {
          height: 6px;
          background: linear-gradient(
            to right,
            rgba(212, 175, 55, 0.3),
            rgba(212, 175, 55, 0.8)
          );
          border-radius: 3px;
        }
      `}</style>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel>FOCUS TOOL</SectionLabel>
          <h2 className="text-display mt-2">Ambient Sounds</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-lg">
            Blend ambient soundscapes to create your perfect focus environment.
            Adjust individual channels and find your flow state.
          </p>
        </motion.div>

        {/* Waveform Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <WaveformVisualizer
            channels={channels}
            masterVolume={masterVolume}
            isPlaying={isPlaying}
          />
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            {/* Playing indicator */}
            <div className="flex items-center gap-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? "bg-gold" : "bg-[var(--text-muted)]"
                }`}
                animate={
                  isPlaying
                    ? { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }
                    : { opacity: 0.5, scale: 1 }
                }
                transition={
                  isPlaying
                    ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    : {}
                }
              />
              <span className="font-display text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)]">
                {isPlaying ? "Playing" : "Stopped"}
              </span>
            </div>

            {/* Active channels count */}
            <span className="text-[var(--text-muted)] text-xs font-mono">
              {activeCount} channel{activeCount !== 1 ? "s" : ""} active
            </span>
          </div>

          {/* Timer countdown */}
          {timerMinutes && timerSeconds > 0 && (
            <span className="font-mono text-sm text-gold tabular-nums">
              {formatTimer(timerSeconds)} remaining
            </span>
          )}
        </motion.div>

        {/* Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VoidPanel className="p-5" hoverable={false}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Play / Stop */}
              <Button
                variant="gold"
                className="min-w-[140px]"
                onClick={handlePlayStop}
              >
                {isPlaying ? (
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Play
                  </span>
                )}
              </Button>

              {/* Timer pills */}
              <div className="flex items-center gap-2">
                <span className="font-display text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mr-1">
                  Timer
                </span>
                {TIMER_OPTIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => handleTimerSelect(min)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      timerMinutes === min
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-[var(--void-deep)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-gold/30"
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>

              {/* Master volume */}
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <span className="font-display text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                  Master
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
                  className="ambient-master-slider flex-1"
                  aria-label="Master volume"
                />
                <span className="font-mono text-xs text-gold tabular-nums w-8 text-right">
                  {masterVolume}%
                </span>
              </div>
            </div>
          </VoidPanel>
        </motion.div>

        {/* Presets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-3"
        >
          <span className="font-display text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[var(--text-muted)]">
            Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded border text-center transition-all cursor-pointer ${
                  activePreset === preset.name
                    ? "border-gold/50 bg-gold/10 shadow-[0_0_12px_rgba(212,175,55,0.1)]"
                    : "border-[var(--border)] bg-[var(--void)] hover:border-gold/30"
                }`}
              >
                <span className="font-display text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[var(--text-primary)]">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel, i) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
            >
              <ChannelCard channel={channel} onChange={handleChannelVolume} />
            </motion.div>
          ))}
        </div>

        {/* Saved Mixes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[var(--text-muted)]">
              Saved Mixes
            </span>
            <Button
              variant="ghost-gold"
              onClick={() => setShowSaveModal(true)}
              disabled={activeCount === 0}
            >
              Save Current Mix
            </Button>
          </div>

          {savedMixes.length === 0 ? (
            <VoidPanel className="p-6 text-center" hoverable={false}>
              <p className="text-[var(--text-muted)] text-sm">
                No saved mixes yet. Create your perfect blend and save it for later.
              </p>
            </VoidPanel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedMixes.map((mix, index) => (
                <VoidPanel key={index} className="p-4" hoverable={false}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLoadMix(mix)}
                      className="font-display text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[var(--text-primary)] hover:text-gold transition-colors cursor-pointer text-left"
                    >
                      {mix.name}
                    </button>
                    <button
                      onClick={() => handleDeleteMix(index)}
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer p-1"
                      aria-label={`Delete ${mix.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {channels
                      .filter((ch) => (mix.volumes[ch.id] ?? 0) > 0)
                      .map((ch) => (
                        <span key={ch.id} className="text-xs" title={`${ch.name}: ${mix.volumes[ch.id]}%`}>
                          {ch.emoji}
                        </span>
                      ))}
                  </div>
                </VoidPanel>
              ))}
            </div>
          )}
        </motion.div>

        {/* Save Modal */}
        {showSaveModal && (
          <SaveModal
            onSave={handleSaveMix}
            onClose={() => setShowSaveModal(false)}
          />
        )}
      </div>
    </>
  );
}
