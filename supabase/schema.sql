-- ============================================================
-- ClientX E-commerce — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── ENUM types ───────────────────────────────────────────────
create type order_status as enum (
  'pending',
  'payment_pending',
  'payment_failed',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type payment_method as enum (
  'jazzcash',
  'easypaisa',
  'cod'
);

create type user_role as enum (
  'customer',
  'admin'
);

-- ─── profiles ─────────────────────────────────────────────────
-- Extends auth.users (one-to-one)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        user_role not null default 'customer',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── categories ───────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── products ─────────────────────────────────────────────────
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text not null default '',
  price         numeric(10,2) not null check (price >= 0),
  sale_price    numeric(10,2) check (sale_price >= 0),
  stock         int not null default 0 check (stock >= 0),
  sku           text not null unique,
  category_id   uuid not null references public.categories(id) on delete restrict,
  images        text[] not null default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);
create index products_is_active_idx on public.products(is_active);

-- ─── orders ───────────────────────────────────────────────────
create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text not null unique,
  user_id             uuid not null references public.profiles(id) on delete restrict,
  status              order_status not null default 'pending',
  payment_method      payment_method not null,
  payment_reference   text,
  subtotal            numeric(10,2) not null check (subtotal >= 0),
  shipping_fee        numeric(10,2) not null default 0 check (shipping_fee >= 0),
  total               numeric(10,2) not null check (total >= 0),
  -- JSONB shipping address
  shipping_address    jsonb not null,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

-- ─── order_items ──────────────────────────────────────────────
create table public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  quantity     int not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  total_price  numeric(10,2) not null check (total_price >= 0)
);

create index order_items_order_idx on public.order_items(order_id);

-- ─── payment_logs ─────────────────────────────────────────────
-- Stores raw gateway callbacks for debugging
create table public.payment_logs (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references public.orders(id) on delete set null,
  gateway     text not null,              -- 'jazzcash' | 'easypaisa'
  direction   text not null,              -- 'request' | 'callback'
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

-- ─── updated_at triggers ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ─── Storage buckets ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
