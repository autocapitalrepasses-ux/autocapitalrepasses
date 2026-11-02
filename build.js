// Copia src/ para dist/, injeta as variáveis do Supabase em dist/js/config.js
// e gera SEO (URL do site, robots.txt, sitemap.xml) e tags de campanha (GA4, Google Ads, Meta Pixel).
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

// ---------- SEO + campanhas ----------
// URL do site: SITE_URL (se você cadastrar) ou URL (o Netlify preenche sozinho).
let siteUrl = (process.env.SITE_URL || process.env.URL || '').trim().replace(/\/+$/, '');
if (!/^https?:\/\//.test(siteUrl)) {
  siteUrl = 'https://SEU-SITE.com.br';
  console.warn('[build] SITE_URL não definido: usando ' + siteUrl + '. Cadastre SITE_URL no Netlify com o endereço final do site (ex.: https://www.autohubrepasses.com.br).');
}

const ga4 = /^G-[A-Z0-9]+$/.test(process.env.GA4_ID || '') ? process.env.GA4_ID : '';
const ads = /^AW-\d+$/.test(process.env.GOOGLE_ADS_ID || '') ? process.env.GOOGLE_ADS_ID : '';
const pixel = /^\d{5,20}$/.test(process.env.META_PIXEL_ID || '') ? process.env.META_PIXEL_ID : '';
const gsc = /^[A-Za-z0-9_-]{20,100}$/.test(process.env.GOOGLE_SITE_VERIFICATION || '') ? process.env.GOOGLE_SITE_VERIFICATION : '';

let analytics = '';
const gtagId = ga4 || ads;
if (gtagId) {
  analytics += `<script async src="https://www.googletagmanager.com/gtag/js?id=${gtagId}"></script>\n` +
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());` +
    (ga4 ? `gtag('config','${ga4}');` : '') + (ads ? `gtag('config','${ads}');` : '') + `</script>\n`;
}
if (pixel) {
  analytics += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script');fbq('init','${pixel}');fbq('track','PageView');</script>\n`;
}

const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html
  .replace(/%%SITE_URL%%/g, siteUrl)
  .replace('%%ANALYTICS%%', analytics)
  .replace('%%GSC%%', gsc ? `<meta name="google-site-verification" content="${gsc}">` : '');
fs.writeFileSync(indexPath, html);

const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${hoje}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`);

console.log('[build] ok -> dist/' + (ga4 || ads || pixel ? ' (rastreamento ativo)' : ''));
