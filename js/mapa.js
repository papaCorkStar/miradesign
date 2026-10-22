(() => {
  const track = document.getElementById("mapTrack");
  const box = document.getElementById("map3d");
  if (!track || !box) return;

  const ESTUDIO = [-6.9535899828, 37.2539723986];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pasos = [...document.querySelectorAll("#zoomSteps li")];
  const coords = document.getElementById("mapCoords");
  const cta = document.querySelector(".ubicacion__cta");
  const fallback = document.getElementById("mapFallback");

  const CAMARAS = [
    { c: [-3.7, 40.1], z: 5.0, pitch: 0, bearing: 0 },
    { c: [-4.75, 37.45], z: 6.7, pitch: 18, bearing: -4 },
    { c: [-6.85, 37.55], z: 8.4, pitch: 30, bearing: -10 },
    { c: [-6.946, 37.262], z: 12.8, pitch: 46, bearing: -18 },
    { c: ESTUDIO, z: 17.4, pitch: 62, bearing: -32 }
  ];

  const C = {
    tierra: "#f2f1ed",
    agua: "#d6dee4",
    aguaTexto: "#6f8394",
    verde: "#e3e7dc",
    urbano: "#ebeae5",
    via: "#ffffff",
    viaBorde: "#d3d2cc",
    viaMayor: "#c4c3bd",
    limite: "#2a2a29",
    texto: "#2a2a29",
    textoSuave: "#7d7c77",
    edificio: "#fbfbf9",
    acento: "#2e4d6e"
  };

  const FONT = ["Noto Sans Regular"];
  const FONT_B = ["Noto Sans Bold"];

  const circulo = (centro, metros, n = 64) => {
    const [lng, lat] = centro;
    const dLat = metros / 111320, dLng = metros / (111320 * Math.cos(lat * Math.PI / 180));
    const ring = Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [lng + Math.cos(a) * dLng, lat + Math.sin(a) * dLat];
    });
    return { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] } };
  };

  const estilo = {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      omt: { type: "vector", url: "https://tiles.openfreemap.org/planet", attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
      estudio: { type: "geojson", data: { type: "FeatureCollection", features: [circulo(ESTUDIO, 45), circulo(ESTUDIO, 140)] } }
    },
    layers: [
      { id: "fondo", type: "background", paint: { "background-color": C.tierra } },
      { id: "verde", type: "fill", source: "omt", "source-layer": "landcover", filter: ["in", ["get", "class"], ["literal", ["wood", "grass", "farmland", "wetland"]]], paint: { "fill-color": C.verde, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, .35, 12, .8] } },
      { id: "urbano", type: "fill", source: "omt", "source-layer": "landuse", filter: ["in", ["get", "class"], ["literal", ["residential", "commercial", "industrial", "retail"]]], paint: { "fill-color": C.urbano, "fill-opacity": .9 } },
      { id: "parques", type: "fill", source: "omt", "source-layer": "park", paint: { "fill-color": C.verde } },
      { id: "agua", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": C.agua } },
      { id: "rios", type: "line", source: "omt", "source-layer": "waterway", minzoom: 8, paint: { "line-color": C.agua, "line-width": ["interpolate", ["linear"], ["zoom"], 8, .6, 14, 2] } },

      { id: "vias-borde", type: "line", source: "omt", "source-layer": "transportation", minzoom: 13, filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary", "secondary", "primary", "trunk"]]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": C.viaBorde, "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 13, 1.5, 18, 26] } },
      { id: "vias", type: "line", source: "omt", "source-layer": "transportation", minzoom: 13, filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary", "secondary", "primary", "trunk"]]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": C.via, "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 13, .8, 18, 22] } },
      { id: "vias-mayores", type: "line", source: "omt", "source-layer": "transportation", maxzoom: 13, filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]], paint: { "line-color": C.viaMayor, "line-width": ["interpolate", ["linear"], ["zoom"], 5, .4, 12, 1.6], "line-opacity": ["interpolate", ["linear"], ["zoom"], 5, .5, 9, 1] } },
      { id: "tren", type: "line", source: "omt", "source-layer": "transportation", minzoom: 11, filter: ["==", ["get", "class"], "rail"], paint: { "line-color": C.viaMayor, "line-width": 1, "line-dasharray": [3, 2] } },

      { id: "limite-prov", type: "line", source: "omt", "source-layer": "boundary", filter: ["all", ["==", ["get", "admin_level"], 6], ["==", ["get", "maritime"], 0]], paint: { "line-color": C.textoSuave, "line-width": .8, "line-dasharray": [1, 2.5], "line-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 7.5, .8, 12, .3] } },
      { id: "limite-region", type: "line", source: "omt", "source-layer": "boundary", filter: ["all", ["==", ["get", "admin_level"], 4], ["==", ["get", "maritime"], 0]], paint: { "line-color": C.textoSuave, "line-width": ["interpolate", ["linear"], ["zoom"], 4, .6, 9, 1.4], "line-dasharray": [4, 2], "line-opacity": ["interpolate", ["linear"], ["zoom"], 4, .6, 10, .9, 13, .2] } },
      { id: "limite-pais", type: "line", source: "omt", "source-layer": "boundary", filter: ["all", ["==", ["get", "admin_level"], 2], ["==", ["get", "maritime"], 0]], paint: { "line-color": C.limite, "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 10, 2] } },

      { id: "estudio-zona", type: "fill", source: "estudio", minzoom: 14, paint: { "fill-color": C.acento, "fill-opacity": .07 } },
      { id: "estudio-borde", type: "line", source: "estudio", minzoom: 14, paint: { "line-color": C.acento, "line-width": 1.2, "line-dasharray": [2, 2], "line-opacity": .8 } },

      { id: "edificios", type: "fill-extrusion", source: "omt", "source-layer": "building", minzoom: 14, paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, "#ffffff", 30, "#e4e3dd"],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.2, ["coalesce", ["get", "render_height"], 8]],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": .94,
        "fill-extrusion-vertical-gradient": true
      } },

      { id: "calles-nombre", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 15.5, layout: { "symbol-placement": "line", "text-field": ["get", "name"], "text-font": FONT, "text-size": 11 }, paint: { "text-color": C.textoSuave, "text-halo-color": C.tierra, "text-halo-width": 1.4 } },
      { id: "agua-nombre", type: "symbol", source: "omt", "source-layer": "water_name", layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": 13, "text-letter-spacing": .1 }, paint: { "text-color": C.aguaTexto, "text-halo-color": C.agua, "text-halo-width": 1 } },
      { id: "pueblos", type: "symbol", source: "omt", "source-layer": "place", minzoom: 8.5, maxzoom: 14.5, filter: ["in", ["get", "class"], ["literal", ["town", "village", "suburb", "neighbourhood"]]], layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10, 14, 13] }, paint: { "text-color": C.textoSuave, "text-halo-color": C.tierra, "text-halo-width": 1.4 } },
      { id: "ciudades", type: "symbol", source: "omt", "source-layer": "place", minzoom: 5.5, maxzoom: 15, filter: ["==", ["get", "class"], "city"], layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 12, 17] }, paint: { "text-color": C.texto, "text-halo-color": C.tierra, "text-halo-width": 1.6 } },
      { id: "regiones", type: "symbol", source: "omt", "source-layer": "place", minzoom: 5.2, maxzoom: 9, filter: ["in", ["get", "class"], ["literal", ["state", "province"]]], layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": 13, "text-letter-spacing": .15 }, paint: { "text-color": C.textoSuave, "text-halo-color": C.tierra, "text-halo-width": 1.4 } },
      { id: "paises", type: "symbol", source: "omt", "source-layer": "place", maxzoom: 7, filter: ["==", ["get", "class"], "country"], layout: { "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]], "text-font": FONT_B, "text-size": ["interpolate", ["linear"], ["zoom"], 4, 13, 7, 18], "text-letter-spacing": .2 }, paint: { "text-color": C.texto, "text-halo-color": C.tierra, "text-halo-width": 1.6 } }
    ]
  };

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function camara(p) {
    const tramos = CAMARAS.length - 1;
    const f = clamp(p / .88) * tramos;
    const i = Math.min(tramos - 1, Math.floor(f));
    const t = ease(clamp(f - i));
    const a = CAMARAS[i], b = CAMARAS[i + 1];
    const ajuste = Math.log2(Math.min(1, box.clientWidth / 1000)) * .9;
    const za = a.z + (i === 0 ? ajuste : ajuste * .5);
    const zb = b.z + (i + 1 === tramos ? 0 : ajuste * .5);
    const z = za + (zb - za) * t;
    const w = zb === za ? t : (1 - Math.pow(2, -(z - za))) / (1 - Math.pow(2, -(zb - za)));
    return {
      center: [a.c[0] + (b.c[0] - a.c[0]) * w, a.c[1] + (b.c[1] - a.c[1]) * w],
      zoom: z,
      pitch: a.pitch + (b.pitch - a.pitch) * t,
      bearing: a.bearing + (b.bearing - a.bearing) * t,
      paso: Math.min(tramos, Math.round(f))
    };
  }

  let map = null, pin = null, p = reduce ? 1 : 0;

  function crear() {
    if (map) return;
    const gl = document.createElement("canvas");
    if (!window.maplibregl || !(gl.getContext("webgl2") || gl.getContext("webgl"))) {
      fallback.hidden = false;
      return;
    }
    try {
      const cam = camara(p);
      map = new maplibregl.Map({
        container: box,
        style: estilo,
        center: cam.center,
        zoom: cam.zoom,
        pitch: cam.pitch,
        bearing: cam.bearing,
        interactive: false,
        attributionControl: { compact: true },
        maxPitch: 70,
        fadeDuration: 150
      });
    } catch (e) {
      fallback.hidden = false;
      return;
    }

    const nodo = document.createElement("div");
    nodo.className = "studio-pin";
    nodo.innerHTML = '<div class="studio-pin__inner"><span class="studio-pin__dot"></span><span class="studio-pin__label"><img src="img/logo.png" alt=""><br>c/ Luis de Vargas, 4, 2º D</span></div>';
    pin = new maplibregl.Marker({ element: nodo, anchor: "center" }).setLngLat(ESTUDIO).addTo(map);

    map.on("load", aplicar);
    map.on("error", e => console.warn("Mapa:", e?.error?.message || e));
    window.addEventListener("resize", () => { map.resize(); aplicar(); });
  }

  function progreso() {
    if (reduce) return 1;
    const r = track.getBoundingClientRect();
    const total = track.offsetHeight - window.innerHeight;
    return clamp(-r.top / total);
  }

  function aplicar() {
    p = progreso();
    const cam = camara(p);
    const ancho = box.clientWidth;
    if (map) map.jumpTo({ center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing, padding: { left: ancho > 820 ? 360 : 0, top: ancho > 820 ? 0 : Math.round(box.clientHeight * .2), right: 0, bottom: 0 } });

    pasos.forEach((li, i) => {
      li.classList.toggle("is-active", i === cam.paso);
      li.classList.toggle("is-done", i < cam.paso);
    });
    if (pin) pin.getElement().firstElementChild.classList.toggle("is-visible", cam.zoom > 15.5);
    cta.classList.toggle("is-ready", cam.paso === pasos.length - 1);

    const km = 156543.03 * Math.cos(cam.center[1] * Math.PI / 180) / Math.pow(2, cam.zoom) * ancho / 1000;
    const lat = cam.center[1].toFixed(4).replace(".", ",");
    const lng = Math.abs(cam.center[0]).toFixed(4).replace(".", ",");
    const vista = km >= 10 ? Math.round(km).toLocaleString("es-ES") + " km" : km >= 1 ? km.toFixed(1).replace(".", ",") + " km" : Math.round(km * 1000) + " m";
    coords.innerHTML = `${lat}° N, ${lng}° O<br>vista de ${vista}`;
  }

  let raf = null;
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = null; aplicar(); }); }, { passive: true });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { crear(); io.disconnect(); }
    }, { rootMargin: "150% 0px" });
    io.observe(track);
  } else {
    crear();
  }

  aplicar();
})();
