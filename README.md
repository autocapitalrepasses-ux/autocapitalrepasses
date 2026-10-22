# Auto Capital Repasses

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
├── supabase/schema.sql    # tabela `leads` + RLS
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

## Passo a passo

### 1. Supabase
1. Crie um projeto em https://supabase.com.
2. **SQL Editor** > cole o conteúdo de `supabase/schema.sql` > **Run**.
3. **Project Settings > API**: copie a **Project URL** e a chave **anon public**.
   (Nunca use a `service_role` no site.)

### 2. GitHub
```bash
cd auto-capital-repasses
git init
git add .
git commit -m "Primeira versão do site"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/auto-capital-repasses.git
git push -u origin main
```

### 3. Netlify
1. **Add new site > Import an existing project > GitHub** e escolha o repositório.
2. Build command e publish directory já vêm do `netlify.toml` (`npm run build` / `dist`).
3. **Site configuration > Environment variables**, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. **Deploys > Trigger deploy**. A cada `git push` na `main` o site republica sozinho.

### Testar localmente
```bash
cp .env.example .env   # preencha os valores
npm run dev
```

## Ver os leads
Supabase > **Table Editor > leads**. A coluna `status` ajuda a organizar o atendimento.

## Depois do deploy
- Troque `og:image` em `src/index.html` por URL absoluta (ex.: `https://SEU-SITE.netlify.app/img/banner.jpg`) para o preview do WhatsApp/Instagram funcionar bem.
- Para domínio próprio: Netlify > Domain management.
