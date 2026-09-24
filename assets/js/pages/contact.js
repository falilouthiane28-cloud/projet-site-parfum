/* contact.js — Coordonnées depuis config.js, validation du formulaire,
   enregistrement via T.api (local, puis Supabase si les clés sont posées).
   Rien n'est envoyé automatiquement : le bouton WhatsApp reste un lien. */
(function () {
  'use strict';
  var T = window.TERANGA;
  var cfg = T.config;
  var form = document.getElementById('contactForm');
  if (!form) return;

  /* ---------- Coordonnées : une seule source, config.js ---------- */
  var set = function (id, text, href) {
    var el = document.getElementById(id);
    if (!el) return;
    if (text != null) el.textContent = text;
    if (href != null) el.setAttribute('href', href);
  };
  set('cAddress', cfg.address);
  set('cHours', cfg.hours);
  set('cPhoneLink', cfg.phoneDisplay, 'https://wa.me/' + cfg.whatsapp);
  set('cMailLink', cfg.email, 'mailto:' + cfg.email);

  /* ---------- Lien WhatsApp, tenu à jour pendant la saisie ---------- */
  var wa = document.getElementById('waBtn');
  function buildWa() {
    var f = form.elements;
    var txt = 'Bonjour Teranga, je souhaite une consultation privée.';
    if (f.name.value.trim()) txt += '\nNom : ' + f.name.value.trim();
    if (f.date.value) txt += '\nDate souhaitée : ' + f.date.value;
    if (f.message.value.trim()) txt += '\nDemande : ' + f.message.value.trim();
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(txt);
  }
  if (wa) {
    wa.href = buildWa();
    form.addEventListener('input', function () { wa.href = buildWa(); });
  }

  /* ---------- Envoi ---------- */
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var errName = document.getElementById('errName');
    var errEmail = document.getElementById('errEmail');
    var ok = true;

    errName.textContent = ''; errEmail.textContent = '';
    f.name.removeAttribute('aria-invalid'); f.email.removeAttribute('aria-invalid');

    if (!f.name.value.trim()) {
      ok = false;
      f.name.setAttribute('aria-invalid', 'true');
      errName.textContent = 'Votre nom, s\'il vous plaît.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value)) {
      ok = false;
      f.email.setAttribute('aria-invalid', 'true');
      errEmail.textContent = 'Adresse incomplète : vérifiez le « @ » et le domaine.';
    }
    if (!ok) { (f.name.getAttribute('aria-invalid') ? f.name : f.email).focus(); return; }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi…';

    T.api.saveConsultation({
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      date: f.date.value, message: f.message.value.trim()
    }).then(function () {
      var name = f.name.value.trim();
      msg.className = 'form-msg is-ok';
      msg.textContent = 'Merci ' + name + '. Votre demande est enregistrée — nous répondons sous 24 heures. Vous pouvez aussi nous écrire sur WhatsApp.';
      btn.textContent = 'Demande envoyée';
      form.querySelectorAll('input, textarea').forEach(function (i) { i.disabled = true; });
      msg.focus && msg.focus();
    });
  });
})();
