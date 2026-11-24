-- Vietnam4trip — Supabase schema
-- Chạy TOÀN BỘ file này trong Supabase → SQL Editor → New query → Run.
-- File an toàn chạy lại nhiều lần (if not exists / drop policy if exists / create or replace).
-- Bao gồm: tour + nội dung chỉnh sửa, đơn đặt, tài khoản admin, tin nhắn chat,
-- RLS, Realtime publication và các hàm create_booking / grant_admin / mark_*_read.

create extension if not exists pgcrypto;

-- 1. Bảng tour ------------------------------------------------------------

create table if not exists public.tours (
  id text primary key,
  price integer not null check (price between 100000 and 200000000),
  title_vi text not null default ''
);

insert into public.tours (id, price, title_vi) values
  ('halong-cruise-2n1d', 2890000, 'Du thuyền Hạ Long 2N1Đ: Ngủ giữa di sản'),
  ('sapa-valley-3n2d', 3590000, 'Sa Pa & thung lũng Mường Hoa 3N2Đ'),
  ('hoian-lanterns-4n3d', 4990000, 'Hội An – Đèn lồng & làng nghề 4N3Đ'),
  ('hue-heritage-2n1d', 2190000, 'Di sản cố đô Huế 2N1Đ'),
  ('danang-bana-3n2d', 3290000, 'Đà Nẵng – Bà Nà & biển Mỹ Khê 3N2Đ'),
  ('phuquoc-island-4n3d', 6490000, 'Phú Quốc: Biển xanh & hoàng hôn 4N3Đ'),
  ('nhatrang-bay-3n2d', 3890000, 'Nha Trang – Vịnh Ninh Vân 3N2Đ'),
  ('ninhbinh-day-1d', 890000, 'Ninh Bình: Tràng An – Hang Múa 1 ngày'),
  ('hagiang-loop-3n2d', 2990000, 'Hà Giang Loop: Mã Pí Lèng huyền thoại 3N2Đ'),
  ('mekong-delta-2n1d', 1990000, 'Đồng bằng sông Cửu Long 2N1Đ'),
  ('dalat-highlands-3n2d', 2790000, 'Đà Lạt: Săn mây & thông reo 3N2Đ')
on conflict (id) do update set price = excluded.price, title_vi = excluded.title_vi;

create table if not exists public.tour_overrides (
  tour_id text primary key references public.tours(id) on delete cascade,
  price integer check (price between 100000 and 200000000),
  active boolean,
  featured boolean,
  updated_at timestamptz not null default now()
);

-- Nội dung tour chỉnh sửa được trong admin. Lưu dạng jsonb một phần:
-- chỉ các khoá có trong object này sẽ đè lên js/data.js ở trình duyệt.
-- KHÔNG lưu price/active/featured ở đây (đã có tour_overrides).
create table if not exists public.tour_content (
  tour_id text primary key references public.tours(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Đơn đặt tour ---------------------------------------------------------

create table if not exists public.bookings (
  code text primary key,
  created_at timestamptz not null default now(),
  tour_id text not null,
  tour_title text not null,
  "date" date not null,
  adults integer not null check (adults between 1 and 20),
  children integer not null default 0 check (children between 0 and 10),
  subtotal integer not null,
  discount integer not null default 0,
  promo text not null default '',
  total integer not null,
  payment text not null default 'later' check (payment in ('later', 'card', 'transfer')),
  status text not null default 'new' check (status in ('new', 'confirmed', 'done', 'cancelled')),
  note text not null default '',
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_country text not null default 'vn',
  contact_requests text not null default ''
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- 3. Tài khoản quản trị ---------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

-- 4. Tin nhắn chat khách ↔ admin ------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread text not null,
  sender text not null check (sender in ('customer', 'admin')),
  customer_uid uuid,
  author_name text not null default '',
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  admin_read boolean not null default false,
  customer_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ẩn hội thoại phía ADMIN (xóa mềm): deleted_at khác null = tin thuộc hội thoại
-- đã được admin ẩn cho gọn danh sách. Khách VẪN thấy toàn bộ tin nhắn.
alter table public.messages add column if not exists deleted_at timestamptz;

create index if not exists messages_thread_created_idx on public.messages (thread, created_at);
create index if not exists messages_admin_unread_idx on public.messages (admin_read) where admin_read = false;
create index if not exists messages_visible_idx on public.messages (thread, created_at) where deleted_at is null;

-- 4b. Đăng ký nhận tin -----------------------------------------------------

create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- 5. Phân quyền -----------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins a where a.user_id = auth.uid()) $$;

-- Quản trị tối cao: chỉ tài khoản ĐĂNG NHẬP bằng email này được xóa vĩnh viễn.
-- So sánh với email trong JWT (email đăng nhập thật), không phụ thuộc cột
-- admins.email (có thể lỡ nhập khác lúc tạo tài khoản).
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin()
     and lower(coalesce(auth.jwt() ->> 'email', '')) = 'khanhquang94cva@gmail.com'
$$;

alter table public.tours enable row level security;
alter table public.tour_overrides enable row level security;
alter table public.tour_content enable row level security;
alter table public.bookings enable row level security;
alter table public.admins enable row level security;
alter table public.messages enable row level security;
alter table public.subscribers enable row level security;

-- Tour: mọi người đọc, admin sửa
drop policy if exists "tours read" on public.tours;
create policy "tours read" on public.tours for select using (true);

drop policy if exists "tours write admin" on public.tours;
create policy "tours write admin" on public.tours for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "overrides read" on public.tour_overrides;
create policy "overrides read" on public.tour_overrides for select using (true);

drop policy if exists "overrides write" on public.tour_overrides;
create policy "overrides write" on public.tour_overrides for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "content read" on public.tour_content;
create policy "content read" on public.tour_content for select using (true);

drop policy if exists "content write admin" on public.tour_content;
create policy "content write admin" on public.tour_content for all
  using (public.is_admin()) with check (public.is_admin());

-- Đơn: khách tạo qua hàm create_booking, admin đọc/sửa/xóa
drop policy if exists "bookings read admin" on public.bookings;
create policy "bookings read admin" on public.bookings for select using (public.is_admin());

drop policy if exists "bookings update admin" on public.bookings;
create policy "bookings update admin" on public.bookings for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bookings delete admin" on public.bookings;
create policy "bookings delete admin" on public.bookings for delete using (public.is_admin());

-- Admin: tự xem mình, admin xem tất cả; chỉ xóa người khác
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select using (public.is_admin() or user_id = auth.uid());

drop policy if exists "admins delete others" on public.admins;
create policy "admins delete others" on public.admins for delete
  using (public.is_admin() and user_id <> auth.uid());

-- Chat: khách (đăng nhập ẩn danh) chỉ thấy tin của chính mình; admin thấy tất cả.
-- INSERT không mở trực tiếp cho client mà đi qua RPC có giới hạn tần suất.
drop policy if exists "messages read" on public.messages;
create policy "messages read" on public.messages for select
  using (public.is_admin() or customer_uid = auth.uid());

drop policy if exists "messages customer insert" on public.messages;
drop policy if exists "messages admin insert" on public.messages;

drop policy if exists "messages admin update" on public.messages;
create policy "messages admin update" on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "messages admin delete" on public.messages;
create policy "messages admin delete" on public.messages for delete to authenticated
  using (public.is_super_admin());

-- Để Realtime gửi kèm toàn bộ dòng cũ khi DELETE (client xóa đúng tin).
alter table public.messages replica identity full;

-- Newsletter: chỉ admin đọc danh sách; khách gửi qua RPC subscribe_newsletter.
drop policy if exists "subscribers read admin" on public.subscribers;
create policy "subscribers read admin" on public.subscribers for select
  using (public.is_admin());

grant select on public.tours, public.tour_overrides, public.tour_content to anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select on public.admins to authenticated;
grant select, update, delete on public.messages to authenticated;
grant select on public.subscribers to authenticated;
grant select, insert, update, delete on public.tours to authenticated;
grant select, insert, update, delete on public.tour_overrides to authenticated;
grant select, insert, update, delete on public.tour_content to authenticated;

-- 6. Hàm tạo đơn: khách gọi trực tiếp, giá do DB tính lại -----------------

create or replace function public.create_booking(
  p_tour_id text,
  p_date date,
  p_adults integer,
  p_children integer,
  p_payment text,
  p_promo text,
  p_name text,
  p_email text,
  p_phone text,
  p_country text default 'vn',
  p_requests text default ''
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_price integer;
  v_active boolean;
  v_title text;
  v_subtotal integer;
  v_discount integer;
  v_total integer;
  v_code text;
  v_promo text := upper(trim(coalesce(p_promo, '')));
  v_name text := trim(coalesce(p_name, ''));
  v_email text := trim(coalesce(p_email, ''));
  v_phone text := trim(coalesce(p_phone, ''));
begin
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Vui lòng nhập họ tên (2–80 ký tự)';
  end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'Email không hợp lệ';
  end if;
  if regexp_replace(v_phone, '[\s().-]', '', 'g') !~ '^\+?\d{8,15}$' then
    raise exception 'Số điện thoại không hợp lệ';
  end if;
  if p_adults is null or p_adults < 1 or p_adults > 20 then
    raise exception 'Số người lớn không hợp lệ';
  end if;
  if p_children is null or p_children < 0 or p_children > 10 then
    raise exception 'Số trẻ em không hợp lệ';
  end if;
  if p_payment not in ('later', 'card', 'transfer') then
    raise exception 'Hình thức thanh toán không hợp lệ';
  end if;
  if p_date is null or p_date < current_date + 1 then
    raise exception 'Ngày khởi hành phải từ ngày mai trở đi';
  end if;

  -- Chống spam: tối đa 5 đơn / email / giờ và 3 đơn / số điện thoại / giờ.
  if (select count(*) from public.bookings b
       where lower(b.contact_email) = lower(v_email)
         and b.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Bạn đã gửi quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau ít phút.';
  end if;
  if (select count(*) from public.bookings b
       where regexp_replace(b.contact_phone, '[\s().-]', '', 'g') =
             regexp_replace(v_phone, '[\s().-]', '', 'g')
         and b.created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Bạn đã gửi quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau ít phút.';
  end if;

  select coalesce(o.price, t.price), t.title_vi, o.active
  into v_price, v_title, v_active
  from public.tours t
  left join public.tour_overrides o on o.tour_id = t.id
  where t.id = p_tour_id;

  if v_price is null then
    raise exception 'Tour không tồn tại';
  end if;
  -- Giá/tiêu đề luôn lấy từ tours + tour_overrides, không lấy từ tour_content
  -- để tránh lệch giữa nội dung admin sửa và giá lúc khách đặt.
  if v_active = false then
    raise exception 'Tour này hiện không mở bán';
  end if;

  v_subtotal := p_adults * v_price + p_children * round(v_price * 0.6)::integer;
  v_discount := case when v_promo = 'VIETNAM10' then round(v_subtotal * 0.1)::integer else 0 end;
  v_total := v_subtotal - v_discount;

  loop
    v_code := 'V4T-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.bookings b where b.code = v_code);
  end loop;

  insert into public.bookings (
    code, tour_id, tour_title, "date", adults, children,
    subtotal, discount, promo, total, payment,
    contact_name, contact_email, contact_phone, contact_country, contact_requests
  ) values (
    v_code, p_tour_id, coalesce(v_title, p_tour_id), p_date, p_adults, p_children,
    v_subtotal, v_discount, case when v_discount > 0 then 'VIETNAM10' else '' end, v_total, p_payment,
    v_name, v_email, v_phone, coalesce(nullif(trim(p_country), ''), 'vn'), trim(coalesce(p_requests, ''))
  );

  return jsonb_build_object(
    'code', v_code,
    'total', v_total,
    'date', p_date,
    'adults', p_adults,
    'children', p_children
  );
end;
$$;

revoke all on function public.create_booking(text, date, integer, integer, text, text, text, text, text, text, text) from public;
grant execute on function public.create_booking(text, date, integer, integer, text, text, text, text, text, text, text) to anon, authenticated;

-- 7. Hàm cấp quyền admin --------------------------------------------------

create or replace function public.grant_admin(p_email text, p_display_name text default '')
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  select u.id into v_uid from auth.users u where lower(u.email) = v_email;
  if v_uid is null then
    raise exception 'Chưa có tài khoản với email %. Hãy tạo người dùng trong Supabase → Authentication → Users trước.', v_email;
  end if;
  insert into public.admins (user_id, email, display_name)
  values (v_uid, v_email, coalesce(nullif(trim(p_display_name), ''), split_part(v_email, '@', 1)))
  on conflict (user_id) do update set display_name = excluded.display_name;
  return jsonb_build_object('user_id', v_uid, 'email', v_email);
end;
$$;

revoke all on function public.grant_admin(text, text) from public, anon;
grant execute on function public.grant_admin(text, text) to authenticated;

-- 8. Hàm đánh dấu đã đọc --------------------------------------------------

create or replace function public.mark_thread_read(p_thread text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  update public.messages set admin_read = true
   where thread = p_thread and admin_read = false;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.mark_thread_read(text) from public, anon;
grant execute on function public.mark_thread_read(text) to authenticated;

create or replace function public.mark_customer_read(p_thread text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not exists (
    select 1 from public.messages m
    where m.thread = p_thread and m.customer_uid = auth.uid()
  ) then
    raise exception 'Không tìm thấy cuộc hội thoại';
  end if;
  update public.messages set customer_read = true
   where thread = p_thread and customer_uid = auth.uid() and customer_read = false;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.mark_customer_read(text) from public, anon;
grant execute on function public.mark_customer_read(text) to authenticated;

-- 8b. Gửi tin nhắn có giới hạn tần suất -----------------------------------

create or replace function public.send_customer_message(
  p_thread text,
  p_name text,
  p_body text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_name text := btrim(coalesce(p_name, ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Phiên trò chuyện chưa sẵn sàng';
  end if;
  if length(v_body) < 1 or length(v_body) > 2000 then
    raise exception 'Tin nhắn phải từ 1 đến 2000 ký tự';
  end if;
  -- Tối đa 8 tin nhắn / khách / phút.
  if (select count(*) from public.messages m
       where m.customer_uid = v_uid
         and m.sender = 'customer'
         and m.created_at > now() - interval '1 minute') >= 8 then
    raise exception 'Bạn gửi tin nhắn hơi nhanh. Vui lòng đợi một chút.';
  end if;

  insert into public.messages (thread, sender, customer_uid, author_name, body)
  values (p_thread, 'customer', v_uid, coalesce(nullif(v_name, ''), 'Khách'), v_body)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id, 'thread', p_thread, 'sender', 'customer',
    'author_name', coalesce(nullif(v_name, ''), 'Khách'), 'body', v_body
  );
end;
$$;

revoke all on function public.send_customer_message(text, text, text) from public;
grant execute on function public.send_customer_message(text, text, text) to anon, authenticated;

create or replace function public.send_admin_reply(
  p_thread text,
  p_body text,
  p_name text default ''
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_name text := btrim(coalesce(p_name, ''));
  v_customer_uid uuid;
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  if length(v_body) < 1 or length(v_body) > 2000 then
    raise exception 'Tin nhắn phải từ 1 đến 2000 ký tự';
  end if;

  -- Quan trọng: gắn uid của khách vào tin admin để RLS cho khách thấy tin trả lời.
  select m.customer_uid into v_customer_uid
  from public.messages m
  where m.thread = p_thread and m.customer_uid is not null
  order by m.created_at asc
  limit 1;

  if v_customer_uid is null then
    raise exception 'Không tìm thấy khách của cuộc hội thoại này';
  end if;

  insert into public.messages (thread, sender, customer_uid, author_name, body)
  values (p_thread, 'admin', v_customer_uid, coalesce(nullif(v_name, ''), 'Admin'), v_body)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id, 'thread', p_thread, 'sender', 'admin',
    'author_name', coalesce(nullif(v_name, ''), 'Admin'), 'body', v_body
  );
end;
$$;

revoke all on function public.send_admin_reply(text, text, text) from public, anon;
grant execute on function public.send_admin_reply(text, text, text) to authenticated;

-- 8b2. Admin ẩn / hiện lại hội thoại (xóa mềm, chỉ phía admin) -------------
-- delete_thread đặt deleted_at cho mọi tin của hội thoại → ẩn khỏi danh sách
-- admin; khách vẫn thấy. restore_thread bỏ deleted_at để hiện lại.
-- delete_message / restore_message: cấp từng tin (dự phòng, UI hiện không dùng).

create or replace function public.delete_message(p_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  update public.messages set deleted_at = now()
   where id = p_id and deleted_at is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.delete_message(uuid) from public, anon;
grant execute on function public.delete_message(uuid) to authenticated;

create or replace function public.delete_thread(p_thread text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  update public.messages set deleted_at = now()
   where thread = p_thread and deleted_at is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.delete_thread(text) from public, anon;
grant execute on function public.delete_thread(text) to authenticated;

create or replace function public.restore_message(p_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  update public.messages set deleted_at = null
   where id = p_id and deleted_at is not null;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.restore_message(uuid) from public, anon;
grant execute on function public.restore_message(uuid) to authenticated;

create or replace function public.restore_thread(p_thread text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Bạn không có quyền thực hiện thao tác này';
  end if;
  update public.messages set deleted_at = null
   where thread = p_thread and deleted_at is not null;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.restore_thread(text) from public, anon;
grant execute on function public.restore_thread(text) to authenticated;

-- Xóa VĨNH VIỄN hội thoại đã ẩn: chỉ quản trị tối cao, và chỉ khi toàn bộ
-- tin của hội thoại đã được ẩn (deleted_at khác null). Không thể khôi phục.
create or replace function public.purge_thread(p_thread text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if not public.is_super_admin() then
    raise exception 'Chỉ tài khoản quản trị tối cao mới được xóa vĩnh viễn';
  end if;
  if exists (
    select 1 from public.messages
    where thread = p_thread and deleted_at is null
  ) then
    raise exception 'Chỉ xóa vĩnh viễn được hội thoại đã ẩn toàn bộ';
  end if;
  delete from public.messages where thread = p_thread;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.purge_thread(text) from public, anon;
grant execute on function public.purge_thread(text) to authenticated;

-- Sửa các câu trả lời cũ bị vô hình do customer_uid = null.
update public.messages a
set customer_uid = c.customer_uid
from (
  select distinct on (thread) thread, customer_uid
  from public.messages
  where customer_uid is not null
  order by thread, created_at asc
) c
where a.thread = c.thread
  and a.customer_uid is null
  and a.sender = 'admin';

-- 8c. Đăng ký nhận tin -----------------------------------------------------

create or replace function public.subscribe_newsletter(p_email text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'Email không hợp lệ';
  end if;
  insert into public.subscribers (email) values (v_email)
  on conflict (email) do nothing;
  return jsonb_build_object('email', v_email);
end;
$$;

revoke all on function public.subscribe_newsletter(text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;

-- 9. Bật Realtime cho các bảng cần cập nhật tức thì -----------------------

do $$ begin alter publication supabase_realtime add table public.tours; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.bookings; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tours; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tour_overrides; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tour_content; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;

-- 10. Tài khoản admin đầu tiên --------------------------------------------
-- Supabase → Authentication → Users → Add user (bật Auto Confirm User),
-- rồi chạy (thay email):
--   insert into public.admins (user_id, email, display_name)
--   select id, email, 'Chủ Vietnam4trip' from auth.users
--   where email = 'email-cua-ban@example.com';
--
-- Chat khách cần bật: Supabase → Authentication → Providers → Allow anonymous sign-ins.
