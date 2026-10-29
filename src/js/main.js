(function () {
  var WPP = '5519998942563'; // (19) 99894-2563
  var cfg = window.APP_CONFIG || {};

  // Emojis definidos pelo codigo Unicode: nao dependem da codificacao do arquivo.
  var E = {
    ola: String.fromCodePoint(0x1F44B),       // maozinha
    loja: String.fromCodePoint(0x1F3EA),      // loja
    carro: String.fromCodePoint(0x1F697),     // carro
    detalhes: String.fromCodePoint(0x1F4CA),  // grafico
    valor: String.fromCodePoint(0x1F4B0),     // dinheiro
    cidade: String.fromCodePoint(0x1F4CD),    // pino de mapa
    pessoa: String.fromCodePoint(0x1F464),    // pessoa
    telefone: String.fromCodePoint(0x1F4DE),  // telefone
    obs: String.fromCodePoint(0x1F4DD)        // bloco de notas
  };

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  // Salva o lead no Supabase. Nunca bloqueia o envio ao WhatsApp.
  // Tenta gravar nas colunas novas (faixa_valor, contato). Se o banco ainda nao tiver
  // essas colunas, regrava no formato antigo para o lead nao se perder.
  function salvarLead(lead, leadLegado) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return;
    var headers = {
      'Content-Type': 'application/json',
      'apikey': cfg.SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    };
    // Chave antiga (anon, comeca com "eyJ") vai tambem no Authorization.
    // Chave nova (publishable, comeca com "sb_publishable_") so em apikey.
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
        }).catch(function (e) { console.warn('Lead n\u00e3o salvo:', e); });
      } catch (e) {
        console.warn('Lead n\u00e3o salvo:', e);
      }
    }
    enviar(lead, !!leadLegado);
  }

  // Maiusculo (o campo ja aparece assim na tela, aqui garantimos no texto enviado/salvo)
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
    if (!carro) { alert('Conte qual carro voc\u00ea procura.'); return; }

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
    // Formato antigo (usado so se as colunas novas ainda nao existirem no banco)
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
    var linhas = [];
    linhas.push('Ol\u00e1, AutoHub Repasses! ' + E.ola);
    linhas.push('');
    linhas.push('Estou procurando um carro, pode me ajudar a encontrar?');
    linhas.push('');
    linhas.push(E.loja + ' Nome da Loja: *' + nome + '*');
    linhas.push(E.carro + ' Carro que procura: *' + carro + '*');
    if (km) linhas.push(E.detalhes + ' Detalhes: *' + km + '*');
    if (valor) linhas.push(E.valor + ' Faixa de Valor: *' + valor + '*');
    if (cidade) linhas.push(E.cidade + ' Cidade da Loja: *' + cidade + '*');
    if (contato) linhas.push(E.pessoa + ' Nome do Contato: *' + contato + '*');
    if (telefone) linhas.push(E.telefone + ' Telefone: *' + telefone + '*');
    if (msg) linhas.push(E.obs + ' Obs: *' + msg + '*');
    linhas.push('');
    linhas.push('Aguardo retorno, obrigado!');
    var texto = linhas.join('\n');

    // Link direto da API do WhatsApp (o wa.me so redireciona para este mesmo endereco)
    window.open('https://api.whatsapp.com/send?phone=' + WPP + '&text=' + encodeURIComponent(texto), '_blank');
  };
})();
