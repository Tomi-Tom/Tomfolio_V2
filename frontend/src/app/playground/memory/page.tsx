"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Difficulty = "easy" | "medium" | "hard";

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const ALL_EMOJIS = [
  "\u{1F680}", "\u{1F31F}", "\u{1F308}", "\u{1F3AE}", "\u{1F3A8}", "\u{1F3B5}",
  "\u{1F355}", "\u{1F3C6}", "\u{1F984}", "\u{1F30D}", "\u{1F3D6}\u{FE0F}", "\u{1F48E}",
];

const PAIR_COUNTS: Record<Difficulty, number> = {
  easy: 6,
  medium: 8,
  hard: 12,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(difficulty: Difficulty): Card[] {
  const count = PAIR_COUNTS[difficulty];
  const emojis = shuffle(ALL_EMOJIS).slice(0, count);
  const pairs = shuffle([...emojis, ...emojis]);
  return pairs.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

/* ------------------------------------------------------------------ */
/*  Card component (CSS perspective flip)                              */
/* ------------------------------------------------------------------ */

function MemoryCard({
  card,
  onClick,
  disabled,
}: {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}) {
  const isRevealed = card.flipped || card.matched;

  return (
    <motion.button
      className="aspect-square [perspective:600px] cursor-pointer focus:outline-none disabled:cursor-default"
      onClick={onClick}
      disabled={disabled || isRevealed}
      whileHover={
        !isRevealed && !disabled ? { scale: 1.05 } : undefined
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — the "?" face */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center rounded-lg
            border border-[var(--border)] [backface-visibility:hidden]
            bg-gradient-to-br from-[var(--void-elevated)] to-[var(--void-surface)]
            transition-colors duration-200
            ${!isRevealed && !disabled ? "hover:border-[var(--gold-dim)]" : ""}
          `}
        >
          <span className="text-[var(--gold)] text-2xl sm:text-3xl font-display select-none">
            ?
          </span>
        </div>

        {/* Back — the emoji face */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg border border-[var(--border)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={
            card.matched
              ? {
                  background: "rgba(212,175,55,0.06)",
                  boxShadow: "0 0 12px rgba(212,175,55,0.15)",
                  borderColor: "rgba(212,175,55,0.3)",
                }
              : {
                  background: "var(--void-elevated)",
                }
          }
        >
          <span className="text-2xl sm:text-3xl md:text-4xl select-none">
            {card.emoji}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function MemoryGamePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [matches, setMatches] = useState(0);
  const [won, setWon] = useState(false);
  const [checking, setChecking] = useState(false);

  /* Initialise / reset */
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function resetGame() {
    setCards(buildDeck(difficulty));
    setFlippedIds([]);
    setTurns(0);
    setMatches(0);
    setWon(false);
    setChecking(false);
  }

  /* Flip a card */
  function handleFlip(id: number) {
    if (checking) return;
    if (flippedIds.length >= 2) return;

    const next = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(next);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setTurns((t) => t + 1);
      setChecking(true);

      const [a, b] = newFlipped;
      const cardA = next.find((c) => c.id === a)!;
      const cardB = next.find((c) => c.id === b)!;

      if (cardA.emoji === cardB.emoji) {
        /* Match */
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b
                ? { ...c, matched: true, flipped: false }
                : c
            )
          );
          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlippedIds([]);
          setChecking(false);

          if (newMatches === PAIR_COUNTS[difficulty]) {
            setWon(true);
          }
        }, 600);
      } else {
        /* No match — flip back */
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
          setChecking(false);
        }, 900);
      }
    }
  }

  /* Grid columns */
  const gridClass =
    difficulty === "hard"
      ? "grid grid-cols-4 md:grid-cols-6 gap-3"
      : "grid grid-cols-3 sm:grid-cols-4 gap-3";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <section className="min-h-screen bg-[var(--void-deep)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <SectionLabel>GAME</SectionLabel>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Memory Game
          </h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
            Find all matching pairs in as few turns as possible.
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="flex justify-center gap-3">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "gold" : "ghost-gold"}
              onClick={() => setDifficulty(d)}
              className="capitalize"
            >
              {d}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <VoidPanel hoverable={false} className="flex justify-center gap-12 py-5">
          <div className="text-center">
            <p className="text-[var(--gold)] font-display text-2xl">{turns}</p>
            <SectionLabel className="mt-1">TURNS</SectionLabel>
          </div>
          <div className="text-center">
            <p className="text-[var(--gold)] font-display text-2xl">
              {matches}/{PAIR_COUNTS[difficulty]}
            </p>
            <SectionLabel className="mt-1">MATCHES</SectionLabel>
          </div>
        </VoidPanel>

        {/* Card grid */}
        <div className={gridClass}>
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <MemoryCard
                card={card}
                onClick={() => handleFlip(card.id)}
                disabled={checking}
              />
            </motion.div>
          ))}
        </div>

        {/* New game button */}
        <div className="flex justify-center">
          <Button variant="ghost-gold" onClick={resetGame}>
            New Game
          </Button>
        </div>
      </div>

      {/* Win modal */}
      <AnimatePresence>
        {won && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <VoidPanel
                hoverable={false}
                className="relative max-w-sm w-full text-center space-y-6 p-8 overflow-hidden"
              >
                {/* Gold gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />

                <h3 className="font-display text-2xl text-[var(--gold)]">
                  Congratulations!
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  You found all {PAIR_COUNTS[difficulty]} pairs in{" "}
                  <span className="text-[var(--gold)] font-semibold">
                    {turns}
                  </span>{" "}
                  turns.
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="gold" onClick={resetGame}>
                    Play Again
                  </Button>
                  <Button variant="ghost-gold" onClick={() => setWon(false)}>
                    Close
                  </Button>
                </div>
              </VoidPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
