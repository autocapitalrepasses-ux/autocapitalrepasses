-- ATUALIZAÇÃO (rode UMA vez, ANTES de publicar o site novo)
-- Supabase > SQL Editor > New query > cole tudo > Run
-- Seguro para rodar de novo: não apaga nem altera leads existentes.

alter table public.leads
  add column if not exists faixa_valor text check (char_length(faixa_valor) <= 120),
  add column if not exists contato     text check (char_length(contato)     <= 120);

-- Nada a mudar em segurança: o RLS e a policy de INSERT continuam valendo
-- para as colunas novas (anon só insere; ninguém de fora lê/edita/apaga).
