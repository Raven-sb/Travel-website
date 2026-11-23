# Vietnam4trip — đưa website lên GitHub Pages + Supabase (miễn phí)

Bộ hồ sơ này biến website thành bản chạy trên internet: trang tĩnh nằm trên GitHub Pages,
dữ liệu (đơn đặt tour, giá tour, tài khoản admin) nằm trên Supabase.

## 1. Tạo dự án Supabase

1. Vào https://supabase.com → đăng ký (miễn phí) → **New project**.
2. Đặt tên (ví dụ `vietnam4trip`), chọn region **Southeast Asia (Singapore)**, đặt mật khẩu database.
3. Đợi dự án khởi tạo xong (~1 phút).

## 2. Nạp cấu trúc dữ liệu

1. Trong Supabase, mở **SQL Editor → New query**.
2. Dán toàn bộ nội dung file `supabase/schema.sql` trong dự án này → bấm **Run**.
   File sẽ tạo bảng tour, bảng giá/trạng thái tour, bảng đơn đặt, bảng admin,
   phân quyền RLS và 2 hàm: `create_booking` (khách đặt tour) và `grant_admin` (cấp quyền admin).

## 3. Tạo tài khoản admin đầu tiên

1. Supabase → **Authentication → Users → Add user**:
   nhập email + mật khẩu, bật **Auto Confirm User** → Create.
2. Mở **SQL Editor**, chạy (thay email của bạn):

   ```sql
   insert into public.admins (user_id, email, display_name)
   select id, email, 'Chủ Vietnam4trip'
   from auth.users
   where email = 'email-cua-ban@example.com';
   ```

3. Từ nay, admin đăng nhập tại `admin.html` bằng **email + mật khẩu** này.
   Thêm nhân viên: tạo user ở bước 1, rồi vào admin → **Tài khoản → Thêm tài khoản** và nhập email người đó.

## 4. Điền khoá kết nối

1. Supabase → **Project Settings → API**: copy **Project URL** và **anon public key**.
2. Mở `js/supabase-config.js`, điền:

   ```js
   window.V4T_SUPABASE = {
     url: "https://xxxxx.supabase.co",
     anonKey: "eyJhbGciOi..."
   };
   ```

   Anon key là khoá công khai (an toàn khi nằm trong trang), dữ liệu được bảo vệ bởi RLS.

## 5. Thử trên máy trước khi đưa lên

- Nhấp đôi `start.cmd` → mở http://localhost:8088.
- Vào `/admin.html` đăng nhập bằng email vừa cấp quyền.
- Đặt thử một tour trên website, kiểm tra đơn xuất hiện trong admin.
- Khi `js/supabase-config.js` còn trống, website tự dùng backend Node (không cần Supabase).

## 6. Đưa lên GitHub Pages

1. Tạo repository **Public** trên https://github.com/new (ví dụ `vietnam4trip`).
2. Trong thư mục dự án, chạy (thay URL repo của bạn):

   ```bash
   git remote add origin https://github.com/<tài-khoản>/vietnam4trip.git
   git branch -M main
   git push -u origin main
   ```

3. GitHub → repo → **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)** → Save.
4. Sau ~1 phút, website có tại `https://<tài-khoản>.github.io/vietnam4trip/`,
   trang quản trị tại `.../admin.html`.

Lưu ý: thư mục `data/` (database SQLite của bản Node) không được đưa lên GitHub —
đã có trong `.gitignore`.

## 7. Những điều cần biết ở gói miễn phí

- Dự án Supabase miễn phí **tự tạm dừng nếu ~7 ngày không có truy cập**; vào dashboard bấm
  **Restore/Resume** là chạy lại. Phù hợp để thử nghiệm; khi kinh doanh thật nên nâng gói Pro
  hoặc chuyển về backend Node trên VPS (khi đó xoá trống `js/supabase-config.js` là tự quay lại chế độ Node).
- Supabase miễn phí giới hạn email xác thực (dùng SMTP mặc định); với 2–3 admin thì đủ.
- Nhớ sao lưu định kỳ: Supabase → Table Editor → `bookings` → Export CSV.
- Khi có tên miền riêng (vd `vietnam4trip.vn`): thêm **Custom domain** trong Settings → Pages,
  rồi trỏ DNS theo hướng dẫn của GitHub.
