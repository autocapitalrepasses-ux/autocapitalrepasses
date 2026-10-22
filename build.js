// Copia src/ para dist/ e injeta as variáveis do Supabase em dist/js/config.js.
// Roda no Netlify (npm run build) e localmente. Sem dependências externas.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

// Carrega .env local (opcional, só para testes na sua máquina)
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(SRC, DIST, { recursive: true });

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.warn('[build] SUPABASE_URL / SUPABASE_ANON_KEY não definidos: leads NÃO serão salvos (o WhatsApp continua funcionando).');
}

const config = `window.APP_CONFIG = ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key }, null, 2)};\n`;
fs.writeFileSync(path.join(DIST, 'js', 'config.js'), config);

console.log('[build] ok -> dist/');
