/* Vietnam4trip — tầng dữ liệu Supabase.
   Chỉ bật khi js/supabase-config.js đã có url + anonKey; nếu không, các trang
   dùng API Node như cũ (/api/...). */
(function () {
  "use strict";

  const conf = window.V4T_SUPABASE || {};
  const url = String(conf.url || "").trim();
  const key = String(conf.anonKey || "").trim();
  const API = { enabled: false };
  window.V4T_API = API;

  if (!url || !key || !window.supabase || !window.supabase.createClient) return;

  const client = window.supabase.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  API.enabled = true;
  API.client = client;

  const DATA = window.VV_DATA || { tours: [] };

  function fail(message, status) {
    const err = new Error(message);
    if (status) err.status = status;
    return err;
  }

  function check(error, fallback) {
    if (error) throw fail(error.message || fallback, error.code === "PGRST301" ? 401 : 0);
  }

  async function currentAdmin() {
    const { data: sess } = await client.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null;
    if (!user) return null;
    const { data, error } = await client.from("admins").select("*").eq("user_id", user.id).maybeSingle();
    if (error) return null;
    if (!data) return null;
    return {
      id: data.user_id,
      username: data.email,
      displayName: data.display_name || String(data.email).split("@")[0]
    };
  }

  async function requireAdmin() {
    const admin = await currentAdmin();
    if (!admin) throw fail("Phiên đăng nhập đã hết hạn", 401);
    return admin;
  }

  /* Overrides ------------------------------------------------------------ */
  API.fetchOverrides = async function () {
    const { data, error } = await client.from("tour_overrides").select("*");
    if (error) throw fail("Không tải được cấu hình tour");
    const map = {};
    (data || []).forEach(function (row) {
      const o = {};
      if (row.price != null) o.price = row.price;
      if (row.active != null) o.active = row.active;
      if (row.featured != null) o.featured = row.featured;
      if (Object.keys(o).length) map[row.tour_id] = o;
    });
    return map;
  };

  /* Booking -------------------------------------------------------------- */
  API.createBooking = async function (payload) {
    const c = payload.contact || {};
    const { data, error } = await client.rpc("create_booking", {
      p_tour_id: payload.tourId,
      p_date: payload.date,
      p_adults: payload.adults,
      p_children: payload.children,
      p_payment: payload.payment,
      p_promo: payload.promo || "",
      p_name: c.name || "",
      p_email: c.email || "",
      p_phone: c.phone || "",
      p_country: c.country || "vn",
      p_requests: c.requests || ""
    });
    if (error) throw fail(error.message || "Không gửi được đơn. Vui lòng thử lại.");
    return data;
  };

  /* Mapping -------------------------------------------------------------- */
  function bookingFromRow(r) {
    return {
      code: r.code,
      createdAt: r.created_at,
      tourId: r.tour_id,
      tourTitle: r.tour_title,
      date: r.date,
      adults: r.adults,
      children: r.children,
      subtotal: r.subtotal,
      discount: r.discount,
      promo: r.promo,
      total: r.total,
      payment: r.payment,
      status: r.status,
      note: r.note,
      contact: {
        name: r.contact_name,
        email: r.contact_email,
        phone: r.contact_phone,
        country: r.contact_country,
        requests: r.contact_requests
      }
    };
  }

  function basePriceOf(tr) {
    return tr._basePrice != null ? tr._basePrice : tr.price;
  }

  function toursMerged(overrides) {
    const ov = overrides || {};
    return (DATA.tours || []).map(function (tr) {
      const o = ov[tr.id] || {};
      const base = basePriceOf(tr);
      const item = {
        id: tr.id,
        dest: tr.dest,
        duration: tr.duration,
        type: tr.type,
        title: tr.title,
        img: tr.img,
        basePrice: base,
        price: typeof o.price === "number" ? o.price : base,
        active: o.active !== false,
        featured: o.featured === true
      };
      tr.price = item.price;
      tr.active = item.active;
      tr.featured = item.featured;
      return item;
    });
  }

  async function saveTour(id, body) {
    await requireAdmin();
    const tr = (DATA.tours || []).find(function (t) { return t.id === id; });
    if (!tr) throw fail("Không tìm thấy tour");
    const base = basePriceOf(tr);
    const price = Math.round(Number(body.price));
    if (!(price >= 100000 && price <= 200000000)) {
      throw fail("Giá phải từ 100.000₫ đến 200.000.000₫");
    }
    const active = body.active !== false;
    const featured = body.featured === true;

    let error;
    if (price === base && active && !featured) {
      ({ error } = await client.from("tour_overrides").delete().eq("tour_id", id));
    } else {
      ({ error } = await client.from("tour_overrides").upsert({
        tour_id: id,
        price: price === base ? null : price,
        active: active ? null : false,
        featured: featured ? true : null,
        updated_at: new Date().toISOString()
      }));
    }
    if (error) throw fail("Không lưu được thay đổi");

    const merged = toursMerged(await API.fetchOverrides());
    return merged.find(function (t) { return t.id === id; });
  }

  /* Admin API shim — cùng path với API Node để js/admin.js không phải đổi */
  API.admin = {
    async login(email, password) {
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email || "").trim(),
        password: password
      });
      if (error) {
        throw fail(/invalid/i.test(error.message || "")
          ? "Email hoặc mật khẩu không đúng"
          : (error.message || "Không đăng nhập được"));
      }
      if (!data.session) throw fail("Không đăng nhập được");
      const admin = await currentAdmin();
      if (!admin) {
        await client.auth.signOut();
        throw fail("Tài khoản này chưa được cấp quyền quản trị");
      }
      return { admin: admin };
    },

    async api(path, options) {
      const opts = options || {};
      const method = (opts.method || "GET").toUpperCase();
      const body = opts.body || {};
      const parts = String(path).replace(/^\/+/, "").split("/");
      const head = parts[0];

      if (head === "me") {
        return { admin: await requireAdmin() };
      }

      if (head === "logout") {
        await client.auth.signOut();
        return { ok: true };
      }

      if (head === "bookings" && parts.length === 1 && method === "GET") {
        await requireAdmin();
        const { data, error } = await client.from("bookings").select("*").order("created_at", { ascending: false });
        check(error, "Không tải được danh sách đơn");
        return { bookings: (data || []).map(bookingFromRow) };
      }

      if (head === "bookings" && parts[1]) {
        await requireAdmin();
        const code = decodeURIComponent(parts[1]);
        if (method === "PATCH") {
          const patch = {};
          if (body.status) patch.status = body.status;
          if (body.note !== undefined) patch.note = String(body.note).slice(0, 2000);
          const { data, error } = await client.from("bookings").update(patch).eq("code", code).select().single();
          check(error, "Không cập nhật được đơn");
          return { booking: bookingFromRow(data) };
        }
        if (method === "DELETE") {
          const { error } = await client.from("bookings").delete().eq("code", code);
          check(error, "Không xóa được đơn");
          return { ok: true };
        }
      }

      if (head === "tours" && parts.length === 1 && method === "GET") {
        await requireAdmin();
        return { tours: toursMerged(await API.fetchOverrides()) };
      }

      if (head === "tours" && parts[1]) {
        const id = decodeURIComponent(parts[1]);
        if (method === "PUT") {
          return { tour: await saveTour(id, body) };
        }
        if (method === "DELETE") {
          await requireAdmin();
          const { error } = await client.from("tour_overrides").delete().eq("tour_id", id);
          check(error, "Không khôi phục được giá gốc");
          const merged = toursMerged(await API.fetchOverrides());
          return { tour: merged.find(function (t) { return t.id === id; }) };
        }
      }

      if (head === "admins" && parts.length === 1 && method === "GET") {
        const me = await requireAdmin();
        const { data, error } = await client.from("admins").select("*").order("created_at", { ascending: true });
        check(error, "Không tải được danh sách tài khoản");
        return {
          admins: (data || []).map(function (a) {
            return {
              id: a.user_id,
              username: a.email,
              displayName: a.display_name,
              createdAt: a.created_at,
              isSelf: a.user_id === me.id
            };
          })
        };
      }

      if (head === "admins" && parts.length === 1 && method === "POST") {
        const { error } = await client.rpc("grant_admin", {
          p_email: String(body.username || "").trim(),
          p_display_name: body.displayName || ""
        });
        check(error, "Không cấp quyền được tài khoản này");
        return { ok: true };
      }

      if (head === "admins" && parts[1]) {
        const id = decodeURIComponent(parts[1]);
        const me = await requireAdmin();
        if (method === "PATCH") {
          if (String(id) !== String(me.id)) {
            throw fail("Đổi mật khẩu người khác: vào Supabase → Authentication → Users để đặt lại.");
          }
          const { error } = await client.auth.updateUser({ password: body.password || "" });
          check(error, "Không đổi được mật khẩu");
          return { admin: me };
        }
        if (method === "DELETE") {
          const { error } = await client.from("admins").delete().eq("user_id", id);
          check(error, "Không xóa được tài khoản");
          return { ok: true };
        }
      }

      throw fail("Thao tác này chưa được hỗ trợ ở chế độ Supabase");
    }
  };
})();
