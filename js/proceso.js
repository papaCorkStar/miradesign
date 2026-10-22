(() => {
  const svg = document.getElementById("houseSvg");
  const track = document.getElementById("procesoTrack");
  if (!svg || !track) return;

  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phases = [...document.querySelectorAll(".phase")];
  const label = document.getElementById("phaseLabel");
  const NOMBRES = ["boceto", "plano", "volumen", "casa terminada"];

  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const iso = ([x, y, z = 0]) => [(x - y) * C, (x + y) * S - z];

  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  const A = { x0: 0, x1: 5, y0: 0, y1: 6, h: 5.6 };
  const B = { x0: 5, x1: 10, y0: 1, y1: 6, h: 2.8 };

  const aristas = [
    [[0, 0, A.h], [5, 0, A.h]], [[5, 0, A.h], [5, 6, A.h]], [[5, 6, A.h], [0, 6, A.h]], [[0, 6, A.h], [0, 0, A.h]],
    [[5, 0, 1.8], [5, 0, A.h]], [[0, 6, 0], [0, 6, A.h]], [[5, 6, B.h], [5, 6, A.h]],
    [[0, 6, 0], [5, 6, 0]],
    [[5, 1, B.h], [10, 1, B.h]], [[10, 1, B.h], [10, 6, B.h]], [[10, 6, B.h], [5, 6, B.h]], [[5, 1, B.h], [5, 6, B.h]],
    [[10, 1, 0], [10, 1, B.h]], [[10, 6, 0], [10, 6, B.h]], [[5, 6, 0], [5, 6, B.h]],
    [[5, 6, 0], [10, 6, 0]], [[10, 1, 0], [10, 6, 0]]
  ];

  const muroExt = [[0, 0], [5, 0], [5, 1], [10, 1], [10, 6], [0, 6]];
  const muroInt = [[.25, .25], [4.75, .25], [4.75, 1.25], [9.75, 1.25], [9.75, 5.75], [.25, 5.75]];
  const tabiques = [
    [[.25, 3], [3.4, 3]], [[4.4, 3], [4.75, 3]],
    [[2.6, 3], [2.6, 5.75]],
    [[5, 1.25], [5, 2.6]], [[5, 3.6], [5, 5.75]],
    [[7.6, 1.25], [7.6, 3.8]]
  ];

  const cotas = [
    { a: [0, 7.3], b: [10, 7.3], txt: "10,00", off: [0, .9] },
    { a: [11.3, 1], b: [11.3, 6], txt: "5,00", off: [.9, 0] },
    { a: [-1.3, 0], b: [-1.3, 6], txt: "6,00", off: [-.9, 0] }
  ];

  const caras = [
    { pts: [[10, 1, 0], [12.6, 1.7, 0], [12.6, 6.7, 0], [10, 6, 0]], fill: "rgba(42,42,41,.08)" },
    { pts: [[0, 0, A.h], [5, 0, A.h], [5, 6, A.h], [0, 6, A.h]], fill: "#fbfbf9" },
    { pts: [[5, 0, 0], [5, 0, A.h], [5, 6, A.h], [5, 6, 0]], fill: "#d8d7d1" },
    { pts: [[0, 6, 0], [5, 6, 0], [5, 6, A.h], [0, 6, A.h]], fill: "#ebeae5" },
    { pts: [[5, 1, B.h], [10, 1, B.h], [10, 6, B.h], [5, 6, B.h]], fill: "#ffffff" },
    { pts: [[10, 1, 0], [10, 1, B.h], [10, 6, B.h], [10, 6, 0]], fill: "#d8d7d1" },
    { pts: [[5, 6, 0], [10, 6, 0], [10, 6, B.h], [5, 6, B.h]], fill: "#ebeae5" }
  ];

  const huecos = [
    [[1, 6, 3.3], [2.5, 6, 3.3], [2.5, 6, 5], [1, 6, 5]],
    [[3.2, 6, 3.3], [4.3, 6, 3.3], [4.3, 6, 5], [3.2, 6, 5]],
    [[5, 1.6, 3.6], [5, 3.6, 3.6], [5, 3.6, 4.8], [5, 1.6, 4.8]],
    [[6, 6, .8], [9.2, 6, .8], [9.2, 6, 2.2], [6, 6, 2.2]],
    [[10, 2.2, 0], [10, 3.4, 0], [10, 3.4, 2.2], [10, 2.2, 2.2]]
  ];

  const todos = [
    ...aristas.flat(), ...muroExt.map(p => [...p, 0]),
    ...cotas.flatMap(c => [[...c.a, 0], [...c.b, 0]]),
    [12.6, 6.7, 0], [-2.2, 7.6, 0], [13, 7.6, 0]
  ].map(iso);
  const minX = Math.min(...todos.map(p => p[0])), maxX = Math.max(...todos.map(p => p[0]));
  const minY = Math.min(...todos.map(p => p[1])), maxY = Math.max(...todos.map(p => p[1]));
  const W = 640, H = 520, M = 28;
  const k = Math.min((W - 2 * M) / (maxX - minX), (H - 2 * M) / (maxY - minY));
  const ox = M + ((W - 2 * M) - (maxX - minX) * k) / 2 - minX * k;
  const oy = M + ((H - 2 * M) - (maxY - minY) * k) / 2 - minY * k;
  const P = p3 => { const [x, y] = iso(p3); return [ox + x * k, oy + y * k]; };
  const d = pts => pts.map((p, i) => (i ? "L" : "M") + p.map(n => n.toFixed(1)).join(" ")).join(" ");

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const a in attrs) n.setAttribute(a, attrs[a]);
    parent.appendChild(n);
    return n;
  };
  const grupo = cls => el("g", { class: cls }, svg);

  const gGrid = grupo("g-grid");
  const gPlan = grupo("g-plan");
  const gCaras = grupo("g-caras");
  const gHuecos = grupo("g-huecos");
  const gAristas = grupo("g-aristas");
  const gBoceto = grupo("g-boceto");
  const gCotas = grupo("g-cotas");

  for (let i = -1; i <= 12; i++) el("path", { class: "grid-line", d: d([P([i, -1, 0]), P([i, 8, 0])]) }, gGrid);
  for (let j = -1; j <= 8; j++) el("path", { class: "grid-line", d: d([P([-1, j, 0]), P([12, j, 0])]) }, gGrid);

  const trazos = { boceto: [], plano: [], aristas: [] };
  const linea = (pts, cls, parent, lista) => {
    const n = el("path", { class: "ink " + cls, d: d(pts) }, parent);
    lista.push(n);
    return n;
  };

  aristas.forEach(([a, b]) => {
    for (let r = 0; r < 2; r++) {
      const j = () => (rnd() - .5) * .28;
      const ext = .12 + rnd() * .25;
      const dir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const a2 = [a[0] - dir[0] * ext / 6 + j(), a[1] - dir[1] * ext / 6 + j(), a[2] - dir[2] * ext / 6 + j()];
      const b2 = [b[0] + dir[0] * ext / 6 + j(), b[1] + dir[1] * ext / 6 + j(), b[2] + dir[2] * ext / 6 + j()];
      const m = [(a2[0] + b2[0]) / 2 + j(), (a2[1] + b2[1]) / 2 + j(), (a2[2] + b2[2]) / 2 + j()];
      const [p0, p1, p2] = [P(a2), P(m), P(b2)];
      const n = el("path", {
        class: "ink sketch",
        d: `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
      }, gBoceto);
      trazos.boceto.push(n);
    }
  });

  linea([...muroExt, muroExt[0]].map(p => P([...p, 0])), "plan", gPlan, trazos.plano);
  linea([...muroInt, muroInt[0]].map(p => P([...p, 0])), "plan", gPlan, trazos.plano);
  tabiques.forEach(([a, b]) => linea([P([...a, 0]), P([...b, 0])], "plan", gPlan, trazos.plano));

  const cotasEls = [];
  cotas.forEach(c => {
    const g = el("g", { class: "cota" }, gCotas);
    const dx = c.b[0] - c.a[0], dy = c.b[1] - c.a[1];
    const nx = dy ? .25 : 0, ny = dx ? .25 : 0;
    el("path", { class: "ink dim", d: d([P([...c.a, 0]), P([...c.b, 0])]) }, g);
    [c.a, c.b].forEach(q => el("path", { class: "ink dim", d: d([P([q[0] - nx, q[1] - ny, 0]), P([q[0] + nx, q[1] + ny, 0])]) }, g));
    const mid = P([(c.a[0] + c.b[0]) / 2 + c.off[0] * .55, (c.a[1] + c.b[1]) / 2 + c.off[1] * .55, 0]);
    const t = el("text", { class: "dim-text", x: mid[0].toFixed(1), y: mid[1].toFixed(1), "text-anchor": "middle", "dominant-baseline": "middle" }, g);
    t.textContent = c.txt;
    cotasEls.push(g);
  });

  const carasEls = caras.map(c => el("path", { class: "face", d: d(c.pts.map(P)) + "Z", fill: c.fill }, gCaras));
  const huecosEls = huecos.map(h => el("path", { class: "face", d: d(h.map(P)) + "Z", fill: "#2e4d6e" }, gHuecos));

  aristas.forEach(([a, b]) => linea([P(a), P(b)], "edge", gAristas, trazos.aristas));

  linea([P([-2.2, 7.6, 0]), P([13, 7.6, 0])], "ground", gAristas, trazos.aristas);

  const prep = n => { const L = n.getTotalLength(); n.style.strokeDasharray = L; n.dataset.len = L; return n; };
  Object.values(trazos).flat().forEach(prep);

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const dibujar = (lista, t, solape = .5) => {
    const n = lista.length;
    lista.forEach((p, i) => {
      const start = (i / n) * (1 - solape);
      const local = clamp((t - start) / solape);
      p.style.strokeDashoffset = p.dataset.len * (1 - local);
    });
  };

  let ultimo = -1;
  function render(p) {
    const f = p * 4;
    const t0 = clamp(f), t1 = clamp(f - 1), t2 = clamp(f - 2), t3 = clamp(f - 3);

    dibujar(trazos.boceto, t0 / .85, .35);
    gBoceto.style.opacity = (1 - t1 * .75 - t2 * .25).toFixed(3);

    gGrid.style.opacity = (t1 * .9 * (1 - t3)).toFixed(3);
    dibujar(trazos.plano, t1 / .8, .4);
    gPlan.style.opacity = (1 - t2 * .55 - t3 * .45).toFixed(3);
    cotasEls.forEach((g, i) => { g.style.opacity = clamp((t1 - .45 - i * .12) * 4) * (1 - t3).toFixed(3); });

    dibujar(trazos.aristas, t2 / .85, .45);

    carasEls.forEach((c, i) => { c.style.opacity = clamp((t3 - i * .07) * 2.4).toFixed(3); });
    huecosEls.forEach((h, i) => { h.style.opacity = clamp((t3 - .4 - i * .06) * 3).toFixed(3); });

    const fase = Math.min(3, Math.floor(f + .0001));
    phases.forEach((ph, i) => {
      ph.classList.toggle("is-active", i === fase);
      ph.classList.toggle("is-done", i < fase);
      ph.style.setProperty("--fill", clamp(f - i).toFixed(3));
    });
    if (fase !== ultimo) { label.textContent = NOMBRES[fase]; ultimo = fase; }
  }

  if (reduce) { render(1); phases.forEach(ph => ph.classList.add("is-active")); return; }

  let raf = null;
  const update = () => {
    raf = null;
    const r = track.getBoundingClientRect();
    const total = track.offsetHeight - window.innerHeight;
    render(clamp(-r.top / (total * .9)));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
