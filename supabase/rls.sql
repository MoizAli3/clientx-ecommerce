-- ============================================================
-- ClientX E-commerce — Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ─── Enable RLS on all tables ─────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.payment_logs  enable row level security;

-- ─── Helper: is current user an admin? ────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────
-- Users can read/update only their own profile; admins can read all
create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update role field (promote/demote)
create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin());

-- ─── categories ───────────────────────────────────────────────
-- Anyone (including anon) can read active categories
create policy "categories: public read"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin());

create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

-- ─── products ─────────────────────────────────────────────────
-- Anyone can read active products
create policy "products: public read"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update
  using (public.is_admin());

create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- ─── orders ───────────────────────────────────────────────────
-- Customers see only their own orders; admins see all
create policy "orders: owner read"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Authenticated users can create orders
create policy "orders: authenticated insert"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Only admins can update orders (status changes etc.)
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin());

-- No one can delete orders (audit trail)
-- (no delete policy = no deletes allowed)

-- ─── order_items ──────────────────────────────────────────────
create policy "order_items: owner read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_items: authenticated insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ─── payment_logs ─────────────────────────────────────────────
-- Only admins and service role can access payment logs
create policy "payment_logs: admin read"
  on public.payment_logs for select
  using (public.is_admin());

-- Inserts only via service role (server actions)
create policy "payment_logs: service insert"
  on public.payment_logs for insert
  with check (public.is_admin());

-- ─── Storage: product-images bucket ──────────────────────────
-- Anyone can view product images
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins can upload/delete product images
create policy "product-images: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
