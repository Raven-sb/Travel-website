// Vietnam4trip — gửi email thông báo khi có đơn mới / đăng ký nhận tin.
// Được gọi bởi Database Webhook (pg_net) qua header x-webhook-secret.
// Không dùng service_role: toàn bộ dữ liệu cần thiết có trong payload của webhook.

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") || "Vietnam4trip <onboarding@resend.dev>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "";
const SITE_URL = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");

type Row = Record<string, unknown>;
type Payload = {
  type?: string;
  table?: string;
  record?: Row | null;
};

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (value: unknown): string => {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN") + "₫";
};

function shell(title: string, body: string): string {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
  <body style="margin:0;padding:32px 16px;background:#f7f5f0;font-family:Arial,sans-serif;color:#182a24">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:18px;padding:28px;border:1px solid #e8e3d9">
      <h1 style="margin:0 0 18px;font-size:22px;color:#0f4a3c">Vietnam4trip</h1>
      ${body}
      <p style="margin-top:28px;font-size:12px;color:#7b857f">Email tự động từ ${esc(SITE_URL || "Vietnam4trip")}. Vui lòng không trả lời trực tiếp.</p>
    </div>
  </body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!to || !RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html })
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return res.ok;
}

function bookingEmail(record: Row) {
  const code = esc(record.code);
  const name = esc(record.contact_name);
  const tour = esc(record.tour_title || record.tour_id);
  const date = esc(record.date);
  const guests = `${record.adults ?? ""} người lớn${Number(record.children || 0) ? `, ${record.children} trẻ em` : ""}`;
  const total = money(record.total);
  const transfer = record.payment === "transfer";

  const customer = shell("Xác nhận đặt tour", `
    <h2 style="margin:0 0 8px;font-size:20px">Đặt tour thành công, ${name}!</h2>
    <p style="color:#5c6a63;line-height:1.6">Chúng tôi đã nhận được yêu cầu đặt chỗ của bạn. Thông tin chi tiết:</p>
    <div style="margin:20px 0;padding:18px;background:#f7fbf8;border-radius:12px;line-height:1.9">
      <div><strong>Mã đặt chỗ:</strong> ${code}</div>
      <div><strong>Tour:</strong> ${tour}</div>
      <div><strong>Ngày khởi hành:</strong> ${date}</div>
      <div><strong>Số khách:</strong> ${guests}</div>
      <div><strong>Tổng:</strong> ${total}</div>
    </div>
    ${transfer
      ? `<p style="padding:14px;background:#fff7e8;border-radius:12px;line-height:1.6">
           Bạn đã chọn <strong>chuyển khoản</strong>. Vui lòng vào trang đặt chỗ để xem thông tin tài khoản và dùng
           <strong>${code}</strong> làm nội dung chuyển khoản. Chúng tôi sẽ xác nhận đơn sau khi nhận được tiền.
         </p>`
      : `<p style="line-height:1.6">Nhân viên sẽ liên hệ để xác nhận chuyến đi của bạn trong thời gian sớm nhất.</p>`}
  `);

  const admin = shell("Đơn đặt tour mới", `
    <h2 style="margin:0 0 12px;font-size:20px">Đơn mới: ${code}</h2>
    <div style="line-height:1.9">
      <div><strong>Khách:</strong> ${name} (${esc(record.contact_email)} · ${esc(record.contact_phone)})</div>
      <div><strong>Tour:</strong> ${tour}</div>
      <div><strong>Ngày:</strong> ${date} · ${guests}</div>
      <div><strong>Tổng:</strong> ${total} · ${esc(record.payment)}</div>
      ${record.contact_requests ? `<div><strong>Yêu cầu:</strong> ${esc(record.contact_requests)}</div>` : ""}
    </div>
    <p style="margin-top:20px"><a href="${esc(SITE_URL)}/admin.html" style="color:#0f4a3c">Mở trang quản trị →</a></p>
  `);

  return Promise.all([
    sendEmail(String(record.contact_email || ""), `Vietnam4trip — Xác nhận đặt tour ${code}`, customer),
    sendEmail(ADMIN_EMAIL, `[V4T] Đơn mới ${code} — ${name}`, admin)
  ]).then((r) => r.some(Boolean));
}

function subscriberEmail(record: Row) {
  const email = String(record.email || "");
  if (!email) return Promise.resolve(false);
  const html = shell("Cảm ơn bạn đăng ký", `
    <h2 style="margin:0 0 12px;font-size:20px">Cảm ơn bạn đăng ký nhận tin!</h2>
    <p style="line-height:1.6">Địa chỉ <strong>${esc(email)}</strong> đã được thêm vào danh sách nhận tin tức và ưu đãi của Vietnam4trip.</p>
    <p style="line-height:1.6">Bạn sẽ nhận được những gợi ý hành trình và mã giảm giá mới nhất. Hẹn gặp bạn trên chuyến đi tiếp theo!</p>
    ${SITE_URL ? `<p><a href="${esc(SITE_URL)}" style="color:#0f4a3c">Khám phá tour →</a></p>` : ""}
  `);
  return sendEmail(email, "Cảm ơn bạn đăng ký nhận tin từ Vietnam4trip", html);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const provided = req.headers.get("x-webhook-secret") || "";
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    console.error("Invalid webhook secret");
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "INSERT" || !payload.record) {
    return Response.json({ ok: true, skipped: "not insert" });
  }

  try {
    if (payload.table === "bookings") {
      const sent = await bookingEmail(payload.record);
      return Response.json({ ok: true, sent });
    }
    if (payload.table === "subscribers") {
      const sent = await subscriberEmail(payload.record);
      return Response.json({ ok: true, sent });
    }
    return Response.json({ ok: true, skipped: payload.table });
  } catch (err) {
    console.error("notify-email failed", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
