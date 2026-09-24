/* =========================================================================
   config.js — Réglages de la boutique. Le SEUL fichier à éditer pour la mise
   en ligne (clés Supabase, WhatsApp, livraison).
   ========================================================================= */
window.TERANGA_CONFIG = {
  /* Supabase — laissez vide pour un fonctionnement 100 % local (localStorage).
     Renseignez l'URL du projet et la clé publique « anon » : la sécurité repose
     sur les règles RLS de supabase/schema.sql, pas sur le secret de cette clé. */
  supabaseUrl: '',
  supabaseAnonKey: '',

  /* Contact */
  whatsapp: '221000000000',            // format international, sans « + » ni espaces
  phoneDisplay: '+221 33 000 00 00',
  email: 'bonjour@teranga.sn',
  address: 'Route des Almadies, Dakar',
  hours: 'Lundi – samedi · 10 h – 20 h',
  coords: [14.7417, -17.5086],          // boutique, pour la carte

  /* Livraison : frais en FCFA (null = sur devis) et délai en jours ouvrés */
  delivery: [
    { group: 'Dakar', fee: 3000, days: [1, 2], cities: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Keur Massar'] },
    { group: 'Sénégal', fee: 5000, days: [2, 4], cities: ['Thiès', 'Mbour – Saly', 'Saint-Louis', 'Touba', 'Kaolack', 'Ziguinchor'] },
    { group: 'CEDEAO', fee: null, days: [5, 10], cities: ['Autre pays de la CEDEAO'] },
    { group: 'Boutique', fee: 0, days: [0, 1], cities: ['Retrait en boutique — Almadies'], pickup: true }
  ]
};
