-- ============================================================
-- CLUBE DE VINHOS — Schema Supabase / PostgreSQL
-- Executar no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. PROFILES (extensão da tabela auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now()
);

-- Trigger para criar perfil automaticamente ao registar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. PRODUCTS (inventário + flag de visibilidade)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  stock integer not null default 0,
  imagem_url text,
  regiao text,
  ano integer,
  casta text,
  tipo text check (tipo in ('tinto', 'branco', 'rosé', 'espumante', 'sobremesa')),
  visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger para updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- 3. ORDERS (encomendas)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pendente' check (status in ('pendente','confirmado','enviado','entregue','cancelado')),
  total numeric(10,2) not null default 0,
  notas text,
  morada_entrega text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();


-- 4. ORDER_ITEMS (linhas de encomenda)
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null,
  created_at timestamptz default now()
);


-- 5. REVIEWS (feed social)
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  nota integer not null check (nota between 1 and 5),
  comentario text,
  foto_url text,
  likes_count integer not null default 0,
  created_at timestamptz default now()
);


-- 6. REVIEW_LIKES (para evitar likes duplicados)
create table public.review_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  primary key (user_id, review_id)
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;

-- Helper para verificar se é admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- PROFILES
create policy "Utilizadores autenticados vêem perfis" on public.profiles
  for select using (auth.uid() is not null);
create policy "Utilizador edita o seu perfil" on public.profiles
  for update using (auth.uid() = id);

-- PRODUCTS
-- Uma única política SELECT: admins vêem tudo, membros só os visíveis
create policy "SELECT products" on public.products
  for select using (
    auth.uid() is not null
    and (visible = true or public.is_admin())
  );
create policy "Admins inserem produtos" on public.products
  for insert with check (public.is_admin());
create policy "Admins atualizam produtos" on public.products
  for update using (public.is_admin());
create policy "Admins apagam produtos" on public.products
  for delete using (public.is_admin());

-- ORDERS
create policy "Utilizador vê as suas encomendas" on public.orders
  for select using (auth.uid() = user_id);
create policy "Utilizador cria encomendas" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "Admins vêem todas as encomendas" on public.orders
  for select using (public.is_admin());
create policy "Admins atualizam encomendas" on public.orders
  for update using (public.is_admin());

-- ORDER_ITEMS
create policy "Utilizador vê itens das suas encomendas" on public.order_items
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Utilizador insere itens" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Admins vêem todos os itens" on public.order_items
  for select using (public.is_admin());

-- REVIEWS
create policy "Membros vêem reviews" on public.reviews
  for select using (auth.uid() is not null);
create policy "Membros criam reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Utilizador edita a sua review" on public.reviews
  for update using (auth.uid() = user_id);
create policy "Utilizador apaga a sua review" on public.reviews
  for delete using (auth.uid() = user_id);

-- REVIEW_LIKES
create policy "Membros vêem likes" on public.review_likes
  for select using (auth.uid() is not null);
create policy "Membros dão/removem likes" on public.review_likes
  for all using (auth.uid() = user_id);


-- ============================================================
-- DADOS DE EXEMPLO (opcional — remover em produção)
-- ============================================================
-- Nota: Para criar o primeiro admin, depois de registar o utilizador,
-- executar no SQL Editor:
-- update public.profiles set role = 'admin' where id = '<uuid-do-utilizador>';
