// Rastreamento de cliques para campanhas (Google Analytics 4, Google Ads e Meta Pixel).
// Só faz algo se os IDs forem cadastrados no Netlify (veja README). Sem IDs, não envia nada.
(function () {
  function evento(nome, meta) {
    try { if (typeof window.gtag === 'function') window.gtag('event', nome, { event_category: 'engajamento' }); } catch (e) {}
    try {
      if (typeof window.fbq === 'function') {
        if (meta === 'Contact' || meta === 'Lead') window.fbq('track', meta);
        else window.fbq('trackCustom', nome);
      }
    } catch (e) {}
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('instagram.com') > -1) evento('clique_instagram', 'custom');
    else if (href.indexOf('wa.me') > -1) evento('clique_whatsapp', 'Contact');
    else if (href.indexOf('mailto:') === 0) evento('clique_email', 'Contact');
    else if (el.classList.contains('btn-whatsapp')) evento('clique_enviar_formulario', 'Lead');
  }, true);
})();
