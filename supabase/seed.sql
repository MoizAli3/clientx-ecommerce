-- ============================================================
-- ClientX Watches — Seed Data
-- Run after schema.sql + rls.sql
-- ============================================================

-- Clear existing data
delete from public.order_items;
delete from public.orders;
delete from public.products;
delete from public.categories;

-- Watch categories
insert into public.categories (name, slug, sort_order) values
  ('Luxury Watches',  'luxury-watches',  1),
  ('Sports Watches',  'sports-watches',  2),
  ('Casual Watches',  'casual-watches',  3),
  ('Smart Watches',   'smart-watches',   4),
  ('Ladies Watches',  'ladies-watches',  5)
on conflict (slug) do nothing;

-- Watch products with Unsplash images
do $$
declare
  lux_id     uuid;
  sport_id   uuid;
  casual_id  uuid;
  smart_id   uuid;
  ladies_id  uuid;
begin
  select id into lux_id    from public.categories where slug = 'luxury-watches';
  select id into sport_id  from public.categories where slug = 'sports-watches';
  select id into casual_id from public.categories where slug = 'casual-watches';
  select id into smart_id  from public.categories where slug = 'smart-watches';
  select id into ladies_id from public.categories where slug = 'ladies-watches';

  insert into public.products (name, slug, description, price, sale_price, stock, sku, category_id, images) values
    (
      'Royal Chronograph Black',
      'royal-chronograph-black',
      'Elegant black dial chronograph with sapphire crystal glass. Swiss movement, stainless steel case. Ek baar pehn lo — duniya dekhti reh jaye. Water resistant 50m, 2 saal ki warranty.',
      45000, 38000, 12, 'LW-RCB-001', lux_id,
      array[
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
        'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=90'
      ]
    ),
    (
      'Prestige Gold Automatic',
      'prestige-gold-automatic',
      ' 18K gold plated case with automatic movement. Genuine leather strap, exhibition caseback. Luxury jo aapki shaan badhaaye. Lifetime servicing available.',
      85000, null, 6, 'LW-PGA-001', lux_id,
      array[
        'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90'
      ]
    ),
    (
      'Elite Dress Watch Silver',
      'elite-dress-watch-silver',
      'Ultra-thin dress watch with silver case. Roman numeral dial, genuine calfskin strap. Office se shaadi tak — har occasion ke liye perfect.',
      32000, 26500, 18, 'LW-EDS-001', lux_id,
      array[
        'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=90',
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90'
      ]
    ),
    (
      'ProDiver 300M',
      'prodiver-300m',
      'Professional diving watch, 300m water resistant. Unidirectional rotating bezel, luminous hands. Adventure ke liye banai gayi. ISO 6425 certified diver''s watch.',
      28000, 22000, 20, 'SW-PD3-001', sport_id,
      array[
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=90',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=90'
      ]
    ),
    (
      'Speedmaster Chronograph',
      'speedmaster-chronograph',
      'Racing-inspired chronograph with tachymeter bezel. Stopwatch function, date display. Speed, precision, style — teeno ek saath. Silicone + steel bracelet included.',
      18500, null, 25, 'SW-SCH-001', sport_id,
      array[
        'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=90',
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90'
      ]
    ),
    (
      'Field Watch Military Green',
      'field-watch-military-green',
      'Rugged military-style field watch. Canvas strap, scratch-resistant mineral crystal. Tough aur dependable — just like you. 100m water resistance.',
      9500, 7800, 35, 'SW-FWM-001', sport_id,
      array[
        'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90'
      ]
    ),
    (
      'Classic Minimalist White',
      'classic-minimalist-white',
      'Clean white dial with slim profile. Japanese quartz movement, mesh bracelet. Simple hai magar powerful impression chhoda hai. Har outfit ke saath match karta hai.',
      6500, 5200, 50, 'CW-CMW-001', casual_id,
      array[
        'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=90',
        'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=90'
      ]
    ),
    (
      'Urban Leather Brown',
      'urban-leather-brown',
      'Classic brown leather strap with bronze case. Vintage-inspired design, day-date display. City ki raunak mein tumhara companion. Perfect everyday casual watch.',
      7800, null, 40, 'CW-ULB-001', casual_id,
      array[
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90',
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90'
      ]
    ),
    (
      'SmartPro X5',
      'smartpro-x5',
      'Advanced smartwatch with health monitoring. Heart rate, SpO2, sleep tracking, GPS. Aapki sehat ka guardian. 7-day battery, AMOLED display, 100+ watch faces.',
      35000, 28000, 30, 'SMW-SPX5-001', smart_id,
      array[
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=90',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=90'
      ]
    ),
    (
      'FitBand Pro Ultra',
      'fitband-pro-ultra',
      'Smart fitness band with always-on display. Step counter, calories, WhatsApp notifications. Fitness aur style dono ek saath. Waterproof, 14-day battery life.',
      12000, 9500, 45, 'SMW-FBP-001', smart_id,
      array[
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90',
        'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=90'
      ]
    ),
    (
      'Rose Gold Diamond Ladies',
      'rose-gold-diamond-ladies',
      'Stunning rose gold case with crystal accents. Mother of pearl dial, butterfly clasp bracelet. Har khaas mauqe ke liye bani hai. Comes in premium gift box.',
      22000, 17500, 15, 'LDW-RGD-001', ladies_id,
      array[
        'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90',
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90'
      ]
    ),
    (
      'Pearl Ceramic White Ladies',
      'pearl-ceramic-white-ladies',
      'Elegant ceramic white bracelet watch. Diamond-cut indices, sapphire crystal. Nazakat aur khoobsurti ka sangam. Lightweight, hypoallergenic ceramic.',
      16500, null, 20, 'LDW-PCW-001', ladies_id,
      array[
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90'
      ]
    )
  on conflict (slug) do nothing;
end $$;
