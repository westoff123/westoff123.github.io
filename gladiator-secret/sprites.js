/* Procedural pixel sprites for Gladiator Secret. No external images. */
(function () {
  const PAL = {
    o: "#140c0a",
    s: "#f0b48a",
    S: "#c48460",
    e: "#1a1210",
    b: "#e8c070",
    B: "#a87430",
    y: "#ffe29a",
    m: "#e4e7ee",
    M: "#6e7686",
    r: "#d23a34",
    R: "#7a1618",
    c: "#9a2428",
    C: "#4a1014",
    p: "#4a3428",
    P: "#2a1c16",
    w: "#f6f1e6",
    g: "#7d8a52",
    G: "#46532e",
    f: "#e0b080",
    F: "#8a5a34",
    k: "#221816",
    n: "#e07068",
    u: "#7f8ea0",
    h: "#3a241c",
    l: "#b07840",
    L: "#6a4018",
    a: "#1c2838",
  };

  function hex(h) {
    return [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
      255,
    ];
  }

  const RGB = {};
  Object.keys(PAL).forEach((k) => {
    RGB[k] = hex(PAL[k]);
  });

  function bake(rows) {
    const h = rows.length;
    const w = rows[0].length;
    for (let y = 0; y < h; y++) {
      if (rows[y].length !== w) {
        throw new Error("Sprite row " + y + " is " + rows[y].length + " wide, expected " + w + ": " + rows[y]);
      }
    }
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        if (ch === "." || ch === " ") continue;
        const col = RGB[ch];
        if (!col) throw new Error("Unknown pixel " + ch);
        const i = (y * w + x) * 4;
        img.data[i] = col[0];
        img.data[i + 1] = col[1];
        img.data[i + 2] = col[2];
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  const RAW = {
    player: [[
      "................",
      ".....oooo.......",
      "....obyybo......",
      "....obbbbo......",
      "....obmmbo......",
      ".....ossso......",
      ".....oseeo......",
      "....oosssoo.....",
      "...obbbrbbbo....",
      "...obbrrrbbo....",
      "...obbrrrbbo....",
      "....orrrro......",
      "....oppppo......",
      "....oppppo......",
      "....oP..Po......",
      "....oP..Po......",
      "....oo..oo......",
      "................",
    ]],
    prisoner: [[
      "................",
      "......oooo......",
      ".....osssso.....",
      ".....oshsso.....",
      ".....oseeso.....",
      ".....osuuso.....",
      "......oooo......",
      ".....oggggo.....",
      "....oggggggo....",
      "....ogGwwGgo....",
      "....oggggggo....",
      ".....oggggo.....",
      ".....oppppo.....",
      ".....oP..Po.....",
      ".....oP..Po.....",
      ".....oo..oo.....",
      "................",
      "................",
    ]],
    brute: [[
      "..................",
      "......oooooo......",
      ".....osssssso.....",
      ".....ossSSsso.....",
      ".....oseeeeso.....",
      ".....osssssso.....",
      "....oossssssoo....",
      "...osssssssssso...",
      "...osssssssssso...",
      "...olsssssssslo...",
      "....osssssssso....",
      "....obllllllbo....",
      ".....oppppppo.....",
      ".....oP....Po.....",
      ".....oP....Po.....",
      ".....oo....oo.....",
      "....oo......oo....",
      "..................",
      "..................",
      "..................",
    ]],
    boss: [[
      "........rr........",
      ".......rrrr.......",
      "......rrRRrr......",
      "......oooooo......",
      ".....oyyyyyo......",
      ".....obbbbbo......",
      ".....obmmbbo......",
      "......ossso.......",
      "......oseeo.......",
      ".....oosssoo......",
      "....occccccco.....",
      "...ocmcccccmco....",
      "...occcccccccco...",
      "...occcccccccco...",
      "....occcccccco....",
      ".....opppp po.....",
      ".....oP....Po.....",
      ".....oP....Po.....",
      ".....oo....oo.....",
      "....oo......oo....",
      "..................",
      "..................",
    ]],
    hound: [[
      "....................",
      "............ooo.....",
      "...........ororo....",
      ".........ooffffoo...",
      "........ooffffFoo...",
      ".......ooffffffkoo..",
      "......oofffffffkoo..",
      "......oofffffoooo...",
      "........oo..oo..oo..",
      ".......oo..oo..oo...",
      "....................",
      "....................",
    ], [
      "....................",
      "............ooo.....",
      "...........ororo....",
      ".........ooffffoo...",
      "........ooffffFoo...",
      ".......ooffffffkoo..",
      "......oofffffffkoo..",
      "......oofffffoooo...",
      ".......oo..oo..oo...",
      "........oo..oo..oo..",
      "....................",
      "....................",
    ]],
    retiarius: [[
      "................",
      "......oooo......",
      ".....osssso.....",
      ".....oshhso.....",
      ".....oseeso.....",
      ".....osssso.....",
      "....oosssoo.....",
      "...oosgggsso....",
      "...oss....sso...",
      "....oss..sso....",
      ".....osssso.....",
      ".....oppppo.....",
      ".....oP..Po.....",
      ".....oP..Po.....",
      ".....oo..oo.....",
      "................",
      "................",
      "................",
    ]],
    murmillo: [[
      "..................",
      "......brrrrb......",
      ".....obbbbbo......",
      ".....obmmmbo......",
      ".....obsssbo......",
      "......oseeo.......",
      ".....oosssoo......",
      "....ouusssuuo.....",
      "....ouusssuuo.....",
      "....oousssuoo.....",
      ".....opppp po.....",
      ".....oP....Po.....",
      ".....oP....Po.....",
      ".....oo....oo.....",
      "..................",
      "..................",
      "..................",
      "..................",
    ]],
    veteran: [[
      "................",
      ".....brrrb......",
      "....obbbbbo.....",
      "....obmmmbo.....",
      "....obsssbo.....",
      ".....oseeo......",
      "....oosssoo.....",
      "...orrsssrrro...",
      "...orsssssrro...",
      "...oosssssso....",
      "....opppp po....",
      "....oP...Po.....",
      "....oP...Po.....",
      "....oo...oo.....",
      "................",
      "................",
      "................",
      "................",
    ]],
    twin: [[
      "................",
      "......oooo......",
      ".....ossso......",
      ".....osSso......",
      ".....oseeo......",
      ".....osssso.....",
      "....oaaaaoo.....",
      "...oauuuuao.....",
      "...oauuuuao.....",
      "....oauuuao.....",
      ".....oppppo.....",
      ".....oP..Po.....",
      ".....oP..Po.....",
      ".....oo..oo.....",
      "................",
      "................",
      "................",
      "................",
    ]],
    varro: [[
      "................",
      ".....hhhhh......",
      "....ohhhhho.....",
      "....ossssso.....",
      "....oseeeso.....",
      "....ossssso.....",
      "...owwbwwwo.....",
      "..owwwwwwwo.....",
      "..owwwwwwwo.....",
      "...owwwwwo......",
      "....oppppo......",
      "....oP..Po......",
      "....oP..Po......",
      "....oo..oo......",
      "................",
      "................",
      "................",
      "................",
    ]],
    aelia: [[
      ".......yy.......",
      "......yyyy......",
      ".....oyyyyo.....",
      ".....obbbbo.....",
      ".....obmmbo.....",
      "......ossso.....",
      "......oseeo.....",
      "....owwsswwo....",
      "...owwwsswwwo...",
      "...owwwsswwwo...",
      "....owwwswwo....",
      ".....oppppo.....",
      ".....oP..Po.....",
      ".....oP..Po.....",
      ".....oo..oo.....",
      "....oo....oo....",
      "................",
      "................",
    ]],
    lion: [[
      "....................",
      "..........oooo......",
      ".........orFro......",
      ".......ooFFFFFoo....",
      "......ooffffffFoo...",
      ".....oooffffffkoo...",
      ".....oofffffffkoo...",
      "......oofffffooo....",
      "........oo..oo..oo..",
      ".......oo..oo..oo...",
      "....................",
      "....................",
    ], [
      "....................",
      "..........oooo......",
      ".........orFro......",
      ".......ooFFFFFoo....",
      "......ooffffffFoo...",
      ".....oooffffffkoo...",
      ".....oofffffffkoo...",
      "......oofffffooo....",
      ".......oo..oo..oo...",
      "........oo..oo..oo..",
      "....................",
      "....................",
    ]],
  };

  const scratch = document.createElement("canvas");
  const sg = scratch.getContext("2d");

  const baked = {};
  Object.keys(RAW).forEach((name) => {
    baked[name] = RAW[name].map(bake);
  });

  function draw(ctx, name, x, y, opt) {
    opt = opt || {};
    const frames = baked[name];
    if (!frames) return;
    const frame = frames[(opt.frame | 0) % frames.length];
    const scale = opt.scale || 2;
    const flash = opt.flash || 0;
    const tint = opt.tint || null;
    const alpha = opt.alpha == null ? 1 : opt.alpha;
    let src = frame;
    if (flash > 0 || tint) {
      scratch.width = frame.width;
      scratch.height = frame.height;
      sg.clearRect(0, 0, scratch.width, scratch.height);
      sg.drawImage(frame, 0, 0);
      sg.globalCompositeOperation = "source-atop";
      if (tint) {
        sg.fillStyle = tint;
        sg.fillRect(0, 0, scratch.width, scratch.height);
      }
      if (flash > 0) {
        sg.fillStyle = "rgba(255,255,255," + Math.min(1, flash) + ")";
        sg.fillRect(0, 0, scratch.width, scratch.height);
      }
      sg.globalCompositeOperation = "source-over";
      src = scratch;
    }
    const dw = frame.width * scale;
    const dh = frame.height * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(x), Math.round(y));
    if (opt.flip) ctx.scale(-1, 1);
    if (opt.rot) ctx.rotate(opt.rot);
    ctx.drawImage(src, Math.round(-dw / 2), Math.round(-dh), dw, dh);
    ctx.restore();
  }

  window.GS_SPRITES = { draw, PAL };
})();
