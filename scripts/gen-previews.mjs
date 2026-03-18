import { createCanvas } from "canvas";
import { writeFileSync } from "fs";
import { join } from "path";

const OUT = join(import.meta.dirname, "../frontend/public/assets");
const W = 800;
const H = 450;

const VOID = "#030303";
const VOID_SURFACE = "#080808";
const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.4)";
const GOLD_GHOST = "rgba(212,175,55,0.08)";
const BORDER = "rgba(212,175,55,0.12)";
const TEXT_DIM = "rgba(232,228,217,0.35)";

function save(canvas, name) {
  writeFileSync(join(OUT, name), canvas.toBuffer("image/png"));
  console.log(`✓ ${name}`);
}

function drawBase(ctx) {
  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, W, H);
  // Subtle grid dots
  ctx.fillStyle = "rgba(212,175,55,0.03)";
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGlow(ctx, x, y, r, alpha = 0.06) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, `rgba(212,175,55,${alpha})`);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawPanel(ctx, x, y, w, h) {
  ctx.fillStyle = VOID_SURFACE;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
}

// 1. Game of Life
function gameOfLife() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);
  drawGlow(ctx, W / 2, H / 2, 300, 0.04);

  const cellSize = 14;
  const gap = 1;
  const cols = 35;
  const rows = 20;
  const offsetX = (W - cols * (cellSize + gap)) / 2;
  const offsetY = (H - rows * (cellSize + gap)) / 2;

  // Random cells
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  };
  const rand = rng(42);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const alive = rand() > 0.65;
      const x = offsetX + c * (cellSize + gap);
      const y = offsetY + r * (cellSize + gap);
      ctx.fillStyle = alive ? GOLD : VOID_SURFACE;
      ctx.fillRect(x, y, cellSize, cellSize);
      if (alive) {
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 8;
        ctx.fillStyle = GOLD;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.shadowBlur = 0;
      }
    }
  }

  save(canvas, "GameOfLife.png");
}

// 2. Memory Game
function memoryGame() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);
  drawGlow(ctx, W / 2, H / 2, 280, 0.05);

  const emojis = ["?", "?", "★", "♦", "?", "♠", "●", "?"];
  const cols = 4;
  const rows = 2;
  const cardW = 100;
  const cardH = 130;
  const gap = 16;
  const totalW = cols * cardW + (cols - 1) * gap;
  const totalH = rows * cardH + (rows - 1) * gap;
  const offsetX = (W - totalW) / 2;
  const offsetY = (H - totalH) / 2;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (cardW + gap);
      const y = offsetY + r * (cardH + gap);
      const flipped = i === 2 || i === 5;

      drawPanel(ctx, x, y, cardW, cardH);

      if (flipped) {
        ctx.fillStyle = GOLD_GHOST;
        ctx.fillRect(x, y, cardW, cardH);
        ctx.fillStyle = GOLD;
        ctx.font = "bold 36px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", x + cardW / 2, y + cardH / 2);
      } else {
        ctx.fillStyle = GOLD_DIM;
        ctx.font = "bold 40px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", x + cardW / 2, y + cardH / 2);
      }
      i++;
    }
  }

  save(canvas, "MemoryGame.png");
}

// 3. Weather App
function weatherApp() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);
  drawGlow(ctx, 300, 225, 250, 0.05);

  // Main card
  drawPanel(ctx, 60, 60, 440, 330);
  // Gold accent top
  ctx.fillStyle = GOLD;
  ctx.fillRect(60, 60, 440, 3);

  // City
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Seoul", 90, 115);
  ctx.fillStyle = TEXT_DIM;
  ctx.font = "14px sans-serif";
  ctx.fillText("KR • 20:30", 90, 140);

  // Big temp
  ctx.fillStyle = GOLD;
  ctx.font = "bold 72px sans-serif";
  ctx.fillText("15°", 90, 240);
  ctx.fillStyle = "rgba(232,228,217,0.6)";
  ctx.font = "18px sans-serif";
  ctx.fillText("Cloudy", 90, 270);

  // Info chips
  for (let i = 0; i < 2; i++) {
    const chipX = 90 + i * 130;
    drawPanel(ctx, chipX, 300, 110, 60);
    ctx.fillStyle = TEXT_DIM;
    ctx.font = "11px sans-serif";
    ctx.fillText(i === 0 ? "Humidity" : "Wind", chipX + 12, 325);
    ctx.fillStyle = GOLD;
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(i === 0 ? "60%" : "9 km/h", chipX + 12, 348);
  }

  // Sidebar
  drawPanel(ctx, 540, 60, 200, 330);
  ctx.fillStyle = GOLD_DIM;
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("SAVED", 560, 90);

  const cities = ["Tokyo 28°", "New York 12°", "Sydney 24°"];
  cities.forEach((c, i) => {
    drawPanel(ctx, 555, 105 + i * 70, 170, 55);
    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.fillText(c, 570, 138 + i * 70);
  });

  save(canvas, "WeatherApp.png");
}

// 4. Pomodoro Timer
function pomodoroTimer() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);
  drawGlow(ctx, W / 2, H / 2, 200, 0.08);

  const cx = W / 2;
  const cy = H / 2 - 10;
  const r = 130;

  // Background circle
  ctx.strokeStyle = VOID_SURFACE;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Progress arc (75%)
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.75);
  ctx.stroke();

  // Glow on arc
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = "rgba(212,175,55,0.3)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.75);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Time
  ctx.fillStyle = GOLD;
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("18:45", cx, cy);

  // Mode buttons
  const modes = ["Focus", "Short", "Long"];
  modes.forEach((m, i) => {
    const bx = cx - 120 + i * 90;
    const by = cy + r + 40;
    ctx.fillStyle = i === 0 ? GOLD : "transparent";
    ctx.strokeStyle = i === 0 ? GOLD : BORDER;
    ctx.lineWidth = 1;
    ctx.fillRect(bx, by, 70, 28);
    if (i !== 0) ctx.strokeRect(bx, by, 70, 28);
    ctx.fillStyle = i === 0 ? "#000" : TEXT_DIM;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(m.toUpperCase(), bx + 35, by + 17);
  });

  save(canvas, "PomodoroTimer.png");
}

// 5. Task Breaker
function taskBreaker() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  // Left panel - task list
  drawPanel(ctx, 40, 40, 260, 370);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("My Tasks", 60, 75);

  const tasks = ["Design system", "API endpoints", "Deploy v2"];
  tasks.forEach((t, i) => {
    const y = 100 + i * 65;
    drawPanel(ctx, 55, y, 230, 50);
    if (i === 0) {
      ctx.strokeStyle = GOLD_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(55, y, 230, 50);
    }
    // Checkbox
    ctx.beginPath();
    ctx.arc(75, y + 25, 8, 0, Math.PI * 2);
    ctx.strokeStyle = i === 2 ? GOLD : BORDER;
    ctx.fillStyle = i === 2 ? GOLD : "transparent";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (i === 2) ctx.fill();
    // Text
    ctx.fillStyle = i === 2 ? TEXT_DIM : "#fff";
    ctx.font = "13px sans-serif";
    ctx.fillText(t, 92, y + 29);
  });

  // Right panel - detail
  drawPanel(ctx, 320, 40, 440, 370);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("Design system", 345, 80);

  // Progress bar
  ctx.fillStyle = VOID_SURFACE;
  ctx.fillRect(345, 100, 390, 8);
  ctx.fillStyle = GOLD;
  ctx.fillRect(345, 100, 260, 8);

  // Steps
  const steps = ["Define tokens", "Build components", "Write docs", "Review"];
  steps.forEach((s, i) => {
    const y = 130 + i * 50;
    drawPanel(ctx, 345, y, 390, 40);
    ctx.beginPath();
    ctx.arc(365, y + 20, 7, 0, Math.PI * 2);
    ctx.strokeStyle = i < 2 ? GOLD : BORDER;
    ctx.fillStyle = i < 2 ? GOLD : "transparent";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (i < 2) ctx.fill();
    ctx.fillStyle = i < 2 ? TEXT_DIM : "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(s, 382, y + 24);
  });

  save(canvas, "TaskBreaker.png");
}

// 6. Mood Tracker
function moodTracker() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  // Weekly calendar
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  days.forEach((d, i) => {
    const x = 80 + i * 95;
    const isToday = i === 4;
    ctx.fillStyle = isToday ? GOLD : VOID_SURFACE;
    ctx.strokeStyle = isToday ? GOLD : BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, 40, 75, 40, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isToday ? "#000" : TEXT_DIM;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(d.toUpperCase(), x + 37, 65);
  });

  // Averages panel
  drawPanel(ctx, 60, 100, 680, 80);
  ctx.fillStyle = GOLD;
  ctx.fillRect(60, 100, 680, 3);

  const avgs = [
    { label: "MOOD", val: "4.2", emoji: "🙂" },
    { label: "ENERGY", val: "3.8", emoji: "⚡" },
    { label: "FOCUS", val: "3.5", emoji: "🎯" },
  ];
  avgs.forEach((a, i) => {
    const x = 120 + i * 230;
    ctx.fillStyle = TEXT_DIM;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(a.label, x, 130);
    ctx.fillStyle = GOLD;
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(a.val, x, 163);
  });

  // Bar chart
  drawPanel(ctx, 60, 200, 680, 200);
  const bars = [80, 60, 45, 70, 55, 30, 65, 50, 40, 75, 35, 55];
  const labels = ["🏃", "🧘", "💼", "👥", "🌳", "📚", "🎮", "🎵", "🎨", "😴", "💊", "🥗"];
  bars.forEach((h, i) => {
    const x = 90 + i * 53;
    const barH = h * 1.5;
    const y = 380 - barH;
    const grad = ctx.createLinearGradient(x, y, x, 380);
    grad.addColorStop(0, GOLD);
    grad.addColorStop(1, "rgba(212,175,55,0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, 32, barH);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + 16, 395);
  });

  save(canvas, "MoodTracker.png");
}

// 7. Typing Test
function typingTest() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);
  drawGlow(ctx, W / 2, 200, 300, 0.04);

  // Stats bar
  const stats = [
    { label: "WPM", val: "87" },
    { label: "ACCURACY", val: "96%" },
    { label: "TIME", val: "0:42" },
  ];
  stats.forEach((s, i) => {
    const x = 140 + i * 210;
    drawPanel(ctx, x, 40, 170, 70);
    ctx.fillStyle = TEXT_DIM;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.label, x + 85, 62);
    ctx.fillStyle = GOLD;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(s.val, x + 85, 92);
  });

  // Text panel
  drawPanel(ctx, 60, 140, 680, 200);
  const text = "The quick brown fox jumps over the lazy dog while coding";
  const typed = 35;
  ctx.font = "20px monospace";
  ctx.textAlign = "left";

  let xPos = 80;
  for (let i = 0; i < text.length; i++) {
    if (i < typed) {
      ctx.fillStyle = GOLD;
    } else if (i === typed) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(xPos, 220, 2, 24);
    } else {
      ctx.fillStyle = TEXT_DIM;
    }
    ctx.fillText(text[i], xPos, 240);
    xPos += ctx.measureText(text[i]).width;
    if (xPos > 700) break;
  }

  // Progress bar
  ctx.fillStyle = VOID_SURFACE;
  ctx.fillRect(60, 360, 680, 4);
  ctx.fillStyle = GOLD;
  ctx.fillRect(60, 360, 680 * 0.7, 4);

  save(canvas, "TypingTest.png");
}

// 8. Color Palette
function colorPalette() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  const colors = ["#d4af37", "#2d5a87", "#8b4a6b", "#4a7c59", "#c97b2a"];
  const stripW = 120;
  const gap = 12;
  const totalW = colors.length * stripW + (colors.length - 1) * gap;
  const offsetX = (W - totalW) / 2;

  colors.forEach((color, i) => {
    const x = offsetX + i * (stripW + gap);
    ctx.fillStyle = color;
    ctx.fillRect(x, 40, stripW, 320);

    // Hex label
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, 310, stripW, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(color.toUpperCase(), x + stripW / 2, 340);
  });

  // Lock icon on one
  ctx.fillStyle = GOLD;
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🔒", offsetX + stripW / 2, 65);

  save(canvas, "ColorPalette.png");
}

// 9. Snake
function snake() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  const gridSize = 20;
  const cellSize = 18;
  const gap = 1;
  const offsetX = (W - gridSize * (cellSize + gap)) / 2;
  const offsetY = (H - gridSize * (cellSize + gap)) / 2;

  // Grid
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      ctx.fillStyle = VOID_SURFACE;
      ctx.fillRect(
        offsetX + c * (cellSize + gap),
        offsetY + r * (cellSize + gap),
        cellSize,
        cellSize,
      );
    }
  }

  // Snake body
  const snakeBody = [
    [10, 10], [10, 11], [10, 12], [10, 13], [10, 14],
    [11, 14], [12, 14], [12, 13], [12, 12],
  ];
  snakeBody.forEach(([r, c], i) => {
    const x = offsetX + c * (cellSize + gap);
    const y = offsetY + r * (cellSize + gap);
    const brightness = 1 - i * 0.08;
    ctx.fillStyle = `rgba(212,175,55,${brightness})`;
    ctx.fillRect(x, y, cellSize, cellSize);
    if (i === 0) {
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.shadowBlur = 0;
    }
  });

  // Food
  const foodX = offsetX + 5 * (cellSize + gap) + cellSize / 2;
  const foodY = offsetY + 8 * (cellSize + gap) + cellSize / 2;
  const foodGrad = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, 12);
  foodGrad.addColorStop(0, GOLD);
  foodGrad.addColorStop(0.6, "rgba(212,175,55,0.5)");
  foodGrad.addColorStop(1, "transparent");
  ctx.fillStyle = foodGrad;
  ctx.beginPath();
  ctx.arc(foodX, foodY, 12, 0, Math.PI * 2);
  ctx.fill();

  // Score
  drawPanel(ctx, 30, 15, 100, 35);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Score: 8", 80, 38);

  save(canvas, "Snake.png");
}

// 10. Ambient Sounds
function ambientSounds() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  // Waveform
  drawPanel(ctx, 40, 30, 720, 100);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 80);
  for (let x = 50; x < 750; x += 2) {
    const y = 80 + Math.sin(x * 0.03) * 25 + Math.sin(x * 0.07) * 12 + Math.sin(x * 0.01) * 15;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  // Glow
  ctx.strokeStyle = "rgba(212,175,55,0.15)";
  ctx.lineWidth = 8;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(50, 80);
  for (let x = 50; x < 750; x += 2) {
    const y = 80 + Math.sin(x * 0.03) * 25 + Math.sin(x * 0.07) * 12 + Math.sin(x * 0.01) * 15;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Channel cards
  const channels = ["🌧️", "⛈️", "🌊", "🌲", "🔥", "💨", "🐦", "☕"];
  const vols = [60, 20, 0, 0, 30, 20, 0, 40];
  channels.forEach((emoji, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 40 + col * 185;
    const y = 155 + row * 150;
    drawPanel(ctx, x, y, 170, 130);
    if (vols[i] > 0) {
      ctx.strokeStyle = "rgba(212,175,55,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 170, 130);
    }
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(emoji, x + 85, y + 45);
    // Slider track
    ctx.fillStyle = BORDER;
    ctx.fillRect(x + 25, y + 70, 120, 3);
    ctx.fillStyle = GOLD;
    ctx.fillRect(x + 25, y + 70, 120 * (vols[i] / 100), 3);
    // Thumb
    if (vols[i] > 0) {
      ctx.beginPath();
      ctx.arc(x + 25 + 120 * (vols[i] / 100), y + 71, 6, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
    }
    // Volume
    ctx.fillStyle = vols[i] > 0 ? GOLD : TEXT_DIM;
    ctx.font = "11px monospace";
    ctx.fillText(`${vols[i]}%`, x + 85, y + 105);
  });

  save(canvas, "AmbientSounds.png");
}

// 11. Pixel Art
function pixelArt() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBase(ctx);

  // Canvas area
  const gridSize = 16;
  const cellSize = 20;
  const gridOffset = 160;
  const gridY = 40;

  // Grid background
  drawPanel(ctx, gridOffset, gridY, gridSize * cellSize + 2, gridSize * cellSize + 2);

  // Pixel art - simple heart
  const art = [
    "................",
    "..XX....XX......",
    ".XXXX..XXXX.....",
    "XXXXXXXX XXX....",
    "XXXXXXXXXXXX....",
    "XXXXXXXXXXXX....",
    ".XXXXXXXXXX.....",
    "..XXXXXXXX......",
    "...XXXXXX.......",
    "....XXXX........",
    ".....XX.........",
    "................",
    "................",
    "................",
    "................",
    "................",
  ];

  const palette = {
    X: GOLD,
    ".": "transparent",
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = gridOffset + 1 + c * cellSize;
      const y = gridY + 1 + r * cellSize;
      const ch = art[r]?.[c] || ".";
      if (ch !== ".") {
        ctx.fillStyle = palette[ch] || GOLD;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
      // Grid lines
      ctx.strokeStyle = "rgba(212,175,55,0.06)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  // Tool panel (left)
  drawPanel(ctx, 30, 40, 110, 200);
  const tools = ["✏️", "🧹", "🪣", "💧"];
  tools.forEach((t, i) => {
    const y = 60 + i * 45;
    ctx.fillStyle = i === 0 ? GOLD_GHOST : "transparent";
    ctx.strokeStyle = i === 0 ? GOLD_DIM : BORDER;
    ctx.lineWidth = 1;
    ctx.fillRect(45, y, 80, 35);
    ctx.strokeRect(45, y, 80, 35);
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t, 85, y + 25);
  });

  // Color palette (right)
  drawPanel(ctx, 510, 40, 250, 200);
  const colors = [
    "#000", "#fff", GOLD, "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#78716c",
    "#374151", "#d1d5db", "#1e3a5f", "#166534",
  ];
  colors.forEach((c, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 530 + col * 52;
    const y = 60 + row * 42;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 36, 30);
    if (i === 2) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, 40, 34);
    }
  });

  save(canvas, "PixelArt.png");
}

// Run all
gameOfLife();
memoryGame();
weatherApp();
pomodoroTimer();
taskBreaker();
moodTracker();
typingTest();
colorPalette();
snake();
ambientSounds();
pixelArt();

console.log("\n✓ All 11 preview images generated");
