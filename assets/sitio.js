/* Asociación de Básquetbol Punta Arenas (ABPA) — sitio web
 * El contenido se lee desde el sistema de la asociación (Google Apps Script).
 * Si el sistema no responde, se usa assets/contenido-base.json. */
(function () {
  'use strict';

  var CFG = window.ABPA_CONFIG || {};
  var API = /^https:\/\/script\.google(usercontent)?\.com\//.test(CFG.API_URL || '') || /^http:\/\/localhost/.test(CFG.API_URL || '') ? CFG.API_URL : '';
  var PANEL = CFG.PANEL_URL || 'panel/';
  var PAGINA = document.body.getAttribute('data-pagina') || 'inicio';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_C = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var ORG = 'Asociación de Básquetbol Punta Arenas';
  var SIGLA = 'ABPA';
  var CORREO_SITIO = CFG.CORREO || '';

  // ───────────── Utilidades ─────────────
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fecha(f) { var p = String(f || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  function fechaLarga(f) { var d = fecha(f); return d ? d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear() : ''; }
  function fechaCorta(f) { var d = fecha(f); return d ? DIAS_C[d.getDay()] + ' ' + d.getDate() + ' ' + MES_C[d.getMonth()] : ''; }
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function url(u) { u = String(u || '').trim(); if (/^@/.test(u)) u = 'https://instagram.com/' + u.slice(1); return /^https?:\/\//i.test(u) ? esc(u) : '#'; }
  function img(id, w) { return id ? 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (w || 1200) : ''; }
  function lineas(t) { return String(t || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function enlazar(t) { return t.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function parrafos(t) { return String(t || '').split(/\n\s*\n/).map(function (p) { return p.trim() ? '<p>' + enlazar(esc(p.trim())).replace(/\n/g, '<br>') + '</p>' : ''; }).join(''); }
  function iniciales(n) { var p = String(n || '').trim().split(/\s+/); return ((p[0] || '')[0] || '') + ((p.length > 2 ? p[p.length - 2] : p[1] || '')[0] || ''); }
  function capital(t) { return String(t || '').toLowerCase().replace(/(^|\s)\S/g, function (x) { return x.toUpperCase(); }); }
  function param(n) { var m = new RegExp('[?&]' + n + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
  function leerLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function guardarLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  // ───────────── Íconos ─────────────
  var I = {
    cal: '<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    balon: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5v19M5.3 5.3c3 2.8 3 10.6 0 13.4M18.7 5.3c-3 2.8-3 10.6 0 13.4"/>',
    trofeo: '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    tabla: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11"/>',
    escudo: '<path d="M12 3l8 3v6c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V6z"/>',
    correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    tel: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    bajar: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    candado: '<rect x="4" y="10" width="18" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>'
  };
  var MARCAS = {
    wa: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/>',
    fb: '<path fill="currentColor" d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/>',
    yt: '<path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/>'
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }
  function marca(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + MARCAS[n] + '</svg>'; }

  // ───────────── Datos auxiliares ─────────────
  var CLUBES = {}, CATS = {};
  function indexar(d) {
    CLUBES = {}; CATS = {};
    (d.clubes || []).concat(d.clubesOtros || []).forEach(function (c) { CLUBES[c.id] = c; });
    (d.categorias || []).forEach(function (c) { CATS[c.id] = c; });
  }
  function club(id) { return CLUBES[id] || { id: id, nombre: 'Por definir', sigla: '?' }; }
  function escudo(c, w) {
    return '<span class="escudo">' + (c.logo ? '<img src="' + img(c.logo, w || 160) + '" alt="" loading="lazy">' : esc(String(c.sigla || iniciales(c.nombre) || '?').slice(0, 4))) + '</span>';
  }

  // ───────────── Cabecera y pie ─────────────
  var NAV = [['inicio', 'index.html', 'Inicio'], ['fixture', 'fixture.html', 'Fixture'], ['posiciones', 'posiciones.html', 'Posiciones'], ['clubes', 'clubes.html', 'Clubes'],
    ['noticias', 'noticias.html', 'Noticias'], ['galeria', 'galeria.html', 'Galería'], ['documentos', 'documentos.html', 'Documentos'], ['nosotros', 'nosotros.html', 'Nosotros'], ['contacto', 'contacto.html', 'Contacto']];
  function cabecera() {
    var activo = { noticia: 'noticias', club: 'clubes' }[PAGINA] || PAGINA;
    $('#cab').outerHTML = '<a class="saltar" href="#contenido">Saltar al contenido</a><header class="cab" id="cab"><div class="contenedor cab-in">' +
      '<a class="marca" href="index.html"><img src="assets/img/logo-96.png" alt="" width="50" height="50"><div><b>' + SIGLA + '</b><span>Asociación de Básquetbol<br>Punta Arenas</span></div></a>' +
      '<button class="menu-btn" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>' +
      '<nav class="menu" id="menu" aria-label="Principal">' + NAV.map(function (n) { return '<a href="' + n[1] + '"' + (n[0] === activo ? ' class="activo" aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') + '</nav></div></header>';
    var btn = $('.menu-btn'), menu = $('#menu');
    btn.onclick = function () { var ab = menu.classList.toggle('abierto'); btn.setAttribute('aria-expanded', ab); };
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('abierto'); btn.setAttribute('aria-expanded', 'false'); }); });
    var cab = $('#cab');
    var alScroll = function () { cab.classList.toggle('scroll', window.scrollY > 8); };
    window.addEventListener('scroll', alScroll, { passive: true }); alScroll();
  }
  function redes(t) {
    return (t.FACEBOOK_URL ? '<a href="' + url(t.FACEBOOK_URL) + '" target="_blank" rel="noopener" aria-label="Facebook">' + marca('fb') + '</a>' : '') +
      (t.INSTAGRAM_URL ? '<a href="' + url(t.INSTAGRAM_URL) + '" target="_blank" rel="noopener" aria-label="Instagram">' + marca('ig') + '</a>' : '') +
      (t.YOUTUBE_URL ? '<a href="' + url(t.YOUTUBE_URL) + '" target="_blank" rel="noopener" aria-label="YouTube">' + marca('yt') + '</a>' : '') +
      (t.CONTACTO_WHATSAPP ? '<a href="https://wa.me/' + esc(t.CONTACTO_WHATSAPP) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + marca('wa') + '</a>' : '');
  }
  function pie(d) {
    var t = d.textos || {}, r = redes(t), correo = t.CONTACTO_CORREO || d.correo || CORREO_SITIO;
    $$('.wa-flotante').forEach(function (x) { x.remove(); });
    $('#pie').outerHTML = '<footer class="pie" id="pie"><div class="contenedor"><div class="pie-in">' +
      '<div><a class="marca" href="index.html"><img src="assets/img/logo-96.png" alt="" width="50" height="50" loading="lazy"><div><b>' + SIGLA + '</b><span>Asociación de Básquetbol Punta Arenas</span></div></a>' +
      '<p style="margin-top:14px;font-size:.94rem;max-width:320px">Competencias oficiales de básquetbol en Punta Arenas, Región de Magallanes y de la Antártica Chilena.</p>' + (r ? '<div class="redes">' + r + '</div>' : '') + '</div>' +
      '<div><h2 class="pie-tit">Competencias</h2><ul><li><a href="fixture.html">Fixture y resultados</a></li><li><a href="posiciones.html">Tabla de posiciones</a></li><li><a href="clubes.html">Clubes</a></li></ul></div>' +
      '<div><h2 class="pie-tit">Asociación</h2><ul><li><a href="nosotros.html">Quiénes somos</a></li><li><a href="noticias.html">Noticias</a></li><li><a href="galeria.html">Galería</a></li><li><a href="documentos.html">Documentos oficiales</a></li>' +
      (PANEL ? '<li><a href="' + esc(PANEL) + '" rel="nofollow">Ingreso dirigentes</a></li>' : '') + '<li><a href="turno/" rel="nofollow">Informe de turno</a></li>' + '</ul></div>' +
      '<div><h2 class="pie-tit">Contacto</h2><ul>' + (correo ? '<li><a href="mailto:' + esc(correo) + '">' + esc(correo) + '</a></li>' : '') + (t.CONTACTO_TELEFONO ? '<li><a href="tel:' + esc(t.CONTACTO_TELEFONO.replace(/\s/g, '')) + '">' + esc(t.CONTACTO_TELEFONO) + '</a></li>' : '') +
      '<li>' + esc(t.CONTACTO_DIRECCION || 'Punta Arenas, Magallanes') + '</li><li><a href="contacto.html">Escríbenos</a></li></ul></div></div>' +
      '<div class="pie-base"><span>© ' + new Date().getFullYear() + ' ' + esc(d.org || ORG) + '. Todos los derechos reservados.</span><span><a href="privacidad.html">Política de privacidad</a> · Punta Arenas · Magallanes · Chile</span></div></div></footer>' +
      (t.CONTACTO_WHATSAPP ? '<a class="wa-flotante" href="https://wa.me/' + esc(t.CONTACTO_WHATSAPP) + '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + marca('wa').replace('class="ico"', '') + '</a>' : '');
  }

  // ───────────── Conexión ─────────────
  function jsonp(u) {
    return new Promise(function (ok, ko) {
      var cb = 'abpa_cb_' + Date.now() + Math.floor(Math.random() * 1000);
      var s = document.createElement('script');
      var t = setTimeout(function () { limpiar(); ko(new Error('Tiempo de espera agotado')); }, 10000);
      function limpiar() { clearTimeout(t); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); }
      window[cb] = function (r) { limpiar(); ok(r); };
      s.onerror = function () { limpiar(); ko(new Error('No se pudo conectar')); };
      s.src = u + (u.indexOf('?') < 0 ? '?' : '&') + 'callback=' + cb;
      document.head.appendChild(s);
    });
  }
  function getApi(q, intento) {
    intento = intento || 1;
    var u = API + '?' + q;
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;
    return fetch(u, { redirect: 'follow', signal: ctrl ? ctrl.signal : undefined }).then(function (r) { clearTimeout(reloj); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () { return jsonp(u); })
      .catch(function () {
        if (intento < 3) return new Promise(function (res) { setTimeout(res, 800 * intento); }).then(function () { return getApi(q, intento + 1); });
        throw new Error('No pudimos conectar con el sistema. Intenta nuevamente en unos segundos.');
      })
      .then(function (r) { if (!r || !r.ok) throw new Error((r && r.error) || 'Error del servidor'); return r.data; });
  }
  function base() { return fetch('assets/contenido-base.json').then(function (r) { return r.json(); }); }
  function cargar(alActualizar) {
    var cache = leerLS('abpa_sitio');
    var fresco = API ? getApi('api=sitio') : base();
    fresco = fresco.catch(function () { return cache ? cache.d : base(); });
    if (cache && cache.d && Date.now() - cache.t < 7 * 864e5) {
      fresco.then(function (d) {
        guardarLS('abpa_sitio', { t: Date.now(), d: d });
        if (JSON.stringify(d) !== JSON.stringify(cache.d)) alActualizar(d);
      });
      return Promise.resolve(cache.d);
    }
    // Primera visita: se muestra al instante la copia publicada y se actualiza apenas responde el sistema
    var listo = false;
    fresco = fresco.then(function (d) { guardarLS('abpa_sitio', { t: Date.now(), d: d }); if (listo) alActualizar(d); return d; });
    var copia = base().then(function (b) { b.hoy = hoyISO(); return b; });
    return Promise.race([fresco, copia.then(function (b) { return new Promise(function (res) { setTimeout(function () { res(b); }, 250); }); })])
      .then(function (d) { listo = true; return d; })
      .catch(function () { listo = true; return fresco; });
  }
  function enviar(datos) {
    if (!API) return Promise.reject(new Error('El formulario todavía no está conectado al sistema.' + (CORREO_SITIO ? ' Escríbenos a ' + CORREO_SITIO + '.' : '')));
    return fetch(API, { method: 'POST', body: JSON.stringify(datos), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (!r.ok) throw new Error(r.error || 'No se pudo enviar.'); return r.mensaje; });
  }

  // ───────────── Componentes ─────────────
  function imagen(id, w, alt) {
    return id ? '<img src="' + img(id, w) + '" alt="' + esc(alt || '') + '" loading="lazy" onerror="this.onerror=null;this.src=\'https://drive.google.com/thumbnail?id=' + esc(id) + '&sz=w' + (w || 1200) + '\'">'
      : '<div class="ph"><img src="assets/img/logo-400.png" alt=""></div>';
  }
  function tarjetaNoticia(n) {
    return '<a class="tarjeta aparece" href="noticia.html?id=' + n.id + '"><div class="img">' + imagen(n.foto, 800, n.titulo) + '</div><div class="cuerpo">' +
      '<div class="meta">' + (n.area ? '<span class="etiqueta ' + esc(n.area) + '">' + esc(n.area) + '</span>' : '') + '<span>' + fechaLarga(n.fecha) + '</span></div>' +
      '<h3>' + esc(n.titulo) + '</h3><p>' + esc(n.resumen || String(n.contenido || '').slice(0, 160) + '…') + '</p></div></a>';
  }
  function tarjetaEvento(e, pasado) {
    var d = fecha(e.fecha);
    return '<article class="evento aparece' + (pasado ? ' pasado' : '') + '"><div class="fecha-caja" aria-hidden="true"><span class="d">' + d.getDate() + '</span><span class="m">' + MES_C[d.getMonth()] + '</span><span class="a">' + d.getFullYear() + '</span></div>' +
      '<div style="flex:1;min-width:0"><div class="meta">' + (e.area ? '<span class="etiqueta ' + esc(e.area) + '">' + esc(e.area) + '</span>' : '') + (e.estado && e.estado !== 'Programado' ? '<span class="etiqueta ' + esc(e.estado) + '">' + esc(e.estado) + '</span>' : '') + '</div>' +
      '<h3>' + esc(e.titulo) + '</h3><div class="meta"><span>' + ico('cal') + capital(DIAS[d.getDay()]) + ' ' + fechaLarga(e.fecha) + '</span>' + (e.hora ? '<span>' + ico('reloj') + esc(e.hora) + ' h</span>' : '') + (e.lugar ? '<span>' + ico('pin') + esc(e.lugar) + '</span>' : '') + '</div>' +
      (e.descripcion ? '<p>' + esc(e.descripcion) + '</p>' : '') + (e.resultado ? '<div class="resultado">' + ico('trofeo') + ' ' + esc(e.resultado) + '</div>' : '') +
      (e.foto ? '<a class="evento-img" href="' + img(e.foto, 1600) + '" target="_blank" rel="noopener"><img src="' + img(e.foto, 700) + '" alt="' + esc(e.titulo) + '" loading="lazy"></a>' : '') + '</div></article>';
  }
  function jugado(p) { return p.pl != null && p.pv != null; }
  function tarjetaPartido(p, hoy, opc) {
    opc = opc || {};
    var L = club(p.l), V = club(p.v), j = jugado(p), wo = /^W\.O/.test(p.estado);
    var gL = j && p.pl > p.pv, gV = j && p.pv > p.pl;
    var eq = function (c, lado, gana) {
      var ref = CLUBES[c.id] ? 'club.html?id=' + c.id : null;
      return '<' + (ref ? 'a href="' + ref + '"' : 'div') + ' class="equipo ' + lado + (j ? (gana ? ' gana' : ' pierde') : '') + '">' + escudo(c) + '<span class="n">' + esc(c.nombre) + '</span></' + (ref ? 'a' : 'div') + '>';
    };
    var marc = j ? '<div class="marcador' + (wo ? ' wo' : '') + '" aria-label="Resultado ' + p.pl + ' a ' + p.pv + '"><span class="' + (gL ? 'g' : '') + '">' + p.pl + '</span><span style="opacity:.5">–</span><span class="' + (gV ? 'g' : '') + '">' + p.pv + '</span></div>'
      : '<div class="marcador vs">' + (p.estado === 'Programado' ? (p.hora ? esc(p.hora) : 'vs') : esc(p.estado)) + '</div>';
    var c = CATS[p.cat] || {};
    return '<article class="partido aparece' + (p.fecha === hoy && !j ? ' hoy' : '') + '"><div class="cuando"><b>' + (p.fecha === hoy ? 'Hoy' : fechaCorta(p.fecha)) + '</b><span>' + (p.hora ? esc(p.hora) + ' h' : 'Hora por confirmar') + '</span></div>' +
      '<div class="duelo">' + eq(L, 'local', gL) + marc + eq(V, 'visita', gV) + '</div>' +
      '<div class="donde">' + (opc.cat ? '<span class="etiqueta">' + esc(c.nombre || '') + '</span><br>' : '') + (p.fase ? esc(p.fase) + '<br>' : '') + (p.recinto ? ico('pin') + ' ' + esc(p.recinto) : '') +
      (wo ? '<br><b>' + esc(p.estado) + '</b>' : (p.estado !== 'Programado' && p.estado !== 'Finalizado' ? '<br><span class="etiqueta ' + esc(p.estado) + '">' + esc(p.estado) + '</span>' : '')) +
      (p.obs ? '<br><i>' + esc(p.obs) + '</i>' : '') + '</div></article>';
  }
  function tablaHTML(c, limite) {
    var filas = (c.tabla || []).slice(0, limite || 99);
    if (!filas.length) return vacio('La tabla aparecerá cuando se jueguen los primeros partidos.');
    return '<div class="tabla-wrap"><table class="tabla-pos"><thead><tr><th>#</th><th>Club</th><th title="Partidos jugados">PJ</th><th title="Ganados">PG</th><th title="Perdidos">PP</th>' +
      '<th class="oc-m" title="Puntos a favor">PF</th><th class="oc-m" title="Puntos en contra">PC</th><th title="Diferencia">DIF</th><th title="Puntos">PTS</th>' + (limite ? '' : '<th class="oc-m">Últimos</th>') + '</tr></thead><tbody>' +
      filas.map(function (r) {
        var cl = club(r.id);
        return '<tr><td class="pos">' + r.pos + '</td><td><a class="club-c" href="club.html?id=' + r.id + '">' + escudo(cl, 80) + '<span class="n">' + esc(cl.nombre) + '</span></a></td><td>' + r.pj + '</td><td>' + r.pg + '</td><td>' + r.pp + '</td>' +
          '<td class="oc-m">' + r.pf + '</td><td class="oc-m">' + r.pc + '</td><td>' + (r.dif > 0 ? '+' : '') + r.dif + '</td><td class="pts">' + r.pts + '</td>' +
          (limite ? '' : '<td class="oc-m racha">' + r.racha.map(function (x) { return '<i class="' + x + '" title="' + (x === 'G' ? 'Ganó' : 'Perdió') + '">' + x + '</i>'; }).join('') + '</td>') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  function vacio(t) { return '<div class="vacio">' + t + '</div>'; }
  var BALON_SVG = '<svg class="bal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' + I.balon + '</svg>';
  function cabPagina(titulo, texto, migas) {
    return '<section class="pagina-cab">' + BALON_SVG + '<div class="contenedor"><div class="migas"><a href="index.html">Inicio</a>' + (migas || '') + ' / ' + esc(titulo) + '</div><h1>' + esc(titulo) + '</h1>' + (texto ? '<p>' + texto + '</p>' : '') + '</div></section>';
  }
  /** Cielo con la Cruz del Sur y cordillera amarilla, como la bandera de Magallanes. */
  function estrellas() {
    var e = function (x, y, r) {
      var p = [];
      for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .42 : r; p.push((x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1)); }
      return '<polygon points="' + p.join(' ') + '" fill="#fff"/>';
    };
    return '<svg class="estrellas" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + e(1100, 110, 22) + e(1230, 70, 15) + e(1185, 200, 26) + e(1310, 160, 18) + e(1040, 240, 13) +
      '<g fill="#fff" opacity=".5"><circle cx="560" cy="60" r="1.6"/><circle cx="760" cy="140" r="1.2"/><circle cx="980" cy="70" r="1.8"/><circle cx="1180" cy="190" r="1.3"/><circle cx="1350" cy="90" r="1.6"/><circle cx="880" cy="260" r="1.1"/><circle cx="430" cy="300" r="1.2"/></g></svg>';
  }
  function cordillera() {
    return '<svg class="cordillera" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 120 L90 70 L160 105 L250 40 L340 95 L420 60 L520 110 L610 30 L700 95 L790 55 L880 100 L980 20 L1070 90 L1160 50 L1260 105 L1350 45 L1440 90 V170 H0Z" fill="#FFCC00"/>' +
      '<path d="M0 150 C240 130 480 160 720 145 S1200 130 1440 150 V170 H0Z" fill="#fff"/></svg>';
  }

  function fechaEvento(t) {
    var v = String(t.CUENTA_REGRESIVA_FECHA || '').trim();
    if (!v) return null;
    var hm = v.match(/(\d{1,2})[:.](\d{2})(?!\d)/) || [];
    var sinHora = hm[0] ? v.replace(hm[0], ' ') : v, a, mes, d, m;
    if ((m = sinHora.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) { a = m[1]; mes = m[2]; d = m[3]; }
    else if ((m = sinHora.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/))) { d = m[1]; mes = m[2]; a = m[3]; }
    else return null;
    var f = new Date(+a, +mes - 1, +d, +(hm[1] || 0), +(hm[2] || 0));
    return isNaN(f) || f.getMonth() !== +mes - 1 ? null : f;
  }
  function cuentaRegresiva(t) {
    var f = fechaEvento(t);
    if (!f || Date.now() > f.getTime() + 2 * 864e5) return '';
    var hora = f.getHours() || f.getMinutes() ? ' · ' + ('0' + f.getHours()).slice(-2) + ':' + ('0' + f.getMinutes()).slice(-2) + ' h' : '';
    var caja = function (id, et) { return '<div class="cr-caja"><b id="cr-' + id + '">--</b><span>' + et + '</span></div>'; };
    return '<section class="cuenta-regresiva" aria-label="Cuenta regresiva"><div class="contenedor cr-in"><div class="cr-txt"><span class="cr-ante">' + ico('balon') + ' Cuenta regresiva</span><h2>' + esc(t.CUENTA_REGRESIVA_TITULO || 'Próximo evento') + '</h2>' +
      '<div class="cr-meta">' + ico('cal') + ' ' + capital(DIAS[f.getDay()]) + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()] + ' de ' + f.getFullYear() + hora + (t.CUENTA_REGRESIVA_LUGAR ? '<br>' + ico('pin') + ' ' + esc(t.CUENTA_REGRESIVA_LUGAR) : '') + '</div>' +
      (t.CUENTA_REGRESIVA_TEXTO ? '<p>' + esc(t.CUENTA_REGRESIVA_TEXTO) + '</p>' : '') + '</div>' +
      '<div class="cr-reloj" id="cr-reloj" data-fin="' + f.getTime() + '" role="timer" aria-live="off">' + caja('d', 'días') + caja('h', 'horas') + caja('m', 'min') + caja('s', 'seg') + '</div></div></section>';
  }
  var intervaloCR = null;
  function activarCuentaRegresiva() {
    clearInterval(intervaloCR);
    var reloj = document.getElementById('cr-reloj');
    if (!reloj) return;
    var fin = Number(reloj.dataset.fin);
    function tic() {
      var r = fin - Date.now();
      if (r <= 0) { clearInterval(intervaloCR); reloj.innerHTML = '<div class="cr-llego">¡Llegó el día!</div>'; return; }
      var s = Math.floor(r / 1000), v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      Object.keys(v).forEach(function (k) { var el = document.getElementById('cr-' + k); if (el) el.textContent = k === 'd' ? v[k] : ('0' + v[k]).slice(-2); });
    }
    tic(); intervaloCR = setInterval(tic, 1000);
  }
  function chipsCategorias(d, activa, attr) {
    if ((d.categorias || []).length < 2) return '';
    return '<div class="chips" role="group" aria-label="Categoría">' + d.categorias.map(function (c) { return '<button type="button" class="chip' + (c.id === activa ? ' activo' : '') + '" data-' + (attr || 'cat') + '="' + c.id + '">' + esc(c.nombre) + '</button>'; }).join('') + '</div>';
  }

  // ───────────── Páginas ─────────────
  var PAGINAS = {};
  var EST = { cat: 0, vista: 'prox', catTabla: 0 };

  PAGINAS.inicio = function (d) {
    var t = d.textos || {}, hoy = d.hoy || hoyISO();
    var prox = d.partidos.filter(function (p) { return !jugado(p) && p.fecha >= hoy && p.estado !== 'Suspendido'; }).slice(0, 6);
    var ult = d.partidos.filter(jugado).slice(-6).reverse();
    var notis = d.noticias.slice().sort(function (a, b) { return (b.destacada - a.destacada) || (a.fecha < b.fecha ? 1 : -1); }).slice(0, 3);
    var acts = d.eventos.filter(function (e) { return e.fecha >= hoy; }).slice(0, 2);
    var album = d.albumes[0];
    if (!EST.catTabla && d.categorias[0]) EST.catTabla = d.categorias[0].id;
    var cat = CATS[EST.catTabla] || d.categorias[0];
    return '<section class="hero">' + estrellas() + '<div class="contenedor hero-in"><div>' +
      (t.AVISO_PORTADA ? '<div class="aviso-portada">' + ico('alerta') + '<span>' + esc(t.AVISO_PORTADA) + '</span></div>' : '') +
      '<span class="antetitulo">' + esc(d.org || ORG) + '</span><h1>' + esc(t.HERO_TITULO || 'Básquetbol en Punta Arenas') + '</h1>' +
      '<p class="lead">' + esc(t.HERO_SUBTITULO || '') + '</p><div class="btns"><a class="btn btn-amarillo" href="fixture.html">' + ico('cal') + ' Fixture y resultados</a><a class="btn btn-borde blanco" href="posiciones.html">' + ico('tabla') + ' Tabla de posiciones</a></div></div>' +
      '<img class="hero-logo" src="assets/img/logo-400.png" fetchpriority="high" alt="Logo de la Asociación de Básquetbol Punta Arenas" width="320" height="320"></div>' + cordillera() + '</section>' +
      cuentaRegresiva(t) +
      '<section class="seccion"><div class="contenedor"><div class="grid g2" style="gap:40px;align-items:start">' +
      '<div><div class="seccion-cab"><div><span class="antetitulo">En cancha</span><h2>Próximos partidos</h2></div><a class="enlace-flecha" href="fixture.html">Fixture completo ' + ico('flecha') + '</a></div>' +
      (prox.length ? '<div class="partidos compacta">' + prox.map(function (p) { return tarjetaPartido(p, hoy, { cat: true }); }).join('') + '</div>' : vacio('Pronto publicaremos la programación de la próxima fecha.')) + '</div>' +
      '<div><div class="seccion-cab"><div><span class="antetitulo">Marcadores</span><h2>Últimos resultados</h2></div><a class="enlace-flecha" href="fixture.html?ver=res">Ver todos ' + ico('flecha') + '</a></div>' +
      (ult.length ? '<div class="partidos compacta">' + ult.map(function (p) { return tarjetaPartido(p, hoy, { cat: true }); }).join('') + '</div>' : vacio('Aún no hay resultados esta temporada.')) + '</div></div></div></section>' +
      (cat ? '<section class="seccion gris"><div class="contenedor"><div class="seccion-cab"><div><span class="antetitulo">' + esc(cat.temporada || 'Temporada') + '</span><h2>Tabla de posiciones</h2></div><a class="enlace-flecha" href="posiciones.html">Todas las tablas ' + ico('flecha') + '</a></div>' +
        '<div style="margin-bottom:16px">' + chipsCategorias(d, cat.id, 'tabla') + '</div><div id="tabla-inicio">' + tablaHTML(cat, 8) + '</div></div></section>' : '') +
      '<section class="seccion"><div class="contenedor"><div class="seccion-cab"><div><span class="antetitulo">Novedades</span><h2>Noticias</h2></div><a class="enlace-flecha" href="noticias.html">Todas las noticias ' + ico('flecha') + '</a></div>' +
      (notis.length ? '<div class="grid g3">' + notis.map(tarjetaNoticia).join('') + '</div>' : vacio('Aún no hay noticias publicadas.')) +
      (acts.length ? '<h3 style="margin:40px 0 14px">Próximas actividades</h3>' + acts.map(function (e) { return tarjetaEvento(e); }).join('') : '') + '</div></section>' +
      (d.clubes.length ? '<section class="seccion gris"><div class="contenedor"><div class="seccion-cab" style="justify-content:center;text-align:center"><div><span class="antetitulo">Afiliados</span><h2>Nuestros clubes</h2></div></div>' +
        '<div class="fila-escudos">' + d.clubes.map(function (c) { return '<a href="club.html?id=' + c.id + '">' + escudo(c) + '<span>' + esc(c.nombre) + '</span></a>'; }).join('') + '</div></div></section>' : '') +
      (album ? '<section class="seccion"><div class="contenedor"><div class="seccion-cab"><div><span class="antetitulo">Galería</span><h2>' + esc(album.titulo) + '</h2></div><a class="enlace-flecha" href="galeria.html">Ver galería ' + ico('flecha') + '</a></div>' +
        '<div class="fotos">' + album.fotos.slice(0, 8).map(function (f, i) { return '<button type="button" data-lb="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + img(f.id, 600) + '" alt="' + esc(f.desc || album.titulo) + '" loading="lazy"></button>'; }).join('') + '</div></div></section>' : '') +
      '<section class="seccion' + (album ? ' gris' : '') + '"><div class="contenedor"><div class="cta aparece"><div><h2>Reglamentos y bases</h2><p>Estatutos, reglamento de competencia, bases de cada torneo y formularios oficiales, siempre disponibles.</p></div>' +
      '<a class="btn" href="documentos.html">' + ico('doc') + ' Documentos oficiales</a></div></div></section>';
  };
  PAGINAS.inicio.despues = function (d) {
    if (d.albumes[0]) activarLightbox(d.albumes[0]);
    activarCuentaRegresiva();
    $$('[data-tabla]').forEach(function (b) {
      b.onclick = function () {
        EST.catTabla = +b.dataset.tabla;
        $$('[data-tabla]').forEach(function (x) { x.classList.toggle('activo', x === b); });
        $('#tabla-inicio').innerHTML = tablaHTML(CATS[EST.catTabla], 8);
      };
    });
  };

  PAGINAS.fixture = function (d) {
    if (!EST.cat) EST.cat = +param('cat') || (d.categorias[0] && d.categorias[0].id) || 0;
    if (param('ver') === 'res' && !PAGINAS.fixture.v) { EST.vista = 'res'; PAGINAS.fixture.v = 1; }
    return cabPagina('Fixture y resultados', 'Programación de cada fecha y marcadores de todas las categorías.') +
      '<section class="seccion"><div class="contenedor"><div class="filtros">' + chipsCategorias(d, EST.cat) +
      '<div class="chips sec" role="group" aria-label="Mostrar"><button type="button" class="chip' + (EST.vista === 'prox' ? ' activo' : '') + '" data-vista="prox">Próximos</button><button type="button" class="chip' + (EST.vista === 'res' ? ' activo' : '') + '" data-vista="res">Resultados</button><button type="button" class="chip' + (EST.vista === 'todo' ? ' activo' : '') + '" data-vista="todo">Temporada completa</button></div></div>' +
      '<div id="lista-fixture"></div></div></section>';
  };
  function pintarFixture(d) {
    var hoy = d.hoy || hoyISO(), c = CATS[EST.cat];
    var ps = d.partidos.filter(function (p) { return !EST.cat || p.cat === EST.cat; });
    if (EST.vista === 'prox') ps = ps.filter(function (p) { return !jugado(p) && p.fecha >= hoy; });
    if (EST.vista === 'res') ps = ps.filter(jugado).reverse();
    var grupos = [], idx = {};
    ps.forEach(function (p) { var k = p.fase || fechaLarga(p.fecha); if (!(k in idx)) { idx[k] = grupos.length; grupos.push({ k: k, ps: [], f: p.fecha }); } grupos[idx[k]].ps.push(p); });
    $('#lista-fixture').innerHTML = (c ? '<p class="muted" style="margin:-8px 0 20px">' + esc(c.nombre) + (c.temporada ? ' · Temporada ' + esc(c.temporada) : '') + (c.formato ? ' · ' + esc(c.formato) : '') + '</p>' : '') +
      (grupos.length ? grupos.map(function (g) {
        return '<div class="jornada"><h3>' + esc(g.k) + '</h3><span class="muted">' + (g.ps[0].fecha === g.ps[g.ps.length - 1].fecha ? capital(DIAS[fecha(g.ps[0].fecha).getDay()]) + ' ' + fechaLarga(g.ps[0].fecha) : 'Del ' + fechaCorta(g.ps[0].fecha) + ' al ' + fechaCorta(g.ps[g.ps.length - 1].fecha)) + '</span></div>' +
          '<div class="partidos">' + g.ps.map(function (p) { return tarjetaPartido(p, hoy); }).join('') + '</div>';
      }).join('') : vacio(EST.vista === 'prox' ? 'No hay partidos programados por ahora.' : 'Todavía no hay resultados en esta categoría.'));
    animar();
  }
  PAGINAS.fixture.despues = function (d) {
    pintarFixture(d);
    $$('[data-cat]').forEach(function (b) { b.onclick = function () { EST.cat = +b.dataset.cat; $$('[data-cat]').forEach(function (x) { x.classList.toggle('activo', x === b); }); pintarFixture(d); }; });
    $$('[data-vista]').forEach(function (b) { b.onclick = function () { EST.vista = b.dataset.vista; $$('[data-vista]').forEach(function (x) { x.classList.toggle('activo', x === b); }); pintarFixture(d); }; });
  };

  PAGINAS.posiciones = function (d) {
    var r = d.reglas || {};
    return cabPagina('Tabla de posiciones', 'Se actualiza automáticamente con cada resultado.') +
      '<section class="seccion"><div class="contenedor">' + (d.categorias.length ? d.categorias.map(function (c) {
        return '<div style="margin-bottom:48px" id="cat-' + c.id + '"><div class="seccion-cab" style="margin-bottom:16px"><div><span class="antetitulo">' + esc([c.rama, c.temporada].filter(Boolean).join(' · ') || 'Categoría') + '</span><h2>' + esc(c.nombre) + '</h2></div>' +
          '<a class="enlace-flecha" href="fixture.html?cat=' + c.id + '">Fixture de la categoría ' + ico('flecha') + '</a></div>' + tablaHTML(c) + '</div>';
      }).join('') + '<p class="leyenda-tabla">PJ: jugados · PG: ganados · PP: perdidos · PF: puntos a favor · PC: puntos en contra · DIF: diferencia · PTS: puntos de tabla. ' +
        'Victoria ' + (r.victoria != null ? r.victoria : 2) + ' pts, derrota ' + (r.derrota != null ? r.derrota : 1) + ' pt, no presentación (W.O.) ' + (r.wo != null ? r.wo : 0) + ' pts. ' +
        'Desempate según reglamento FIBA: resultado de los partidos entre los equipos empatados; luego diferencia y puntos a favor.</p>' : vacio('Aún no hay categorías publicadas.')) + '</div></section>';
  };

  PAGINAS.clubes = function (d) {
    return cabPagina('Clubes afiliados', 'Conoce a los clubes que forman parte de la asociación.') + '<section class="seccion"><div class="contenedor">' +
      (d.clubes.length ? '<div class="grid g4">' + d.clubes.map(function (c) {
        return '<a class="tarjeta club-tarjeta aparece" href="club.html?id=' + c.id + '">' + escudo(c, 300) + '<h3>' + esc(c.nombre) + '</h3><div class="meta">' + (c.fundacion ? '<span>Desde ' + esc(c.fundacion) + '</span>' : '') + (c.recinto ? '<span>' + ico('pin') + ' ' + esc(c.recinto) + '</span>' : '') + '</div></a>';
      }).join('') + '</div>' : vacio('Pronto publicaremos la lista de clubes afiliados.')) + '</div></section>';
  };

  PAGINAS.club = function (d) {
    var id = Number(param('id')), c = d.clubes.filter(function (x) { return x.id === id; })[0];
    if (!c) return cabPagina('Club no encontrado', '', ' / <a href="clubes.html">Clubes</a>') + '<section class="seccion"><div class="contenedor">' + vacio('<a href="clubes.html">Ver todos los clubes</a>') + '</div></section>';
    document.title = c.nombre + ' · ' + SIGLA;
    var hoy = d.hoy || hoyISO();
    var ps = d.partidos.filter(function (p) { return p.l === id || p.v === id; });
    var prox = ps.filter(function (p) { return !jugado(p) && p.fecha >= hoy; }).slice(0, 4), res = ps.filter(jugado).slice(-6).reverse();
    var pos = d.categorias.map(function (k) { var r = (k.tabla || []).filter(function (x) { return x.id === id; })[0]; return r ? { c: k, r: r } : null; }).filter(Boolean);
    var dato = function (et, v) { return v ? '<div><b>' + et + '</b>' + v + '</div>' : ''; };
    return cabPagina(c.nombre, c.fundacion ? 'Fundado en ' + esc(c.fundacion) : '', ' / <a href="clubes.html">Clubes</a>') +
      '<section class="seccion"><div class="contenedor"><div class="ficha-club">' + escudo(c, 500) + '<div>' + (c.descripcion ? '<div class="prosa">' + parrafos(c.descripcion) + '</div>' : '') +
      '<div class="datos-club">' + dato('Gimnasio', esc(c.recinto) + (c.direccion ? '<br><span class="muted">' + esc(c.direccion) + '</span>' : '')) + dato('Presidencia', esc(c.presidente)) +
      dato('Correo', c.correo ? '<a href="mailto:' + esc(c.correo) + '">' + esc(c.correo) + '</a>' : '') + dato('Teléfono', c.telefono ? '<a href="tel:' + esc(String(c.telefono).replace(/\s/g, '')) + '">' + esc(c.telefono) + '</a>' : '') +
      dato('Redes', (c.instagram ? '<a href="' + url(c.instagram) + '" target="_blank" rel="noopener">Instagram</a> ' : '') + (c.facebook ? '<a href="' + url(c.facebook) + '" target="_blank" rel="noopener">Facebook</a>' : '')) + '</div>' +
      (pos.length ? '<div class="datos-club">' + pos.map(function (x) { return '<div><b>' + esc(x.c.nombre) + '</b><span style="font-family:var(--t-titulo);font-size:1.6rem;font-weight:800;color:var(--azul)">' + x.r.pos + '° lugar</span> · ' + x.r.pts + ' pts (' + x.r.pg + 'G ' + x.r.pp + 'P)</div>'; }).join('') + '</div>' : '') +
      '</div></div>' +
      '<div class="grid g2" style="gap:40px;margin-top:56px;align-items:start"><div><h2>Próximos partidos</h2>' + (prox.length ? '<div class="partidos compacta">' + prox.map(function (p) { return tarjetaPartido(p, hoy, { cat: true }); }).join('') + '</div>' : vacio('Sin partidos programados.')) + '</div>' +
      '<div><h2>Últimos resultados</h2>' + (res.length ? '<div class="partidos compacta">' + res.map(function (p) { return tarjetaPartido(p, hoy, { cat: true }); }).join('') + '</div>' : vacio('Aún sin resultados.')) + '</div></div></div></section>';
  };

  PAGINAS.noticias = function (d) {
    var hoy = d.hoy || hoyISO(), acts = d.eventos.filter(function (e) { return e.fecha >= hoy; }), pas = d.eventos.filter(function (e) { return e.fecha < hoy; }).reverse().slice(0, 6);
    return cabPagina('Noticias', 'Novedades, comunicados y actividades de la asociación.') + '<section class="seccion"><div class="contenedor">' +
      (d.noticias.length ? '<div class="grid g3">' + d.noticias.map(tarjetaNoticia).join('') + '</div>' : vacio('Aún no hay noticias publicadas.')) + '</div></section>' +
      (acts.length || pas.length ? '<section class="seccion gris" id="actividades"><div class="contenedor"><div class="seccion-cab"><div><span class="antetitulo">Agenda</span><h2>Actividades</h2></div><p>Clínicas, cursos, asambleas e inscripciones.</p></div>' +
        (acts.length ? acts.map(function (e) { return tarjetaEvento(e); }).join('') : vacio('No hay actividades programadas.')) +
        (pas.length ? '<h3 style="margin:36px 0 14px">Realizadas</h3>' + pas.map(function (e) { return tarjetaEvento(e, true); }).join('') : '') + '</div></section>' : '');
  };

  PAGINAS.noticia = function (d) {
    var id = Number(param('id')), n = d.noticias.filter(function (x) { return x.id === id; })[0];
    if (!n) return cabPagina('Noticia no encontrada', '', ' / <a href="noticias.html">Noticias</a>') + '<section class="seccion"><div class="contenedor">' + vacio('La noticia no existe o ya no está publicada. <a href="noticias.html">Ver todas las noticias</a>') + '</div></section>';
    document.title = n.titulo + ' · ' + SIGLA;
    var md = $('meta[name=description]'); if (md) md.setAttribute('content', n.resumen || n.titulo);
    var u = location.href, txt = n.titulo + ' – ' + u;
    var otras = d.noticias.filter(function (x) { return x.id !== id; }).slice(0, 3);
    return cabPagina(n.titulo, fechaLarga(n.fecha) + (n.area ? ' · ' + esc(n.area) : ''), ' / <a href="noticias.html">Noticias</a>') +
      '<section class="seccion"><div class="contenedor"><article class="articulo">' + (n.foto ? '<figure class="portada">' + imagen(n.foto, 1600, n.titulo) + '</figure>' : '') +
      (n.resumen ? '<p style="font-size:1.2rem;font-weight:600;color:var(--tinta)">' + esc(n.resumen) + '</p>' : '') + '<div class="cuerpo">' + parrafos(n.contenido) + '</div>' +
      '<div class="compartir"><b>Compartir:</b>' + (n.foto && navigator.share ? '<button type="button" class="btn btn-prim" id="compartir-foto" data-foto="' + esc(img(n.foto, 1200)) + '" data-titulo="' + esc(n.titulo) + '">' + ico('flecha') + ' Compartir con foto</button>' : '') +
      '<a class="btn btn-wa" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" target="_blank" rel="noopener">' + marca('wa') + ' WhatsApp</a>' +
      '<a class="btn btn-lago" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u) + '" target="_blank" rel="noopener">' + marca('fb') + ' Facebook</a></div></article>' +
      (otras.length ? '<div style="margin-top:60px"><h2>Otras noticias</h2><div class="grid g3">' + otras.map(tarjetaNoticia).join('') + '</div></div>' : '') + '</div></section>';
  };

  PAGINAS.galeria = function (d) {
    var id = Number(param('album'));
    if (id) {
      var a = d.albumes.filter(function (x) { return x.id === id; })[0];
      if (!a) return cabPagina('Álbum no encontrado', '', ' / <a href="galeria.html">Galería</a>') + '<section class="seccion"><div class="contenedor">' + vacio('<a href="galeria.html">Volver a la galería</a>') + '</div></section>';
      document.title = a.titulo + ' · Galería ' + SIGLA;
      return cabPagina(a.titulo, fechaLarga(a.fecha) + (a.descripcion ? ' · ' + esc(a.descripcion) : ''), ' / <a href="galeria.html">Galería</a>') +
        '<section class="seccion"><div class="contenedor"><div class="fotos">' + a.fotos.map(function (f, i) { return '<button type="button" data-lb="' + i + '" aria-label="Ampliar foto ' + (i + 1) + '"><img src="' + img(f.id, 600) + '" alt="' + esc(f.desc || a.titulo) + '" loading="lazy"></button>'; }).join('') +
        '</div><p style="margin-top:28px"><a class="enlace-flecha" href="galeria.html">← Todos los álbumes</a></p></div></section>';
    }
    return cabPagina('Galería', 'Fotos de partidos, finales y actividades de la asociación.') + '<section class="seccion"><div class="contenedor">' +
      (d.albumes.length ? '<div class="grid g3">' + d.albumes.map(function (a) {
        return '<a class="tarjeta album aparece" href="galeria.html?album=' + a.id + '"><div class="img">' + imagen(a.portada, 800, a.titulo) + '<span class="cuenta">' + a.fotos.length + ' fotos</span></div><div class="cuerpo"><div class="meta">' + fechaLarga(a.fecha) + '</div><h3>' + esc(a.titulo) + '</h3>' + (a.descripcion ? '<p>' + esc(a.descripcion) + '</p>' : '') + '</div></a>';
      }).join('') + '</div>' : vacio('Muy pronto compartiremos las fotos de la temporada.')) + '</div></section>';
  };
  PAGINAS.galeria.despues = function (d) { var id = Number(param('album')); var a = d.albumes.filter(function (x) { return x.id === id; })[0]; if (a) activarLightbox(a); };

  PAGINAS.documentos = function (d) {
    var grupos = {}, orden = [];
    d.documentos.forEach(function (x) { if (!grupos[x.tipo]) { grupos[x.tipo] = []; orden.push(x.tipo); } grupos[x.tipo].push(x); });
    return cabPagina('Documentos oficiales', 'Estatutos, reglamentos, bases de competencia y formularios de la asociación.') + '<section class="seccion"><div class="contenedor" style="max-width:900px">' +
      (orden.length ? orden.map(function (t) {
        return '<div class="grupo-docs"><h2>' + esc(t) + '</h2><div class="docs">' + grupos[t].map(function (x) {
          var enlace = x.archivo ? 'https://drive.google.com/file/d/' + encodeURIComponent(x.archivo) + '/view' : x.url;
          return '<a class="doc aparece" href="' + url(enlace) + '" target="_blank" rel="noopener"><span class="icono">' + ico('doc') + '</span><div><b>' + esc(x.titulo) + '</b><span>' + [x.fecha ? fechaLarga(x.fecha) : '', x.descripcion].filter(Boolean).map(esc).join(' · ') + '</span></div><span class="ir">' + ico('bajar') + '</span></a>';
        }).join('') + '</div></div>';
      }).join('') : vacio('Pronto publicaremos los documentos oficiales de la asociación.')) + '</div></section>';
  };

  PAGINAS.nosotros = function (d) {
    var t = d.textos || {};
    return cabPagina('Quiénes somos', 'Historia, propósitos y directiva de la asociación.') +
      '<section class="seccion"><div class="contenedor"><div class="grid g2" style="align-items:center;gap:48px"><div><span class="antetitulo">La asociación</span><h2>Básquetbol en el fin del mundo</h2><div class="prosa">' + parrafos(t.NOSOTROS) + '</div>' +
      (t.HISTORIA_AFILIACION ? '<p class="muted"><b>' + esc(t.HISTORIA_AFILIACION) + '</b></p>' : '') + '<a class="btn btn-borde" href="documentos.html">' + ico('doc') + ' Estatutos y reglamentos</a></div>' +
      '<div style="display:flex;justify-content:center"><img src="assets/img/logo-400.png" alt="Logo ABPA" width="360" height="360" loading="lazy" style="width:min(360px,100%);border-radius:36px;box-shadow:var(--sombra)"></div></div></div></section>' +
      '<section class="seccion gris"><div class="contenedor"><div class="grid g2"><div class="mv aparece"><div class="icono">' + ico('diana') + '</div><h3>Misión</h3><p>' + esc(t.MISION) + '</p></div>' +
      '<div class="mv aparece"><div class="icono">' + ico('ojo') + '</div><h3>Visión</h3><p>' + esc(t.VISION) + '</p></div></div>' +
      '<h3 style="margin:40px 0 16px">Nuestros valores</h3><div class="valores">' + lineas(t.VALORES).map(function (v) { return '<span>' + esc(v) + '</span>'; }).join('') + '</div></div></section>' +
      '<section class="seccion"><div class="contenedor"><div class="seccion-cab"><div><span class="antetitulo">Organización</span><h2>Directiva</h2></div></div>' +
      (d.directiva.length ? '<div class="grid g4">' + d.directiva.map(function (p) {
        return '<div class="persona aparece"><div class="avatar">' + (p.foto ? '<img src="' + img(p.foto, 300) + '" alt="' + esc(p.nombre) + '" loading="lazy">' : esc(iniciales(p.nombre))) + '</div><b>' + esc(p.nombre) + '</b><span>' + esc(p.cargo) + '</span>' +
          (p.correo ? '<a href="mailto:' + esc(p.correo) + '">' + esc(p.correo) + '</a>' : '') + '</div>';
      }).join('') + '</div>' : vacio('Directiva por publicar.')) + '</div></section>';
  };

  PAGINAS.privacidad = function (d) {
    var t = d.textos || {}, correo = esc(t.CONTACTO_CORREO || d.correo || CORREO_SITIO);
    var mail = correo ? '<a href="mailto:' + correo + '">' + correo + '</a>' : 'el formulario de <a href="contacto.html">contacto</a>';
    var sec = function (tit, html) { return '<h2>' + tit + '</h2>' + html; };
    var lista = function (xs) { return '<ul>' + xs.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };
    return cabPagina('Política de privacidad', 'Cómo cuidamos los datos de quienes visitan el sitio.', '') +
      '<section class="seccion"><div class="contenedor"><article class="articulo"><div class="cuerpo">' +
      '<p><b>Última actualización:</b> 20 de octubre de 2026.</p>' +
      sec('1. Responsable', '<p>El responsable de los datos es la ' + esc(d.org || ORG) + ', con domicilio en Punta Arenas, Región de Magallanes y de la Antártica Chilena. Para cualquier consulta sobre tus datos, escríbenos a ' + mail + '.</p>') +
      sec('2. Qué datos recopilamos', lista(['<b>Formulario de contacto:</b> nombre, correo electrónico, teléfono (opcional), asunto y mensaje.',
        '<b>Información deportiva pública:</b> nombres de clubes, resultados, tablas y, cuando corresponde, nombres de dirigentes que los propios clubes informan para su publicación.'])) +
      sec('3. Para qué los usamos', '<p>Para responder tus consultas y para informar sobre las competencias y actividades de la asociación. No usamos tus datos con fines comerciales ni los vendemos o cedemos a terceros.</p>') +
      sec('4. Dónde se guardan', '<p>Los datos se almacenan en servicios de Google (Google Sheets y Google Drive) administrados por la asociación. Solo acceden integrantes de la directiva y personas encargadas, con usuario y clave personal.</p>') +
      sec('5. Fotografías', '<p>Publicamos fotos de partidos y actividades. Si apareces en una imagen y prefieres que la retiremos, escríbenos a ' + mail + ' y la quitaremos a la brevedad. En el caso de menores de edad, atendemos con prioridad las solicitudes de sus madres, padres o tutores.</p>') +
      sec('6. Tus derechos', '<p>Puedes pedir en cualquier momento el acceso, la rectificación, la eliminación o la oposición al tratamiento de tus datos, escribiendo a ' + mail + '.</p>') +
      sec('7. Cookies y almacenamiento', '<p>Este sitio no usa cookies de publicidad ni de seguimiento. Para cargar más rápido, guarda en tu navegador una copia del contenido público. Las tipografías se cargan desde Google Fonts.</p>') +
      sec('8. Normativa', '<p>Tratamos los datos de acuerdo con la Ley N° 19.628 sobre protección de la vida privada y, desde su entrada en vigencia, la Ley N° 21.719 sobre protección y tratamiento de datos personales.</p>') +
      '</div></article></div></section>';
  };

  PAGINAS.contacto = function (d) {
    var t = d.textos || {}, correo = t.CONTACTO_CORREO || d.correo || CORREO_SITIO;
    var dato = function (icono, et, val) { return '<div class="dato-contacto"><div class="icono">' + icono + '</div><div><b>' + et + '</b>' + val + '</div></div>'; };
    return cabPagina('Contacto', 'Consultas sobre competencias, inscripción de clubes, arbitraje o prensa.') +
      '<section class="seccion"><div class="contenedor"><div class="grid g2" style="gap:40px;align-items:start"><div><h2>Hablemos</h2><p class="prosa">Te responderemos a la brevedad por correo electrónico.</p>' +
      (correo ? dato(ico('correo'), 'Correo', '<a href="mailto:' + esc(correo) + '">' + esc(correo) + '</a>') : '') +
      (t.CONTACTO_TELEFONO ? dato(ico('tel'), 'Teléfono', '<a href="tel:' + esc(t.CONTACTO_TELEFONO.replace(/\s/g, '')) + '">' + esc(t.CONTACTO_TELEFONO) + '</a>') : '') +
      (t.CONTACTO_WHATSAPP ? dato(marca('wa'), 'WhatsApp', '<a href="https://wa.me/' + esc(t.CONTACTO_WHATSAPP) + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>') : '') +
      dato(ico('pin'), 'Ubicación', '<div>' + esc(t.CONTACTO_DIRECCION || 'Punta Arenas, Magallanes') + '</div>') +
      (t.INSTAGRAM_URL ? dato(marca('ig'), 'Instagram', '<a href="' + url(t.INSTAGRAM_URL) + '" target="_blank" rel="noopener">Síguenos</a>') : '') +
      (t.FACEBOOK_URL ? dato(marca('fb'), 'Facebook', '<a href="' + url(t.FACEBOOK_URL) + '" target="_blank" rel="noopener">Síguenos</a>') : '') + '</div>' +
      '<form class="panel form f2" id="f-contacto" novalidate><label class="campo"><span>Nombre *</span><input class="inp" name="nombre" required autocomplete="name"></label>' +
      '<label class="campo"><span>Teléfono</span><input class="inp" name="telefono" type="tel" autocomplete="tel"></label>' +
      '<label class="campo full"><span>Correo electrónico *</span><input class="inp" name="correo" type="email" required autocomplete="email"></label>' +
      '<label class="campo full"><span>Asunto</span><select class="inp" name="asunto"><option>Consulta general</option><option>Competencias y fixture</option><option>Inscripción de clubes y jugadores</option><option>Arbitraje</option><option>Prensa y auspicios</option><option>Otro</option></select></label>' +
      '<label class="campo full"><span>Mensaje *</span><textarea class="inp" name="mensaje" required minlength="10"></textarea></label>' +
      '<p class="full muted" style="margin:0;font-size:.86rem">Tus datos se usan solo para responder tu consulta. Más información en nuestra <a href="privacidad.html">política de privacidad</a>.</p>' +
      '<input class="trampa" name="web" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="full" id="r-contacto" aria-live="polite"></div>' +
      '<button class="btn btn-prim full" type="submit">Enviar mensaje</button></form></div></div></section>';
  };
  PAGINAS.contacto.despues = function () {
    var f = $('#f-contacto');
    f.onsubmit = function (e) {
      e.preventDefault();
      var r = $('#r-contacto');
      if (!f.checkValidity()) { r.innerHTML = '<div class="alerta error">Completa nombre, correo y un mensaje de al menos 10 caracteres.</div>'; return; }
      var b = $('button[type=submit]', f), txt = b.textContent;
      b.disabled = true; b.textContent = 'Enviando…'; r.innerHTML = '';
      enviar({ tipo: 'contacto', nombre: f.nombre.value, telefono: f.telefono.value, correo: f.correo.value, asunto: f.asunto.value, mensaje: f.mensaje.value, web: f.web.value })
        .then(function (msg) { r.innerHTML = '<div class="alerta ok">✓ ' + esc(msg) + '</div>'; f.reset(); })
        .catch(function (err) { r.innerHTML = '<div class="alerta error">' + esc(err.message === 'Failed to fetch' ? 'No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.' : err.message) + '</div>'; })
        .then(function () { b.disabled = false; b.textContent = txt; });
    };
  };

  // ───────────── Lightbox ─────────────
  function activarLightbox(album) {
    var i = 0, lb = null;
    function mostrar() {
      var f = album.fotos[i];
      lb.querySelector('img').src = img(f.id, 1920);
      lb.querySelector('img').alt = f.desc || album.titulo;
      lb.querySelector('.cap').textContent = (f.desc ? f.desc + ' · ' : '') + (i + 1) + ' / ' + album.fotos.length;
    }
    function cerrar() { lb.remove(); lb = null; document.removeEventListener('keydown', teclas); document.body.style.overflow = ''; }
    function mover(n) { i = (i + n + album.fotos.length) % album.fotos.length; mostrar(); }
    function teclas(e) { if (e.key === 'Escape') cerrar(); if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); }
    $$('[data-lb]').forEach(function (b) {
      b.onclick = function () {
        i = +b.dataset.lb;
        lb = document.createElement('div');
        lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Foto ampliada');
        lb.innerHTML = '<img alt=""><div class="cap"></div><button class="cerrar" aria-label="Cerrar">×</button><button class="ant" aria-label="Anterior">‹</button><button class="sig" aria-label="Siguiente">›</button>';
        document.body.appendChild(lb); document.body.style.overflow = 'hidden';
        lb.querySelector('.cerrar').onclick = cerrar;
        lb.querySelector('.ant').onclick = function () { mover(-1); };
        lb.querySelector('.sig').onclick = function () { mover(1); };
        lb.addEventListener('click', function (e) { if (e.target === lb) cerrar(); });
        document.addEventListener('keydown', teclas);
        mostrar(); lb.querySelector('.cerrar').focus();
      };
    });
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#compartir-foto');
    if (!b) return;
    var datos = { title: b.dataset.titulo, text: b.dataset.titulo + ' – ' + location.href, url: location.href };
    b.disabled = true;
    fetch(b.dataset.foto, { mode: 'cors' }).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (bl) {
      var f = new File([bl], 'noticia.jpg', { type: bl.type || 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: datos.title, text: datos.text });
      return navigator.share(datos);
    }).catch(function (e) { if (!e || e.name !== 'AbortError') return navigator.share(datos).catch(function () { }); })
      .then(function () { b.disabled = false; });
  });

  // ───────────── Arranque ─────────────
  function animar() {
    var els = $$('.aparece:not(.visible)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (ent) { ent.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  function pintar(d) {
    d.partidos = d.partidos || []; d.categorias = d.categorias || []; d.clubes = d.clubes || []; d.documentos = d.documentos || [];
    d.noticias = d.noticias || []; d.eventos = d.eventos || []; d.albumes = d.albumes || []; d.directiva = d.directiva || [];
    indexar(d);
    if (d.org) ORG = d.org;
    if (d.sigla) SIGLA = d.sigla;
    CORREO_SITIO = (d.textos && d.textos.CONTACTO_CORREO) || d.correo || CORREO_SITIO;
    var main = $('#contenido');
    if (!PAGINAS[PAGINA]) return;
    main.innerHTML = PAGINAS[PAGINA](d);
    if (PAGINAS[PAGINA].despues) PAGINAS[PAGINA].despues(d);
    pie(d);
    animar();
    if (location.hash && !pintar.saltado) { pintar.saltado = true; var el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(function () { el.scrollIntoView(); }, 30); }
  }

  cabecera();
  if (!PAGINAS[PAGINA]) { pie({ textos: {} }); return; }
  $('#contenido').innerHTML = '<div class="contenedor" style="padding:60px 20px"><div class="grid g3"><div class="esqueleto"></div><div class="esqueleto"></div><div class="esqueleto"></div></div></div>';
  cargar(function (nuevo) {
    if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    pintar(nuevo);
  }).then(pintar).catch(function () {
    $('#contenido').innerHTML = '<div class="contenedor seccion">' + vacio('No pudimos cargar el contenido. Intenta recargar la página.') + '</div>';
    pie({ textos: {} });
  });
})();
