/* CYPK Soluções Digitais — comportamento compartilhado (home + portfólio) */
(function () {
  "use strict";

  /* ===== CONFIGURAÇÃO: troque aqui quando tiver os dados oficiais ===== */
  var CYPK = {
    whatsapp: "5592900000000",      // EXEMPLO — número fictício
    whatsappReal: false,            // mude para true quando o número for o oficial
    mensagem: "Olá! Vim pelo site da CYPK e quero saber mais sobre a landing page."
  };

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var raf = window.requestAnimationFrame.bind(window);

  /* ===== Aviso (toast) ===== */
  var aviso = document.createElement("div");
  aviso.className = "aviso"; aviso.setAttribute("role", "status"); aviso.setAttribute("aria-live", "polite");
  document.body.appendChild(aviso);
  var avisoTimer;
  function avisar(html) {
    aviso.innerHTML = html; aviso.classList.add("on");
    clearTimeout(avisoTimer); avisoTimer = setTimeout(function () { aviso.classList.remove("on"); }, 5200);
  }

  /* ===== WhatsApp ===== */
  document.querySelectorAll("[data-whats]").forEach(function (a) {
    var msg = a.getAttribute("data-whats") || CYPK.mensagem;
    a.href = "https://wa.me/" + CYPK.whatsapp + "?text=" + encodeURIComponent(msg);
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", function (e) {
      if (CYPK.whatsappReal) return;
      e.preventDefault();
      avisar("<b>Número de exemplo.</b> Quando a CYPK configurar o WhatsApp oficial, este botão abre a conversa direto com a mensagem pronta.");
    });
  });
  document.querySelectorAll("[data-exemplo]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); avisar(b.getAttribute("data-exemplo")); });
  });

  /* ===== Rolagem suave (Lenis) ===== */
  var lenis = null;
  if (!reduzido && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.2 });
    (function loop(t) { lenis.raf(t); raf(loop); })(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) { e.preventDefault(); lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      var alvo = document.querySelector(id);
      if (!alvo) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(alvo, { offset: -90 });
      else window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY - 90, behavior: reduzido ? "auto" : "smooth" });
    });
  });
  // chegou com #âncora vindo de outra página
  if (location.hash && document.querySelector(location.hash)) {
    window.addEventListener("load", function () {
      var alvo = document.querySelector(location.hash);
      if (lenis) lenis.scrollTo(alvo, { offset: -90, immediate: true });
      else window.scrollTo(0, alvo.getBoundingClientRect().top + window.scrollY - 90);
    });
  }

  /* ===== Duplicar trilhos (marquee infinito) ===== */
  document.querySelectorAll("[data-dup]").forEach(function (t) {
    Array.prototype.slice.call(t.children).forEach(function (c) {
      var k = c.cloneNode(true); k.setAttribute("aria-hidden", "true");
      k.querySelectorAll("a,button").forEach(function (x) { x.tabIndex = -1; });
      t.appendChild(k);
    });
  });

  /* ===== Contadores ===== */
  function contar(el) {
    if (el.dataset.feito) return; el.dataset.feito = "1";
    var fim = parseFloat(el.dataset.conta), casas = parseInt(el.dataset.casas || "0", 10);
    var pre = el.dataset.pre || "", suf = el.dataset.suf || "", dur = parseInt(el.dataset.dur || "2000", 10);
    var fmt = function (v) { return pre + v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + suf; };
    if (reduzido) { el.textContent = fmt(fim); return; }
    var t0 = performance.now();
    (function passo(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(fim * e);
      if (p < 1) raf(passo);
    })(t0);
  }

  /* ===== Revelações ao rolar ===== */
  var reveal = Array.prototype.slice.call(document.querySelectorAll("[data-r]"));
  reveal.forEach(function (el) { if (el.dataset.d) el.style.transitionDelay = el.dataset.d + "ms"; });
  var gatilhos = Array.prototype.slice.call(document.querySelectorAll("[data-ativa]"));
  var contadores = Array.prototype.slice.call(document.querySelectorAll("[data-conta]"));
  function checar() {
    var h = window.innerHeight;
    reveal.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var tipo = el.getAttribute("data-r");
      if (top < h * 0.88) el.classList.add("ativo");
      else if (tipo === "sobe" || tipo === "letras") el.classList.remove("ativo"); // volta a esconder, como no original
    });
    gatilhos.forEach(function (el) { if (el.getBoundingClientRect().top < h * 0.8) el.classList.add("ativo"); });
    contadores.forEach(function (el) { if (el.getBoundingClientRect().top < h * 0.92) contar(el); });
  }
  var agendado = false;
  function aoRolar() { if (!agendado) { agendado = true; raf(function () { agendado = false; checar(); notebook(); marcarMenu(); }); } }
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);

  /* ===== Menu: marca a seção visível ===== */
  var linksMenu = Array.prototype.slice.call(document.querySelectorAll('.menu ul a[href^="#"]'));
  function marcarMenu() {
    var at = null;
    linksMenu.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) at = a; });
    linksMenu.forEach(function (a) { a.classList.toggle("on", a === at); });
  }

  /* ===== Notebook: abre a tampa e inclina com a rolagem ===== */
  var nb = document.querySelector(".notebook");
  var cena = document.querySelector(".cena");
  if (nb) setTimeout(function () { nb.classList.add("aberto"); }, reduzido ? 0 : 700);
  function notebook() {
    if (!nb || reduzido) return;
    var r = cena.getBoundingClientRect(), h = window.innerHeight;
    var p = Math.max(0, Math.min(1, (h * 0.55 - r.top) / (r.height + h * 0.2)));
    nb.style.setProperty("--tilt", (p * 16).toFixed(2) + "deg");
    nb.style.setProperty("--zoom", (1 - p * 0.06).toFixed(3));
  }

  /* ===== Luz que segue o mouse nos cartões ===== */
  document.querySelectorAll(".cartoes").forEach(function (g) {
    g.addEventListener("pointermove", function (e) {
      g.querySelectorAll(".cartao").forEach(function (c) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  });

  /* ===== FAQ (acordeão) ===== */
  document.querySelectorAll(".pergunta button").forEach(function (b) {
    b.addEventListener("click", function () {
      var item = b.parentElement, aberta = item.classList.contains("aberta");
      item.classList.toggle("aberta", !aberta);
      b.setAttribute("aria-expanded", String(!aberta));
    });
  });

  /* ===== Campo de pontos com pulso de luz (atrás do título) ===== */
  var wrap = document.getElementById("pulso");
  if (wrap && !reduzido) {
    var cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, pts = [], ini, fim;
    var CORES = [[54, 227, 246], [76, 123, 255], [143, 69, 255], [255, 255, 255]];
    var semente = 7;
    function rnd() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }
    function suave(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    function montar() {
      var r = wrap.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semente = 7; pts = [];
      var meia = W * 0.3, passo = W < 600 ? 22 : 28;
      // nuvens de pontos densas no centro de cada lado, ralas nas bordas
      var centros = [];
      for (var i = 0; i < 4; i++) centros.push({ x: meia * (0.35 + rnd() * 0.4), y: H * (0.3 + rnd() * 0.45), r: meia * (0.18 + rnd() * 0.16) });
      for (var y = passo / 2; y < H; y += passo) for (var x = passo / 2; x < meia; x += passo) {
        var jx = x + (rnd() - 0.5) * passo * 0.7, jy = y + (rnd() - 0.5) * passo * 0.7, f = 0;
        centros.forEach(function (c) { var dx = jx - c.x, dy = jy - c.y; f += Math.exp(-(dx * dx + dy * dy) / (2 * c.r * c.r)); });
        var prob = suave(0.15, 0.7, f) * 0.9; if (prob < 0.1 && f > 0.04) prob = 0.05;
        if (rnd() < prob) {
          var p = { x: jx, y: jy, q: rnd() < 0.35, g: rnd(), f: rnd() * 6.28, cor: CORES[Math.floor(rnd() * CORES.length)] };
          pts.push(p, { x: W - jx, y: jy, q: p.q, g: p.g, f: p.f + 1, cor: p.cor });
        }
      }
      pts.forEach(function (p) { p.pr = p.x * 0.98 + p.y * 0.18; });
      ini = -150; fim = W + H * 0.18 + 260;
    }
    function quadro(t) {
      ctx.clearRect(0, 0, W, H);
      var ciclo = t % 6200, ativo = ciclo < 4600, onda = ini + (fim - ini) * (ciclo / 4600);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        ctx.fillStyle = p.q ? "rgb(30,30,42)" : "rgba(140,140,170,.07)";
        if (p.q) ctx.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8); else { ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, 6.283); ctx.fill(); }
        var banda = 0;
        if (ativo) { var d = p.pr - onda, s = d <= 0 ? 140 : 100; banda = Math.exp(-(d * d) / (2 * s * s)); }
        var lim = p.g * 1.3, vis = suave(lim, lim + 0.22, banda);
        var cint = 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.004 + p.f));
        var amb = 0.05 * (0.5 + 0.5 * Math.sin(t * 0.0016 + p.f * 1.7)) * p.g;
        var a = (vis * cint + amb) * 0.75;
        if (a < 0.015) continue;
        ctx.fillStyle = "rgba(" + p.cor[0] + "," + p.cor[1] + "," + p.cor[2] + "," + Math.min(0.95, a) + ")";
        if (p.q) ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); else { ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * (1 + 0.4 * a), 0, 6.283); ctx.fill(); }
      }
      raf(quadro);
    }
    montar(); raf(quadro);
    if (window.ResizeObserver) new ResizeObserver(montar).observe(wrap);
  }

  checar(); notebook(); marcarMenu();
  window.addEventListener("load", checar);
})();
