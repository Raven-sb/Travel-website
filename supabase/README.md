# Vietnam4trip — Supabase Realtime (khách ↔ admin)

Website tĩnh + Supabase làm backend: đơn đặt tour, nội dung tour, tài khoản admin
và tin nhắn chat đều nằm trên Supabase. Khách và admin thấy thay đổi **ngay lập tức**
nhờ Supabase Realtime.

## 1. Tạo project (nếu chưa có)

https://supabase.com → **New project** → region **Southeast Asia (Singapore)**.

## 2. Chạy schema

**SQL Editor → New query** → dán toàn bộ `supabase/schema.sql` → **Run**.

File này tạo: `tours`, `tour_overrides`, `tour_content`, `bookings`, `admins`,
`messages`, `subscribers`; bật RLS + Realtime; tạo các hàm `create_booking`,
`grant_admin`, `mark_thread_read`, `mark_customer_read`, `send_customer_message`,
`send_admin_reply`, `subscribe_newsletter`. Chạy lại nhiều lần cũng được.

> ⚠️ Nếu SQL Editor báo lỗi `42601 syntax error at or near "loop"` / `"v_content"`,
> đó là do bạn đang dán **một đoạn rời** vào query cũ. Bấm **New query → Discard
> unsaved edits → dán TOÀN BỘ file → Run**.

### Giới hạn tần suất (chống spam) đã có trong DB

- Đặt tour: tối đa **5 đơn / email / giờ** và **3 đơn / số điện thoại / giờ**.
- Chat khách: tối đa **8 tin / khách / phút**.
- Tin nhắn được gửi qua RPC `send_customer_message` / `send_admin_reply`; client
  không được INSERT trực tiếp vào bảng `messages`.

## 3. Bật đăng nhập ẩn danh (bắt buộc để chat)

**Authentication → Providers → Allow anonymous sign-ins → Bật → Save.**

Khách không cần tạo tài khoản: khi mở khung chat, website tự tạo một phiên ẩn danh.
Mỗi khách chỉ đọc được tin nhắn của chính mình (RLS), admin đọc được tất cả.

## 4. Tạo tài khoản admin đầu tiên

1. **Authentication → Users → Add user** → email + mật khẩu → bật **Auto Confirm User**.
2. **SQL Editor** → chạy (thay email của bạn):

```sql
insert into public.admins (user_id, email, display_name)
select id, email, 'Chủ Vietnam4trip'
from auth.users
where email = 'email-cua-ban@example.com';
```

3. Mở `admin.html`, đăng nhập bằng email + mật khẩu đó.
4. Thêm nhân viên: tạo user ở bước 1, rồi vào **Tài khoản → Thêm tài khoản** trong admin.

## 5. Điền khóa kết nối

**Project Settings → API** → copy **Project URL** và **anon public key**, điền vào
`js/supabase-config.js`:

```js
window.V4T_SUPABASE = {
  url: "https://xxxxx.supabase.co",
  anonKey: "sb_publishable_..."
};
```

Cùng file này có `window.V4T_BANK` — **hãy thay bằng thông tin tài khoản thật**
trước khi nhận tiền. Khách chọn “Chuyển khoản” sẽ thấy các thông tin này ngay,
và dùng mã đặt chỗ làm nội dung chuyển khoản.

⚠️ Chỉ dùng **anon public key**. Không bao giờ put `service_role key` vào file này.
Dữ liệu được bảo vệ bởi RLS, anon key an toàn khi nằm trong trang public.

## 6. Chạy thử

Mở `index.html` (hoặc chạy `start.cmd` → http://localhost:8088) rồi kiểm tra:

| Hành động | Kết quả mong đợi |
|---|---|
| Đặt một tour | Đơn xuất hiện ngay trong `admin.html → Đơn đăng ký` (không cần reload) |
| Khách bấm nút chat, gửi tin | Tin xuất hiện ngay trong `admin.html → Tin nhắn`, có badge chưa đọc |
| Admin trả lời | Khách thấy câu trả lời ngay (Realtime; có polling dự phòng 8s) |
| Admin đổi giá / ẩn tour | Khách đang mở trang thấy thay đổi ngay |
| Admin → Tour → Chỉnh sửa | Sửa tiêu đề, ảnh, điểm nhấn, lịch trình, thư viện ảnh → khách thấy ngay |
| Admin → Tour → Thêm tour | Tạo tour mới trên Supabase, hiển thị ngay cho khách (không sửa `data.js`) |
| Đăng ký email ở footer | Email xuất hiện trong `admin.html → Đăng ký nhận tin` |
| Chọn “Chuyển khoản” | Hiện thông tin tài khoản từ `V4T_BANK` + mã đặt chỗ làm nội dung |

Nếu chat báo lỗi "Không mở được phiên trò chuyện", kiểm tra lại bước 3.
Nếu newsletter/chat báo lỗi `PGRST202 ... function ... not found`, bạn chưa chạy
lại `supabase/schema.sql` sau bản cập nhật này.

## 7. Đưa lên GitHub Pages

1. Push code lên GitHub (remote đã trỏ tới `Raven-sb/Travel-website`).
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `(root)`.
3. Website: `https://raven-sb.github.io/Travel-website/`.
4. Nhớ rằng `js/supabase-config.js` phải đã điền khóa trước khi deploy.

## 8. Lưu ý bảo mật & chi phí

- Gói free Supabase **tự tạm dừng sau ~7 ngày không truy cập** → vào dashboard bấm Restore.
- Đã có rate limit trong DB (xem mục 2); nếu vẫn bị spam, cân nhắc thêm CAPTCHA.
- Thông tin thẻ tín dụng trong form chỉ để giao diện, **không gửi/lưu**. Chưa có cổng thanh toán thật.
- Email thông báo (bước cuối trong lộ trình) chưa làm: cần cấu hình dịch vụ gửi mail
  (Supabase Edge Function + SMTP/Resend) và lưu secret ở Edge Function, **không** đưa vào frontend.
- Sao lưu định kỳ: Table Editor → `bookings` / `messages` → Export CSV.
- Muốn quay lại backend Node: xóa trống 2 chuỗi trong `js/supabase-config.js`
  (cần cài Node ≥ 22.5 và chạy `start.cmd`).
