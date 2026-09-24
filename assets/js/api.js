/* =========================================================================
   api.js — Persistance. Toujours en localStorage ; en plus dans Supabase si
   config.js contient supabaseUrl + supabaseAnonKey (client chargé à la demande).
   Tables : voir supabase/schema.sql.
   ========================================================================= */
(function () {
  'use strict';
  var T = window.TERANGA;
  var cfg = T.config;
  var configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  var sbPromise = null;

  function client() {
    if (!configured) return Promise.resolve(null);
    if (sbPromise) return sbPromise;
    sbPromise = new Promise(function (resolve) {
      if (window.supabase && window.supabase.createClient) {
        return resolve(window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey));
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload = function () { resolve(window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return sbPromise;
  }

  async function currentUser() {
    var sb = await client();
    if (!sb) return null;
    try { var r = await sb.auth.getUser(); return r.data.user || null; } catch (e) { return null; }
  }

  /* Insère dans Supabase si possible ; ne lève jamais (le local fait foi). */
  async function remoteInsert(table, row) {
    var sb = await client();
    if (!sb) return false;
    try { var r = await sb.from(table).insert(row); return !r.error; } catch (e) { return false; }
  }

  function pushLocal(key, item) {
    var list = T.ls.get(key, []);
    list.unshift(item);
    T.ls.set(key, list);
  }

  T.api = {
    configured: configured,

    saveOrder: async function (order) {
      pushLocal('teranga-orders', order);
      var user = await currentUser();
      var remote = await remoteInsert('orders', {
        order_ref: order.id, user_id: user ? user.id : null,
        items: order.items, total_xof: order.total, delivery_fee_xof: order.deliveryFee,
        delivery_address: order.delivery, payment_method: order.payment.method,
        payment_phone: order.payment.phone || null, remarks: order.remarks || null,
        phone: order.delivery.telephone, email: order.delivery.email || null
      });
      return { ok: true, remote: remote };
    },

    saveNewsletter: async function (email) {
      pushLocal('teranga-newsletter', { email: email, at: Date.now() });
      return { ok: true, remote: await remoteInsert('newsletter', { email: email }) };
    },

    saveConsultation: async function (c) {
      pushLocal('teranga-consultations', Object.assign({ at: Date.now() }, c));
      return {
        ok: true,
        remote: await remoteInsert('consultations', {
          full_name: c.name, phone: c.phone || null, email: c.email || null,
          preferred_date: c.date || null, notes: c.message || null
        })
      };
    },

    localOrders: function () { return T.ls.get('teranga-orders', []); },

    remoteOrders: async function () {
      var sb = await client(); var user = await currentUser();
      if (!sb || !user) return [];
      try {
        var r = await sb.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        return r.error ? [] : r.data;
      } catch (e) { return []; }
    },

    /* ---------- Authentification (Supabase uniquement) ---------- */
    auth: {
      user: currentUser,
      signUp: async function (email, password, fullName) {
        var sb = await client(); if (!sb) return { error: 'indisponible' };
        var r = await sb.auth.signUp({ email: email, password: password, options: { data: { full_name: fullName } } });
        return { error: r.error ? r.error.message : null, needsConfirm: !r.data.session };
      },
      signIn: async function (email, password) {
        var sb = await client(); if (!sb) return { error: 'indisponible' };
        var r = await sb.auth.signInWithPassword({ email: email, password: password });
        return { error: r.error ? r.error.message : null };
      },
      signOut: async function () { var sb = await client(); if (sb) await sb.auth.signOut(); }
    },

    /* ---------- Profil ---------- */
    getProfile: async function () {
      var local = T.ls.get('teranga-profile', { full_name: '', phone: '', address: '' });
      var sb = await client(); var user = await currentUser();
      if (!sb || !user) return local;
      try {
        var r = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
        return r.data || local;
      } catch (e) { return local; }
    },
    saveProfile: async function (profile) {
      T.ls.set('teranga-profile', profile);
      var sb = await client(); var user = await currentUser();
      if (!sb || !user) return { remote: false };
      try {
        var r = await sb.from('profiles').upsert(Object.assign({ id: user.id }, profile));
        return { remote: !r.error };
      } catch (e) { return { remote: false }; }
    },

    /* ---------- Liste de désirs ---------- */
    wishlist: {
      all: function () { return T.ls.get('teranga-wishlist', []); },
      has: function (id) { return T.ls.get('teranga-wishlist', []).indexOf(id) !== -1; },
      toggle: async function (id) {
        var list = T.ls.get('teranga-wishlist', []);
        var on = list.indexOf(id) === -1;
        list = on ? [id].concat(list) : list.filter(function (x) { return x !== id; });
        T.ls.set('teranga-wishlist', list);
        document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { id: id, on: on } }));
        var sb = await client(); var user = await currentUser();
        if (sb && user) {
          try {
            if (on) await sb.from('wishlist').upsert({ user_id: user.id, parfum_id: id });
            else await sb.from('wishlist').delete().eq('user_id', user.id).eq('parfum_id', id);
          } catch (e) { /* le local fait foi */ }
        }
        return on;
      }
    },

    /* ---------- Panier (synchronisé pour un utilisateur connecté) ---------- */
    syncCart: async function (items) {
      var sb = await client(); var user = await currentUser();
      if (!sb || !user) return;
      try { await sb.from('carts').upsert({ user_id: user.id, items: items, updated_at: new Date().toISOString() }); }
      catch (e) { /* le local fait foi */ }
    }
  };
})();
