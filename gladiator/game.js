/* Gladiator Secret — pit combat plus the career that starts when the gate opens.
   Top-down fights. No external assets.
   Desktop: WASD, mouse aim, left click attack, right click block, Space dodge.
   Touch: joystick, Attack / Block / Dodge. Aim follows the stick, or the enemy when you stand still. */
(function () {
  "use strict";

  const W = 320;
  const H = 180;
  const ARENA = { cx: 160, cy: 98, rx: 132, ry: 68 };

  const PLAYER = {
    hp: 100,
    stam: 100,
    speed: 74,
    r: 8,
    dmg: 12,
  };
  const ATTACK = { stam: 20, range: 30, arc: 1.75, lock: 0.17, hitStart: 0.05, hitEnd: 0.16, total: 0.34 };
  const DODGE = { stam: 26, dur: 0.28, iframes: 0.22, speed: 196 };
  const BLOCK = { drain: 22, min: 4 };
  const STAM = { regen: 27, delay: 0.48 };

  const FIGHTS = [
    { kind: "prisoner", kicker: "Fight I", title: "Weak Prisoner", sub: "They throw you a sword.", lessons: ["move", "attack"] },
    { kind: "brute", kicker: "Fight II", title: "The Brute", sub: "You catch your breath.", lessons: ["block"] },
    { kind: "hound", kicker: "Fight III", title: "Pit Hound", sub: "You catch your breath.", lessons: ["dodge"] },
    { kind: "boss", kicker: "Freedom Fight", title: "The Pit Boss", sub: "No more lessons. Earn the gate.", lessons: ["boss"] },
  ];

  const LESSONS = {
    move: {
      desk: "Move with WASD. Learn the size of the pit.",
      touch: "Drag the stick to move. Learn the size of the pit.",
    },
    attack: {
      desk: "Aim with the mouse. Left click swings the sword.",
      touch: "You face your stick, or the enemy if you stand still. Tap Attack.",
    },
    block: {
      desk: "Hold right click to block. Press it when the club flares white — that perfect block staggers him. Holding early only softens the blow.",
      touch: "Hold Block. Press it when the club flares white — that perfect block staggers him. Holding early only softens the blow.",
    },
    dodge: {
      desk: "Space dodges, with a brief moment you cannot be hit. When the hound flares, roll off the orange line. A block will not save you cleanly.",
      touch: "Dodge when the hound flares and roll off the orange line. A block will not save you cleanly.",
    },
    boss: {
      desk: "He punishes wild swings. Do not hit a raised guard. Dodge orange lanes and red circles. Block when a cut flares white. Spend stamina on purpose.",
      touch: "He punishes wild swings. Do not hit a raised guard. Dodge orange lanes and red circles. Block when a cut flares white. Spend stamina on purpose.",
    },
  };

  /* Armor below 1 means the hit lands but skids — windups are for reading, not for mashing. */
  const PATTERNS = {
    prisonerSwing: {
      superArmor: false,
      phases: [
        { t: 0.52, tag: "windup", track: 0.36, flare: 0.18, cock: 1, telegraph: { shape: "cone", range: 28, arc: 1.1, color: "#f0c84a" } },
        { t: 0.12, tag: "strike", hit: { shape: "cone", range: 30, arc: 1.25, dmg: 8, kb: 90, hitstun: 0.16, stagger: 0.65 } },
        { t: 0.75, tag: "recover" },
      ],
    },
    bruteSlam: {
      superArmor: true,
      phases: [
        { t: 1.0, tag: "windup", track: 0.72, flare: 0.2, cock: 1.3, armor: 0.3, telegraph: { shape: "cone", range: 38, arc: 1.75, color: "#e23b32" } },
        { t: 0.14, tag: "strike", armor: 0.3, hit: { shape: "cone", range: 42, arc: 1.95, dmg: 34, chip: 8, blockStam: 12, kb: 160, hitstun: 0.36, stagger: 1.15 } },
        { t: 0.95, tag: "recover" },
      ],
    },
    houndLunge: {
      superArmor: true,
      phases: [
        { t: 0.52, tag: "windup", track: 0.28, flare: 0.18, armor: 0.45, telegraph: { shape: "lane", length: 74, width: 20, color: "#f08a3a" } },
        { t: 0.2, tag: "strike", move: 255, armor: 0.45, hit: { shape: "circle", range: 12, persist: true, dmg: 20, kb: 120, hitstun: 0.24, dirty: true, chip: 14, perfectChip: 8, stagger: 0.28 } },
        { t: 0.66, tag: "recover" },
      ],
    },
    bossCleave: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.48, tag: "windup", track: 0.3, flare: 0.16, cock: 1, armor: 0.35, telegraph: { shape: "cone", range: 34, arc: 1.15, color: "#f0c84a" } },
        { t: 0.1, tag: "strike", armor: 0.35, hit: { shape: "cone", range: 36, arc: 1.3, dmg: 10, kb: 80, hitstun: 0.18, stagger: 0.48, blockStam: 8 } },
        { t: 0.2, tag: "gap", armor: 0.4 },
        { t: 0.32, tag: "windup", track: 0.16, flare: 0.14, cock: 1, armor: 0.35, telegraph: { shape: "cone", range: 36, arc: 1.4, color: "#f0c84a" } },
        { t: 0.1, tag: "strike", armor: 0.35, hit: { shape: "cone", range: 38, arc: 1.5, dmg: 11, kb: 90, hitstun: 0.18, stagger: 0.5, blockStam: 8 } },
        { t: 0.22, tag: "gap", armor: 0.4 },
        { t: 0.52, tag: "windup", track: 0.24, flare: 0.18, cock: 1.35, armor: 0.35, telegraph: { shape: "cone", range: 42, arc: 2.0, color: "#e23b32" } },
        { t: 0.12, tag: "strike", armor: 0.35, hit: { shape: "cone", range: 44, arc: 2.15, dmg: 24, kb: 160, hitstun: 0.32, stagger: 1.05, blockStam: 14 } },
        { t: 0.86, tag: "recover" },
      ],
    },
    bossCharge: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.66, tag: "windup", track: 0.38, flare: 0.18, cock: 0.45, armor: 0.35, telegraph: { shape: "lane", length: 120, width: 24, color: "#f08a3a" } },
        { t: 0.3, tag: "strike", move: 255, armor: 0.35, hit: { shape: "circle", range: 14, persist: true, dmg: 20, kb: 170, hitstun: 0.32, guardbreak: true, blockDmg: 12, stagger: 0.5 } },
        { t: 0.72, tag: "recover" },
      ],
    },
    bossSlam: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.74, tag: "windup", track: 0.2, flare: 0.18, armor: 0.35, telegraph: { shape: "circle", range: 52, color: "#e23b32" } },
        { t: 0.12, tag: "strike", armor: 0.35, hit: { shape: "circle", range: 52, dmg: 22, chip: 12, blockStam: 26, kb: 140, hitstun: 0.28, stagger: 0.42 } },
        { t: 0.8, tag: "recover" },
      ],
    },
    bossWhirl: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.42, tag: "windup", flare: 0.16, armor: 0.35, telegraph: { shape: "circle", range: 30, color: "#f4e7c2" } },
        { t: 1.18, tag: "spin", move: 36, tick: 0.32, armor: 0.3, telegraph: { shape: "circle", range: 30, color: "#f4e7c2" }, hit: { shape: "circle", range: 30, dmg: 9, chip: 4, blockStam: 14, kb: 55, hitstun: 0.12 } },
        { t: 0.74, tag: "recover" },
      ],
    },
    bossGuard: {
      superArmor: true,
      phases: [
        { t: 0.26, tag: "windup", track: 0.26, guardRaise: true, armor: 0.45, telegraph: { shape: "ring", range: 18, color: "#8ec2ff" } },
        { t: 1.05, tag: "guard", telegraph: { shape: "ring", range: 22, color: "#e7f3ff" } },
        { t: 0.52, tag: "recover" },
      ],
    },
    bossCounter: {
      superArmor: true,
      phases: [
        { t: 0.13, tag: "windup", flare: 0.13, cock: 0.7, armor: 1, telegraph: { shape: "cone", range: 34, arc: 1.35, color: "#e23b32" } },
        { t: 0.1, tag: "strike", armor: 1, hit: { shape: "cone", range: 36, arc: 1.4, dmg: 16, kb: 180, hitstun: 0.4, stagger: 0.3 } },
        { t: 0.5, tag: "recover" },
      ],
    },
    bossRoar: {
      superArmor: true,
      phases: [{ t: 0.7, tag: "roar" }],
    },
  };

  const KINDS = {
    prisoner: { sprite: "prisoner", hp: 32, speed: 26, r: 8, prefer: 22, think: 0.45, weapon: { len: 12, thick: 1, color: "#a85a3a", edge: "#3a2218" } },
    brute: { sprite: "brute", hp: 96, speed: 22, r: 11, prefer: 28, think: 0.4, weapon: { len: 22, thick: 2, color: "#c48848", edge: "#3a2414" } },
    hound: { sprite: "hound", hp: 104, speed: 64, r: 8, prefer: 52, think: 0.18, weapon: null },
    boss: { sprite: "boss", hp: 250, speed: 34, r: 11, prefer: 34, think: 0.2, weapon: { len: 26, thick: 1, color: "#e4e7ee", edge: "#2a3038" } },
  };

  Object.assign(PATTERNS, window.GS_CAREER.PATTERNS);
  Object.assign(KINDS, window.GS_CAREER.KINDS);

  const GLYPH = {
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    C: ["111", "100", "100", "100", "111"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    G: ["111", "100", "101", "101", "111"],
    K: ["101", "110", "100", "110", "101"],
    L: ["100", "100", "100", "100", "111"],
    N: ["101", "111", "111", "101", "101"],
    O: ["111", "101", "101", "101", "111"],
    P: ["110", "101", "110", "100", "100"],
    R: ["110", "101", "110", "101", "101"],
    S: ["111", "100", "111", "001", "111"],
    T: ["111", "010", "010", "010", "010"],
    U: ["101", "101", "101", "101", "111"],
    Y: ["101", "101", "010", "010", "010"],
    H: ["101", "111", "101", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    M: ["101", "111", "101", "101", "101"],
    F: ["111", "100", "110", "100", "100"],
    "!": ["010", "010", "010", "000", "010"],
    "?": ["111", "001", "011", "000", "010"],
  };

  const $ = (id) => document.getElementById(id);
  const app = $("app");
  const screen = $("game");
  const frameEl = $("frame");
  const buf = document.createElement("canvas");
  buf.width = W;
  buf.height = H;
  const ctx = buf.getContext("2d", { alpha: false });
  const screenCtx = screen.getContext("2d");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mode = "title";
  let pausedFrom = "fight";
  let time = 0;
  let fightIndex = 0;
  let fightTime = 0;
  let introT = 0;
  let bannerT = 0;
  let victoryT = 0;
  let downT = 0;
  let shake = 0;
  let hitstop = 0;
  let worldFlash = 0;
  let gateOpen = false;
  let lessonI = 0;
  let hitsAtLesson = 0;
  let last = 0;
  let emptyT = -10;
  let announced = "";

  let stats = { dealt: 0, taken: 0, perfects: 0, cleared: 0 };
  let player = null;
  let enemy = null;
  let partner = null;
  let corpses = [];
  let act = 1;
  let careerIndex = 0;
  let run = null;
  let meta = window.GS_CAREER.load();
  let prisonerName = "";
  let banked = 0;
  let venue = "pit";
  let hubSheet = null;
  let hubNear = null;
  const particles = [];
  const numbers = [];
  const decals = [];

  const key = {};
  const mouse = { wx: 160, wy: 90, aimOk: false, left: false, right: false };
  const joy = { x: 0, y: 0, active: false };
  const btn = { attack: false, block: false, dodge: false };
  let prevDodge = false;
  let attackWas = false;
  let attackBuffer = 0;
  let forcedTouch = false;

  let floorCanvas = null;
  const crowd = [];
  for (let i = 0; i < 20; i++) crowd.push({ x: 4 + i * 16, ph: Math.random() * 6, h: 7 + (i % 3), odd: i % 2 === 0 });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function angDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function damp(v, dt) { return v * Math.exp(-10 * dt); }
  function touchMode() { return document.body.classList.contains("touch"); }

  function inside(ent) {
    const rx = ARENA.rx - ent.r;
    const ry = ARENA.ry - ent.r;
    const nx = (ent.x - ARENA.cx) / rx;
    const ny = (ent.y - ARENA.cy) / ry;
    return nx * nx + ny * ny <= 1;
  }

  function tryMove(ent, dx, dy) {
    if (dx) {
      ent.x += dx;
      if (!inside(ent)) ent.x -= dx;
    }
    if (dy) {
      ent.y += dy;
      if (!inside(ent)) ent.y -= dy;
    }
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildFloor() {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const rnd = mulberry32(0x51a7);
    g.fillStyle = "#221c18";
    g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 8) {
      for (let x = -8; x < W; x += 11) {
        const shade = 46 + Math.floor(rnd() * 26);
        const ox = ((y / 8) % 2) * 5;
        g.fillStyle = "rgb(" + (shade + 18) + "," + (shade + 14) + "," + (shade + 10) + ")";
        g.fillRect(x + ox, y, 10, 7);
        g.fillStyle = "#14110f";
        g.fillRect(x + ox, y + 7, 10, 1);
      }
    }
    for (let y = 20; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = (x - ARENA.cx) / ARENA.rx;
        const ny = (y - ARENA.cy) / ARENA.ry;
        const e = nx * nx + ny * ny;
        if (e > 1) continue;
        const n = rnd();
        let r = 108 + n * 36 - e * 38;
        let gg = 74 + n * 22 - e * 26;
        let b = 46 + n * 14 - e * 18;
        if (n > 0.94) { r -= 28; gg -= 18; b -= 10; }
        if (n < 0.035) { r += 30; gg += 18; b += 8; }
        g.fillStyle = "rgb(" + (r | 0) + "," + (gg | 0) + "," + (b | 0) + ")";
        g.fillRect(x, y, 1, 1);
      }
    }
    g.strokeStyle = "#3c342c";
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(ARENA.cx, ARENA.cy, ARENA.rx, ARENA.ry, 0, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = "#120e0c";
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(ARENA.cx, ARENA.cy, ARENA.rx + 3, ARENA.ry + 2, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(90,20,16,0.45)";
    for (let i = 0; i < 14; i++) {
      g.fillRect(ARENA.cx - 70 + rnd() * 140, ARENA.cy - 36 + rnd() * 70, 2 + rnd() * 4, 2);
    }
    floorCanvas = c;
  }

  /* ---------- audio ---------- */
  let actx = null;
  let muted = false;
  try { muted = sessionStorage.getItem("gs-mute") === "1"; } catch (err) { muted = false; }

  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!actx) actx = new AC();
    if (actx.state === "suspended") actx.resume();
    return actx;
  }

  function tone(freq, dur, type, vol, freq2) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (freq2) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq2), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur + 0.02);
  }

  function noise(dur, vol) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const n = Math.max(1, Math.floor(a.sampleRate * dur));
    const buffer = a.createBuffer(1, n, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = a.createBufferSource();
    src.buffer = buffer;
    const filter = a.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 700;
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(filter);
    filter.connect(g);
    g.connect(a.destination);
    src.start();
  }

  function sfx(name) {
    if (name === "swing") { noise(0.05, 0.05); tone(230, 0.07, "square", 0.03, 80); }
    else if (name === "hit") { tone(170, 0.08, "square", 0.045, 55); noise(0.03, 0.04); }
    else if (name === "skid") { tone(240, 0.04, "square", 0.02, 140); }
    else if (name === "hurt") { tone(120, 0.16, "sawtooth", 0.05, 40); }
    else if (name === "block") { tone(520, 0.06, "square", 0.04, 280); }
    else if (name === "perfect") { tone(660, 0.08, "square", 0.05); tone(990, 0.12, "square", 0.04); }
    else if (name === "dodge") noise(0.09, 0.055);
    else if (name === "die") tone(210, 0.45, "sawtooth", 0.055, 32);
    else if (name === "roar") tone(78, 0.4, "sawtooth", 0.05, 36);
    else if (name === "break") { noise(0.1, 0.07); tone(90, 0.14, "square", 0.05, 40); }
    else if (name === "empty") tone(78, 0.05, "square", 0.03);
    else if (name === "ui") tone(620, 0.04, "square", 0.03);
    else if (name === "win") {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.16, "square", 0.04), i * 110));
    }
  }

  function setMuted(v) {
    muted = v;
    try { sessionStorage.setItem("gs-mute", v ? "1" : "0"); } catch (err) { /* private mode */ }
    const label = v ? "SFX off" : "SFX";
    $("btn-mute").textContent = label;
    $("btn-mute").setAttribute("aria-pressed", v ? "true" : "false");
    $("btn-mute-title").textContent = v ? "SFX off" : "SFX on";
  }

  /* ---------- fx ---------- */
  function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.35 + Math.random() * 0.75);
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.22 + Math.random() * 0.22,
        max: 0.44,
        color,
        s: Math.random() < 0.3 ? 2 : 1,
        g: 0,
      });
    }
    if (particles.length > 140) particles.splice(0, particles.length - 140);
  }

  function ember(x, y) {
    particles.push({
      x: x + (Math.random() * 4 - 2),
      y,
      vx: Math.random() * 8 - 4,
      vy: -10 - Math.random() * 14,
      life: 0.5 + Math.random() * 0.4,
      max: 0.9,
      color: Math.random() < 0.5 ? "#ffb15a" : "#ff6a32",
      s: 1,
      g: -8,
    });
  }

  function floater(x, y, text, color) {
    numbers.push({ x: x + (Math.random() * 6 - 3), y, text: String(text), color, life: 0.75, vy: -22 });
    if (numbers.length > 18) numbers.shift();
  }

  function splatter(x, y, color) {
    for (let i = 0; i < 5; i++) {
      decals.push({
        x: x + Math.random() * 12 - 6,
        y: y + Math.random() * 8 - 4,
        s: Math.random() < 0.4 ? 2 : 1,
        color,
      });
    }
    if (decals.length > 48) decals.splice(0, decals.length - 48);
  }

  function bump(stop, sh) {
    hitstop = Math.max(hitstop, stop);
    shake = Math.min(1, shake + (reduceMotion ? sh * 0.25 : sh));
  }

  /* ---------- entities ---------- */
  function makePlayer() {
    const body = window.GS_CAREER.legendBody(meta);
    return {
      x: 160, y: 136, r: PLAYER.r, facing: -Math.PI / 2,
      hp: PLAYER.hp, hpMax: PLAYER.hp, stam: PLAYER.stam + body.stam, stamMax: PLAYER.stam + body.stam,
      action: "none", actionT: 0, alive: true,
      vx: 0, vy: 0, iFrames: 0, hitstun: 0, flash: 0,
      armedParry: 0, guardLock: 0, stamDelay: 0,
      attackHit: false, blockStart: -10, walked: 0, hitsLanded: 0, blockHits: 0, perfects: 0, dodgeAvoids: 0,
      swings: [], trail: [], lastDir: -Math.PI / 2,
      slowT: 0, swingFoe: null,
      dmg: PLAYER.dmg + body.dmgBonus,
      def: body.def,
      speed: PLAYER.speed,
      weaponLook: body.blade
        ? { len: 20, thick: 1, color: "#e4e7ee", edge: "#e8c070" }
        : { len: 18, thick: 1, color: "#e4e7ee", edge: "#2a3038" },
      look: null,
    };
  }

  function applyCareerCombat(p) {
    const mods = window.GS_CAREER.combatMods(run, meta);
    p.dmg = mods.dmg;
    p.def = mods.def;
    p.speed = mods.speed;
    p.stamMax = mods.stamMax;
    p.stam = mods.stamMax;
    p.hpMax = mods.hpMax;
    p.hp = Math.max(1, Math.min(mods.hpMax, Math.round(run.hp)));
    p.weaponLook = mods.weaponLook;
    p.look = mods.look;
    if (run.oil) run.oil = 0;
  }

  function syncStreetLook() {
    if (!run) return;
    const mods = window.GS_CAREER.combatMods(run, meta);
    player.look = mods.look;
    player.weaponLook = mods.weaponLook;
    player.hp = run.hp;
    player.hpMax = window.GS_CAREER.hpMax(run);
  }

  function spawnEnemy(kind) {
    const k = KINDS[kind];
    return {
      kind, sprite: k.sprite, weapon: k.weapon,
      x: 160, y: 74, r: k.r,
      hp: k.hp, hpMax: k.hp, speed: k.speed, prefer: k.prefer, thinkGap: k.think,
      facing: Math.PI / 2, alive: true, enraged: false,
      vx: 0, vy: 0, flash: 0, hitstun: 0,
      pattern: null, phase: 0, phaseT: 0, phaseEntered: false, didHit: false,
      parryOpen: false, thinkT: 0.85, lastPat: null, spinT: 0,
    };
  }

  function currentPhase(e) {
    if (!e || !e.pattern) return null;
    return e.pattern.phases[e.phase] || null;
  }

  function startPattern(e, id) {
    const src = PATTERNS[id];
    if (!src) return;
    const phases = src.phases.map((p) => ({
      ...p,
      hit: p.hit ? { ...p.hit } : undefined,
      telegraph: p.telegraph ? { ...p.telegraph } : undefined,
    }));
    if (e.kind === "varro" && run && run.rivalHeat) {
      const m = Math.max(0.82, 1 - run.rivalHeat * 0.05);
      phases.forEach((p) => { if (p.tag === "windup") p.t *= m; });
    }
    if (e.enraged && src.scales) {
      phases.forEach((p) => {
        if (p.tag === "windup" || p.tag === "recover") p.t *= 0.8;
        else if (p.tag === "gap") p.t *= 0.88;
      });
    }
    e.pattern = { id, phases, superArmor: !!src.superArmor };
    e.phase = 0;
    e.phaseT = 0;
    e.phaseEntered = false;
    e.didHit = false;
    e.spinT = 0;
    if (id !== "stagger") e.lastPat = id;
  }

  function staggerEnemy(e, dur) {
    e.pattern = { id: "stagger", phases: [{ t: dur, tag: "stagger" }], superArmor: false };
    e.phase = 0;
    e.phaseT = 0;
    e.phaseEntered = false;
    e.didHit = false;
    e.parryOpen = false;
    e.flash = 1;
    const ang = Math.atan2(e.y - player.y, e.x - player.x);
    e.vx += Math.cos(ang) * 40;
    e.vy += Math.sin(ang) * 40;
  }

  function killEnemy(which) {
    const fallen = which || enemy;
    if (!fallen || !fallen.alive) return;
    fallen.hp = 0;
    fallen.alive = false;
    fallen.pattern = null;
    burst(fallen.x, fallen.y - 8, "#e23b32", 16, 60);
    splatter(fallen.x, fallen.y, "#6a1414");
    bump(0.1, 0.75);
    sfx("hit");
    if (fallen === partner) {
      corpses.push(fallen);
      partner = null;
      showBanner("One down", "The other remains", "They came as a pair.", 1.15);
      announce("One falls. One remains.");
      return;
    }
    if (partner && partner.alive) {
      corpses.push(fallen);
      enemy = partner;
      partner = null;
      showBanner("One down", "The other remains", "They came as a pair.", 1.15);
      announce("One falls. One remains.");
      return;
    }
    stats.cleared += 1;
    mode = "victory";
    victoryT = 1.2;
    hidePrompt();
    if (act === 1) banked += [8, 12, 14, 40][fightIndex] || 0;
    if (act === 2) {
      const card = currentCareerFight();
      showBanner("Down", card ? card.title : "Down", "The street is through the gate.", 1.05);
      announce((card ? card.title : "The fighter") + " defeated.");
    } else if (fightIndex >= FIGHTS.length - 1) {
      gateOpen = true;
      showBanner("The gate", "It opens", "You are still standing.", 1.15);
      announce("The Pit Boss falls. The gate opens.");
    } else {
      showBanner("Down", FIGHTS[fightIndex].title, "The next fighter is already walking out.", 1.05);
      announce(FIGHTS[fightIndex].title + " defeated.");
    }
  }

  function triggerRivalRage(e) {
    e.enraged = true;
    e.speed = Math.round(e.speed * 1.18);
    startPattern(e, "bossRoar");
    const name = e.kind === "aelia" ? window.GS_CAREER.CHAMPION : window.GS_CAREER.RIVAL;
    showBanner("Enraged", name, e.kind === "aelia" ? "The sun gets meaner." : "He stops performing and starts hunting.", 1.3);
    sfx("roar");
    bump(0.08, 0.6);
    announce(name + " is enraged.");
  }

  function killPlayer() {
    if (!player.alive) return;
    player.alive = false;
    player.hp = 0;
    player.action = "dead";
    mode = "downed";
    downT = 0.85;
    sfx("die");
    bump(0.12, 0.9);
    hidePrompt();
    announce("You have been cut down.");
  }

  function triggerEnrage(e) {
    e.enraged = true;
    e.speed = 48;
    startPattern(e, "bossRoar");
    showBanner("Enraged", "The Pit Boss", "Faster now. He will spin if you stay close.", 1.35);
    sfx("roar");
    bump(0.08, 0.65);
    announce("The Pit Boss is enraged.");
  }

  function facingEnemy() {
    if (!enemy) return false;
    const to = Math.atan2(enemy.y - player.y, enemy.x - player.x);
    return Math.abs(angDiff(player.facing, to)) <= 1.2;
  }

  function hitOverlaps(e, hit) {
    const d = Math.hypot(player.x - e.x, player.y - e.y);
    if (hit.shape === "cone") {
      if (d > hit.range + player.r) return false;
      const ang = Math.atan2(player.y - e.y, player.x - e.x);
      return Math.abs(angDiff(ang, e.facing)) <= hit.arc * 0.5;
    }
    if (hit.shape === "circle") return d <= hit.range + player.r;
    return false;
  }

  function guardBreak() {
    player.stam = 0;
    player.action = "hurt";
    player.actionT = 0;
    player.hitstun = Math.max(player.hitstun, 0.42);
    player.guardLock = 0.6;
    player.armedParry = 0;
    floater(player.x, player.y - 26, "BREAK", "#ffffff");
    sfx("break");
    bump(0.05, 0.45);
  }

  function hurtPlayer(dmg, srcX, srcY, hitstun, kb) {
    if (!player.alive) return;
    if (dmg > 0 && player.def) dmg = Math.max(1, Math.round(dmg) - player.def);
    player.hp = Math.max(0, player.hp - dmg);
    stats.taken += dmg;
    player.flash = 1;
    player.action = "hurt";
    player.actionT = 0;
    player.hitstun = hitstun;
    player.iFrames = Math.max(player.iFrames, 0.25);
    player.armedParry = 0;
    const ang = Math.atan2(player.y - srcY, player.x - srcX);
    player.vx += Math.cos(ang) * kb;
    player.vy += Math.sin(ang) * kb;
    floater(player.x, player.y - 20, String(Math.round(dmg)), "#ff6a5a");
    burst(player.x, player.y - 10, "#e23b32", 8, 46);
    splatter(player.x, player.y, "#6a1414");
    sfx("hurt");
    bump(dmg >= 18 ? 0.07 : 0.05, dmg >= 18 ? 0.55 : 0.32);
    if (player.hp <= 0) killPlayer();
  }

  function perfectEffect(e, staggerTime) {
    player.perfects += 1;
    stats.perfects += 1;
    player.armedParry = 0;
    sfx("perfect");
    worldFlash = 1;
    bump(0.085, 0.42);
    burst((player.x + e.x) / 2, (player.y + e.y) / 2 - 6, "#ffe29a", 12, 55);
    player.stam = Math.min(player.stamMax, player.stam + 8);
    if (staggerTime > 0) {
      floater((player.x + e.x) / 2, (player.y + e.y) / 2 - 14, "STAGGER", "#ffe29a");
      staggerEnemy(e, staggerTime);
    } else {
      floater(player.x, player.y - 18, "PARRY", "#ffe29a");
    }
  }

  function resolveEnemyHit(e, hit) {
    if (!player.alive || (mode !== "fight" && mode !== "victory")) return;
    if (!hitOverlaps(e, hit)) return;
    if (player.iFrames > 0) {
      if (player.action === "dodge") {
        player.dodgeAvoids += 1;
        burst(player.x, player.y - 6, "#f6f1e6", 5, 28);
      }
      return;
    }
    const blocking = player.action === "block" && facingEnemy() && player.guardLock <= 0;
    // A perfect block is a press in the last moment, not a shield held up the whole windup.
    const perfect = blocking && (time - player.blockStart) <= 0.24 && (time - player.blockStart) >= 0;

    if (hit.guardbreak && blocking) {
      if (perfect && player.stam >= 16) {
        player.stam -= 16;
        perfectEffect(e, hit.stagger || 0.45);
      } else {
        hurtPlayer(hit.blockDmg ?? 10, e.x, e.y, 0.34, hit.kb || 120);
        if (player.alive) guardBreak();
      }
      return;
    }

    if (hit.dirty && blocking) {
      const dmg = perfect ? (hit.perfectChip ?? 6) : (hit.chip ?? 11);
      player.blockHits += 1;
      if (perfect) sfx("perfect");
      else sfx("block");
      applySnare(hit, true, perfect);
      hurtPlayer(dmg, e.x, e.y, perfect ? 0.12 : 0.2, perfect ? 36 : 70);
      if (perfect && hit.stagger && enemy && enemy.alive) staggerEnemy(e, hit.stagger);
      player.armedParry = 0;
      return;
    }

    if (blocking) {
      const chip = perfect ? 0 : (hit.chip || 0);
      const stamCost = perfect ? 0 : (hit.blockStam ?? 8);
      player.stam = Math.max(0, player.stam - stamCost);
      player.blockHits += 1;
      if (perfect) {
        if (chip) hurtPlayer(chip, e.x, e.y, 0.08, 24);
        if (player.alive) perfectEffect(e, hit.stagger || 0);
      } else {
        sfx("block");
        burst(player.x + Math.cos(player.facing) * 8, player.y - 10, "#d5dbe6", 6, 32);
        bump(0.03, 0.16);
        floater(player.x, player.y - 18, chip ? "CHIP" : "BLOCK", "#d5dbe6");
        if (chip) hurtPlayer(chip, e.x, e.y, 0.12, (hit.kb || 50) * 0.3);
        else {
          const ang = Math.atan2(player.y - e.y, player.x - e.x);
          player.vx += Math.cos(ang) * 36;
          player.vy += Math.sin(ang) * 36;
        }
        applySnare(hit, true, false);
      }
      if (player.alive && player.stam <= 0 && player.action === "block") guardBreak();
      return;
    }

    hurtPlayer(hit.dmg, e.x, e.y, hit.hitstun ?? 0.2, hit.kb ?? 80);
    applySnare(hit, false, false);
  }

  function applySnare(hit, blocked, perfect) {
    if (!hit || !hit.snare || perfect) return;
    const dur = blocked ? hit.snare * 0.45 : hit.snare;
    player.slowT = Math.max(player.slowT || 0, dur);
    floater(player.x, player.y - 28, "SNARE", "#f0c84a");
  }

  function onPlayerHitEnemy() {
    const e = (player.swingFoe && player.swingFoe.alive) ? player.swingFoe : enemy;
    if (!e || !e.alive) return;
    const ph = currentPhase(e);
    if (ph && ph.tag === "guard") {
      sfx("block");
      burst(e.x, e.y - 12, "#9ad0ff", 8, 40);
      floater(e.x, e.y - 26, "COUNTER", "#9ad0ff");
      const cid = ph.counter || (e.kind === "boss" ? "bossCounter" : null);
      if (cid) startPattern(e, cid);
      bump(0.05, 0.3);
      return;
    }
    let dmg = player.dmg || PLAYER.dmg;
    const armor = ph && ph.armor != null ? ph.armor : 1;
    const skid = armor < 0.95;
    if (skid) dmg = Math.max(1, Math.round(dmg * armor));
    e.hp -= dmg;
    e.flash = 1;
    stats.dealt += dmg;
    player.hitsLanded += 1;
    floater(e.x, e.y - 22, String(dmg), skid ? "#9a9088" : "#f6f1e6");
    burst(e.x, e.y - 8, skid ? "#9a9088" : "#f6f1e6", skid ? 3 : 6, skid ? 20 : 36);
    if (!skid) splatter(e.x, e.y, "#6a1414");
    sfx(skid ? "skid" : "hit");
    bump(skid ? 0.02 : 0.045, skid ? 0.08 : 0.26);
    const ang = Math.atan2(e.y - player.y, e.x - player.x);
    if (ph && (ph.tag === "stagger" || ph.tag === "roar")) {
      e.vx += Math.cos(ang) * 14;
      e.vy += Math.sin(ang) * 14;
    } else if (e.pattern && e.pattern.superArmor) {
      e.vx += Math.cos(ang) * 18;
      e.vy += Math.sin(ang) * 18;
    } else {
      e.hitstun = Math.max(e.hitstun, 0.12);
      e.vx += Math.cos(ang) * 100;
      e.vy += Math.sin(ang) * 100;
      if (e.pattern && !e.pattern.superArmor) e.pattern = null;
    }
    if (e.hp <= 0) {
      killEnemy(e);
      return;
    }
    if (e.kind === "boss" && !e.enraged && e.hp <= e.hpMax * 0.45) triggerEnrage(e);
    else if (!e.enraged && e.hp <= e.hpMax * 0.4 && (e.kind === "varro" || e.kind === "aelia")) triggerRivalRage(e);
  }

  function foeInSwing(e) {
    if (!e || !e.alive) return false;
    const d = dist(player, e);
    if (d > ATTACK.range + e.r) return false;
    const ang = Math.atan2(e.y - player.y, e.x - player.x);
    return Math.abs(angDiff(ang, player.facing)) <= ATTACK.arc * 0.5;
  }

  function swingConnects() {
    const list = [];
    if (foeInSwing(enemy)) list.push(enemy);
    if (foeInSwing(partner)) list.push(partner);
    if (!list.length) {
      player.swingFoe = null;
      return false;
    }
    list.sort((a, b) => dist(player, a) - dist(player, b));
    player.swingFoe = list[0];
    return true;
  }

  /* ---------- player actions ---------- */
  function emptyNotice() {
    if (time - emptyT < 0.45) return;
    emptyT = time;
    floater(player.x, player.y - 24, "EMPTY", "#e8c070");
    sfx("empty");
  }

  function canDodge() {
    if (!player.alive) return false;
    if (player.action === "hurt" || player.action === "dodge" || player.action === "dead") return false;
    if (player.action === "attack" && player.actionT < ATTACK.lock) return false;
    return true;
  }

  function canBlock() {
    if (!player.alive) return false;
    if (player.action === "hurt" || player.action === "dodge" || player.action === "dead") return false;
    if (player.guardLock > 0) return false;
    if (player.action === "attack" && player.actionT < ATTACK.lock) return false;
    if (player.stam <= BLOCK.min && player.action !== "block") return false;
    return true;
  }

  function canAttack() {
    if (!player.alive) return false;
    if (mode !== "fight" && mode !== "intro") return false;
    if (player.action === "hurt" || player.action === "dodge" || player.action === "block" || player.action === "dead") return false;
    if (player.action === "attack" && player.actionT < ATTACK.total - 0.02) return false;
    return true;
  }

  function beginDodge(inp) {
    if (player.stam < DODGE.stam) { emptyNotice(); return; }
    const mag = Math.hypot(inp.mx, inp.my);
    let dir;
    if (mag > 0.2) dir = Math.atan2(inp.my, inp.mx);
    else if (player.lastDir != null) dir = player.lastDir;
    else if (enemy && enemy.alive) dir = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    else dir = player.facing;
    player.stam -= DODGE.stam;
    player.stamDelay = STAM.delay;
    player.dodgeDir = dir;
    player.facing = dir;
    player.action = "dodge";
    player.actionT = 0;
    player.iFrames = DODGE.iframes;
    player.trail = [];
    sfx("dodge");
  }

  function beginBlock() {
    if (player.action !== "block") {
      player.blockStart = time;
      if (enemy && enemy.parryOpen) player.armedParry = 0.48;
    }
    player.action = "block";
    player.stamDelay = STAM.delay;
  }

  function beginAttack() {
    if (player.stam < ATTACK.stam) { emptyNotice(); return; }
    player.stam -= ATTACK.stam;
    player.stamDelay = STAM.delay;
    player.action = "attack";
    player.actionT = 0;
    player.attackHit = false;
    player.swings.push(time);
    player.swings = player.swings.filter((t) => time - t < 1.25);
    attackBuffer = 0;
    sfx("swing");
  }

  function updateFacing(inp) {
    if (player.action === "dodge" || player.action === "hurt" || player.action === "dead") return;
    let ang = null;
    if (inp.aimOk) ang = Math.atan2(inp.aimY - player.y, inp.aimX - player.x);
    else if (touchMode()) {
      const mag = Math.hypot(inp.mx, inp.my);
      const near = nearestFoe();
      if ((player.action === "block" || mag < 0.22) && near) {
        ang = Math.atan2(near.y - player.y, near.x - player.x);
      } else if (mag >= 0.22) ang = Math.atan2(inp.my, inp.mx);
    } else {
      const near = nearestFoe();
      if (near) ang = Math.atan2(near.y - player.y, near.x - player.x);
    }
    if (ang == null) return;
    if (player.action === "attack" && player.actionT >= 0.04) return;
    player.facing = ang;
  }

  function applyMove(inp, dt, mul) {
    const mag = Math.hypot(inp.mx, inp.my);
    if (mag < 0.12 || !player.alive) return;
    const sp = (player.speed || PLAYER.speed) * (player.slowT > 0 ? 0.45 : 1) * mul;
    tryMove(player, (inp.mx / mag) * sp * dt, (inp.my / mag) * sp * dt);
    player.walked += sp * dt;
    player.lastDir = Math.atan2(inp.my, inp.mx);
    if (Math.random() < dt * 8) {
      particles.push({
        x: player.x, y: player.y, vx: 0, vy: 0,
        life: 0.25, max: 0.25, color: "#6a5038", s: 1, g: 0,
      });
    }
  }

  function stepPlayer(inp, dt) {
    player.iFrames = Math.max(0, player.iFrames - dt);
    player.flash = Math.max(0, player.flash - dt * 7);
    player.slowT = Math.max(0, (player.slowT || 0) - dt);
    player.armedParry = Math.max(0, player.armedParry - dt);
    player.guardLock = Math.max(0, player.guardLock - dt);
    player.hitstun = Math.max(0, player.hitstun - dt);
    player.vx = damp(player.vx, dt);
    player.vy = damp(player.vy, dt);
    tryMove(player, player.vx * dt, player.vy * dt);

    if (!player.alive) return;
    updateFacing(inp);

    if (player.action === "dodge") {
      tryMove(player, Math.cos(player.dodgeDir) * DODGE.speed * dt, Math.sin(player.dodgeDir) * DODGE.speed * dt);
      player.trail.push({ x: player.x, y: player.y });
      if (player.trail.length > 4) player.trail.shift();
      player.actionT += dt;
      if (player.actionT >= DODGE.dur) player.action = "none";
    } else if (player.action === "hurt") {
      player.actionT += dt;
      if (player.hitstun <= 0) player.action = "none";
    } else if (inp.dodge && canDodge()) {
      beginDodge(inp);
    } else if (player.action === "attack") {
      const t = player.actionT;
      if (t >= ATTACK.hitStart && t <= ATTACK.hitEnd) {
        tryMove(player, Math.cos(player.facing) * 36 * dt, Math.sin(player.facing) * 36 * dt);
      }
      if (!player.attackHit && t >= ATTACK.hitStart && t <= ATTACK.hitEnd && swingConnects()) {
        player.attackHit = true;
        onPlayerHitEnemy();
      }
      applyMove(inp, dt, 0.42);
      player.actionT += dt;
      if (player.action === "attack" && player.actionT >= ATTACK.lock) {
        if (inp.dodge && canDodge()) beginDodge(inp);
        else if (inp.block && canBlock()) beginBlock();
      }
      if (player.action === "attack" && player.actionT >= ATTACK.total) player.action = "none";
    } else if (inp.block && canBlock()) {
      beginBlock();
      applyMove(inp, dt, 0.55);
      player.stam -= BLOCK.drain * dt;
      if (player.stam <= 0) guardBreak();
    } else {
      if (player.action === "block") player.action = "none";
      applyMove(inp, dt, 1);
      if ((inp.attack || attackBuffer > 0) && canAttack()) beginAttack();
    }

    if (player.stamDelay > 0) player.stamDelay -= dt;
    else if (player.action !== "block" && player.action !== "dodge" && player.action !== "attack") {
      player.stam = Math.min(player.stamMax, player.stam + STAM.regen * dt);
    }
    player.stam = clamp(player.stam, 0, player.stamMax);
  }

  /* ---------- enemy AI ---------- */
  function onPhaseEnter(e, ph) {
    if (ph.tag === "strike" && ph.hit && !ph.hit.persist) {
      e.didHit = true;
      resolveEnemyHit(e, ph.hit);
    }
    if (ph.lunge) tryMove(e, Math.cos(e.facing) * ph.lunge, Math.sin(e.facing) * ph.lunge);
  }

  function tickPattern(e, dt) {
    if (!e.pattern) return;
    const pat = e.pattern;
    const ph = pat.phases[e.phase];
    if (!ph) { e.pattern = null; return; }
    if (!e.phaseEntered) {
      e.phaseEntered = true;
      onPhaseEnter(e, ph);
      if (e.pattern !== pat) return;
    }
    if (ph.tag === "windup" && e.phaseT < (ph.track ?? 0)) {
      e.facing = Math.atan2(player.y - e.y, player.x - e.x);
    }
    if (ph.tag === "spin") {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = (ph.move || 0) * (e.enraged ? 1.2 : 1);
      tryMove(e, (dx / d) * sp * dt, (dy / d) * sp * dt);
      e.facing += dt * 12;
      e.spinT += dt;
      const every = ph.tick || 0.34;
      if (e.spinT >= every) {
        e.spinT -= every;
        if (ph.hit && player.alive) resolveEnemyHit(e, ph.hit);
      }
    }
    if (ph.move && ph.tag === "strike") {
      tryMove(e, Math.cos(e.facing) * ph.move * dt, Math.sin(e.facing) * ph.move * dt);
      if (ph.hit && ph.hit.persist && !e.didHit && hitOverlaps(e, ph.hit)) {
        e.didHit = true;
        resolveEnemyHit(e, ph.hit);
      }
    }
    const remain = ph.t - e.phaseT;
    e.parryOpen = !!(ph.tag === "windup" && ph.flare && remain <= ph.flare);
    e.phaseT += dt;
    if (e.pattern !== pat) return;
    if (e.phaseT >= ph.t) {
      e.phase += 1;
      e.phaseT = 0;
      e.phaseEntered = false;
      e.didHit = false;
      e.parryOpen = false;
      if (e.phase >= pat.phases.length) {
        e.pattern = null;
        e.thinkT = 0.16;
      }
    }
  }

  function pickBoss(e) {
    if (!e.lastPat) return "bossCleave";
    const d = dist(e, player);
    const bag = [];
    const add = (id, w) => { if (w > 0) bag.push({ id, w }); };
    add("bossCleave", 5);
    add("bossCharge", d > 52 ? 5 : 2);
    if (e.hp <= e.hpMax * 0.72) add("bossSlam", 4);
    if (e.enraged) add("bossWhirl", 4);
    if (player.action === "block") {
      add("bossCharge", 4);
      if (e.hp <= e.hpMax * 0.72) add("bossSlam", 3);
    }
    const recent = player.swings.filter((t) => time - t < 1.2).length;
    if (recent >= 3 && d < 44) add("bossGuard", 9);
    else add("bossGuard", 1.2);
    if (e.lastPat && bag.length > 1) {
      bag.forEach((b) => { if (b.id === e.lastPat) b.w *= 0.25; });
    }
    let total = 0;
    bag.forEach((b) => { total += b.w; });
    let r = Math.random() * total;
    for (let i = 0; i < bag.length; i++) {
      r -= bag[i].w;
      if (r <= 0) return bag[i].id;
    }
    return "bossCleave";
  }

  function choosePattern(e) {
    if (e.kind === "prisoner") return "prisonerSwing";
    if (e.kind === "brute") return "bruteSlam";
    if (e.kind === "hound") return "houndLunge";
    if (e.kind === "boss") return pickBoss(e);
    return window.GS_CAREER.pick(e, {
      dist: dist(e, player),
      blocking: player.action === "block",
      swings: player.swings.filter((t) => time - t < 1.2).length,
      hp: e.hpMax ? e.hp / e.hpMax : 1,
    });
  }

  function think(e, dt) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.facing = Math.atan2(dy, dx);
    const sp = e.speed;
    if (d > e.prefer + 3) tryMove(e, (dx / d) * sp * dt, (dy / d) * sp * dt);
    else if (d < e.prefer - 16) tryMove(e, (-dx / d) * sp * 0.65 * dt, (-dy / d) * sp * 0.65 * dt);
    else if (e.kind === "hound" || e.kind === "lion") tryMove(e, (-dy / d) * sp * dt, (dx / d) * sp * dt);
    e.thinkT -= dt;
    if (e.thinkT > 0) return;
    startPattern(e, choosePattern(e));
  }

  function updateOneFoe(e, dt) {
    if (!e) return;
    e.flash = Math.max(0, e.flash - dt * 8);
    e.vx = damp(e.vx, dt);
    e.vy = damp(e.vy, dt);
    tryMove(e, e.vx * dt, e.vy * dt);
    if (!e.alive) return;
    if (e.hitstun > 0) {
      e.hitstun -= dt;
      return;
    }
    if (mode !== "fight") {
      e.facing = Math.atan2(player.y - e.y, player.x - e.x);
      return;
    }
    if (e.pattern) tickPattern(e, dt);
    else think(e, dt);
  }

  function updateEnemy(dt) {
    if (enemy) updateOneFoe(enemy, dt);
    if (partner) updateOneFoe(partner, dt);
  }

  function pushApart(a, b) {
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 0.0001;
    const min = a.r + b.r - 1;
    if (d >= min) return;
    const push = (min - d) / 2;
    const nx = dx / d;
    const ny = dy / d;
    a.x -= nx * push;
    a.y -= ny * push;
    b.x += nx * push;
    b.y += ny * push;
    if (!inside(a)) { a.x += nx * push; a.y += ny * push; }
    if (!inside(b)) { b.x -= nx * push; b.y -= ny * push; }
  }

  function separate() {
    if (enemy) pushApart(player, enemy);
    if (partner && partner.alive) pushApart(player, partner);
    if (enemy && enemy.alive && partner && partner.alive) pushApart(enemy, partner);
  }

  function livingFoes() {
    const list = [];
    if (enemy && enemy.alive) list.push(enemy);
    if (partner && partner.alive) list.push(partner);
    return list;
  }

  function nearestFoe() {
    let best = null;
    let bd = 1e9;
    livingFoes().forEach((e) => {
      const d = dist(player, e);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  /* ---------- input ---------- */
  function readHuman() {
    let mx = 0;
    let my = 0;
    if (key.KeyW || key.ArrowUp) my -= 1;
    if (key.KeyS || key.ArrowDown) my += 1;
    if (key.KeyA || key.ArrowLeft) mx -= 1;
    if (key.KeyD || key.ArrowRight) mx += 1;
    if (joy.active) { mx = joy.x; my = joy.y; }
    else if (mx && my) {
      const l = Math.hypot(mx, my);
      mx /= l;
      my /= l;
    }
    return {
      mx, my,
      attack: mouse.left || btn.attack,
      block: mouse.right || btn.block,
      dodge: !!key.Space || btn.dodge,
      aimOk: mouse.aimOk && !touchMode(),
      aimX: mouse.wx,
      aimY: mouse.wy,
    };
  }

  function gather() {
    const src = readHuman();
    const dodge = !!src.dodge && !prevDodge;
    prevDodge = !!src.dodge;
    const attack = !!src.attack;
    if (attack && !attackWas) attackBuffer = 0.14;
    attackWas = attack;
    attackBuffer = Math.max(0, attackBuffer - 0); // decayed in update with dt
    return {
      mx: src.mx || 0,
      my: src.my || 0,
      attack,
      block: !!src.block,
      dodge,
      aimOk: !!src.aimOk,
      aimX: src.aimX,
      aimY: src.aimY,
    };
  }

  /* ---------- lessons / flow ---------- */
  function currentCareerFight() {
    if (!run || !run.currentId || !window.GS_CAREER) return null;
    return window.GS_CAREER.fightById(run.currentId);
  }

  function currentCard() {
    if (act === 2) return currentCareerFight() || { kicker: "The street", title: "the sand", tip: "" };
    return FIGHTS[fightIndex] || FIGHTS[0];
  }

  function lessonId() {
    if (act === 2) {
      const f = currentCareerFight();
      return f && f.tip && lessonI === 0 ? "tip" : null;
    }
    const list = FIGHTS[fightIndex] ? FIGHTS[fightIndex].lessons : [];
    return list[lessonI] || null;
  }

  function refreshLesson() {
    const el = $("prompt");
    const id = lessonId();
    if (!id || (mode !== "fight" && mode !== "intro")) {
      el.hidden = true;
      return;
    }
    if (mode === "intro") { el.hidden = true; return; }
    el.hidden = false;
    if (id === "tip") {
      const f = currentCareerFight();
      el.textContent = f ? f.tip : "";
      return;
    }
    el.textContent = LESSONS[id][touchMode() ? "touch" : "desk"];
  }

  function hidePrompt() { $("prompt").hidden = true; }

  function checkLesson() {
    const id = lessonId();
    if (!id || mode !== "fight") return;
    let done = false;
    if (id === "move" && player.walked > 30) done = true;
    if (id === "attack" && player.hitsLanded > hitsAtLesson) done = true;
    if (id === "block" && (player.perfects > 0 || (player.blockHits > 0 && fightTime > 6))) done = true;
    if (id === "dodge" && player.dodgeAvoids > 0) done = true;
    if (id === "boss" && fightTime > 8.5) done = true;
    if (id === "tip" && fightTime > 6.5) done = true;
    if (!done) return;
    lessonI += 1;
    hitsAtLesson = player.hitsLanded;
    refreshLesson();
  }

  function showBanner(kicker, title, sub, dur) {
    $("banner-kicker").textContent = kicker || "";
    $("banner-title").textContent = title || "";
    $("banner-sub").textContent = sub || "";
    $("banner").hidden = false;
    $("prompt").hidden = true;
    app.classList.add("banner-on");
    bannerT = dur;
  }

  function hideBanner() {
    $("banner").hidden = true;
    app.classList.remove("banner-on");
    bannerT = 0;
    if (mode === "fight") refreshLesson();
  }

  function controlsText() {
    if (touchMode()) {
      return "Stick moves and aims. Stand still to face the nearest enemy. Attack, hold Block, Dodge. A block pressed as the warning flares white is a perfect block.";
    }
    return "WASD moves. Mouse aims. Left click attacks. Hold right click to block. Space dodges. Press block as the warning flares white to perfect-block.";
  }

  function syncControlsCopy() {
    const text = controlsText();
    $("title-controls").textContent = text;
    $("pause-controls").textContent = text;
  }

  function showOverlay(which) {
    $("overlay").hidden = false;
    ["title", "pause", "dead", "champion", "hall", "legend"].forEach((name) => {
      $("panel-" + name).hidden = name !== which;
    });
    if (which === "dead") fillStats($("dead-stats"));
    syncControlsCopy();
  }

  function hideOverlay() { $("overlay").hidden = true; }

  function fillStats(el) {
    const fights = act === 1 && !run ? stats.cleared + " / " + FIGHTS.length : String(stats.cleared);
    el.innerHTML =
      "<div>Fights cleared<b>" + fights + "</b></div>" +
      "<div>Perfect blocks<b>" + stats.perfects + "</b></div>" +
      "<div>Damage dealt<b>" + Math.round(stats.dealt) + "</b></div>" +
      "<div>Damage taken<b>" + Math.round(stats.taken) + "</b></div>";
  }

  function announce(text) {
    if (text === announced) return;
    announced = text;
    $("sr").textContent = text;
  }

  function beginFight(i) {
    fightIndex = i;
    const f = FIGHTS[i];
    player.x = 160;
    player.y = 126;
    player.hp = player.hpMax;
    player.stam = player.stamMax;
    player.action = "none";
    player.actionT = 0;
    player.alive = true;
    player.vx = player.vy = 0;
    player.iFrames = 0.45;
    player.hitstun = 0;
    player.flash = 0;
    player.armedParry = 0;
    player.guardLock = 0;
    player.facing = -Math.PI / 2;
    player.lastDir = -Math.PI / 2;
    player.walked = 0;
    player.hitsLanded = 0;
    player.blockHits = 0;
    player.perfects = 0;
    player.dodgeAvoids = 0;
    player.swings = [];
    player.trail = [];
    player.stamDelay = 0;
    player.attackHit = false;
    player.blockStart = -10;
    enemy = spawnEnemy(f.kind);
    partner = null;
    corpses = [];
    venue = "pit";
    particles.length = 0;
    numbers.length = 0;
    decals.length = 0;
    gateOpen = false;
    lessonI = 0;
    hitsAtLesson = 0;
    fightTime = 0;
    mode = "intro";
    introT = 1.5;
    showBanner(f.kicker, f.title, f.sub, 1.5);
    hidePrompt();
    announce(f.kicker + ". " + f.title + ".");
  }

  function startRun() {
    stats = { dealt: 0, taken: 0, perfects: 0, cleared: 0 };
    act = 1;
    run = null;
    careerIndex = 0;
    banked = 0;
    partner = null;
    corpses = [];
    venue = "pit";
    hubSheet = null;
    hubNear = null;
    prisonerName = window.GS_CAREER.randomName();
    meta = window.GS_CAREER.load();
    window.GS_CAREER.clearRun();
    player = makePlayer();
    document.body.classList.remove("hub-on");
    $("hub-dock").hidden = true;
    hideOverlay();
    beginFight(0);
    sfx("ui");
  }

  function leaveHubChrome() {
    document.body.classList.remove("hub-on");
    $("hub-dock").hidden = true;
  }

  function refreshHub() {
    const on = mode === "hub";
    document.body.classList.toggle("hub-on", on);
    $("hub-dock").hidden = !on;
    if (!on || !run) return;
    syncStreetLook();
    window.GS_CAREER.paint($("hub-dock"), run, hubSheet, meta);
    window.GS_CAREER.saveRun(run);
  }

  function enterCareerFromPit() {
    const hurt = player.hp < player.hpMax * 0.5;
    run = window.GS_CAREER.createRun({
      name: prisonerName,
      hp: Math.max(1, player.hp),
      gold: banked,
    });
    if (hurt) run.deepCut = true;
    run.hp = Math.min(run.hp, window.GS_CAREER.hpMax(run));
    act = 2;
    careerIndex = 0;
    run._index = 0;
    venue = "street";
    enemy = null;
    partner = null;
    corpses = [];
    hubSheet = "gate";
    hubNear = null;
    mode = "hub";
    player.x = 160;
    player.y = 96;
    player.action = "none";
    player.alive = true;
    player.vx = player.vy = 0;
    syncStreetLook();
    hideOverlay();
    showBanner("You are free", run.name, "Two names on the card. You cannot do all of it.", 2.4);
    announce("You are free. The career begins.");
    refreshHub();
    sfx("win");
  }

  function beginCareerFight() {
    const f = currentCareerFight();
    if (!f || !run) return;
    window.GS_CAREER.saveRun(run);
    const paid = !!(run.heatPending && f.id !== "varro" && f.id !== "aelia");
    const oiled = run.oil > 0;
    venue = f.venue;
    partner = null;
    corpses = [];
    player.x = 160;
    player.y = 126;
    player.action = "none";
    player.actionT = 0;
    player.alive = true;
    player.vx = player.vy = 0;
    player.iFrames = 0.45;
    player.hitstun = 0;
    player.flash = 0;
    player.armedParry = 0;
    player.guardLock = 0;
    player.facing = -Math.PI / 2;
    player.lastDir = -Math.PI / 2;
    player.walked = 0;
    player.hitsLanded = 0;
    player.blockHits = 0;
    player.perfects = 0;
    player.dodgeAvoids = 0;
    player.swings = [];
    player.trail = [];
    player.stamDelay = 0;
    player.attackHit = false;
    player.blockStart = -10;
    player.slowT = 0;
    applyCareerCombat(player);
    enemy = spawnEnemy(f.kind);
    enemy.role = "jab";
    if (f.duo) {
      enemy.x = 124;
      partner = spawnEnemy(f.kind);
      partner.role = "sweep";
      partner.x = 196;
      partner.y = 66;
    }
    if (paid) {
      [enemy, partner].forEach((e) => {
        if (!e) return;
        e.hp = Math.round(e.hp * 1.15);
        e.hpMax = e.hp;
      });
      run.heatPending = false;
    }
    particles.length = 0;
    numbers.length = 0;
    decals.length = 0;
    gateOpen = false;
    lessonI = 0;
    hitsAtLesson = 0;
    fightTime = 0;
    mode = "intro";
    introT = 1.6;
    leaveHubChrome();
    hideOverlay();
    const taunt = window.GS_CAREER.taunt(run, f);
    let sub = taunt || f.sub;
    if (oiled) sub = "Oil on the blade. " + sub;
    if (paid) sub = window.GS_CAREER.RIVAL + " paid them. " + sub;
    showBanner(f.kicker, f.title, sub, 1.8);
    announce(f.kicker + ". " + f.title + ".");
  }

  function concludeCareerFight() {
    const f = currentCareerFight();
    if (!f) return;
    const result = window.GS_CAREER.onWin(run, f, player.hp, player.hpMax);
    syncStreetLook();
    if (f.final) {
      finishChampion();
      return;
    }
    enemy = null;
    partner = null;
    corpses = [];
    venue = "street";
    mode = "hub";
    hubSheet = "gate";
    hubNear = null;
    player.x = 160;
    player.y = 96;
    player.action = "none";
    player.alive = true;
    run.note = result.note;
    showBanner("Purse +" + result.purse, f.title, run.hp + " health left on you.", 1.8);
    refreshHub();
  }

  function finishChampion() {
    const pts = window.GS_CAREER.score({ champion: true, careerWins: run.wins, act1Cleared: 4 });
    window.GS_CAREER.bank(meta, {
      name: run.name,
      fate: "Champion of Rome",
      points: pts,
      fame: run.fame,
    });
    meta = window.GS_CAREER.load();
    window.GS_CAREER.clearRun();
    mode = "champion";
    leaveHubChrome();
    showOverlay("champion");
    $("champ-name").textContent = run.name;
    $("champ-copy").textContent = "Rome says the name. " + run.gold + " denarii on the table, fame " + run.fame + ", and " + pts + " Legend for whoever wakes up in the pit next.";
    sfx("win");
    announce("Champion of Rome.");
  }

  function advance() {
    hideBanner();
    if (act === 2) {
      concludeCareerFight();
      return;
    }
    if (fightIndex >= FIGHTS.length - 1) enterCareerFromPit();
    else beginFight(fightIndex + 1);
  }

  function finishDeath() {
    const foe = currentCard();
    const where = run
      ? "fell to " + (foe ? foe.title : "the sand")
      : "fell in the pit" + (foe ? " to " + foe.title : "");
    const pts = window.GS_CAREER.score({
      champion: false,
      careerWins: run ? run.wins : 0,
      act1Cleared: run ? 4 : stats.cleared,
    });
    window.GS_CAREER.bank(meta, {
      name: prisonerName || "A prisoner",
      fate: where,
      points: pts,
      fame: run ? run.fame : 0,
    });
    meta = window.GS_CAREER.load();
    window.GS_CAREER.clearRun();
    mode = "dead";
    leaveHubChrome();
    showOverlay("dead");
    $("dead-blurb").textContent = "The sand keeps the body. The yard keeps the name. +" + pts + " Legend. The next prisoner starts at the first fight.";
    announce("Run over. Legend plus " + pts + ".");
  }

  function pause() {
    if (mode === "title" || mode === "dead" || mode === "free" || mode === "paused" || mode === "champion" || mode === "codex") return;
    pausedFrom = mode;
    mode = "paused";
    showOverlay("pause");
  }

  function resume() {
    if (mode !== "paused") return;
    mode = pausedFrom || "fight";
    hideOverlay();
    refreshLesson();
    if (mode === "hub") refreshHub();
  }

  function bootTitle() {
    mode = "title";
    act = 1;
    run = null;
    enemy = null;
    partner = null;
    corpses = [];
    venue = "pit";
    player = makePlayer();
    player.x = 160;
    player.y = 110;
    gateOpen = false;
    leaveHubChrome();
    showOverlay("title");
    const line = $("title-legend");
    if (line) {
      const owned = Object.keys(meta.owned).filter((k) => meta.owned[k]).length;
      const bits = [];
      if (meta.hall.length) bits.push(meta.hall.length + " names in the hall");
      bits.push(meta.points + " Legend to spend");
      if (owned) bits.push(owned + " unlock" + (owned === 1 ? "" : "s") + " carried into the pit");
      line.textContent = bits.join(". ") + ".";
    }
    const saved = window.GS_CAREER.loadRun();
    const resumeBtn = $("btn-resume-career");
    const saveLine = $("title-save");
    if (resumeBtn) {
      resumeBtn.hidden = !saved;
      resumeBtn.textContent = saved ? "Resume " + saved.name : "Resume career";
    }
    if (saveLine) {
      saveLine.hidden = !saved;
      saveLine.textContent = saved
        ? "A career is still on the street. Enter the pit starts a new prisoner and leaves that one behind."
        : "";
    }
    announce("Gladiator Secret. A prisoner, then a career, if the gate opens.");
  }

  function resumeCareer() {
    const saved = window.GS_CAREER.loadRun();
    if (!saved) return;
    stats = { dealt: 0, taken: 0, perfects: 0, cleared: saved.wins || 0 };
    act = 2;
    run = saved;
    careerIndex = 0;
    banked = 0;
    partner = null;
    corpses = [];
    venue = "street";
    hubSheet = "gate";
    hubNear = null;
    prisonerName = saved.name;
    meta = window.GS_CAREER.load();
    player = makePlayer();
    player.x = 160;
    player.y = 96;
    enemy = null;
    mode = "hub";
    syncStreetLook();
    hideOverlay();
    showBanner("The street", run.name, run.days + (run.days === 1 ? " day" : " days") + " before the gate.", 1.6);
    refreshHub();
    announce("Career resumed.");
  }

  function openCodex(which) {
    mode = "codex";
    showOverlay(which);
    if (which === "hall") window.GS_CAREER.paintHall($("hall-body"), meta);
    if (which === "legend") window.GS_CAREER.paintLegend($("legend-body"), meta);
  }

  function onHubClick(e) {
    const b = e.target.closest("[data-act]");
    if (!b || !run || mode !== "hub") return;
    const res = window.GS_CAREER.perform(run, b.dataset.act, b.dataset.arg || "");
    if (res.open) hubSheet = res.open;
    if (res.close) hubSheet = null;
    if (res.msg) run.note = res.msg;
    sfx(res.ok ? "ui" : "empty");
    announce(res.msg || "");
    if (res.fight) {
      beginCareerFight();
      return;
    }
    syncStreetLook();
    refreshHub();
  }

  function updateHub(inp, dt) {
    player.flash = Math.max(0, player.flash - dt * 7);
    const mag = Math.hypot(inp.mx, inp.my);
    if (mag > 0.12 && player.alive) {
      const sp = 68;
      player.x = clamp(player.x + (inp.mx / mag) * sp * dt, 18, 302);
      player.y = clamp(player.y + (inp.my / mag) * sp * dt, 52, 164);
      player.facing = Math.atan2(inp.my, inp.mx);
      player.lastDir = player.facing;
    }
    const st = window.GS_CAREER.stationAt(player.x, player.y, 0);
    const id = st ? st.id : null;
    if (id && id !== hubNear) {
      hubNear = id;
      hubSheet = id;
      refreshHub();
    } else if (!id) hubNear = null;
  }

  /* ---------- update / draw ---------- */
  function updateParticles(dt) {
    if (mode !== "hub" && venue === "pit") {
      if (Math.random() < dt * 7) ember(34, 52);
      if (Math.random() < dt * 7) ember(286, 52);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.g || 0) * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = numbers.length - 1; i >= 0; i--) {
      const n = numbers[i];
      n.life -= dt;
      n.y += n.vy * dt;
      n.vy *= Math.exp(-1.5 * dt);
      if (n.life <= 0) numbers.splice(i, 1);
    }
  }

  function update(dt) {
    attackBuffer = Math.max(0, attackBuffer - dt);
    time += dt;
    shake = Math.max(0, shake - dt * 1.7);
    worldFlash = Math.max(0, worldFlash - dt * 3.2);
    updateParticles(dt);

    if (mode === "title") {
      player.facing = -Math.PI / 2 + Math.sin(time * 0.8) * 0.7;
      player.x = 160 + Math.sin(time * 0.55) * 16;
      player.y = 112 + Math.cos(time * 0.4) * 5;
      return;
    }
    if (mode === "paused" || mode === "dead" || mode === "free" || mode === "champion" || mode === "codex") return;

    if (mode === "hub") {
      if (bannerT > 0) {
        bannerT -= dt;
        if (bannerT <= 0) hideBanner();
      }
      updateHub(gather(), dt);
      return;
    }

    if (mode === "downed") {
      downT -= dt;
      if (player) {
        player.vx = damp(player.vx, dt);
        player.vy = damp(player.vy, dt);
        tryMove(player, player.vx * dt, player.vy * dt);
      }
      if (downT <= 0) finishDeath();
      return;
    }

    const inp = gather();
    if (mode === "intro") {
      introT -= dt;
      if (bannerT > 0) bannerT -= dt;
      stepPlayer(inp, dt);
      updateEnemy(dt);
      separate();
      if (introT <= 0) {
        mode = "fight";
        fightTime = 0;
        hideBanner();
        refreshLesson();
      }
      return;
    }

    if (mode === "victory") {
      victoryT -= dt;
      if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) hideBanner(); }
      stepPlayer(inp, dt);
      if (enemy) {
        enemy.vx = damp(enemy.vx, dt);
        enemy.vy = damp(enemy.vy, dt);
        enemy.flash = Math.max(0, enemy.flash - dt * 8);
      }
      if (victoryT <= 0) advance();
      return;
    }

    fightTime += dt;
    if (bannerT > 0) {
      bannerT -= dt;
      if (bannerT <= 0) hideBanner();
    }
    stepPlayer(inp, dt);
    if (!player.alive) return;
    updateEnemy(dt);
    separate();
    checkLesson();
  }

  function drawText(g, text, x, y, color, scale) {
    const s = scale || 2;
    let cx = Math.round(x);
    const cy = Math.round(y);
    g.fillStyle = color;
    const str = String(text).toUpperCase();
    const width = str.length * 4 * s;
    cx -= Math.floor(width / 2);
    for (let i = 0; i < str.length; i++) {
      const glyph = GLYPH[str[i]];
      if (!glyph) { cx += 4 * s; continue; }
      for (let gy = 0; gy < glyph.length; gy++) {
        for (let gx = 0; gx < glyph[gy].length; gx++) {
          if (glyph[gy][gx] === "1") g.fillRect(cx + gx * s, cy + gy * s, s, s);
        }
      }
      cx += 4 * s;
    }
  }

  function drawWeapon(g, x, y, angle, len, thick, fill, edge) {
    const steps = Math.max(1, Math.ceil(len));
    for (let pass = 0; pass < 2; pass++) {
      g.fillStyle = pass === 0 ? edge : fill;
      const rad = pass === 0 ? thick : Math.max(0, thick - 1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = Math.round(x + Math.cos(angle) * len * t);
        const py = Math.round(y + Math.sin(angle) * len * t);
        const size = rad * 2 + 1;
        g.fillRect(px - rad, py - rad, size, size);
      }
    }
  }

  function weaponAngleFor(ent, isPlayer, ph) {
    if (isPlayer && player.action === "attack") {
      const u = clamp((player.actionT - 0.02) / 0.18, 0, 1);
      return player.facing + (-1.2 + u * 2.35);
    }
    if (isPlayer && player.action === "block") return player.facing + 0.7;
    if (!isPlayer && ph && ph.tag === "spin") return time * 14;
    if (!isPlayer && ph && ph.cock) {
      const u = clamp(ent.phaseT / ph.t, 0, 1);
      return ent.facing - 1.4 * ph.cock * (0.35 + 0.65 * u);
    }
    if (!isPlayer && ph && ph.tag === "strike") return ent.facing + 0.95;
    if (!isPlayer && ph && ph.tag === "stagger") return ent.facing + 1.7;
    return (isPlayer ? player.facing : ent.facing) + 0.5;
  }

  function drawShadow(g, x, y, r) {
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.ellipse(Math.round(x), Math.round(y), r, Math.max(3, r * 0.45), 0, 0, Math.PI * 2);
    g.fill();
  }

  function drawActor(g, ent, sprite, isPlayer) {
    const ph = isPlayer ? null : currentPhase(ent);
    const bob = isPlayer && player.action !== "dodge" ? Math.round(Math.sin(time * (Math.hypot(player.vx, player.vy) > 8 ? 14 : 3)) * 1) : 0;
    const flip = Math.cos(isPlayer ? player.facing : ent.facing) < 0 && !(ph && ph.tag === "spin");
    const dead = isPlayer ? !player.alive : ent.alive === false;
    const scale = 2;
    const frame = (sprite === "hound" || sprite === "lion") ? (Math.floor(time * 8) % 2) : 0;
    let tint = null;
    if (!isPlayer && ent.enraged) tint = "rgba(255,50,30,0.38)";
    if (!isPlayer && ph && ph.tag === "roar") tint = "rgba(255,40,20,0.55)";
    const flash = isPlayer ? player.flash : ent.flash;
    const face = isPlayer ? player.facing : ent.facing;
    const side = face + Math.PI / 2;
    const hx = isPlayer ? player.x : ent.x;
    const originY = (isPlayer ? player.y : ent.y) + bob;
    const hand = originY - (sprite === "hound" ? 8 : 14);
    const holdX = hx + Math.cos(side) * 7 + Math.cos(face) * 2;
    const holdY = hand + Math.sin(side) * 2;

    if (isPlayer && player.action === "dodge") {
      player.trail.forEach((tr, i) => {
        window.GS_SPRITES.draw(g, sprite, tr.x, tr.y, { scale, flip, alpha: 0.18 + i * 0.08, frame });
      });
    }

    drawShadow(g, hx, isPlayer ? player.y : ent.y, ent.r + 4);

    if (isPlayer && player.look && player.look.cape) {
      g.fillStyle = player.look.cape;
      g.fillRect(Math.round(hx) - 7, Math.round(originY) - 22, 4, 12);
      g.fillRect(Math.round(hx) + 3, Math.round(originY) - 20, 4, 10);
    }

    const weapon = isPlayer
      ? (player.weaponLook || { len: 18, thick: 1, color: "#e4e7ee", edge: "#2a3038" })
      : ent.weapon;
    const ang = weaponAngleFor(isPlayer ? player : ent, isPlayer, ph);

    if (weapon && ph && ph.cock) {
      drawWeapon(g, holdX, holdY, ang, weapon.len, weapon.thick, weapon.color, weapon.edge);
    }

    g.save();
    if (dead) {
      g.translate(Math.round(hx), Math.round(originY));
      g.rotate(1.15);
      g.translate(-Math.round(hx), -Math.round(originY));
    }
    window.GS_SPRITES.draw(g, sprite, hx, originY, { scale, flip, flash, tint, frame });
    if (isPlayer && player.look && player.look.helm) {
      g.fillStyle = player.look.helm;
      g.fillRect(Math.round(hx) - 4, Math.round(originY) - 32, 8, 2);
    }
    g.restore();

    if (weapon && !(ph && ph.cock)) {
      drawWeapon(g, holdX, holdY, ang, weapon.len, weapon.thick, weapon.color, weapon.edge);
      if (isPlayer && player.action === "attack") {
        const back = weaponAngleFor(player, true, null) - 0.45;
        g.globalAlpha = 0.45;
        drawWeapon(g, holdX, holdY, back, weapon.len - 2, 1, "#fff4d2", "#fff4d2");
        g.globalAlpha = 1;
      }
    }

    if (isPlayer && player.action === "block") {
      g.strokeStyle = "#f6f1e6";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(hx, originY - 12, 13, player.facing - 1.05, player.facing + 1.05);
      g.stroke();
      const bx = Math.round(hx + Math.cos(player.facing) * 12);
      const by = Math.round(originY - 12 + Math.sin(player.facing) * 10);
      g.fillStyle = "#9aa3b2";
      g.fillRect(bx - 3, by - 4, 6, 8);
      g.fillStyle = "#e8c070";
      g.fillRect(bx - 1, by - 1, 2, 3);
    }

    if (!isPlayer && ph && (ph.tag === "guard" || ph.guardRaise)) {
      const bright = ph.tag === "guard";
      g.strokeStyle = bright ? "#e7f3ff" : "#6f93c4";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(hx, originY - 14, bright ? 16 : 12, ent.facing - 1.2, ent.facing + 1.2);
      g.stroke();
    }
  }

  function drawTelegraph(g, e) {
    const ph = currentPhase(e);
    if (!ph || !ph.telegraph || !e.alive) return;
    const tel = ph.telegraph;
    const remain = ph.t - e.phaseT;
    const flare = ph.tag === "windup" && ph.flare && remain <= ph.flare;
    const flick = flare && Math.sin(time * 42) > 0;
    const color = flick ? "#ffffff" : tel.color;
    g.save();
    g.globalAlpha = flare ? 0.55 : 0.32;
    g.fillStyle = color;
    g.strokeStyle = flick ? "#ffffff" : tel.color;
    g.lineWidth = 1;
    if (tel.shape === "cone") {
      g.beginPath();
      g.moveTo(e.x, e.y);
      g.arc(e.x, e.y, tel.range, e.facing - tel.arc / 2, e.facing + tel.arc / 2);
      g.closePath();
      g.fill();
      g.globalAlpha = 0.9;
      g.stroke();
    } else if (tel.shape === "circle") {
      const grow = ph.tag === "windup" ? 0.35 + 0.65 * clamp(e.phaseT / ph.t, 0, 1) : 1;
      g.beginPath();
      g.arc(e.x, e.y, tel.range * grow, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.95;
      g.beginPath();
      g.arc(e.x, e.y, tel.range * grow, 0, Math.PI * 2);
      g.stroke();
    } else if (tel.shape === "lane") {
      g.translate(e.x, e.y);
      g.rotate(e.facing);
      g.fillRect(0, -tel.width / 2, tel.length, tel.width);
      g.globalAlpha = 0.95;
      g.strokeRect(0, -tel.width / 2, tel.length, tel.width);
    } else if (tel.shape === "ring") {
      g.globalAlpha = flare || ph.tag === "guard" ? 0.95 : 0.7;
      g.beginPath();
      g.arc(e.x, e.y, tel.range, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }

  function drawWoodStands(g) {
    g.fillStyle = "#6a4a28";
    g.fillRect(0, 0, W, 34);
    g.fillStyle = "#c46a3a";
    g.fillRect(0, 0, W, 8);
    crowd.forEach((c) => {
      const bob = Math.sin(time * 2.2 + c.ph) * 1;
      const y = 16 - c.h + bob;
      g.fillStyle = c.odd ? "#8a3a28" : "#3a2418";
      g.fillRect(c.x, y, 10, c.h + 6);
      g.fillRect(c.x + 2, y - 4, 6, 5);
    });
    for (let x = 0; x < W; x += 14) {
      g.fillStyle = "#4a3018";
      g.fillRect(x, 22, 12, 12);
      g.fillStyle = "#2a1a10";
      g.fillRect(x, 32, 12, 3);
    }
    g.fillStyle = "#e8c070";
    for (let x = 8; x < W; x += 36) g.fillRect(x, 6, 16, 3);
  }

  function drawMarbleStands(g) {
    const finals = venue === "finals";
    g.fillStyle = finals ? "#2a1218" : "#6a4030";
    g.fillRect(0, 0, W, 10);
    g.fillStyle = finals ? "#1a1014" : "#d8cbb8";
    g.fillRect(0, 10, W, 26);
    crowd.forEach((c) => {
      const hype = shake > 0.35 || (enemy && !enemy.alive);
      const raise = Math.sin(time * 3 + c.ph * 1.7) > (hype ? 0.05 : 0.72);
      const bob = Math.sin(time * 2.4 + c.ph) * 1;
      const y = 18 - c.h + bob;
      g.fillStyle = c.odd ? "#6a3038" : "#2a2430";
      g.fillRect(c.x, y, 9, c.h + 5);
      g.fillRect(c.x + 2, y - 4, 5, 4);
      if (raise) g.fillRect(c.x + 8, y - 7, 2, 6);
    });
    g.fillStyle = "#8a8078";
    g.fillRect(0, 32, W, 4);
    g.fillStyle = finals ? "#e8c070" : "#f0e2c8";
    g.fillRect(0, 32, W, 1);
    g.fillStyle = finals && shake > 0.35 ? "#fff1c4" : "#6a5438";
    g.fillRect(132, 4, 56, 16);
    g.fillStyle = "#e8c070";
    g.fillRect(148, 8, 8, 6);
    g.fillStyle = "#7a1618";
    g.fillRect(160, 8, 8, 6);
    g.fillStyle = "#1a100c";
    g.fillRect(132, 18, 56, 2);
  }

  function drawBanners(g) {
    const colors = venue === "provincial" ? ["#7a1618", "#e8c070", "#3a2418"] : ["#7a1618", "#e8c070", "#f6f1e6"];
    for (let i = 0; i < 5; i++) {
      const x = 24 + i * 64;
      g.fillStyle = colors[i % colors.length];
      g.fillRect(x, 38, 10, 16 + (i % 2) * 4);
      g.fillStyle = "#3a2418";
      g.fillRect(x, 38, 10, 2);
    }
  }

  function drawStands(g) {
    if (venue === "provincial") { drawWoodStands(g); return; }
    if (venue === "colosseum" || venue === "finals") { drawMarbleStands(g); return; }
    g.fillStyle = "#100c0b";
    g.fillRect(0, 0, W, 36);
    crowd.forEach((c) => {
      const bob = Math.sin(time * 2.2 + c.ph) * 1;
      const hype = shake > 0.4 || (enemy && !enemy.alive);
      const raise = Math.sin(time * 3 + c.ph * 1.7) > (hype ? 0.2 : 0.82);
      const y = 18 - c.h + bob;
      g.fillStyle = c.odd ? "#1a1418" : "#26181c";
      g.fillRect(c.x, y, 10, c.h + 6);
      g.fillRect(c.x + 2, y - 4, 6, 5);
      if (raise) g.fillRect(c.x + 9, y - 6, 2, 6);
    });
    for (let x = 2; x < W; x += 8) {
      g.fillStyle = "#07080a";
      g.fillRect(x, 16, 3, 20);
      g.fillStyle = "#3c424c";
      g.fillRect(x, 16, 1, 20);
    }
    g.fillStyle = "#07080a";
    g.fillRect(0, 15, W, 2);
    g.fillRect(0, 34, W, 2);
    g.fillStyle = "#6a7078";
    g.fillRect(0, 15, W, 1);
  }

  function drawTorch(g, x, y) {
    g.fillStyle = "#3a3228";
    g.fillRect(x - 1, y, 3, 8);
    g.fillStyle = "#6e5a42";
    g.fillRect(x - 4, y, 8, 3);
    const f = Math.floor(time * 12) % 3;
    g.fillStyle = "#e24a22";
    g.fillRect(x - 2, y - 5 - f, 5, 5);
    g.fillStyle = f === 2 ? "#fff1c4" : "#ffb15a";
    g.fillRect(x - 1, y - 7 - f, 3, 4);
    g.fillStyle = "#fff6d8";
    g.fillRect(x, y - 8 - f, 1, 2);
  }

  function drawGate(g) {
    const x = 146;
    const y = 148;
    const w = 28;
    const h = 30;
    g.fillStyle = "#070606";
    g.fillRect(x, y, w, h);
    if (gateOpen) {
      const grd = g.createLinearGradient(0, y, 0, y + h);
      grd.addColorStop(0, "rgba(255,220,160,0)");
      grd.addColorStop(1, "rgba(255,214,150,0.9)");
      g.fillStyle = grd;
      g.fillRect(x + 3, y, w - 6, h);
    }
    const lift = gateOpen ? -14 : 0;
    g.fillStyle = "#121418";
    for (let i = 0; i < 5; i++) g.fillRect(x + 4 + i * 5, y + 4 + lift, 2, 16);
    g.fillRect(x + 3, y + 4 + lift, w - 6, 2);
    g.fillStyle = "#5c5348";
    g.fillRect(x - 2, y, 2, h);
    g.fillRect(x + w, y, 2, h);
  }

  // Lighting buffer reused so we don't allocate a canvas every frame.
  const lightBuf = document.createElement("canvas");
  lightBuf.width = W;
  lightBuf.height = H;
  const lightCtx = lightBuf.getContext("2d");

  function drawLightingFast(g) {
    lightCtx.clearRect(0, 0, W, H);
    lightCtx.globalCompositeOperation = "source-over";
    const night = venue === "pit" ? 0.58 : venue === "finals" ? 0.4 : venue === "colosseum" ? 0.2 : 0.1;
    lightCtx.fillStyle = "rgba(6,3,4," + night + ")";
    lightCtx.fillRect(0, 0, W, H);
    lightCtx.globalCompositeOperation = "destination-out";
    const lights = [
      { x: 36, y: 58, r: 78 + Math.sin(time * 11) * 4 },
      { x: 284, y: 58, r: 76 + Math.sin(time * 9 + 1) * 4 },
      { x: player.x, y: player.y - 6, r: 60 },
    ];
    livingFoes().forEach((e) => {
      lights.push({ x: e.x, y: e.y, r: (e.kind === "boss" || e.kind === "aelia" || e.kind === "varro") ? 48 : 28 });
    });
    if (gateOpen) lights.push({ x: 160, y: 170, r: 74 });
    lights.forEach((L) => {
      const rad = lightCtx.createRadialGradient(L.x, L.y, 4, L.x, L.y, L.r);
      rad.addColorStop(0, "rgba(0,0,0,1)");
      rad.addColorStop(1, "rgba(0,0,0,0)");
      lightCtx.fillStyle = rad;
      lightCtx.beginPath();
      lightCtx.arc(L.x, L.y, L.r, 0, Math.PI * 2);
      lightCtx.fill();
    });
    lightCtx.globalCompositeOperation = "source-over";
    g.drawImage(lightBuf, 0, 0);
    g.save();
    g.globalCompositeOperation = "lighter";
    [{ x: 36, y: 50 }, { x: 284, y: 50 }].forEach((L) => {
      const rad = g.createRadialGradient(L.x, L.y, 2, L.x, L.y, 34);
      rad.addColorStop(0, "rgba(255,170,70,0.3)");
      rad.addColorStop(1, "rgba(255,120,40,0)");
      g.fillStyle = rad;
      g.beginPath();
      g.arc(L.x, L.y, 34, 0, Math.PI * 2);
      g.fill();
    });
    g.restore();
  }

  function drawHubScene(g) {
    const rich = run ? window.GS_CAREER.richness(run) : { villa: 0, fame: 0, banners: false, marble: false, crowd: false, gold: false };
    const sky = rich.gold ? "#6a3828" : rich.marble ? "#5a3428" : rich.banners ? "#3a241c" : "#161014";
    g.fillStyle = sky;
    g.fillRect(0, 0, W, 70);
    g.fillStyle = rich.marble ? "#c4b39a" : "#2a211c";
    g.fillRect(0, 58, W, 8);
    g.fillStyle = "#5a4634";
    g.fillRect(0, 66, W, H - 66);
    for (let i = 0; i < 18; i++) {
      g.fillStyle = i % 2 ? "#4a3828" : "#6a5040";
      g.fillRect(i * 18, 150, 16, 6);
    }
    if (rich.crowd) {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? "#1a1214" : "#3a2428";
        g.fillRect(8 + i * 18, 48, 8, 12);
      }
    }
    if (!rich.banners) {
      drawTorch(g, 20, 62);
      drawTorch(g, 300, 62);
    } else {
      g.fillStyle = "#f0c070";
      g.fillRect(8, 8, 10, 10);
      g.fillStyle = "#fff6d8";
      g.fillRect(11, 11, 4, 4);
    }
    window.GS_CAREER.STATIONS.forEach((s) => {
      const here = hubSheet === s.id;
      let wall = "#3a2a22";
      let roof = "#6a2418";
      if (s.id === "home") {
        wall = ["#3a2a22", "#6a5344", "#c4b39a", "#e8d8b0"][rich.villa] || "#3a2a22";
        roof = rich.gold ? "#e8c070" : "#7a3030";
      } else if (s.id === "gate") {
        wall = "#1a120e";
        roof = "#e8c070";
      } else if (s.id === "heal") roof = "#f6f1e6";
      else if (s.id === "smith") roof = "#4a4038";
      g.fillStyle = roof;
      g.fillRect(s.x, s.y, s.w, 8);
      g.fillStyle = here ? "#e8c070" : wall;
      g.fillRect(s.x + 2, s.y + 8, s.w - 4, s.h - 8);
      g.fillStyle = "#140c0a";
      g.fillRect(s.x + Math.floor(s.w / 2) - 4, s.y + s.h - 12, 8, 12);
      if (s.id === "home" && rich.villa >= 2) {
        g.fillStyle = "#8ec8e8";
        const bob = Math.sin(time * 4) * 1;
        g.fillRect(s.x + s.w - 14, s.y + 16 + bob, 6, 3);
        g.fillStyle = rich.gold ? "#e8c070" : "#d8cbb8";
        g.fillRect(s.x + 4, s.y - 8, 3, 10);
        g.fillRect(s.x + s.w - 8, s.y - 8, 3, 10);
      }
      if (rich.banners && s.id === "gate") {
        g.fillStyle = "#7a1618";
        g.fillRect(s.x - 6, s.y, 4, 14);
        g.fillStyle = "#e8c070";
        g.fillRect(s.x + s.w + 2, s.y, 4, 14);
      }
    });
    if (player) drawActor(g, player, "player", true);
    window.GS_CAREER.STATIONS.forEach((s) => {
      const here = hubSheet === s.id;
      const below = s.y > 90;
      drawText(g, s.label, s.x + s.w / 2, below ? s.y - 8 : s.y + s.h + 2, here ? "#ffe29a" : "#f6f1e6", 1);
    });
  }

  function drawingHub() {
    return mode === "hub" || (mode === "paused" && pausedFrom === "hub");
  }

  function drawWorld(g) {
    if (drawingHub()) {
      drawHubScene(g);
      return;
    }
    g.drawImage(floorCanvas, 0, 0);
    if (venue === "provincial") {
      g.fillStyle = "rgba(255, 210, 140, 0.1)";
      g.fillRect(0, 0, W, H);
    } else if (venue === "colosseum") {
      g.fillStyle = "rgba(255, 140, 70, 0.07)";
      g.fillRect(0, 0, W, H);
    } else if (venue === "finals") {
      g.fillStyle = "rgba(40, 0, 16, 0.16)";
      g.fillRect(0, 0, W, H);
    }
    decals.forEach((d) => {
      g.fillStyle = d.color;
      g.fillRect(Math.round(d.x), Math.round(d.y), d.s, d.s);
    });
    livingFoes().forEach((e) => drawTelegraph(g, e));
    if (enemy && !enemy.alive) drawTelegraph(g, enemy);
    drawStands(g);
    if (venue === "pit") {
      drawTorch(g, 36, 48);
      drawTorch(g, 284, 48);
      drawGate(g);
    } else drawBanners(g);

    const actors = [{ y: player.y, draw: () => drawActor(g, player, "player", true) }];
    corpses.forEach((c) => actors.push({ y: c.y, draw: () => drawActor(g, c, c.sprite, false) }));
    if (enemy) actors.push({ y: enemy.y, draw: () => drawActor(g, enemy, enemy.sprite, false) });
    if (partner) actors.push({ y: partner.y, draw: () => drawActor(g, partner, partner.sprite, false) });
    actors.sort((a, b) => a.y - b.y);
    actors.forEach((a) => a.draw());

    particles.forEach((p) => {
      g.globalAlpha = Math.max(0, p.life / p.max);
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      g.globalAlpha = 1;
    });

    drawLightingFast(g);

    livingFoes().forEach((foe) => {
      const ph = currentPhase(foe);
      const barW = (foe.kind === "boss" || foe.kind === "aelia" || foe.kind === "varro") ? 36 : 20;
      const bx = Math.round(foe.x - barW / 2);
      const by = Math.round(foe.y + 3);
      g.fillStyle = "#140c0a";
      g.fillRect(bx - 1, by - 1, barW + 2, 5);
      g.fillStyle = "#3a1814";
      g.fillRect(bx, by, barW, 3);
      g.fillStyle = (foe.kind === "boss" || foe.kind === "aelia") ? "#e8c070" : "#d23a34";
      g.fillRect(bx, by, Math.max(0, Math.round(barW * (foe.hp / foe.hpMax))), 3);
      if (!(ph && ph.telegraph && ph.tag === "windup" && ph.flare && (ph.t - foe.phaseT) <= ph.flare)) return;
      g.save();
      g.globalAlpha = 0.95;
      g.strokeStyle = Math.sin(time * 42) > 0 ? "#ffffff" : ph.telegraph.color;
      g.lineWidth = 1;
      const tel = ph.telegraph;
      if (tel.shape === "cone") {
        g.beginPath();
        g.arc(foe.x, foe.y, tel.range, foe.facing - tel.arc / 2, foe.facing + tel.arc / 2);
        g.stroke();
      } else if (tel.shape === "circle") {
        g.beginPath();
        g.arc(foe.x, foe.y, tel.range, 0, Math.PI * 2);
        g.stroke();
      } else if (tel.shape === "lane") {
        g.translate(foe.x, foe.y);
        g.rotate(foe.facing);
        g.strokeRect(0, -tel.width / 2, tel.length, tel.width);
      }
      g.restore();
    });

    numbers.forEach((n) => {
      g.globalAlpha = Math.max(0, n.life / 0.75);
      drawText(g, n.text, n.x, n.y, n.color, n.text.length > 3 ? 1 : 2);
      g.globalAlpha = 1;
    });

    if (player.alive && player.hp / player.hpMax < 0.34 && (mode === "fight" || mode === "intro")) {
      const a = (0.34 - player.hp / player.hpMax) / 0.34;
      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 6));
      const rad = g.createRadialGradient(W / 2, H / 2, 36, W / 2, H / 2, 120);
      rad.addColorStop(0, "rgba(90,0,0,0)");
      rad.addColorStop(1, "rgba(80,0,0," + (a * pulse * 0.75) + ")");
      g.fillStyle = rad;
      g.fillRect(0, 0, W, H);
    }

    if (worldFlash > 0) {
      g.fillStyle = "rgba(255,244,220," + (worldFlash * 0.22) + ")";
      g.fillRect(0, 0, W, H);
    }
  }

  function draw() {
    const mag = shake * shake * (reduceMotion ? 2 : 5);
    const ox = mag ? (Math.random() - 0.5) * 2 * mag : 0;
    const oy = mag ? (Math.random() - 0.5) * 2 * mag : 0;
    ctx.fillStyle = "#070605";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(Math.round(ox), Math.round(oy));
    drawWorld(ctx);
    ctx.restore();
    screenCtx.imageSmoothingEnabled = false;
    screenCtx.drawImage(buf, 0, 0, screen.width, screen.height);
  }

  function syncHud() {
    app.dataset.mode = mode;
    app.dataset.fight = String(fightIndex + 1);
    app.dataset.hp = String(Math.ceil(player.hp));
    app.dataset.stam = String(Math.ceil(player.stam));
    app.dataset.act = String(act);
    app.dataset.ehp = enemy && enemy.alive ? String(Math.ceil(enemy.hp)) : "0";
    app.dataset.pattern = enemy && enemy.pattern ? enemy.pattern.id : "";
    app.dataset.lesson = lessonId() || "";
    const hpP = player.hpMax ? player.hp / player.hpMax : 0;
    const stP = player.stamMax ? player.stam / player.stamMax : 0;
    $("hp-fill").style.transform = "scaleX(" + Math.max(0, hpP) + ")";
    $("st-fill").style.transform = "scaleX(" + Math.max(0, stP) + ")";
    $("hp-bar").setAttribute("aria-valuenow", String(Math.ceil(player.hp)));
    $("hp-bar").setAttribute("aria-valuemax", String(player.hpMax));
    $("st-bar").setAttribute("aria-valuenow", String(Math.ceil(player.stam)));
    $("st-bar").classList.toggle("low", stP < 0.22 && mode === "fight");
    const f = currentCard();
    if (mode === "hub" && run) $("fight-name").textContent = window.GS_CAREER.fameTitle(run.fame) + " — " + run.name;
    else $("fight-name").textContent = f.kicker + " — " + f.title;
    const pips = $("pips").children;
    for (let i = 0; i < pips.length; i++) {
      pips[i].classList.toggle("now", act === 1 && i === fightIndex && mode !== "free" && mode !== "hub");
      pips[i].classList.toggle("done", act === 1 && (i < fightIndex || (mode === "free" && i <= fightIndex)));
    }
  }

  function layout() {
    const stage = document.querySelector(".stage");
    const rect = stage.getBoundingClientRect();
    const controls = $("touch");
    const controlsH = controls.hidden ? 0 : 0;
    const fit = Math.min(rect.width / W, rect.height / H);
    const integer = Math.floor(fit);
    let cssW;
    let cssH;
    if (integer >= 1 && W * integer >= rect.width * 0.86 && H * integer <= rect.height + 1) {
      screen.width = W * integer;
      screen.height = H * integer;
      cssW = W * integer;
      cssH = H * integer;
    } else {
      screen.width = W;
      screen.height = H;
      cssW = Math.max(1, Math.floor(W * fit));
      cssH = Math.max(1, Math.floor(H * fit));
    }
    screen.style.width = cssW + "px";
    screen.style.height = cssH + "px";
    frameEl.style.width = cssW + "px";
    frameEl.style.height = cssH + "px";
    void controlsH;
  }

  function toWorld(clientX, clientY) {
    const r = screen.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H,
    };
  }

  /* ---------- boot ---------- */
  function detectTouch() {
    const coarse = matchMedia("(pointer: coarse)").matches;
    document.body.classList.toggle("touch", coarse || forcedTouch);
    $("touch").hidden = !(coarse || forcedTouch);
    syncControlsCopy();
    layout();
  }

  function bindHold(el, name) {
    el.addEventListener("pointerdown", (e) => {
      if (mode === "title" || mode === "dead" || mode === "free" || mode === "paused") return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      btn[name] = true;
      el.classList.add("is-down");
    });
    const up = () => {
      btn[name] = false;
      el.classList.remove("is-down");
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  function bind() {
    detectTouch();
    matchMedia("(pointer: coarse)").addEventListener("change", detectTouch);
    window.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") {
        forcedTouch = true;
        detectTouch();
      }
      try { audio(); } catch (err) { /* ignore */ }
    }, true);

    window.addEventListener("keydown", (e) => {
      const onHubButton = mode === "hub" && e.target && e.target.closest && e.target.closest("#hub-dock button");
      if (onHubButton && (e.code === "Space" || e.code === "Enter")) return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.repeat) {
        key[e.code] = true;
        return;
      }
      key[e.code] = true;
      if (e.code === "Space" && (mode === "title" || mode === "dead" || mode === "free" || mode === "champion")) {
        prevDodge = true;
        startRun();
        return;
      }
      if (e.code === "KeyE" && mode === "hub") {
        const st = window.GS_CAREER.stationAt(player.x, player.y, 18);
        if (st) {
          hubSheet = st.id;
          refreshHub();
        }
      }
      if (e.code === "Escape") {
        if (mode === "paused") resume();
        else pause();
      } else if (e.code === "Enter") {
        if (e.target && e.target.tagName === "BUTTON") return;
        if (mode === "title" || mode === "dead" || mode === "free" || mode === "champion") startRun();
        else if (mode === "paused") resume();
      } else if (e.code === "KeyP") {
        if (mode === "paused") resume();
        else pause();
      } else if ((e.code === "KeyM") && (mode === "title" || mode === "paused")) {
        setMuted(!muted);
      }
    });
    window.addEventListener("keyup", (e) => { key[e.code] = false; });
    window.addEventListener("blur", () => {
      Object.keys(key).forEach((k) => { key[k] = false; });
      mouse.left = false;
      mouse.right = false;
      btn.attack = btn.block = btn.dodge = false;
      joy.active = false;
      joy.x = joy.y = 0;
      $("knob").style.transform = "translate(-50%, -50%)";
    });

    window.addEventListener("contextmenu", (e) => e.preventDefault());

    screen.addEventListener("mousedown", (e) => {
      if (e.button === 0) mouse.left = true;
      if (e.button === 2) { mouse.right = true; e.preventDefault(); }
    });
    screen.addEventListener("pointerdown", (e) => {
      if (mode !== "hub") return;
      const p = toWorld(e.clientX, e.clientY);
      const st = window.GS_CAREER.stationAt(p.x, p.y, 2);
      if (!st) return;
      hubSheet = st.id;
      refreshHub();
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) mouse.left = false;
      if (e.button === 2) mouse.right = false;
    });
    window.addEventListener("mousemove", (e) => {
      const p = toWorld(e.clientX, e.clientY);
      mouse.wx = p.x;
      mouse.wy = p.y;
      mouse.aimOk = true;
    });

    const joyEl = $("joy");
    const knob = $("knob");
    function joySet(clientX, clientY) {
      const rect = joyEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const max = rect.width * 0.36;
      const mag = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(mag, max);
      joy.x = (dx / mag) * (clamped / max);
      joy.y = (dy / mag) * (clamped / max);
      if (Math.hypot(joy.x, joy.y) < 0.18) { joy.x = 0; joy.y = 0; }
      knob.style.transform = "translate(calc(-50% + " + (dx / mag) * clamped + "px), calc(-50% + " + (dy / mag) * clamped + "px))";
    }
    joyEl.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      joyEl.setPointerCapture(e.pointerId);
      joy.active = true;
      joySet(e.clientX, e.clientY);
    });
    joyEl.addEventListener("pointermove", (e) => { if (joy.active) joySet(e.clientX, e.clientY); });
    const joyEnd = () => {
      joy.active = false;
      joy.x = 0;
      joy.y = 0;
      knob.style.transform = "translate(-50%, -50%)";
    };
    joyEl.addEventListener("pointerup", joyEnd);
    joyEl.addEventListener("pointercancel", joyEnd);

    bindHold($("btn-attack"), "attack");
    bindHold($("btn-block"), "block");
    bindHold($("btn-dodge"), "dodge");

    $("btn-start").addEventListener("click", () => { sfx("ui"); startRun(); });
    $("btn-resume-career").addEventListener("click", () => { sfx("ui"); resumeCareer(); });
    $("btn-resume").addEventListener("click", () => { sfx("ui"); resume(); });
    $("btn-restart").addEventListener("click", () => { sfx("ui"); startRun(); });
    $("btn-again").addEventListener("click", () => { sfx("ui"); startRun(); });
    $("btn-dead-title").addEventListener("click", () => { sfx("ui"); bootTitle(); });
    $("btn-pause").addEventListener("click", () => { sfx("ui"); pause(); });
    $("hub-dock").addEventListener("click", onHubClick);
    $("btn-hall").addEventListener("click", () => { sfx("ui"); openCodex("hall"); });
    $("btn-legend").addEventListener("click", () => { sfx("ui"); openCodex("legend"); });
    $("btn-hall-back").addEventListener("click", () => { sfx("ui"); bootTitle(); });
    $("btn-legend-back").addEventListener("click", () => { sfx("ui"); bootTitle(); });
    $("btn-dead-hall").addEventListener("click", () => { sfx("ui"); openCodex("hall"); });
    $("btn-champ-again").addEventListener("click", () => { sfx("ui"); startRun(); });
    $("btn-champ-title").addEventListener("click", () => { sfx("ui"); bootTitle(); });
    $("legend-body").addEventListener("click", (e) => {
      const b = e.target.closest("[data-act='unlock']");
      if (!b) return;
      const res = window.GS_CAREER.buyUnlock(meta, b.dataset.arg);
      meta = window.GS_CAREER.load();
      window.GS_CAREER.paintLegend($("legend-body"), meta);
      sfx(res.ok ? "ui" : "empty");
      announce(res.msg || "");
    });
    const toggleMute = () => setMuted(!muted);
    $("btn-mute").addEventListener("click", toggleMute);
    $("btn-mute-title").addEventListener("click", toggleMute);

    window.addEventListener("resize", layout);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.034, (now - last) / 1000 || 0);
    last = now;
    if (hitstop > 0) {
      hitstop -= dt;
      draw();
      syncHud();
      return;
    }
    update(dt);
    draw();
    syncHud();
  }

  buildFloor();
  bind();
  setMuted(muted);
  bootTitle();
  layout();
  last = performance.now();
  requestAnimationFrame(frame);
})();
