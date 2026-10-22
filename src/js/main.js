(function () {
  var WPP = '5519998942563'; // (19) 99894-2563
  var cfg = window.APP_CONFIG || {};

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  // Salva o lead no Supabase. Nunca bloqueia o envio ao WhatsApp.
  // Tenta gravar nas colunas novas (faixa_valor, contato). Se o banco ainda não tiver
  // essas colunas, regrava no formato antigo para o lead não se perder.
  function salvarLead(lead, leadLegado) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return;
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
    function enviar(corpo, tentarLegado) {
      try {
        fetch(cfg.SUPABASE_URL + '/rest/v1/leads', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(corpo),
          keepalive: true
        }).then(function (r) {
          if (!r.ok && tentarLegado) enviar(leadLegado, false);
        }).catch(function (e) { console.warn('Lead não salvo:', e); });
      } catch (e) {
        console.warn('Lead não salvo:', e);
      }
    }
    enviar(lead, !!leadLegado);
  }

  // Maiúsculo (o campo já aparece assim na tela, aqui garantimos no texto enviado/salvo)
  function up(id) {
    return val(id).toLocaleUpperCase('pt-BR');
  }

  window.enviarInteresse = function () {
    var nome = up('nome');
    var carro = up('carro');
    var km = up('km');
    var valor = up('valor');
    var cidade = up('cidade');
    var contato = up('contato');
    var telefone = val('telefone');
    var msg = up('msg');

    if (!nome) { alert('Por favor, informe o nome da loja.'); return; }
    if (!carro) { alert('Conte qual carro você procura.'); return; }

    var leadNovo = {
      nome: nome.slice(0, 120),
      carro: carro.slice(0, 200),
      detalhes: km ? km.slice(0, 300) : null,
      faixa_valor: valor ? valor.slice(0, 120) : null,
      cidade: cidade ? cidade.slice(0, 120) : null,
      contato: contato ? contato.slice(0, 120) : null,
      telefone: telefone || null,
      observacoes: msg || null
    };
    // Formato antigo (usado só se as colunas novas ainda não existirem no banco)
    var detalhesLegado = [km, valor ? 'FAIXA DE VALOR: ' + valor : ''].filter(Boolean).join(' | ');
    var leadLegado = {
      nome: (contato ? nome + ' (CONTATO: ' + contato + ')' : nome).slice(0, 120),
      carro: carro.slice(0, 200),
      detalhes: detalhesLegado ? detalhesLegado.slice(0, 300) : null,
      cidade: cidade ? cidade.slice(0, 120) : null,
      telefone: telefone || null,
      observacoes: msg || null
    };
    salvarLead(leadNovo, leadLegado);

    // *texto* = negrito no WhatsApp
    var texto = 'Olá, Auto Capital Repasses! \ud83d\udc4b\n\nEstou procurando um carro, pode me ajudar a encontrar?\n\n';
    texto += '\ud83c\udfea Nome da Loja: *' + nome + '*\n';
    texto += '\ud83d\ude97 Carro que procura: *' + carro + '*\n';
    if (km) texto += '\ud83d\udccb Detalhes: *' + km + '*\n';
    if (valor) texto += '\ud83d\udcb0 Faixa de Valor: *' + valor + '*\n';
    if (cidade) texto += '\ud83d\udccd Cidade da Loja: *' + cidade + '*\n';
    if (contato) texto += '\ud83d\udc64 Nome do Contato: *' + contato + '*\n';
    if (telefone) texto += '\ud83d\udcde Telefone: *' + telefone + '*\n';
    if (msg) texto += '\ud83d\udcdd Obs: *' + msg + '*\n';
    texto += '\nAguardo retorno, obrigado!';

    window.open('https://wa.me/' + WPP + '?text=' + encodeURIComponent(texto), '_blank');
  };
})();
