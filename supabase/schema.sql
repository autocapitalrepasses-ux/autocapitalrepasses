-- Rode no Supabase: SQL Editor > New query > Run

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null check (char_length(nome)    between 1 and 120),
  carro        text not null check (char_length(carro)   between 1 and 200),
  detalhes     text          check (char_length(detalhes)    <= 300),
  cidade       text          check (char_length(cidade)      <= 120),
  faixa_valor  text          check (char_length(faixa_valor) <= 120),
  contato      text          check (char_length(contato)     <= 120),
  telefone     text          check (char_length(telefone)    <= 40),
  observacoes  text          check (char_length(observacoes) <= 1000),
  status       text not null default 'novo' check (status in ('novo','em_contato','atendido','descartado'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Segurança: RLS ligado. O site (chave anon) só consegue INSERIR.
-- Ninguém de fora consegue ler, alterar ou apagar leads.
alter table public.leads enable row level security;

drop policy if exists "anon pode inserir leads" on public.leads;
create policy "anon pode inserir leads"
  on public.leads
  for insert
  to anon
  with check (status = 'novo');

-- Sem policy de SELECT/UPDATE/DELETE para anon = bloqueado.
-- Você vê os leads em Table Editor (logado no painel do Supabase).
