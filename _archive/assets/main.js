(function () {
  'use strict';

  /* ================= Product catalog ================= */
  var PRODUCTS = {
    noor:   { name: 'Noor',           price: 48000, tag: 'Eau de Parfum', img: 'https://images.pexels.com/photos/8625543/pexels-photo-8625543.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/8625543/pexels-photo-8625543.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Bergamot · Pink pepper', heart: 'Tiare · Amber', base: 'Amber · Vanilla', desc: 'A golden, sunlit opening that settles into warm amber and tiare. Our signature welcome.' },
    ambre:  { name: 'Ambre de Dakar', price: 62000, tag: 'Extrait',       img: 'https://images.pexels.com/photos/12426169/pexels-photo-12426169.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/12426169/pexels-photo-12426169.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Saffron · Cardamom', heart: 'Oud · Rose', base: 'Amber · Musk', desc: 'Deep saffron and oud, warmed by amber. A fragrance for the evening.' },
    oud:    { name: 'Oud Noir',       price: 75000, tag: 'Extrait',       img: 'https://images.pexels.com/photos/15097440/pexels-photo-15097440.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/15097440/pexels-photo-15097440.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Oud · Leather', heart: 'Oud · Vetiver', base: 'Leather · Musk', desc: 'Smoky oud and leather, dark and lasting. Our boldest statement.' },
    lumiere:{ name: 'Lumière',        price: 52000, tag: 'Eau de Parfum', img: 'https://images.pexels.com/photos/11711813/pexels-photo-11711813.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/11711813/pexels-photo-11711813.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Citrus · Neroli', heart: 'Tiare · Jasmine', base: 'Amber · Sandalwood', desc: 'Bright citrus and white flowers, softened by sandalwood. For daylight.' },
    sillage:{ name: 'Sillage',        price: 68000, tag: 'Extrait',       img: 'https://images.pexels.com/photos/7796225/pexels-photo-7796225.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/7796225/pexels-photo-7796225.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Pink pepper · Bergamot', heart: 'Iris · Amber', base: 'Vanilla · Musk', desc: 'A powdery, warm trail that lingers long after you leave the room.' },
    minuit: { name: 'Minuit',         price: 45000, tag: 'Eau de Parfum', img: 'https://images.pexels.com/photos/30970926/pexels-photo-30970926.jpeg?auto=compress&cs=tinysrgb&w=900&h=945&fit=crop', thumb: 'https://images.pexels.com/photos/30970926/pexels-photo-30970926.jpeg?auto=compress&cs=tinysrgb&w=200&h=210&fit=crop', top: 'Violet · Bergamot', heart: 'Rose · Oud', base: 'Musk · Patchouli', desc: 'Violet and rose over a quiet oud base. Soft, close, intimate.' }
  };

  /* ================= Cart (persisted) ================= */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('gana-cart') || '[]'); } catch (e) { cart = []; }

  var cartCount = document.getElementById('cartCount');
  var cartBody = document.getElementById('cartBody');
  var cartTotal = document.getElementById('cartTotal');
  var cartSheet = document.getElementById('cartSheet');
  var cartOverlay = document.getElementById('cartOverlay');

  var fmt = function (n) { return n.toLocaleString('fr-FR').replace(/\u202f/g, ' ') + ' FCFA'; };

  function persist() { try { localStorage.setItem('gana-cart', JSON.stringify(cart)); } catch (e) {} }

  function renderCart() {
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    if (cartCount) { cartCount.hidden = count === 0; cartCount.textContent = count; }
    if (cartTotal) cartTotal.textContent = fmt(cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0));
    if (!cartBody) return;
    if (cart.length === 0) { cartBody.innerHTML = '<p class="cart-empty">Your cart is empty.</p>'; return; }
    cartBody.innerHTML = '';
    cart.forEach(function (item, idx) {
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<img src="' + item.img + '" alt="' + item.name + '" width="60" height="60" loading="lazy" />' +
        '<div><div class="ci-name">' + item.name + '</div><div class="ci-price">' + fmt(item.price) + '</div></div>' +
        '<div class="ci-qty">' +
        '<button data-dec="' + idx + '" aria-label="Decrease quantity">\u2212</button>' +
        '<span>' + item.qty + '</span>' +
        '<button data-inc="' + idx + '" aria-label="Increase quantity">+</button>' +
        '</div>';
      cartBody.appendChild(row);
    });
    cartBody.querySelectorAll('[data-inc]').forEach(function (b) {
      b.addEventListener('click', function () { cart[+b.dataset.inc].qty++; persist(); renderCart(); });
    });
    cartBody.querySelectorAll('[data-dec]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.dec; cart[i].qty--;
        if (cart[i].qty <= 0) cart.splice(i, 1);
        persist(); renderCart();
      });
    });
  }

  function addToCart(key, qty) {
    qty = qty || 1;
    var p = PRODUCTS[key];
    if (!p) return;
    var found = cart.find(function (i) { return i.key === key; });
    if (found) found.qty += qty;
    else cart.push({ key: key, name: p.name, price: p.price, img: p.thumb, qty: qty });
    persist(); renderCart(); openCart();
  }

  function openCart() { if (cartSheet) { cartSheet.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  function closeCart() { if (cartSheet) { cartSheet.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; } }

  document.querySelectorAll('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () { addToCart(b.dataset.add); });
  });
  var cartOpen = document.getElementById('cartOpen');
  var cartClose = document.getElementById('cartClose');
  if (cartOpen) cartOpen.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  /* ================= Nav ================= */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.style.display === 'flex';
        links.style.display = open ? 'none' : 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '68px'; links.style.left = '0'; links.style.right = '0';
        links.style.background = 'rgba(11,27,58,0.97)';
        links.style.padding = '20px 24px';
        links.style.gap = '18px';
      });
    }
  }

  /* ================= Shop filters ================= */
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      document.querySelectorAll('[data-category]').forEach(function (card) {
        var show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ================= Product detail (?id=) ================= */
  var pd = document.getElementById('productDetail');
  if (pd) {
    var key = new URLSearchParams(location.search).get('id') || 'noor';
    var p = PRODUCTS[key] || PRODUCTS.noor;
    var set = function (sel, val) { var el = pd.querySelector(sel); if (el) el.textContent = val; };
    var img = pd.querySelector('[data-pd-img]');
    if (img) { img.src = p.img; img.alt = p.name; }
    set('[data-pd-name]', p.name);
    set('[data-pd-tag]', p.tag);
    set('[data-pd-price]', fmt(p.price));
    set('[data-pd-desc]', p.desc);
    set('[data-pd-top]', p.top);
    set('[data-pd-heart]', p.heart);
    set('[data-pd-base]', p.base);
    var addBtn = pd.querySelector('[data-add]');
    if (addBtn) addBtn.dataset.add = key;

    // Size selector
    var basePrice = p.price;
    document.querySelectorAll('.size-btn').forEach(function (s) {
      s.addEventListener('click', function () {
        document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('active'); });
        s.classList.add('active');
        var mult = s.dataset.size === '50' ? 0.6 : 1;
        set('[data-pd-price]', fmt(Math.round(basePrice * mult)));
      });
    });
  }

  /* ================= Motion (GSAP) ================= */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = window.gsap && window.ScrollTrigger && !reduced;

  if (!hasGsap) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  } else {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    var heroEls = document.querySelectorAll('.hero [data-reveal]');
    if (heroEls.length) {
      gsap.from(heroEls, { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.14, delay: 0.15 });
    }

    // Hero scrub (parallax + zoom)
    var heroImg = document.querySelector('.hero-media img');
    if (heroImg) {
      gsap.to(heroImg, { yPercent: 18, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-content', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // Scroll reveals
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero')) return;
      var from = { opacity: 0, y: 26 };
      if (el.dataset.reveal === 'left') from = { opacity: 0, x: -30 };
      else if (el.dataset.reveal === 'right') from = { opacity: 0, x: 30 };
      else if (el.dataset.reveal === 'scale') from = { opacity: 0, scale: 0.94 };
      gsap.fromTo(el, from, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // Self-drawing SVG line
    document.querySelectorAll('[data-draw]').forEach(function (host) {
      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 400 400');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;right:5%;top:14%;width:min(300px,38vw);height:auto;opacity:0.55;pointer-events:none;';
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M20 380 C 80 120, 200 40, 380 60');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#D1C2A7');
      path.setAttribute('stroke-width', '1.6');
      svg.appendChild(path);
      host.style.position = 'relative';
      host.appendChild(svg);
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: host, start: 'top 75%', end: 'bottom 55%', scrub: true } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  renderCart();
})();
