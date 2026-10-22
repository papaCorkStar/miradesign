(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const img = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

  const PROYECTOS = [
    {
      nombre: "Casa de los postigos azules",
      tipo: "rehabilitacion",
      tipoTexto: "Rehabilitación",
      lugar: "Huelva",
      año: 2023,
      foto: "1713121577029-bf271baec1c5",
      alt: "Fachada antigua de piedra con ventanas de postigos azules",
      desc: "Recuperación de una vivienda tradicional conservando sus muros de carga y carpinterías originales, con una nueva distribución interior más luminosa.",
      superficie: "140 m²"
    },
    {
      nombre: "Cocina abierta en Isla Chica",
      tipo: "interiorismo",
      tipoTexto: "Interiorismo",
      lugar: "Huelva",
      año: 2024,
      foto: "1502005097973-6a7082348e28",
      alt: "Cocina blanca con isla de madera y puerta de cristal al patio",
      desc: "Unión de cocina y comedor en un solo espacio, con una isla central de madera y salida directa al patio.",
      superficie: "32 m²"
    },
    {
      nombre: "Casa entre medianeras",
      tipo: "obra-nueva",
      tipoTexto: "Obra nueva",
      lugar: "Aljaraque",
      año: 2022,
      foto: "1622396481322-3b83d186701b",
      alt: "Volumen blanco de hormigón recortado contra el cielo",
      desc: "Vivienda unifamiliar en una parcela estrecha que se abre a un patio interior para ganar luz y ventilación cruzada.",
      superficie: "210 m²"
    },
    {
      nombre: "Salón junto a la ría",
      tipo: "interiorismo",
      tipoTexto: "Interiorismo",
      lugar: "Punta Umbría",
      año: 2024,
      foto: "1583847268964-b28dc8f51f92",
      alt: "Salón luminoso en tonos claros con sofá blanco y mesas de madera",
      desc: "Interiorismo de una vivienda de vacaciones: materiales claros, fibras naturales y mobiliario a medida.",
      superficie: "85 m²"
    },
    {
      nombre: "Casa de piedra en la sierra",
      tipo: "rehabilitacion",
      tipoTexto: "Rehabilitación",
      lugar: "Aracena",
      año: 2021,
      foto: "1622473635194-f928d7b02a72",
      alt: "Edificio de piedra con ventanas y puerta azules",
      desc: "Rehabilitación integral de una casa de piedra, reforzando la estructura y adaptándola a los estándares actuales de confort.",
      superficie: "180 m²"
    },
    {
      nombre: "Piso en el Ensanche",
      tipo: "interiorismo",
      tipoTexto: "Interiorismo",
      lugar: "Huelva",
      año: 2023,
      foto: "1609081144289-eacc3108cd03",
      alt: "Salón con sofá blanco, sillón de madera y suelo de tarima",
      desc: "Reforma de un piso de los años setenta: se eliminan pasillos y se ordenan las estancias alrededor de la luz.",
      superficie: "95 m²"
    },
    {
      nombre: "Volúmenes blancos",
      tipo: "obra-nueva",
      tipoTexto: "Obra nueva",
      lugar: "Cartaya",
      año: 2020,
      foto: "1534094830444-3a1e21f7e3e7",
      alt: "Encuentro entre un muro blanco y un paño de madera",
      desc: "Vivienda de una planta compuesta por volúmenes encalados y detalles de madera, pensada para el clima de la costa.",
      superficie: "160 m²"
    },
    {
      nombre: "Escalera de luz",
      tipo: "rehabilitacion",
      tipoTexto: "Rehabilitación",
      lugar: "Moguer",
      año: 2022,
      foto: "1601993957728-1e56ab70c5a8",
      alt: "Escalera blanca de líneas sencillas iluminada con luz natural",
      desc: "Nueva escalera y patio de luces en una casa de dos plantas, que lleva la luz natural hasta la planta baja.",
      superficie: "120 m²"
    }
  ];

  /* Número de proyectos por tipo (inicio) */

  document.querySelectorAll("[data-count]").forEach(el => {
    const n = PROYECTOS.filter(p => p.tipo === el.dataset.count).length;
    el.textContent = n === 1 ? "1 proyecto" : `${n} proyectos`;
  });

  /* Proyectos que se deslizan a izquierda y derecha, con puntitos */

  const list = document.getElementById("projects");
  const dots = document.getElementById("dots");
  const contador = document.getElementById("sliderCount");
  const estado = { visibles: [] };
  let actual = 0;

  const slides = () => [...list.children];

  function marcar(i) {
    actual = i;
    slides().forEach((el, n) => {
      el.classList.toggle("is-active", n === i);
      el.setAttribute("aria-hidden", String(n !== i));
      el.querySelector(".slide__btn").tabIndex = n === i ? 0 : -1;
    });
    [...dots.children].forEach((d, n) => {
      d.classList.toggle("is-active", n === i);
      d.classList.toggle("is-near", Math.abs(n - i) === 1);
      d.setAttribute("aria-current", n === i ? "true" : "false");
    });
    contador.textContent = `${i + 1} / ${estado.visibles.length}`;
  }

  function centroDe(el) {
    return el.offsetLeft + el.offsetWidth / 2 - list.clientWidth / 2;
  }

  function ir(i, suave = true) {
    const el = slides()[i];
    if (!el) return;
    list.scrollTo({ left: centroDe(el), behavior: suave && !reduce ? "smooth" : "auto" });
    marcar(i);
  }

  function masCercano() {
    const centro = list.scrollLeft;
    let mejor = 0, dist = Infinity;
    slides().forEach((el, n) => {
      const d = Math.abs(centroDe(el) - centro);
      if (d < dist) { dist = d; mejor = n; }
    });
    return mejor;
  }

  function pintar() {
    list.innerHTML = estado.visibles.map(i => {
      const p = PROYECTOS[i];
      return `
        <li class="slide" data-index="${i}">
          <button class="slide__btn" type="button" aria-haspopup="dialog">
            <figure class="slide__img photo">
              <img src="${img(p.foto, 1600)}" alt="${p.alt}" loading="lazy" draggable="false">
              <span class="photo-tag">imagen de ejemplo</span>
            </figure>
            <span class="slide__info">
              <span class="slide__name">${p.nombre}</span>
              <span class="slide__meta">${p.tipoTexto}, ${p.lugar}, ${p.año}</span>
              <span class="slide__go">Ver ficha</span>
            </span>
          </button>
        </li>`;
    }).join("");

    dots.innerHTML = estado.visibles.map((i, n) =>
      `<button class="dot" type="button" aria-label="Proyecto ${n + 1}: ${PROYECTOS[i].nombre}"></button>`
    ).join("");
    [...dots.children].forEach((d, n) => d.addEventListener("click", () => ir(n)));

    slides().forEach((el, n) => {
      el.querySelector(".slide__btn").addEventListener("click", () => {
        if (arrastrado) return;
        if (n === actual) abrir(Number(el.dataset.index), estado);
        else ir(n);
      });
    });

    list.scrollLeft = 0;
    requestAnimationFrame(() => ir(0, false));
  }

  function filtrar(f, animar) {
    if (!document.querySelector(`.filter[data-filter="${f}"]`)) f = "todos";
    document.querySelectorAll(".filter").forEach(b => {
      const on = b.dataset.filter === f;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    estado.visibles = PROYECTOS.map((p, i) => (f === "todos" || p.tipo === f ? i : -1)).filter(i => i >= 0);
    if (!animar || reduce) { pintar(); return; }
    list.classList.add("is-changing");
    setTimeout(() => {
      pintar();
      requestAnimationFrame(() => list.classList.remove("is-changing"));
    }, 320);
  }

  let arrastrado = false;

  if (list) {
    let raf = null;
    list.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const n = masCercano();
        if (n !== actual) marcar(n);
      });
    }, { passive: true });

    list.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(Math.min(actual + 1, estado.visibles.length - 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(Math.max(actual - 1, 0)); }
    });

    let abajo = false, x0 = 0, left0 = 0;
    list.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      abajo = true; arrastrado = false; x0 = e.clientX; left0 = list.scrollLeft;
      list.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", e => {
      if (!abajo) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 6) arrastrado = true;
      list.scrollLeft = left0 - dx;
    });
    window.addEventListener("pointerup", e => {
      if (!abajo) return;
      abajo = false;
      list.classList.remove("is-dragging");
      if (arrastrado) {
        const dx = e.clientX - x0;
        let n = masCercano();
        if (n === actual && Math.abs(dx) > 60) n = dx < 0 ? actual + 1 : actual - 1;
        ir(Math.max(0, Math.min(n, estado.visibles.length - 1)));
        setTimeout(() => { arrastrado = false; }, 50);
      }
    });

    window.addEventListener("resize", () => ir(actual, false));

    filtrar(decodeURIComponent(location.hash.slice(1)) || "todos", false);

    document.querySelectorAll(".filter").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-active")) return;
        const f = btn.dataset.filter;
        try { history.replaceState(null, "", f === "todos" ? location.pathname : "#" + f); } catch (e) {}
        filtrar(f, true);
      });
    });
    window.addEventListener("hashchange", () => filtrar(location.hash.slice(1) || "todos", true));
  }

  /* Ficha de proyecto */

  const modal = document.getElementById("modal");
  if (!modal) return;
  const $ = id => document.getElementById(id);
  let lista = [], pos = 0, lastFocus = null;

  function rellenar() {
    const p = PROYECTOS[lista[pos]];
    $("modalImg").src = img(p.foto, 1400);
    $("modalImg").alt = p.alt;
    $("modalMeta").textContent = `${p.tipoTexto}, ${p.lugar}`;
    $("modalTitle").textContent = p.nombre;
    $("modalDesc").textContent = p.desc;
    $("modalData").innerHTML = `
      <div><dt>Ubicación</dt><dd>${p.lugar}</dd></div>
      <div><dt>Año</dt><dd>${p.año}</dd></div>
      <div><dt>Superficie</dt><dd>${p.superficie}</dd></div>`;
    const solo = lista.length < 2;
    $("modalPrev").hidden = solo;
    $("modalNext").hidden = solo;
  }

  function abrir(index, estado) {
    lastFocus = document.activeElement;
    lista = estado.visibles;
    pos = Math.max(0, lista.indexOf(index));
    rellenar();
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }

  const mover = d => { pos = (pos + d + lista.length) % lista.length; rellenar(); };

  modal.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  });
  $("modalClose").addEventListener("click", () => modal.close());
  $("modalPrev").addEventListener("click", () => mover(-1));
  $("modalNext").addEventListener("click", () => mover(1));
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
  modal.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") mover(1);
    if (e.key === "ArrowLeft") mover(-1);
  });
})();
