const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const EASE = "cubic-bezier(.22,.61,.21,1)";

/* Transición entre páginas */

document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const href = a.getAttribute("href");
  if (a.target === "_blank" || !/\.html(#.*)?$/.test(href)) return;
  if (reduceMotion) return;
  e.preventDefault();
  document.body.classList.add("is-leaving");
  setTimeout(() => { window.location.href = href; }, 280);
});
window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));

/* Cabecera */

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
let lastY = window.scrollY;
let anclando = false;

function onHeaderScroll() {
  const y = window.scrollY;
  header.classList.toggle("is-solid", y > 40);
  const goingDown = y > lastY && y > 400;
  if (anclando) header.classList.add("is-hidden");
  else header.classList.toggle("is-hidden", goingDown && !nav.classList.contains("is-open"));
  lastY = y;
}
["wheel", "touchstart", "keydown", "pointerdown"].forEach(ev =>
  window.addEventListener(ev, () => { anclando = false; }, { passive: true })
);

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onHeaderScroll(); ticking = false; });
}, { passive: true });
onHeaderScroll();

/* Enlaces a partes de la página: la sección queda justo arriba, sin hueco */

function irA(destino, suave) {
  const el = document.querySelector(destino);
  if (!el) return;
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY);
  if (y > 0) {
    anclando = true;
    header.classList.add("is-hidden");
  }
  window.scrollTo({ top: y, behavior: suave && !reduceMotion ? "smooth" : "auto" });
}

document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
  const destino = a.getAttribute("href");
  if (destino.length < 2) return;
  if (!document.querySelector(destino)) return;
  e.preventDefault();
  if (nav.classList.contains("is-open")) setMenu(false);
  irA(destino, true);
  try { history.replaceState(null, "", destino); } catch (err) {}
});

if (location.hash.length > 1 && document.querySelector(location.hash) && !document.getElementById("projects")) {
  window.addEventListener("load", () => setTimeout(() => irA(location.hash, false), 60));
}

/* Menú móvil */

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
  document.body.style.overflow = open ? "hidden" : "";
}

menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false);
});

/* Apariciones que se deshacen al volver a subir */

let revealIo = null;
if (!reduceMotion && "IntersectionObserver" in window) {
  revealIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-in");
      else if (entry.boundingClientRect.top > 0) entry.target.classList.remove("is-in");
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".section__title:not(.page-title):not(.proceso .section__title)").forEach(el => {
    el.classList.add("reveal");
    revealIo.observe(el);
  });
  document.querySelectorAll(".person, .faq__item, .door, .panels, .tipos__list > li, .cta__data, .cta .btn, .form, .contact__data > div").forEach(el => {
    el.classList.add("fade");
    revealIo.observe(el);
  });
}
window.observeReveal = el => {
  if (!revealIo) return;
  el.classList.add("fade");
  revealIo.observe(el);
};

/* Animaciones ligadas al scroll: tres fotos, línea del tiempo y foto del estudio */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const vh = () => window.innerHeight;

const trio = document.getElementById("trio");
const trioFotos = trio ? [...trio.querySelectorAll("[data-speed]")] : [];

const timeline = document.getElementById("timeline");
const timelineWrap = timeline ? timeline.parentElement : null;
const trayectoria = document.getElementById("trayectoria");
const hitos = timeline ? [...timeline.children] : [];

const parallax = [...document.querySelectorAll(".estudio__img img")];

function scrollAnim() {
  if (trio) {
    const r = trio.getBoundingClientRect();
    const t = (vh() - r.top) / (vh() + r.height);
    trioFotos.forEach(f => {
      const v = Number(f.dataset.speed);
      f.style.transform = `translate3d(0, ${((.5 - t) * v * vh()).toFixed(1)}px, 0)`;
      f.querySelector("img").style.transform = `scale(${(1.12 - clamp(t * 1.4) * .12).toFixed(3)})`;
    });
  }

  if (timeline) {
    const r = timelineWrap.getBoundingClientRect();
    const t = clamp((vh() * .95 - r.top) / (vh() * .8));
    timelineWrap.style.setProperty("--t", t.toFixed(4));
    let ultimo = -1;
    hitos.forEach((h, i) => {
      const on = t >= i / (hitos.length - 1) - .001 && t > 0;
      h.classList.toggle("is-on", on);
      if (on) ultimo = i;
    });
    hitos.forEach((h, i) => h.classList.toggle("is-current", i === ultimo));
  }

  parallax.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    const t = clamp((vh() - r.top) / (vh() + r.height));
    img.style.transform = `scale(1.15) translate3d(0, ${((t - .5) * -10).toFixed(2)}%, 0)`;
  });
}

if (!reduceMotion) {
  let rafAnim = null;
  const pedir = () => { if (!rafAnim) rafAnim = requestAnimationFrame(() => { rafAnim = null; scrollAnim(); }); };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  scrollAnim();
} else {
  hitos.forEach(h => h.classList.add("is-on"));
  if (timelineWrap) timelineWrap.style.setProperty("--t", 1);
}

/* Desplegables con animación (leer más y preguntas) */

function desplegable(item, body, soloUno) {
  const summary = item.querySelector("summary");
  summary.addEventListener("click", e => {
    if (reduceMotion) return;
    e.preventDefault();
    if (item.open) {
      body.animate([{ height: body.scrollHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 380, easing: EASE })
        .onfinish = () => { item.open = false; };
    } else {
      if (soloUno) document.querySelectorAll(soloUno).forEach(o => { if (o !== item) o.open = false; });
      item.open = true;
      body.animate([{ height: "0px", opacity: 0 }, { height: body.scrollHeight + "px", opacity: 1 }], { duration: 460, easing: EASE });
    }
  });
}
document.querySelectorAll(".more").forEach(d => desplegable(d, d.querySelector(".more__body")));
document.querySelectorAll(".faq__item").forEach(d => desplegable(d, d.querySelector(".faq__body"), ".faq__item[open]"));

/* Paneles de proyectos: se abren al pasar el ratón y llevan a los proyectos de ese tipo */

const panels = [...document.querySelectorAll(".panel")];
function abrirPanel(p) {
  panels.forEach(o => o.classList.toggle("is-open", o === p));
}
panels.forEach(p => {
  if (finePointer) p.addEventListener("mouseenter", () => abrirPanel(p));
  p.addEventListener("focus", () => abrirPanel(p));
  p.addEventListener("click", e => {
    if (!finePointer && !p.classList.contains("is-open")) {
      e.preventDefault();
      e.stopPropagation();
      abrirPanel(p);
    }
  }, true);
  p.addEventListener("keydown", e => {
    const i = panels.indexOf(p);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); panels[(i + 1) % panels.length].focus(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); panels[(i - 1 + panels.length) % panels.length].focus(); }
  });
});

/* Menú: marca la parte de la página en la que estás */

const enlacesNav = [...nav.querySelectorAll('a[href^="#"]')];
const partes = enlacesNav.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
if (partes.length && "IntersectionObserver" in window) {
  const navIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      enlacesNav.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  partes.forEach(sec => navIo.observe(sec));
}

/* Formulario: abre el correo con el mensaje preparado */

const form = document.getElementById("contactForm");
if (form) {
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const errores = [];

    form.querySelectorAll(".has-error").forEach(el => el.classList.remove("has-error"));

    const marcar = (name, msg) => {
      form.elements[name].closest(".field, .check").classList.add("has-error");
      errores.push(msg);
    };

    if (!data.get("nombre").trim()) marcar("nombre", "Escribe tu nombre.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email").trim())) marcar("email", "Revisa el email, parece incompleto.");
    if (!data.get("mensaje").trim()) marcar("mensaje", "Cuéntanos algo sobre tu proyecto.");
    if (!data.get("privacidad")) marcar("privacidad", "Acepta la política de privacidad para continuar.");

    if (errores.length) {
      status.className = "form__status is-error";
      status.textContent = errores.join(" ");
      form.querySelector(".has-error input, .has-error textarea")?.focus();
      return;
    }

    const asunto = `Consulta web: ${data.get("tipo")}, ${data.get("nombre").trim()}`;
    const cuerpo = [
      data.get("mensaje").trim(),
      "",
      "---",
      `Nombre: ${data.get("nombre").trim()}`,
      `Email: ${data.get("email").trim()}`,
      `Teléfono: ${data.get("telefono").trim() || "no indicado"}`,
      `Tipo de proyecto: ${data.get("tipo")}`
    ].join("\n");

    window.location.href = `mailto:info@miradesign.es?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    status.className = "form__status is-ok";
    status.textContent = "Email preparado. Revísalo en tu programa de correo y pulsa enviar.";
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
