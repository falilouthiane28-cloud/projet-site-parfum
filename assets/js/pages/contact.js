/* contact.js — Validation + enregistrement local + lien WhatsApp (aucun envoi automatique) */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;
  var wa = document.getElementById('waBtn');
  var PHONE = '221000000000';

  function buildWa() {
    var n = form.name.value.trim(), m = form.message.value.trim(), d = form.date.value;
    var txt = 'Bonjour Teranga, je souhaite une consultation privée.';
    if (n) txt += '\nNom : ' + n;
    if (d) txt += '\nDate souhaitée : ' + d;
    if (m) txt += '\nDemande : ' + m;
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(txt);
  }
  form.addEventListener('input', function () { wa.href = buildWa(); });
  wa.href = buildWa();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var name = form.name, email = form.email;
    var errName = document.getElementById('errName'), errEmail = document.getElementById('errEmail');
    errName.textContent = ''; errEmail.textContent = ''; name.removeAttribute('aria-invalid'); email.removeAttribute('aria-invalid');
    if (!name.value.trim()) { ok = false; name.setAttribute('aria-invalid', 'true'); errName.textContent = 'Votre nom, s\'il vous plaît.'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { ok = false; email.setAttribute('aria-invalid', 'true'); errEmail.textContent = 'Adresse e-mail invalide.'; }
    if (!ok) return;
    try {
      var list = JSON.parse(localStorage.getItem('teranga-consultations') || '[]');
      list.push({ name: name.value.trim(), email: email.value.trim(), phone: form.phone.value.trim(), date: form.date.value, message: form.message.value.trim(), at: Date.now() });
      localStorage.setItem('teranga-consultations', JSON.stringify(list));
    } catch (e2) {}
    var msg = document.getElementById('formMsg');
    msg.style.color = 'var(--color-success)';
    msg.textContent = 'Merci ' + name.value.trim() + '. Votre demande est enregistrée — nous vous répondons sous 24h. Vous pouvez aussi nous écrire directement sur WhatsApp.';
    form.querySelector('button[type="submit"]').disabled = true;
  });
})();
