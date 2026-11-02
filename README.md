# AutoHub Repasses

Site estático (HTML/CSS/JS puro) · leads salvos no **Supabase** · deploy no **Netlify** via **GitHub**.

## Estrutura

```
├── src/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js        # formulário -> salva lead + abre WhatsApp
│   │   └── config.js      # (sobrescrito no build com as env vars)
│   └── img/               # banner, logos e favicons
├── supabase/schema.sql    # tabela `leads` + RLS (já inclui todas as colunas)
├── build.js               # copia src -> dist e injeta config do Supabase
├── netlify.toml           # build, publish e headers
├── .env.example
└── package.json
```

## Como funciona o fluxo

1. Lojista preenche o formulário "Qual carro você precisa?".
2. `main.js` envia o pedido para a tabela `leads` do Supabase (em segundo plano).
3. Em seguida abre o WhatsApp (19) 99894-2563 com a mensagem pronta.
   Se o Supabase estiver fora do ar ou sem configuração, o WhatsApp abre normalmente.

## Passo a passo (publicação do zero, sem programar)

### 1. Supabase (banco de dados)
1. Em https://supabase.com crie um **New project** (anote a senha do banco).
2. Menu **SQL Editor > New query**, cole todo o conteúdo de `supabase/schema.sql` e clique **Run**.
3. Menu **Project Settings > API** (ou **API Keys**): copie a **Project URL** e a chave **anon public** (ou *publishable*). Nunca use a `service_role`.

### 2. GitHub (guardar os arquivos)
1. Em https://github.com clique em **New repository**, dê o nome `autohub-repasses` e crie (pode ser Private).
2. Extraia o zip no computador. Abra a pasta **AutoHub Repasses** e arraste o **conteúdo** dela (não a pasta) para a tela do repositório (**uploading an existing file**).
3. Confira que `package.json`, `netlify.toml`, `build.js` e a pasta `src` aparecem na raiz. Clique em **Commit changes**.

### 3. Netlify (colocar no ar)
1. **Add new site > Import an existing project > GitHub** e escolha o repositório.
2. Antes de clicar em Deploy, abra **Environment variables** e cadastre `SUPABASE_URL` e `SUPABASE_ANON_KEY` (e, se já tiver, as variáveis da seção SEO abaixo).
3. Cadastre também `SECRETS_SCAN_OMIT_KEYS` = `SUPABASE_URL,SUPABASE_ANON_KEY` (já vai no `netlify.toml`, mas não custa garantir). Sem isso o Netlify acusa "secrets found" e o build falha.
4. Clique **Deploy**. Cada envio novo ao GitHub gera um novo deploy (15 créditos), então junte as mudanças e envie de uma vez.

### Testar localmente (opcional)
```bash
cp .env.example .env   # preencha os valores
npm run dev
```

## Ver os leads
Supabase > **Table Editor > leads**. A coluna `status` ajuda a organizar o atendimento.

## Depois do deploy
- Para domínio próprio: Netlify > Domain management.

## SEO e campanhas

O build já gera, sozinho, tudo o que o Google precisa: título e descrição, URL canônica, preview para WhatsApp/Instagram/Facebook (imagem 1200x630), dados estruturados (schema.org), `robots.txt`, `sitemap.xml` e página 404.

Variáveis opcionais (Netlify > Site configuration > Environment variables). Veja `.env.example`:

| Variável | Para que serve |
|---|---|
| `SITE_URL` | Endereço final do site (ex.: `https://www.seudominio.com.br`). Se ficar vazio, usa a URL do Netlify. |
| `GA4_ID` | Google Analytics 4 (começa com `G-`) |
| `GOOGLE_ADS_ID` | Google Ads (começa com `AW-`) |
| `META_PIXEL_ID` | Meta Pixel, para anúncios no Instagram/Facebook |
| `GOOGLE_SITE_VERIFICATION` | Verificação do Google Search Console |

Eventos medidos (`src/js/track.js`): clique no Instagram, clique no WhatsApp, clique no e-mail e clique em "Enviar pelo WhatsApp" (formulário).

Depois de publicar: cadastre o site no Google Search Console, envie `SEU-SITE/sitemap.xml` e peça a indexação da página inicial. Para campanhas, use links com UTM (ex.: `?utm_source=instagram&utm_medium=cpc&utm_campaign=estoque`); o GA4 lê isso automaticamente.
