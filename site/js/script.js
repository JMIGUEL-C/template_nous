/* NOUS Perfumería — shared site behavior (vanilla JS, no framework).
   Reference build for porting into a Shopify theme: cart, drawers, carousels,
   countdown and testimonial rotation are all plain DOM manipulation so the
   logic below maps directly onto whatever theme JS you end up writing. */

(function () {
  'use strict';

  /* ---------- Product data (mirrors what would come from Shopify's product/collection objects) ---------- */
  var PRODUCTS = [
    { key: 'f-tiramisu', cat: 'femeninas', name: 'Tiramisú', price: 69900, bg: '#C7A98D', bottle: '#7C5A43', tag: 'Café · Cacao · Vainilla · Cremoso', badge: 'Temporada' },
    { key: 'f-panelita', cat: 'femeninas', name: 'Panelita de Leche', price: 69900, bg: '#E7C79C', bottle: '#C1934F', tag: 'Dulce de leche · Caramelo · Vainilla' },
    { key: 'f-coquito', cat: 'femeninas', name: 'Coquito Rallado', price: 69900, bg: '#EFE6D3', bottle: '#D8C49E', tag: 'Coco · Crema · Vainilla' },
    { key: 'f-fresita', cat: 'femeninas', name: 'Fresita', price: 69900, bg: '#F3A7B9', bottle: '#DE5E79', tag: 'Fresa · Dulce · Frutal', badge: 'Top ventas' },
    { key: 'f-orquidea', cat: 'femeninas', name: 'Dulce Orquídea', price: 69900, bg: '#C8A6D6', bottle: '#9367AE', tag: 'Orquídea · Floral · Dulce', badge: 'Favorita' },
    { key: 'f-nube', cat: 'femeninas', name: 'Nube de Azúcar', price: 69900, bg: '#C3D9EC', bottle: '#8EB4DA', tag: 'Algodón de azúcar · Dulce · Suave' },
    { key: 'f-jardin', cat: 'femeninas', name: 'Jardín Rosa', price: 69900, bg: '#F1B7C6', bottle: '#D67C92', tag: 'Rosa · Floral · Fresco' },
    { key: 'f-galleta', cat: 'femeninas', name: 'Galleta de Limón', price: 69900, bg: '#F1DD8C', bottle: '#DBBF45', tag: 'Limón · Galleta · Cítrico' },
    { key: 'f-almendra', cat: 'femeninas', name: 'Almendra Tostada', price: 69900, bg: '#D9B790', bottle: '#B08653', tag: 'Almendra · Tostado · Cálido' },
    { key: 'f-carinito', cat: 'femeninas', name: 'Cariñito', price: 69900, bg: '#F7C9D9', bottle: '#E58FA9', tag: 'Vainilla · Ámbar · Dulce' },
    { key: 'm-azul', cat: 'masculinas', name: 'Azul del Pacífico', price: 69900, bg: '#A6C4E0', bottle: '#3D6E9E', tag: 'Marino · Cítrico · Fresco', badge: 'Top ventas' },
    { key: 'm-noche', cat: 'masculinas', name: 'Noche de Fiesta', price: 69900, bg: '#52506F', bottle: '#C9A24B', tag: 'Ámbar · Especiado · Nocturno' },
    { key: 'm-granizado', cat: 'masculinas', name: 'Granizado de Mandarina', price: 69900, bg: '#F3B87C', bottle: '#DF893D', tag: 'Mandarina · Cítrico · Fresco' },
    { key: 'm-licor', cat: 'masculinas', name: 'Licor de Miel', price: 69900, bg: '#E7C277', bottle: '#C7982F', tag: 'Miel · Amaderado · Cálido' },
    { key: 'm-manglar', cat: 'masculinas', name: 'Manglar', price: 69900, bg: '#AAC49A', bottle: '#6E8E5E', tag: 'Verde · Herbal · Fresco' },
    { key: 'b-panelita', cat: 'mantequillas', name: 'Panelita de Leche', price: 39900, bg: '#E7C79C', bottle: '#C1934F', tag: 'Dulce de leche · Caramelo · Vainilla' },
    { key: 'b-coquito', cat: 'mantequillas', name: 'Coquito Rallado', price: 39900, bg: '#EFE6D3', bottle: '#D8C49E', tag: 'Coco · Crema · Vainilla', badge: 'Favorita' },
    { key: 'b-fresita', cat: 'mantequillas', name: 'Fresita', price: 39900, bg: '#F3A7B9', bottle: '#DE5E79', tag: 'Fresa · Dulce · Frutal' },
    { key: 'b-almendra', cat: 'mantequillas', name: 'Almendra Tostada', price: 39900, bg: '#D9B790', bottle: '#B08653', tag: 'Almendra · Tostado · Cálido' }
  ];

  var TESTIMONIALS = [
    { text: 'El Tiramisú es adictivo, huelo a postre todo el día y me preguntan qué perfume uso. ¡Amo NOUS!', name: 'Valentina R.', city: 'Medellín', initial: 'V', color: '#DE5E79' },
    { text: 'Pedí la Panelita de Leche para mi mamá y lloró de la emoción. El empaque hecho a mano es hermoso.', name: 'Daniela M.', city: 'Bogotá', initial: 'D', color: '#C9A24B' },
    { text: 'Compro al por mayor para mi tienda y las clientas repiten. Fragancias que de verdad duran.', name: 'Carolina P.', city: 'Cali', initial: 'C', color: '#9367AE' },
    { text: 'La mantequilla de Coquito deja la piel divina y con un olorcito rico toda la mañana.', name: 'Laura G.', city: 'Barranquilla', initial: 'L', color: '#8EB4DA' }
  ];

  function fmt(n) { return '$' + Number(n).toLocaleString('es-CO'); }
  function byKey(key) { return PRODUCTS.filter(function (p) { return p.key === key; })[0]; }

  /* ---------- Cart (persisted in localStorage so it survives page navigation) ---------- */
  var Cart = {
    STORAGE_KEY: 'nous_cart',
    read: function () {
      try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } catch (e) { return []; }
    },
    write: function (cart) { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart)); },
    add: function (key) {
      var cart = this.read();
      var line = cart.filter(function (l) { return l.key === key; })[0];
      if (line) line.qty += 1;
      else cart.push({ key: key, qty: 1 });
      this.write(cart);
      renderCart();
      showToast(byKey(key).name + ' añadido al carrito', 'success');
      openDrawer('cart');
    },
    changeQty: function (key, delta) {
      var cart = this.read().map(function (l) {
        return l.key === key ? { key: l.key, qty: l.qty + delta } : l;
      }).filter(function (l) { return l.qty > 0; });
      this.write(cart);
      renderCart();
    },
    remove: function (key) {
      var cart = this.read().filter(function (l) { return l.key !== key; });
      this.write(cart);
      renderCart();
    },
    total: function () {
      return this.read().reduce(function (sum, l) {
        var p = byKey(l.key);
        return sum + (p ? p.price * l.qty : 0);
      }, 0);
    },
    count: function () {
      return this.read().reduce(function (sum, l) { return sum + l.qty; }, 0);
    }
  };

  function renderCart() {
    var cart = Cart.read();
    var count = Cart.count();
    document.querySelectorAll('.js-cart-count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });

    var itemsEl = document.getElementById('cart-items');
    var emptyEl = document.getElementById('cart-empty');
    var footerEl = document.getElementById('cart-footer');
    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = '';
      itemsEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    itemsEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'block';

    itemsEl.innerHTML = cart.map(function (line) {
      var p = byKey(line.key);
      if (!p) return '';
      return (
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div style="width:58px;height:66px;border-radius:10px;background:' + p.bg + ';flex:none;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px">' +
            '<div style="width:26px;height:38px;border-radius:5px;background:linear-gradient(140deg,rgba(255,255,255,.6),' + p.bottle + ')"></div>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-family:\'Montserrat\',sans-serif;font-size:18px;font-weight:600;color:var(--brand-deep);line-height:1.1">' + p.name + '</div>' +
            '<div style="font-size:11px;color:#8a6b52;margin:2px 0 8px">' + fmt(p.price) + ' c/u</div>' +
            '<div style="display:flex;align-items:center;gap:10px">' +
              '<div style="display:flex;align-items:center;border:1px solid rgba(201,162,75,.35);border-radius:999px;overflow:hidden">' +
                '<button data-qty-dec="' + p.key + '" style="width:28px;height:28px;border:none;background:#FBEFF3;cursor:pointer;font-size:16px;color:#8C6A50">−</button>' +
                '<span style="width:30px;text-align:center;font-weight:700;font-size:13px;color:var(--brand-deep)">' + line.qty + '</span>' +
                '<button data-qty-inc="' + p.key + '" style="width:28px;height:28px;border:none;background:#FBEFF3;cursor:pointer;font-size:16px;color:#8C6A50">+</button>' +
              '</div>' +
              '<button data-remove="' + p.key + '" style="background:none;border:none;cursor:pointer;color:#B98;font-size:12px;text-decoration:underline">Quitar</button>' +
            '</div>' +
          '</div>' +
          '<div style="font-weight:700;font-size:15px;color:var(--brand-deep);flex:none">' + fmt(p.price * line.qty) + '</div>' +
        '</div>'
      );
    }).join('');

    var total = Cart.total();
    var subtotalEl = document.getElementById('cart-subtotal');
    var shippingEl = document.getElementById('cart-shipping-note');
    if (subtotalEl) subtotalEl.textContent = fmt(total);
    if (shippingEl) {
      shippingEl.textContent = total >= 175000
        ? '¡Felicidades! Tienes envío GRATIS'
        : ('Te faltan ' + fmt(175000 - total) + ' para tu envío GRATIS');
    }
  }

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }

  /* ---------- Drawers (cart / mobile nav / mobile search) ---------- */
  function openDrawer(name) {
    var overlay = document.getElementById(name + '-overlay');
    var panel = document.getElementById(name + '-panel');
    if (overlay) overlay.classList.add('open');
    if (panel) panel.classList.add('open');
  }
  function closeDrawer(name) {
    var overlay = document.getElementById(name + '-overlay');
    var panel = document.getElementById(name + '-panel');
    if (overlay) overlay.classList.remove('open');
    if (panel) panel.classList.remove('open');
  }
  function closeAllDrawers() { ['cart', 'nav', 'search'].forEach(closeDrawer); }

  /* ---------- Countdown (perpetual 30-day cycle, resets on its own) ---------- */
  function monthlyCountdown() {
    var cycleMs = 30 * 24 * 60 * 60 * 1000;
    var anchor = new Date('2026-01-01T00:00:00').getTime();
    var elapsed = (Date.now() - anchor) % cycleMs;
    var remaining = cycleMs - elapsed;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return {
      days: Math.floor(remaining / 86400000),
      hours: pad(Math.floor((remaining % 86400000) / 3600000)),
      minutes: pad(Math.floor((remaining % 3600000) / 60000)),
      seconds: pad(Math.floor((remaining % 60000) / 1000))
    };
  }
  function renderCountdown() {
    var c = monthlyCountdown();
    document.querySelectorAll('.js-countdown-days').forEach(function (el) { el.textContent = c.days; });
    document.querySelectorAll('.js-countdown-hours').forEach(function (el) { el.textContent = c.hours; });
    document.querySelectorAll('.js-countdown-minutes').forEach(function (el) { el.textContent = c.minutes; });
    document.querySelectorAll('.js-countdown-seconds').forEach(function (el) { el.textContent = c.seconds; });
  }

  /* ---------- Testimonials rotation ---------- */
  function initTestimonials() {
    var root = document.getElementById('testimonial');
    if (!root) return;
    var idx = 0;
    function render() {
      var t = TESTIMONIALS[idx];
      root.querySelector('.t-text').textContent = t.text;
      var avatar = root.querySelector('.t-avatar');
      avatar.textContent = t.initial;
      avatar.style.background = t.color;
      root.querySelector('.t-name').textContent = t.name;
      root.querySelector('.t-city').textContent = t.city;
      root.querySelectorAll('.t-dot').forEach(function (dot, i) {
        dot.style.width = i === idx ? '26px' : '9px';
        dot.style.background = i === idx ? 'var(--gold)' : '#EBD3DD';
      });
    }
    root.querySelectorAll('.t-dot').forEach(function (dot, i) {
      dot.addEventListener('click', function () { idx = i; render(); resetInterval(); });
    });
    var prevBtn = root.querySelector('.t-prev');
    var nextBtn = root.querySelector('.t-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { idx = (idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length; render(); resetInterval(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { idx = (idx + 1) % TESTIMONIALS.length; render(); resetInterval(); });
    var iv;
    function resetInterval() {
      clearInterval(iv);
      iv = setInterval(function () { idx = (idx + 1) % TESTIMONIALS.length; render(); }, 5200);
    }
    render();
    resetInterval();
  }

  /* ---------- Product detail page: one template, product picked via ?id= ---------- */
  var CATEGORY_LABELS = {
    femeninas: { label: 'Fragancias femeninas', href: 'femeninas.html' },
    masculinas: { label: 'Fragancias masculinas', href: 'masculinas.html' },
    mantequillas: { label: 'Mantequillas corporales', href: 'mantequillas.html' }
  };

  function initProductPage() {
    var titleEl = document.getElementById('p-title');
    if (!titleEl) return;
    var key = new URLSearchParams(location.search).get('id') || 'f-tiramisu';
    var p = byKey(key) || byKey('f-tiramisu');
    var original = Math.round(p.price / 0.88 / 100) * 100;
    var cat = CATEGORY_LABELS[p.cat] || CATEGORY_LABELS.femeninas;

    document.title = p.name + ' — NOUS Perfumería';
    titleEl.textContent = p.name;

    var breadcrumb = document.getElementById('p-breadcrumb');
    if (breadcrumb) breadcrumb.setAttribute('href', cat.href);
    var breadcrumbText = document.getElementById('p-breadcrumb-text');
    if (breadcrumbText) breadcrumbText.textContent = cat.label;

    var gallery = document.getElementById('p-gallery-bg');
    if (gallery) gallery.style.background = 'linear-gradient(150deg,' + p.bg + ',' + p.bottle + ')';
    document.querySelectorAll('[data-bottle-part]').forEach(function (el) {
      var part = el.getAttribute('data-bottle-part');
      el.style.background = part === 'body'
        ? 'linear-gradient(140deg,rgba(255,255,255,.5),' + p.bottle + ' 65%)'
        : p.bottle;
    });
    var bottleName = document.getElementById('p-bottle-name');
    if (bottleName) bottleName.textContent = p.name;

    var badge = document.getElementById('p-badge');
    if (badge) { if (p.badge) badge.textContent = p.badge; else badge.style.display = 'none'; }

    var accords = document.getElementById('p-accords');
    if (accords) accords.innerHTML = p.tag.split(' · ').map(function (w) { return '<span>' + w + '</span>'; }).join('·');

    var priceEl = document.getElementById('p-price');
    if (priceEl) priceEl.textContent = fmt(p.price);
    var originalEl = document.getElementById('p-original');
    if (originalEl) originalEl.textContent = fmt(original);

    document.querySelectorAll('.p-add-btn').forEach(function (btn) { btn.setAttribute('data-add', p.key); });
  }

  /* ---------- Carousels (sliding track with cyclic tail-pad, mobile "peek") ---------- */
  function initCarousel(root, perPage) {
    var track = root.querySelector('.carousel-track');
    var dotsEl = root.querySelector('.carousel-dots');
    var prevBtn = root.querySelector('.carousel-prev');
    var nextBtn = root.querySelector('.carousel-next');
    var items = Array.prototype.slice.call(track.children);
    var n = items.length;
    var page = 0;

    function layout() {
      var mobile = window.innerWidth <= 640;
      track.innerHTML = '';

      if (mobile) {
        // Native horizontal scroll-snap: every card in DOM order, each one
        // taking ~82% of the viewport so the next card peeks at the edge.
        // No JS paging needed — the user swipes directly.
        track.style.width = '';
        track.style.transform = '';
        items.forEach(function (el) {
          var wrap = el.cloneNode(true);
          wrap.style.cssText = 'flex:0 0 82%;width:82%;box-sizing:border-box;padding:0 7px;scroll-snap-align:center';
          track.appendChild(wrap);
        });
        if (dotsEl) dotsEl.innerHTML = '';
        return;
      }

      var step = Math.min(perPage, n);
      var itemViewportPct = 100 / step;
      var totalPages = Math.max(1, Math.ceil(n / step));
      page = ((page % totalPages) + totalPages) % totalPages;
      var start = page * step;
      var peekExtra = Math.max(0, Math.ceil(100 / itemViewportPct) - 1);
      var padCount = Math.min(n, Math.max(step - 1, peekExtra));

      // Rebuild the track with n original items + padCount cyclic clones so the
      // last page never shows a short/empty row.
      var all = items.concat(items.slice(0, padCount));
      var total = all.length;
      var pct = 100 / total;
      all.forEach(function (el) {
        var wrap = el.cloneNode(true);
        wrap.style.flex = '0 0 ' + pct.toFixed(4) + '%';
        wrap.style.boxSizing = 'border-box';
        wrap.style.padding = '0 12px';
        track.appendChild(wrap);
      });
      track.style.width = (total * itemViewportPct) + '%';
      track.style.transform = 'translateX(-' + (start * pct).toFixed(4) + '%)';

      if (dotsEl) {
        dotsEl.innerHTML = '';
        for (var i = 0; i < totalPages; i++) {
          var dot = document.createElement('button');
          dot.style.cssText = 'border:none;cursor:pointer;padding:0;border-radius:999px;height:9px;transition:all .3s;width:' + (i === page ? '26px' : '9px') + ';background:' + (i === page ? 'var(--brand)' : '#EBD3DD');
          (function (i) { dot.addEventListener('click', function () { page = i; layout(); }); })(i);
          dotsEl.appendChild(dot);
        }
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { page -= 1; layout(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { page += 1; layout(); });
    window.addEventListener('resize', debounce(layout, 150));
    layout();
  }

  function debounce(fn, wait) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, wait); };
  }

  /* ---------- Search (used by both the header search box and the mobile search drawer) ---------- */
  function initSearch() {
    var inputs = document.querySelectorAll('.js-search-input');
    var resultsSection = document.getElementById('search-results');
    var resultsGrid = document.getElementById('search-results-grid');
    var noResults = document.getElementById('search-no-results');
    var homeSections = document.getElementById('home-sections');
    if (!inputs.length) return;

    function run(q) {
      q = q.trim().toLowerCase();
      inputs.forEach(function (el) { if (el.value !== q) el.value = q; });
      if (!resultsSection) return;
      if (q.length === 0) {
        resultsSection.style.display = 'none';
        if (homeSections) homeSections.style.display = '';
        return;
      }
      if (homeSections) homeSections.style.display = 'none';
      resultsSection.style.display = 'block';
      var matches = PRODUCTS.filter(function (p) { return p.name.toLowerCase().indexOf(q) !== -1; });
      if (matches.length === 0) {
        resultsGrid.style.display = 'none';
        noResults.style.display = 'block';
        noResults.textContent = 'Sin resultados para «' + q + '» — prueba con otro nombre ✿';
        return;
      }
      resultsGrid.style.display = 'grid';
      noResults.style.display = 'none';
      resultsGrid.innerHTML = matches.map(productCardHtml).join('');
    }

    inputs.forEach(function (el) {
      el.addEventListener('input', function () { run(el.value); });
    });
  }

  function productCardHtml(p) {
    var badge = p.badge
      ? '<span style="position:absolute;top:0;left:0;background:#111;color:#fff;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 12px">' + p.badge + '</span>'
      : '';
    return (
      '<div class="prod-card" style="width:100%;background:#fff;border-radius:0;overflow:hidden;display:flex;flex-direction:column;position:relative">' +
        '<a class="prod-card-link" href="product.html?id=' + p.key + '" aria-label="Ver producto"></a>' +
        '<div class="prod-card-img" style="position:relative;aspect-ratio:3/4;overflow:hidden;background:' + p.bg + ';display:flex;align-items:flex-end;justify-content:center;padding-bottom:28px">' +
          badge +
          '<div style="width:80px;filter:drop-shadow(0 12px 16px rgba(0,0,0,.22))">' +
            '<div style="width:28px;height:21px;margin:0 auto;background:' + p.bottle + ';border-radius:4px 4px 0 0;opacity:.92"></div>' +
            '<div style="width:36px;height:9px;margin:0 auto;background:' + p.bottle + ';opacity:.72"></div>' +
            '<div style="position:relative;width:80px;height:108px;border-radius:13px;background:linear-gradient(140deg,rgba(255,255,255,.55),' + p.bottle + ' 62%);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.28)">' +
              '<div style="position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:56px;height:48px;background:rgba(255,253,248,.93);border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:1px solid rgba(201,162,75,.35)">' +
                '<span style="font-family:\'Montserrat\',sans-serif;font-size:17px;color:var(--brand-deep)">N</span>' +
                '<span style="font-size:6px;letter-spacing:2px;color:var(--gold)">NOUS</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button data-add="' + p.key + '" class="prod-hover-bar" style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--cta);color:#fff;border:none;padding:12px;font-family:\'Montserrat\',sans-serif;font-weight:600;font-size:12px;letter-spacing:.4px;text-transform:uppercase;cursor:pointer">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M12 5v14M5 12h14"></path></svg> Agregar al carrito' +
          '</button>' +
        '</div>' +
        '<div style="padding:14px 2px 0;display:flex;flex-direction:column;gap:4px;flex:1">' +
          '<div style="font-family:\'Montserrat\',sans-serif;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:500">' + p.tag + '</div>' +
          '<div style="font-family:\'Montserrat\',sans-serif;font-size:13.5px;font-weight:700;color:#111;line-height:1.3;text-transform:uppercase"><a href="product.html?id=' + p.key + '" style="color:inherit;text-decoration:none">' + p.name + '</a></div>' +
          '<div style="margin-top:auto;padding-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span style="font-family:\'Montserrat\',sans-serif;font-size:14px;font-weight:600;color:var(--muted)">' + fmt(p.price) + '</span><span style="font-size:11px;color:#C7B8BC;text-decoration:line-through">' + fmt(Math.round(p.price / 0.88 / 100) * 100) + '</span><span style="background:var(--blush);color:#8C2B4E;font-size:9px;font-weight:700;padding:2px 5px">-12%</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---------- Category page view toggle (grid / list) ---------- */
  function initViewToggle() {
    var grid = document.querySelector('.category-grid');
    if (!grid) return;
    var gridBtn = document.querySelector('[data-view="grid"]');
    var listBtn = document.querySelector('[data-view="list"]');
    function setView(mode) {
      grid.classList.toggle('category-list', mode === 'list');
      if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
      if (listBtn) listBtn.classList.toggle('active', mode === 'list');
    }
    if (gridBtn) gridBtn.addEventListener('click', function () { setView('grid'); });
    if (listBtn) listBtn.addEventListener('click', function () { setView('list'); });
  }

  /* ---------- Discount popup (shows once per browser session) ---------- */
  function initDiscountPopup() {
    var overlay = document.getElementById('popup-overlay');
    var card = document.getElementById('popup-card');
    var sideTab = document.getElementById('popup-side-tab');
    if (!overlay || !card) return;

    function open() {
      overlay.classList.add('open');
      card.classList.add('open');
      if (sideTab) sideTab.style.display = 'none';
    }
    function close(dismissForGood) {
      overlay.classList.remove('open');
      card.classList.remove('open');
      if (dismissForGood) localStorage.setItem('nous_popup_dismissed', '1');
      if (sideTab) sideTab.style.display = dismissForGood ? 'block' : 'none';
    }

    document.querySelectorAll('[data-popup-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { close(true); });
    });
    overlay.addEventListener('click', function () { close(true); });
    if (sideTab) sideTab.addEventListener('click', open);

    var form = document.getElementById('popup-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showToast('¡Gracias! Revisa tu correo ✿');
        close(true);
      });
    }

    // Once dismissed, stay dismissed across pages/reloads — just show the
    // little side tab instead of nagging with the popup again.
    if (localStorage.getItem('nous_popup_dismissed')) {
      if (sideTab) sideTab.style.display = 'block';
    } else if (!sessionStorage.getItem('nous_popup_shown')) {
      sessionStorage.setItem('nous_popup_shown', '1');
      setTimeout(open, 1200);
    }
  }

  /* ---------- Wire up everything on load ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    renderCountdown();
    initProductPage();
    setInterval(renderCountdown, 1000);

    document.addEventListener('click', function (e) {
      var add = e.target.closest && e.target.closest('[data-add]');
      var inc = e.target.closest && e.target.closest('[data-qty-inc]');
      var dec = e.target.closest && e.target.closest('[data-qty-dec]');
      var rem = e.target.closest && e.target.closest('[data-remove]');
      if (add) Cart.add(add.getAttribute('data-add'));
      if (inc) Cart.changeQty(inc.getAttribute('data-qty-inc'), 1);
      if (dec) Cart.changeQty(dec.getAttribute('data-qty-dec'), -1);
      if (rem) Cart.remove(rem.getAttribute('data-remove'));
    });

    document.querySelectorAll('[data-open-drawer]').forEach(function (btn) {
      btn.addEventListener('click', function () { openDrawer(btn.getAttribute('data-open-drawer')); });
    });
    document.querySelectorAll('[data-close-drawer]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDrawer(btn.getAttribute('data-close-drawer')); });
    });
    document.querySelectorAll('.drawer-overlay').forEach(function (ov) {
      ov.addEventListener('click', function () { closeAllDrawers(); });
    });
    document.querySelectorAll('.js-nav-link').forEach(function (link) {
      link.addEventListener('click', function () { closeDrawer('nav'); });
    });

    var checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', function () { showToast('Redirigiendo a Bold…'); });

    document.querySelectorAll('.js-carousel').forEach(function (root) {
      initCarousel(root, parseInt(root.getAttribute('data-per-page'), 10) || 4);
    });

    initTestimonials();
    initSearch();
    initViewToggle();
    initDiscountPopup();
  });
})();
