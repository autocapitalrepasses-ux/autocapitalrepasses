(function () {
  var WPP = '5519998942563'; // (19) 99894-2563
  var cfg = window.APP_CONFIG || {};

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  // Salva o lead no Supabase. Nunca bloqueia o envio ao WhatsApp.
  function salvarLead(lead) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return;
    try {
      var headers = {
        'Content-Type': 'application/json',
        'apikey': cfg.SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      };
      // Chave antiga (anon, começa com "eyJ") vai também no Authorization.
      // Chave nova (publishable, começa com "sb_publishable_") só em apikey.
      if (cfg.SUPABASE_ANON_KEY.indexOf('eyJ') === 0) {
        headers['Authorization'] = 'Bearer ' + cfg.SUPABASE_ANON_KEY;
      }
      fetch(cfg.SUPABASE_URL + '/rest/v1/leads', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(lead),
        keepalive: true
      }).catch(function (e) { console.warn('Lead não salvo:', e); });
    } catch (e) {
      console.warn('Lead não salvo:', e);
    }
  }

  window.enviarInteresse = function () {
    var nome = val('nome');
    var carro = val('carro');
    var km = val('km');
    var cidade = val('cidade');
    var telefone = val('telefone');
    var msg = val('msg');

    if (!nome) { alert('Por favor, informe seu nome.'); return; }
    if (!carro) { alert('Conte qual carro você procura.'); return; }

    salvarLead({
      nome: nome,
      carro: carro,
      detalhes: km || null,
      cidade: cidade || null,
      telefone: telefone || null,
      observacoes: msg || null
    });

    var texto = 'Olá, Auto Capital Repasses! \ud83d\udc4b\n\nEstou procurando um carro, pode me ajudar a encontrar?\n\n';
    texto += '\ud83d\udc64 Nome/Loja: ' + nome + '\n';
    texto += '\ud83d\ude97 Procuro: ' + carro + '\n';
    if (km) texto += '\ud83d\udcca Detalhes: ' + km + '\n';
    if (cidade) texto += '\ud83d\udccd Cidade: ' + cidade + '\n';
    if (telefone) texto += '\ud83d\udcde Telefone: ' + telefone + '\n';
    if (msg) texto += '\ud83d\udcdd Observações: ' + msg + '\n';
    texto += '\nAguardo retorno, obrigado!';

    window.open('https://wa.me/' + WPP + '?text=' + encodeURIComponent(texto), '_blank');
  };
})();
