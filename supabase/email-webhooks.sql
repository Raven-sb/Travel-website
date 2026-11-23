-- Vietnam4trip — email thông báo qua Edge Function.
-- Chạy file này SAU khi đã deploy function notify-email và đặt secrets.
-- Xem hướng dẫn đầy đủ trong supabase/README.md (mục 9).

create extension if not exists pg_net with schema extensions;

-- Gọi Edge Function bất đồng bộ khi có bản ghi mới. Dữ liệu email nằm trong
-- payload, nên function KHÔNG cần service_role key.
create or replace function public.v4t_notify_email_webhook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'v4t_site_url';
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'v4t_webhook_secret';

  -- Chưa cấu hình secrets → bỏ qua, không làm ảnh hưởng đến thao tác của khách.
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := v_url || '/functions/v1/notify-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      'type', tg_op,
      'table', tg_table_name,
      'schema', tg_table_schema,
      'record', to_jsonb(new),
      'old_record', null
    )
  );
  return new;
end;
$$;

drop trigger if exists v4t_booking_email on public.bookings;
create trigger v4t_booking_email
after insert on public.bookings
for each row execute function public.v4t_notify_email_webhook();

drop trigger if exists v4t_subscriber_email on public.subscribers;
create trigger v4t_subscriber_email
after insert on public.subscribers
for each row execute function public.v4t_notify_email_webhook();
