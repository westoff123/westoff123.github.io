/* Gladiator Secret — career, Act II, legend.
   Plain data and rules. Combat stays in game.js. */
(function () {
  "use strict";

  const KEY = "gs-legend-v1";
  const DAYS = 3;

  const PRAE = ["Marcus", "Titus", "Gaius", "Quintus", "Servius", "Appius", "Sextus", "Numerius"];
  const COG = ["Sura", "Pullo", "Cotta", "Flaccus", "Nasica", "Strabo", "Cursor", "Pavo", "Corvus", "Falco"];

  const WEAPONS = {
    gladius: { id: "gladius", name: "Pit gladius", dmg: 0, price: 0, len: 18, thick: 1, color: "#e4e7ee", edge: "#2a3038", blurb: "The sword they threw you. Honest, short, and already nicked." },
    arena: { id: "arena", name: "Arena gladius", dmg: 3, price: 42, len: 20, thick: 1, color: "#d5dbe6", edge: "#e8c070", blurb: "+3 damage. A smith finally looked at the edge." },
    sica: { id: "sica", name: "Thracian sica", dmg: 5, price: 78, len: 16, thick: 2, color: "#e8c070", edge: "#7a1618", blurb: "+5 damage. Short, curved, and rude about it." },
    spatha: { id: "spatha", name: "Champion spatha", dmg: 8, price: 130, len: 26, thick: 1, color: "#f6f1e6", edge: "#e8c070", blurb: "+8 damage. Long enough to settle an argument early." },
  };

  const ARMORS = {
    rags: { id: "rags", name: "Rags", def: 0, price: 0, blurb: "Cloth. It catches sweat and very little else." },
    leather: { id: "leather", name: "Leather", def: 3, price: 32, blurb: "Hits hurt 3 less. You still feel the big ones." },
    scale: { id: "scale", name: "Scale", def: 5, price: 70, blurb: "Hits hurt 5 less. It rattles when you roll." },
    lorica: { id: "lorica", name: "Lorica", def: 7, price: 120, blurb: "Hits hurt 7 less. Senators pretend they invented it." },
  };

  const LOOKS = {
    none: { id: "none", name: "Bare shoulders", price: 0, cape: null, helm: null, blurb: "Nothing between you and the weather." },
    cloak: { id: "cloak", name: "Red cloak", price: 24, cape: "#7a1618", helm: null, blurb: "A cloak. The cheap seats can find you." },
    laurel: { id: "laurel", name: "Gold laurel", price: 36, cape: null, helm: "#e8c070", blurb: "A laurel. It does not block a sword. It blocks anonymity." },
    pelt: { id: "pelt", name: "Lion pelt", price: 58, cape: "#8a5a34", helm: null, blurb: "A pelt. Something already lost this fight." },
  };

  const TRAIN = {
    str: { name: "Strength", gold: 18, max: 4, blurb: "+2 damage on a clean hit, each rank." },
    spd: { name: "Speed", gold: 18, max: 4, blurb: "+7 move speed, each rank. The sand gets smaller." },
    sta: { name: "Wind", gold: 16, max: 4, blurb: "+12 stamina, each rank. More blocks. More rolls." },
  };

  const VILLA = [
    { name: "Rented room", cost: 0, rent: 0, blurb: "A bed, a bolt, and a landlord who knew you when you were inventory." },
    { name: "Courtyard rooms", cost: 70, rent: 5, blurb: "A door that locks from your side. +5 denarii whenever you come home from a win." },
    { name: "Column house", cost: 140, rent: 10, blurb: "Columns, and a fountain that wastes water on purpose. +10 denarii a win." },
    { name: "Gilded villa", cost: 220, rent: 16, blurb: "Gold on the plaster. The street pretends not to stare. +16 denarii a win." },
  ];

  const UNLOCKS = [
    { id: "blade", cost: 3, name: "Pit blade", text: "New prisoners start with a keener sword. +2 damage until you buy a better one." },
    { id: "breath", cost: 3, name: "Lanista's breath", text: "+15 stamina from the first step of a new run." },
    { id: "scar", cost: 4, name: "Old scars", text: "Start in worn leather. Incoming hits hurt 2 less until you buy real armor." },
  ];

  const STATIONS = [
    { id: "yard", name: "Training yard", x: 8, y: 24, w: 68, h: 34, label: "YARD" },
    { id: "smith", name: "Blacksmith", x: 84, y: 20, w: 56, h: 32, label: "SMITH" },
    { id: "market", name: "Market", x: 180, y: 20, w: 56, h: 32, label: "MARKET" },
    { id: "heal", name: "Infirmary", x: 244, y: 24, w: 68, h: 34, label: "HEAL" },
    { id: "home", name: "Your rooms", x: 8, y: 136, w: 72, h: 28, label: "HOME" },
    { id: "court", name: "The court", x: 112, y: 140, w: 68, h: 26, label: "COURT" },
    { id: "gate", name: "The arena", x: 208, y: 132, w: 100, h: 32, label: "GATE" },
  ];

  const RIVAL = "Lucius Varro";
  const CHAMPION = "Aelia the Unbroken";

  const FIGHTS = [
    {
      kind: "retiarius",
      venue: "provincial",
      kicker: "Rising name",
      title: "Cassia the Net",
      sub: "A provincial card. She fights as if the sand were a conversation.",
      tip: "The yellow lane is her net. If it lands, you slow down. Dodge it. The trident is a cut — block when it flares white.",
      purse: 28,
    },
    {
      kind: "murmillo",
      venue: "provincial",
      kicker: "Rising name",
      title: "Vitus the Shield",
      sub: "He was trained. The wood of the stands still smells like livestock.",
      tip: "Dodge the red bash — a held block breaks. Do not swing while his shield is bright. The slow hook is there to be perfect-blocked.",
      purse: 36,
    },
    {
      kind: "veteran",
      venue: "colosseum",
      kicker: "Crowd favorite",
      title: "Decimus",
      sub: "Marble, sunset, and a man who has buried prettier names than yours.",
      tip: "Two quick cuts, then a circle at his feet. Leave the circle. His lunge can be blocked. His guard cannot be hit.",
      purse: 48,
    },
    {
      kind: "lion",
      venue: "colosseum",
      kicker: "Crowd favorite",
      title: "The Lion",
      sub: "No speech. The emperor's box leans forward anyway.",
      tip: "Orange is a pounce. Blocking it is dirty. Rolling is clean. When it spins, leave the circle — one dodge only covers one bite.",
      purse: 55,
    },
    {
      kind: "twin",
      duo: true,
      venue: "colosseum",
      kicker: "Crowd favorite",
      title: "The Brothers",
      sub: "Two of them. They do not share a health bar, or a sense of fairness.",
      tip: "Kill one. The other keeps coming. Jabs are short. The sweep is a circle.",
      purse: 62,
    },
    {
      kind: "varro",
      venue: "finals",
      kicker: "The rival",
      title: RIVAL,
      sub: "He has been winning while you were learning the street.",
      tip: "A held block invites his rush — dodge the lane. A wild flurry invites the shield. The narrow cut is for a perfect block.",
      purse: 80,
    },
    {
      kind: "aelia",
      final: true,
      venue: "finals",
      kicker: "Champion of Rome",
      title: CHAMPION,
      sub: "The last name on the card. She has not lost it in nine years.",
      tip: "The heavy cut is the second swing, not the third. Spears are lanes. The sun is a circle you walk out of. Do not hit the bright guard.",
      purse: 120,
    },
  ];

  function cone(range, arc, color) {
    return { shape: "cone", range: range, arc: arc, color: color };
  }
  function hitCone(range, arc, extra) {
    return Object.assign({ shape: "cone", range: range, arc: arc, kb: 90, hitstun: 0.18 }, extra);
  }

  const PATTERNS = {
    netCast: {
      superArmor: true,
      phases: [
        { t: 0.62, tag: "windup", track: 0.34, flare: 0.18, armor: 0.4, telegraph: { shape: "lane", length: 88, width: 22, color: "#f0c84a" } },
        { t: 0.22, tag: "strike", move: 200, armor: 0.4, hit: { shape: "circle", range: 12, persist: true, dmg: 7, snare: 2.05, kb: 50, hitstun: 0.16 } },
        { t: 0.62, tag: "recover" },
      ],
    },
    trident: {
      superArmor: true,
      phases: [
        { t: 0.4, tag: "windup", track: 0.24, flare: 0.16, cock: 1, armor: 0.35, telegraph: cone(34, 0.9, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.35, hit: hitCone(36, 1.0, { dmg: 14, stagger: 0.7, blockStam: 8 }) },
        { t: 0.58, tag: "recover" },
      ],
    },
    shieldBash: {
      superArmor: true,
      phases: [
        { t: 0.58, tag: "windup", track: 0.4, flare: 0.18, cock: 0.6, armor: 0.4, telegraph: cone(36, 1.5, "#e23b32") },
        { t: 0.12, tag: "strike", armor: 0.4, hit: hitCone(38, 1.65, { dmg: 16, kb: 150, hitstun: 0.28, guardbreak: true, blockDmg: 10, stagger: 0.55 }) },
        { t: 0.7, tag: "recover" },
      ],
    },
    shieldHook: {
      superArmor: true,
      phases: [
        { t: 0.78, tag: "windup", track: 0.5, flare: 0.22, cock: 1.2, armor: 0.35, telegraph: cone(40, 1.7, "#f0c84a") },
        { t: 0.12, tag: "strike", armor: 0.35, hit: hitCone(42, 1.85, { dmg: 20, chip: 6, kb: 120, hitstun: 0.26, stagger: 0.95, blockStam: 10 }) },
        { t: 0.72, tag: "recover" },
      ],
    },
    shieldWall: {
      superArmor: true,
      phases: [
        { t: 0.28, tag: "windup", track: 0.28, guardRaise: true, armor: 0.45, telegraph: { shape: "ring", range: 16, color: "#8ec2ff" } },
        { t: 1.05, tag: "guard", counter: "shieldPunch", telegraph: { shape: "ring", range: 20, color: "#e7f3ff" } },
        { t: 0.48, tag: "recover" },
      ],
    },
    shieldPunch: {
      superArmor: true,
      phases: [
        { t: 0.26, tag: "windup", flare: 0.16, cock: 0.7, armor: 0.55, telegraph: cone(32, 1.25, "#e23b32") },
        { t: 0.1, tag: "strike", armor: 0.55, hit: hitCone(34, 1.4, { dmg: 14, kb: 140, hitstun: 0.26, stagger: 0.35, blockStam: 10 }) },
        { t: 0.5, tag: "recover" },
      ],
    },
    vetCombo: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.36, tag: "windup", track: 0.2, flare: 0.14, cock: 0.9, armor: 0.35, telegraph: cone(32, 1.05, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.35, hit: hitCone(34, 1.15, { dmg: 9, stagger: 0.4, blockStam: 6 }) },
        { t: 0.16, tag: "gap", armor: 0.4 },
        { t: 0.28, tag: "windup", track: 0.12, flare: 0.12, cock: 0.9, armor: 0.35, telegraph: cone(34, 1.2, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.35, hit: hitCone(36, 1.3, { dmg: 10, stagger: 0.4, blockStam: 6 }) },
        { t: 0.18, tag: "gap", armor: 0.4 },
        { t: 0.46, tag: "windup", flare: 0.16, armor: 0.35, telegraph: { shape: "circle", range: 40, color: "#e23b32" } },
        { t: 0.12, tag: "strike", armor: 0.35, hit: { shape: "circle", range: 40, dmg: 16, chip: 7, blockStam: 14, kb: 110, hitstun: 0.24, stagger: 0.45 } },
        { t: 0.7, tag: "recover" },
      ],
    },
    vetLunge: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.5, tag: "windup", track: 0.28, flare: 0.16, armor: 0.35, telegraph: { shape: "lane", length: 96, width: 18, color: "#f08a3a" } },
        { t: 0.22, tag: "strike", move: 230, armor: 0.35, hit: { shape: "circle", range: 12, persist: true, dmg: 15, chip: 6, kb: 120, hitstun: 0.22, blockStam: 8 } },
        { t: 0.6, tag: "recover" },
      ],
    },
    vetGuard: {
      superArmor: true,
      phases: [
        { t: 0.24, tag: "windup", guardRaise: true, armor: 0.5, telegraph: { shape: "ring", range: 16, color: "#8ec2ff" } },
        { t: 0.9, tag: "guard", counter: "vetRiposte", telegraph: { shape: "ring", range: 20, color: "#e7f3ff" } },
        { t: 0.42, tag: "recover" },
      ],
    },
    vetRiposte: {
      superArmor: true,
      phases: [
        { t: 0.18, tag: "windup", flare: 0.14, cock: 0.8, armor: 0.8, telegraph: cone(34, 1.2, "#e23b32") },
        { t: 0.1, tag: "strike", armor: 0.8, hit: hitCone(36, 1.3, { dmg: 15, kb: 150, hitstun: 0.28, stagger: 0.3 }) },
        { t: 0.48, tag: "recover" },
      ],
    },
    lionPounce: {
      superArmor: true,
      phases: [
        { t: 0.48, tag: "windup", track: 0.26, flare: 0.16, armor: 0.45, telegraph: { shape: "lane", length: 78, width: 22, color: "#f08a3a" } },
        { t: 0.2, tag: "strike", move: 250, armor: 0.45, hit: { shape: "circle", range: 13, persist: true, dmg: 18, kb: 130, hitstun: 0.22, dirty: true, chip: 12, perfectChip: 6, stagger: 0.3 } },
        { t: 0.55, tag: "recover" },
      ],
    },
    lionMaul: {
      superArmor: true,
      phases: [
        { t: 0.4, tag: "windup", flare: 0.16, armor: 0.4, telegraph: { shape: "circle", range: 32, color: "#e23b32" } },
        { t: 1.05, tag: "spin", move: 28, tick: 0.3, armor: 0.35, telegraph: { shape: "circle", range: 32, color: "#c4452d" }, hit: { shape: "circle", range: 32, dmg: 8, dirty: true, chip: 5, perfectChip: 2, kb: 40, hitstun: 0.1 } },
        { t: 0.6, tag: "recover" },
      ],
    },
    twinJab: {
      superArmor: false,
      phases: [
        { t: 0.36, tag: "windup", track: 0.22, flare: 0.14, cock: 0.8, telegraph: cone(28, 1.0, "#f0c84a") },
        { t: 0.1, tag: "strike", hit: hitCone(30, 1.1, { dmg: 9, stagger: 0.45, blockStam: 6 }) },
        { t: 0.42, tag: "recover" },
      ],
    },
    twinSweep: {
      superArmor: true,
      phases: [
        { t: 0.5, tag: "windup", flare: 0.16, armor: 0.35, telegraph: { shape: "circle", range: 34, color: "#f0c84a" } },
        { t: 0.12, tag: "strike", armor: 0.35, hit: { shape: "circle", range: 34, dmg: 12, chip: 4, kb: 80, hitstun: 0.18, blockStam: 8 } },
        { t: 0.5, tag: "recover" },
      ],
    },
    varroRead: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.56, tag: "windup", track: 0.3, flare: 0.2, cock: 1.15, armor: 0.4, telegraph: cone(36, 0.85, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.4, hit: hitCone(38, 0.95, { dmg: 18, chip: 4, kb: 100, hitstun: 0.22, stagger: 0.9, blockStam: 8 }) },
        { t: 0.62, tag: "recover" },
      ],
    },
    varroRush: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.58, tag: "windup", track: 0.32, flare: 0.16, armor: 0.4, telegraph: { shape: "lane", length: 110, width: 20, color: "#f08a3a" } },
        { t: 0.26, tag: "strike", move: 250, armor: 0.4, hit: { shape: "circle", range: 13, persist: true, dmg: 18, kb: 160, hitstun: 0.28, guardbreak: true, blockDmg: 11, stagger: 0.45 } },
        { t: 0.64, tag: "recover" },
      ],
    },
    varroAegis: {
      superArmor: true,
      phases: [
        { t: 0.22, tag: "windup", guardRaise: true, armor: 0.5, telegraph: { shape: "ring", range: 16, color: "#8ec2ff" } },
        { t: 0.95, tag: "guard", counter: "varroRiposte", telegraph: { shape: "ring", range: 21, color: "#e7f3ff" } },
        { t: 0.4, tag: "recover" },
      ],
    },
    varroRiposte: {
      superArmor: true,
      phases: [
        { t: 0.16, tag: "windup", flare: 0.14, cock: 0.8, armor: 1, telegraph: cone(34, 1.2, "#e23b32") },
        { t: 0.1, tag: "strike", armor: 1, hit: hitCone(36, 1.35, { dmg: 16, kb: 160, hitstun: 0.3, stagger: 0.25 }) },
        { t: 0.46, tag: "recover" },
      ],
    },
    varroExecute: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.5, tag: "windup", flare: 0.16, armor: 0.4, telegraph: { shape: "circle", range: 38, color: "#e23b32" } },
        { t: 0.12, tag: "strike", armor: 0.4, hit: { shape: "circle", range: 38, dmg: 16, chip: 8, blockStam: 16, kb: 90, hitstun: 0.2, stagger: 0.3 } },
        { t: 0.2, tag: "gap", armor: 0.45 },
        { t: 0.36, tag: "windup", track: 0.2, flare: 0.16, cock: 1, armor: 0.4, telegraph: cone(40, 1.6, "#e23b32") },
        { t: 0.1, tag: "strike", armor: 0.4, hit: hitCone(42, 1.75, { dmg: 18, kb: 140, hitstun: 0.28, stagger: 0.7, blockStam: 12 }) },
        { t: 0.7, tag: "recover" },
      ],
    },
    aeliaJudgment: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.4, tag: "windup", track: 0.22, flare: 0.14, cock: 1, armor: 0.35, telegraph: cone(34, 1.1, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.35, hit: hitCone(36, 1.2, { dmg: 9, stagger: 0.35, blockStam: 6 }) },
        { t: 0.18, tag: "gap", armor: 0.4 },
        { t: 0.5, tag: "windup", track: 0.22, flare: 0.18, cock: 1.3, armor: 0.35, telegraph: cone(42, 1.9, "#e23b32") },
        { t: 0.12, tag: "strike", armor: 0.35, hit: hitCone(44, 2.05, { dmg: 22, chip: 8, kb: 150, hitstun: 0.3, stagger: 0.95, blockStam: 14 }) },
        { t: 0.2, tag: "gap", armor: 0.4 },
        { t: 0.34, tag: "windup", track: 0.16, flare: 0.14, cock: 0.9, armor: 0.35, telegraph: cone(34, 1.15, "#f0c84a") },
        { t: 0.1, tag: "strike", armor: 0.35, hit: hitCone(36, 1.25, { dmg: 10, stagger: 0.4, blockStam: 6 }) },
        { t: 0.72, tag: "recover" },
      ],
    },
    aeliaSpear: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.62, tag: "windup", track: 0.36, flare: 0.16, armor: 0.4, telegraph: { shape: "lane", length: 132, width: 18, color: "#f08a3a" } },
        { t: 0.28, tag: "strike", move: 270, armor: 0.4, hit: { shape: "circle", range: 13, persist: true, dmg: 18, kb: 160, hitstun: 0.26, guardbreak: true, blockDmg: 12, stagger: 0.4 } },
        { t: 0.66, tag: "recover" },
      ],
    },
    aeliaSun: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.7, tag: "windup", flare: 0.18, armor: 0.35, telegraph: { shape: "circle", range: 54, color: "#e23b32" } },
        { t: 0.12, tag: "strike", armor: 0.35, hit: { shape: "circle", range: 54, dmg: 20, chip: 10, blockStam: 22, kb: 100, hitstun: 0.24, stagger: 0.35 } },
        { t: 0.74, tag: "recover" },
      ],
    },
    aeliaAegis: {
      superArmor: true,
      phases: [
        { t: 0.24, tag: "windup", guardRaise: true, armor: 0.5, telegraph: { shape: "ring", range: 18, color: "#e8c070" } },
        { t: 1.0, tag: "guard", counter: "aeliaRebuke", telegraph: { shape: "ring", range: 22, color: "#fff1c4" } },
        { t: 0.42, tag: "recover" },
      ],
    },
    aeliaRebuke: {
      superArmor: true,
      phases: [
        { t: 0.14, tag: "windup", flare: 0.14, cock: 0.7, armor: 1, telegraph: cone(36, 1.35, "#e23b32") },
        { t: 0.1, tag: "strike", armor: 1, hit: hitCone(38, 1.45, { dmg: 18, kb: 170, hitstun: 0.32, stagger: 0.2 }) },
        { t: 0.5, tag: "recover" },
      ],
    },
    aeliaWheel: {
      superArmor: true,
      scales: true,
      phases: [
        { t: 0.4, tag: "windup", flare: 0.14, armor: 0.4, telegraph: { shape: "circle", range: 34, color: "#f4e7c2" } },
        { t: 1.15, tag: "spin", move: 34, tick: 0.32, armor: 0.35, telegraph: { shape: "circle", range: 34, color: "#f4e7c2" }, hit: { shape: "circle", range: 34, dmg: 9, chip: 4, blockStam: 12, kb: 50, hitstun: 0.1 } },
        { t: 0.7, tag: "recover" },
      ],
    },
  };

  const KINDS = {
    retiarius: { sprite: "retiarius", hp: 100, speed: 42, r: 8, prefer: 50, think: 0.3, weapon: { len: 20, thick: 1, color: "#9aa3b2", edge: "#e8c070" } },
    murmillo: { sprite: "murmillo", hp: 128, speed: 30, r: 10, prefer: 26, think: 0.34, weapon: { len: 16, thick: 2, color: "#d5dbe6", edge: "#2a3038" } },
    veteran: { sprite: "veteran", hp: 150, speed: 36, r: 9, prefer: 30, think: 0.24, weapon: { len: 20, thick: 1, color: "#e4e7ee", edge: "#7a1618" } },
    lion: { sprite: "lion", hp: 126, speed: 66, r: 10, prefer: 30, think: 0.16, weapon: null },
    twin: { sprite: "twin", hp: 74, speed: 36, r: 8, prefer: 26, think: 0.26, weapon: { len: 16, thick: 1, color: "#c8d0dc", edge: "#1c2838" } },
    varro: { sprite: "varro", hp: 210, speed: 40, r: 9, prefer: 32, think: 0.2, weapon: { len: 22, thick: 1, color: "#f6f1e6", edge: "#1c2838" } },
    aelia: { sprite: "aelia", hp: 255, speed: 36, r: 10, prefer: 34, think: 0.18, weapon: { len: 26, thick: 1, color: "#e8c070", edge: "#fff6d8" } },
  };

  function weighted(e, pairs) {
    const bag = [];
    pairs.forEach((p) => { if (p[1] > 0) bag.push({ id: p[0], w: p[1] }); });
    if (!bag.length) return "trident";
    if (e.lastPat && bag.length > 1) {
      bag.forEach((b) => { if (b.id === e.lastPat) b.w *= 0.28; });
    }
    let total = 0;
    bag.forEach((b) => { total += b.w; });
    let r = Math.random() * total;
    for (let i = 0; i < bag.length; i++) {
      r -= bag[i].w;
      if (r <= 0) return bag[i].id;
    }
    return bag[0].id;
  }

  function pick(e, ctx) {
    const d = ctx.dist;
    const mash = ctx.swings >= 3 && d < 46;
    const blocking = ctx.blocking;
    if (e.kind === "retiarius") {
      return weighted(e, [["netCast", d > 36 ? 6 : 2], ["trident", d < 42 ? 6 : 3]]);
    }
    if (e.kind === "murmillo") {
      return weighted(e, [
        ["shieldBash", blocking ? 6 : 4],
        ["shieldHook", 4],
        ["shieldWall", mash ? 8 : 1.4],
      ]);
    }
    if (e.kind === "veteran") {
      return weighted(e, [
        ["vetCombo", 5],
        ["vetLunge", d > 48 ? 5 : 2],
        ["vetGuard", mash ? 8 : 1.3],
      ]);
    }
    if (e.kind === "lion") {
      return weighted(e, [["lionPounce", d > 40 ? 6 : 3], ["lionMaul", d < 46 ? 5 : 2]]);
    }
    if (e.kind === "twin") {
      return e.role === "sweep" ? "twinSweep" : "twinJab";
    }
    if (e.kind === "varro") {
      const low = ctx.hp <= 0.45;
      return weighted(e, [
        ["varroRead", 5],
        ["varroRush", blocking || d > 54 ? 6 : 2],
        ["varroAegis", mash ? 8 : 1.5],
        ["varroExecute", low ? 5 : 0],
      ]);
    }
    if (e.kind === "aelia") {
      return weighted(e, [
        ["aeliaJudgment", 5],
        ["aeliaSpear", d > 50 || blocking ? 5 : 2],
        ["aeliaSun", 4],
        ["aeliaAegis", mash ? 8 : 1.4],
        ["aeliaWheel", e.enraged ? 4 : 0],
      ]);
    }
    return "trident";
  }

  function randomName() {
    return PRAE[Math.floor(Math.random() * PRAE.length)] + " " + COG[Math.floor(Math.random() * COG.length)];
  }

  function emptyLegend() {
    return { v: 1, points: 0, owned: { blade: false, breath: false, scar: false }, hall: [] };
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (err) { raw = null; }
    if (!raw) return emptyLegend();
    try {
      const data = JSON.parse(raw);
      const base = emptyLegend();
      base.points = Math.max(0, data.points | 0);
      if (data.owned) {
        base.owned.blade = !!data.owned.blade;
        base.owned.breath = !!data.owned.breath;
        base.owned.scar = !!data.owned.scar;
      }
      if (Array.isArray(data.hall)) {
        base.hall = data.hall.slice(0, 12).map((h) => ({
          name: String(h.name || "Unknown"),
          fate: String(h.fate || ""),
          points: h.points | 0,
          fame: h.fame | 0,
        }));
      }
      return base;
    } catch (err) {
      return emptyLegend();
    }
  }

  function save(meta) {
    try { localStorage.setItem(KEY, JSON.stringify(meta)); } catch (err) { /* private mode */ }
  }

  function score(info) {
    let pts;
    if (!info.careerWins) {
      if (info.act1Cleared >= 4) pts = 3;
      else if (info.act1Cleared >= 2) pts = 2;
      else pts = 1;
    } else {
      pts = 2 + info.careerWins * 2;
    }
    if (info.champion) pts += 8;
    return pts;
  }

  function bank(meta, entry) {
    meta.points += entry.points;
    meta.hall.unshift({
      name: entry.name,
      fate: entry.fate,
      points: entry.points,
      fame: entry.fame || 0,
    });
    if (meta.hall.length > 12) meta.hall.length = 12;
    save(meta);
    return entry.points;
  }

  function buyUnlock(meta, id) {
    const u = UNLOCKS.find((x) => x.id === id);
    if (!u) return { ok: false, msg: "Nothing by that name." };
    if (meta.owned[id]) return { ok: false, msg: "Already yours. The next prisoner carries it." };
    if (meta.points < u.cost) return { ok: false, msg: "Not enough Legend. The yard is patient." };
    meta.points -= u.cost;
    meta.owned[id] = true;
    save(meta);
    return { ok: true, msg: u.name + " will be waiting at the next pit." };
  }

  function createRun(o) {
    return {
      name: o.name,
      day: 1,
      gold: o.gold | 0,
      fame: 0,
      fans: 0,
      days: DAYS,
      hp: Math.max(1, Math.round(o.hp)),
      deepCut: false,
      str: 0,
      spd: 0,
      sta: 0,
      weapon: "gladius",
      armor: "rags",
      cosmetic: "none",
      villa: 0,
      patron: null,
      oil: 0,
      rivalHeat: 0,
      heatPending: false,
      court: { gallus: false, marcia: false, rufus: false },
      partyTip: 0,
      wins: 0,
      note: "You are free. Three days before they call your name.",
    };
  }

  function hpMax(run) {
    return run.deepCut ? 82 : 100;
  }

  function fameTitle(fame) {
    if (fame >= 5) return "Champion's shadow";
    if (fame >= 2) return "Crowd favorite";
    if (fame >= 1) return "Rising name";
    return "Freedman";
  }

  function nextFight(index) {
    return FIGHTS[index] || null;
  }

  function freshness(run) {
    run.days = DAYS;
    run.court = { gallus: false, marcia: false, rufus: false };
  }

  function pay(run, gold, day) {
    if (day && run.days < 1) return "The lanista is at the gate. Spend later.";
    if (gold && run.gold < gold) return "Not enough denarii.";
    if (day) {
      run.days -= 1;
      run.day += 1;
    }
    if (gold) run.gold -= gold;
    return null;
  }

  function perform(run, action, arg) {
    if (action === "open") return { ok: true, open: arg, msg: run.note };
    if (action === "close") return { ok: true, close: true, msg: run.note };
    if (action === "train") {
      const spec = TRAIN[arg];
      if (!spec) return { ok: false, msg: "The yard does not teach that." };
      if (run[arg] >= spec.max) return { ok: false, msg: spec.name + " is already as sharp as the yard can make it." };
      const err = pay(run, spec.gold, true);
      if (err) return { ok: false, msg: err };
      run[arg] += 1;
      return { ok: true, msg: spec.name + " " + run[arg] + ". You will feel it in the next sand." };
    }
    if (action === "weapon" || action === "armor" || action === "cosmetic") {
      const table = action === "weapon" ? WEAPONS : action === "armor" ? ARMORS : LOOKS;
      const item = table[arg];
      if (!item) return { ok: false, msg: "They do not sell that." };
      if (run[action] === arg) return { ok: false, msg: "Already wearing it." };
      const err = pay(run, item.price, true);
      if (err) return { ok: false, msg: err };
      run[action] = arg;
      return { ok: true, msg: item.name + ". Equipped. The next fight will notice." };
    }
    if (action === "rest") {
      const max = hpMax(run);
      if (run.hp >= max && !run.deepCut) return { ok: false, msg: "You are as whole as the bed can make you." };
      const err = pay(run, 0, true);
      if (err) return { ok: false, msg: err };
      run.hp = Math.min(max, run.hp + 30);
      return { ok: true, msg: "A day in bed. " + run.hp + " health. " + (run.deepCut ? "The deep cut is still there." : "Nothing torn that sleep won't close.") };
    }
    if (action === "physician") {
      const max = hpMax(run);
      if (run.hp >= 100 && !run.deepCut) return { ok: false, msg: "The physician shrugs. You are wasting both of your time." };
      const err = pay(run, 24, true);
      if (err) return { ok: false, msg: err };
      run.deepCut = false;
      run.hp = 100;
      void max;
      return { ok: true, msg: "Stitched, salved, and charged for the privilege. You are whole." };
    }
    if (action === "villa") {
      if (run.villa >= VILLA.length - 1) return { ok: false, msg: "The house is already embarrassing the neighbors." };
      const next = VILLA[run.villa + 1];
      const err = pay(run, next.cost, true);
      if (err) return { ok: false, msg: err };
      run.villa += 1;
      return { ok: true, msg: next.name + ". Wins will bring " + next.rent + " denarii home with you." };
    }
    if (action === "court") {
      if (run.court[arg]) return { ok: false, msg: "You already bent the knee today. Try again after a fight." };
      if (arg === "gallus") {
        const err = pay(run, 0, true);
        if (err) return { ok: false, msg: err };
        run.court.gallus = true;
        run.gold += 24;
        run.patron = "gallus";
        return { ok: true, msg: "Senator Gallus is amused. +24 now, and +12 on every purse while he claims you." };
      }
      if (arg === "marcia") {
        const err = pay(run, 10, true);
        if (err) return { ok: false, msg: err };
        run.court.marcia = true;
        if (run.cosmetic === "none") {
          const choices = ["cloak", "laurel", "pelt"];
          const pickId = choices[Math.floor(Math.random() * choices.length)];
          run.cosmetic = pickId;
          return { ok: true, msg: "Lady Marcia hates a bare shoulder. She gives you the " + LOOKS[pickId].name + "." };
        }
        run.gold += 28;
        return { ok: true, msg: "Lady Marcia approves of the costume and sends 28 denarii so you keep wearing it." };
      }
      if (arg === "rufus") {
        const err = pay(run, 0, true);
        if (err) return { ok: false, msg: err };
        run.court.rufus = true;
        if (run.lastTaken != null && run.lastTaken < 40 && run.wins > 0) {
          run.oil += 4;
          return { ok: true, msg: "General Rufus likes a clean fight. Oil for the blade: +4 damage next bout." };
        }
        run.gold += 12;
        return { ok: true, msg: "Rufus grunts. +12 denarii. He says the next one should bleed less of you." };
      }
      return { ok: false, msg: "That patron is not receiving." };
    }
    if (action === "party") {
      if (arg === "feast") {
        const err = pay(run, 15, true);
        if (err) return { ok: false, msg: err };
        run.fans += 4;
        run.partyTip += 8;
        return { ok: true, msg: "The street ate on you. More fans. The next purse is a little fatter." };
      }
      if (arg === "supper") {
        const err = pay(run, 40, true);
        if (err) return { ok: false, msg: err };
        run.fans += 2;
        if (run.patron !== "gallus") {
          run.patron = "gallus";
          return { ok: true, msg: "A patron. Gallus will add 12 denarii to every purse." };
        }
        run.gold += 25;
        run.rivalHeat += 1;
        return { ok: true, msg: "Gallus is already yours. The supper still pays 25, and " + RIVAL + " hears your name again." };
      }
      if (arg === "boast") {
        const err = pay(run, 25, true);
        if (err) return { ok: false, msg: err };
        run.rivalHeat += 1;
        run.heatPending = true;
        return { ok: true, msg: RIVAL + " hears it. Your next opponent may be paid to end you. His own purse, when you meet, is larger — and he is faster." };
      }
      return { ok: false, msg: "That party already ended." };
    }
    if (action === "fight") {
      if (!nextFight(arg | 0)) return { ok: false, msg: "No bout on the card." };
      return { ok: true, fight: true, msg: "The gate." };
    }
    return { ok: false, msg: "Nothing happens." };
  }

  function onWin(run, fight, hp, fightMax) {
    let purse = fight.purse + Math.min(16, Math.floor(run.fans / 3));
    if (run.patron === "gallus") purse += 12;
    purse += run.partyTip || 0;
    if (fight.kind === "varro") purse += (run.rivalHeat | 0) * 15;
    const rent = (VILLA[run.villa] && VILLA[run.villa].rent) || 0;
    run.partyTip = 0;
    run.gold += purse + rent;
    run.fans += 2;
    run.fame += 1;
    run.wins += 1;
    run.lastTaken = Math.max(0, Math.round(fightMax - hp));
    if (hp < fightMax * 0.45) run.deepCut = true;
    run.hp = Math.max(1, Math.min(hpMax(run), Math.round(hp)));
    freshness(run);
    const bits = ["Purse +" + purse + "."];
    if (rent) bits.push("The house added " + rent + ".");
    if (run.deepCut && hp < fightMax * 0.45) bits.push("A deep cut. The physician can close it.");
    else if (run.hp < hpMax(run)) bits.push("You are still bleeding. The bed is cheaper than pride.");
    return { purse: purse + rent, note: bits.join(" ") };
  }

  function combatMods(run, meta) {
    const owned = (meta && meta.owned) || {};
    const w = WEAPONS[run.weapon] || WEAPONS.gladius;
    const a = ARMORS[run.armor] || ARMORS.rags;
    const look = LOOKS[run.cosmetic] || LOOKS.none;
    let dmg = 12 + run.str * 2 + (w.dmg || 0);
    if (run.weapon === "gladius" && owned.blade) dmg += 2;
    dmg += run.oil || 0;
    let def = a.def || 0;
    if (run.armor === "rags" && owned.scar) def = Math.max(def, 2);
    const edge = (run.weapon === "gladius" && owned.blade) ? "#e8c070" : w.edge;
    return {
      dmg: dmg,
      def: def,
      speed: 74 + run.spd * 7,
      stamMax: 100 + (owned.breath ? 15 : 0) + run.sta * 12,
      hpMax: hpMax(run),
      weaponLook: { len: w.len, thick: w.thick, color: w.color, edge: edge },
      look: { cape: look.cape, helm: look.helm },
      oil: run.oil || 0,
    };
  }

  function legendBody(meta) {
    return {
      dmgBonus: meta.owned.blade ? 2 : 0,
      def: meta.owned.scar ? 2 : 0,
      stam: meta.owned.breath ? 15 : 0,
      blade: !!meta.owned.blade,
    };
  }

  function stationAt(x, y, pad) {
    const p = pad || 0;
    for (let i = 0; i < STATIONS.length; i++) {
      const s = STATIONS[i];
      if (x >= s.x - p && x <= s.x + s.w + p && y >= s.y - p && y <= s.y + s.h + p) return s;
    }
    return null;
  }

  function richness(run) {
    return {
      villa: run.villa,
      fame: run.fame,
      banners: run.fame >= 1,
      marble: run.fame >= 2,
      crowd: run.fame >= 3 || run.villa >= 2,
      gold: run.villa >= 3 || run.fame >= 5,
    };
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function actButton(label, action, arg, disabled) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hub-btn" + (action === "fight" ? " primary" : "");
    b.textContent = label;
    b.dataset.act = action;
    if (arg != null) b.dataset.arg = arg;
    if (disabled) b.disabled = true;
    return b;
  }

  function paint(root, run, sheet) {
    root.replaceChildren();
    const max = hpMax(run);
    const top = el("div", "hub-top");
    top.appendChild(el("b", null, run.name));
    top.appendChild(el("span", null, fameTitle(run.fame) + " · Day " + run.day + " · " + run.days + (run.days === 1 ? " day" : " days")));
    const wound = run.deepCut ? " · deep cut" : "";
    top.appendChild(el("span", null, run.gold + " denarii · " + run.hp + "/" + max + " HP" + wound));
    root.appendChild(top);
    root.appendChild(el("p", "hub-note", run.note || ""));

    const row = el("div", "hub-row");
    STATIONS.forEach((s) => {
      const b = actButton(s.label, "open", s.id, false);
      if (sheet === s.id) b.classList.add("is-on");
      row.appendChild(b);
    });
    const fight = nextFight(run._index || 0);
    if (fight) row.appendChild(actButton(run.days ? "Fight early" : "To the sand", "fight", String(run._index || 0), false));
    root.appendChild(row);

    const stats = el("p", "hub-stats");
    stats.textContent = "STR " + run.str + "  SPD " + run.spd + "  WND " + run.sta +
      "   " + WEAPONS[run.weapon].name + " · " + ARMORS[run.armor].name +
      (run.cosmetic !== "none" ? " · " + LOOKS[run.cosmetic].name : "") +
      "   Fans " + run.fans + (run.patron === "gallus" ? " · Gallus" : "");
    root.appendChild(stats);

    if (!sheet) return;
    const sheetEl = el("div", "hub-sheet");
    const station = STATIONS.find((s) => s.id === sheet);
    sheetEl.appendChild(el("h3", null, station ? station.name : "The street"));
    const noDay = run.days < 1;

    if (sheet === "yard") {
      sheetEl.appendChild(el("p", null, "A day and some coin. The change shows up in the next fight, not in a speech."));
      Object.keys(TRAIN).forEach((id) => {
        const spec = TRAIN[id];
        const rank = run[id];
        const line = el("div", "hub-line");
        line.appendChild(el("span", null, spec.name + " " + rank + "/" + spec.max + " — " + spec.blurb));
        line.appendChild(actButton(rank >= spec.max ? "Maxed" : spec.gold + " denarii", "train", id, rank >= spec.max || noDay || run.gold < spec.gold));
        sheetEl.appendChild(line);
      });
    } else if (sheet === "smith") {
      sheetEl.appendChild(el("p", null, "Buying spends a day. The smith does not do rush work for freedmen."));
      Object.keys(WEAPONS).forEach((id) => {
        if (id === "gladius") return;
        const item = WEAPONS[id];
        const line = el("div", "hub-line");
        const owned = run.weapon === id;
        line.appendChild(el("span", null, item.name + " — " + item.blurb));
        line.appendChild(actButton(owned ? "Equipped" : item.price + " denarii", "weapon", id, owned || noDay || run.gold < item.price));
        sheetEl.appendChild(line);
      });
      sheetEl.appendChild(el("p", null, "Armor. Defense comes off the top of a hit. A perfect read still matters more."));
      Object.keys(ARMORS).forEach((id) => {
        if (id === "rags") return;
        const item = ARMORS[id];
        const line = el("div", "hub-line");
        const owned = run.armor === id;
        line.appendChild(el("span", null, item.name + " — " + item.blurb));
        line.appendChild(actButton(owned ? "Equipped" : item.price + " denarii", "armor", id, owned || noDay || run.gold < item.price));
        sheetEl.appendChild(line);
      });
    } else if (sheet === "market") {
      sheetEl.appendChild(el("p", null, "None of this stops a blade. All of it changes who can see you from the cheap seats. Lady Marcia cares."));
      Object.keys(LOOKS).forEach((id) => {
        if (id === "none") return;
        const item = LOOKS[id];
        const line = el("div", "hub-line");
        const owned = run.cosmetic === id;
        line.appendChild(el("span", null, item.name + " — " + item.blurb));
        line.appendChild(actButton(owned ? "Wearing" : item.price + " denarii", "cosmetic", id, owned || noDay || run.gold < item.price));
        sheetEl.appendChild(line);
      });
    } else if (sheet === "heal") {
      sheetEl.appendChild(el("p", null, "You enter the next fight at the health you leave with. A deep cut also lowers your maximum until a physician closes it."));
      const line1 = el("div", "hub-line");
      line1.appendChild(el("span", null, "Rest the day. Free. +30 health. Does not close a deep cut."));
      line1.appendChild(actButton("Rest", "rest", "", noDay || (run.hp >= max && !run.deepCut)));
      sheetEl.appendChild(line1);
      const line2 = el("div", "hub-line");
      line2.appendChild(el("span", null, "Physician. 24 denarii. Full health, deep cut closed."));
      line2.appendChild(actButton("Pay", "physician", "", noDay || run.gold < 24 || (run.hp >= 100 && !run.deepCut)));
      sheetEl.appendChild(line2);
    } else if (sheet === "home") {
      const here = VILLA[run.villa];
      sheetEl.appendChild(el("p", null, here.name + ". " + here.blurb));
      if (run.villa < VILLA.length - 1) {
        const nxt = VILLA[run.villa + 1];
        const line = el("div", "hub-line");
        line.appendChild(el("span", null, "Upgrade to " + nxt.name + "."));
        line.appendChild(actButton(nxt.cost + " denarii", "villa", "", noDay || run.gold < nxt.cost));
        sheetEl.appendChild(line);
      }
    } else if (sheet === "court") {
      sheetEl.appendChild(el("p", null, "A day spent on people who own the city. They pay in coin, cloth, or a sharper next fight."));
      const g = el("div", "hub-line");
      g.appendChild(el("span", null, "Senator Gallus. +24 now, and +12 on every purse."));
      g.appendChild(actButton(run.court.gallus ? "Seen" : "Court", "court", "gallus", noDay || run.court.gallus));
      sheetEl.appendChild(g);
      const m = el("div", "hub-line");
      m.appendChild(el("span", null, "Lady Marcia. Costs 10. A costume if you are bare, otherwise coin."));
      m.appendChild(actButton(run.court.marcia ? "Seen" : "Court", "court", "marcia", noDay || run.court.marcia || run.gold < 10));
      sheetEl.appendChild(m);
      const r = el("div", "hub-line");
      r.appendChild(el("span", null, "General Rufus. A clean last fight earns blade oil. A messy one earns 12 denarii and advice."));
      r.appendChild(actButton(run.court.rufus ? "Seen" : "Court", "court", "rufus", noDay || run.court.rufus));
      sheetEl.appendChild(r);
      sheetEl.appendChild(el("h3", null, "Parties"));
      const feast = el("div", "hub-line");
      feast.appendChild(el("span", null, "Street feast. 15 denarii. Fans, and a tip on the next purse."));
      feast.appendChild(actButton("Host", "party", "feast", noDay || run.gold < 15));
      sheetEl.appendChild(feast);
      const supper = el("div", "hub-line");
      supper.appendChild(el("span", null, "Noble supper. 40 denarii. A patron, or coin if you already have one."));
      supper.appendChild(actButton("Host", "party", "supper", noDay || run.gold < 40));
      sheetEl.appendChild(supper);
      const boast = el("div", "hub-line");
      boast.appendChild(el("span", null, "Boast about " + RIVAL + ". 25 denarii. He spends money on your next opponent, and he hits faster when you finally meet. His purse grows too."));
      boast.appendChild(actButton("Provoke", "party", "boast", noDay || run.gold < 25));
      sheetEl.appendChild(boast);
    } else if (sheet === "gate") {
      if (!fight) {
        sheetEl.appendChild(el("p", null, "The card is blank."));
      } else {
        sheetEl.appendChild(el("p", null, fight.kicker + " — " + fight.title));
        sheetEl.appendChild(el("p", null, fight.sub));
        sheetEl.appendChild(el("p", null, fight.tip));
        sheetEl.appendChild(el("p", null, "Purse " + fight.purse + " denarii, plus fans" + (run.patron === "gallus" ? " and Gallus" : "") + ". You go in at " + run.hp + "/" + max + " health."));
        if (run.heatPending && fight.kind !== "varro" && fight.kind !== "aelia") {
          sheetEl.appendChild(el("p", null, RIVAL + " has paid this one. They will have more blood to spend."));
        }
        if (fight.kind === "varro" && run.rivalHeat) {
          sheetEl.appendChild(el("p", null, "He has heard you " + run.rivalHeat + " time" + (run.rivalHeat > 1 ? "s" : "") + ". Faster hands. A fatter purse."));
        }
        sheetEl.appendChild(actButton("Enter the sand", "fight", String(run._index || 0), false));
      }
    }
    const close = actButton("Back to the street", "close", "", false);
    sheetEl.appendChild(close);
    root.appendChild(sheetEl);
  }

  function paintLegend(root, meta) {
    root.replaceChildren();
    root.appendChild(el("p", "eyebrow", "Between prisoners"));
    root.appendChild(el("h2", null, "Legend"));
    root.appendChild(el("p", null, meta.points + " to spend. Unlocks stick. The next body starts with them, still at the first pit."));
    UNLOCKS.forEach((u) => {
      const line = el("div", "hub-line");
      const owned = !!meta.owned[u.id];
      line.appendChild(el("span", null, u.name + " (" + u.cost + ") — " + u.text));
      const b = actButton(owned ? "Yours" : "Take", "unlock", u.id, owned || meta.points < u.cost);
      b.classList.add("secondary");
      line.appendChild(b);
      root.appendChild(line);
    });
  }

  function paintHall(root, meta) {
    root.replaceChildren();
    root.appendChild(el("p", "eyebrow", "Names the sand kept"));
    root.appendChild(el("h2", null, "Hall of Legends"));
    if (!meta.hall.length) {
      root.appendChild(el("p", null, "No names yet. The sand is patient, which is not the same as kind."));
      return;
    }
    const list = el("ul", "hall");
    meta.hall.forEach((h) => {
      const li = el("li");
      li.textContent = h.name + " — " + h.fate + "  (+" + h.points + " Legend)";
      list.appendChild(li);
    });
    root.appendChild(list);
  }

  function taunt(run, fight) {
    if (!fight) return "";
    if (fight.kind === "varro") {
      if (run && run.rivalHeat >= 2) return "Still talking, pit rat? Good. I brought a faster sword.";
      if (run && run.rivalHeat === 1) return "I heard the supper. I was not invited. I came anyway.";
      return "So you are the one the pit spat out. Try to be interesting.";
    }
    if (fight.kind === "aelia") return "Nine years. Make it worth standing up.";
    return "";
  }

  window.GS_CAREER = {
    DAYS: DAYS,
    RIVAL: RIVAL,
    CHAMPION: CHAMPION,
    WEAPONS: WEAPONS,
    ARMORS: ARMORS,
    LOOKS: LOOKS,
    VILLA: VILLA,
    UNLOCKS: UNLOCKS,
    STATIONS: STATIONS,
    FIGHTS: FIGHTS,
    PATTERNS: PATTERNS,
    KINDS: KINDS,
    randomName: randomName,
    load: load,
    save: save,
    score: score,
    bank: bank,
    buyUnlock: buyUnlock,
    createRun: createRun,
    hpMax: hpMax,
    fameTitle: fameTitle,
    nextFight: nextFight,
    perform: perform,
    onWin: onWin,
    combatMods: combatMods,
    legendBody: legendBody,
    stationAt: stationAt,
    richness: richness,
    pick: pick,
    paint: paint,
    paintLegend: paintLegend,
    paintHall: paintHall,
    taunt: taunt,
  };
})();
