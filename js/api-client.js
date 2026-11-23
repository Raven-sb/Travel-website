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
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  API.enabled = true;
  API.client = client;

  const DATA = window.VV_DATA || { tours: [] };
  const STATUS_KEYS = ["new", "confirmed", "done", "cancelled"];
  const channels = {};

  function fail(message, status) {
    const err = new Error(message);
    if (status) err.status = status;
    return err;
  }

  function check(error, fallback) {
    if (!error) return;
    const code = error.code || "";
    const msg = String(error.message || "");
    const unauthorized = code === "PGRST301" || code === "42501" || /JWT|permission|not authorized/i.test(msg);
    throw fail(msg || fallback, unauthorized ? 401 : 0);
  }

  function deepMerge(target, patch) {
    if (!patch || typeof patch !== "object") return target;
    Object.keys(patch).forEach(function (k) {
      const v = patch[k];
      if (v === undefined) return;
      const cur = target[k];
      if (v && typeof v === "object" && !Array.isArray(v) &&
          cur && typeof cur === "object" && !Array.isArray(cur)) {
        deepMerge(cur, v);
      } else {
        target[k] = v;
      }
    });
    return target;
  }

  async function currentAdmin() {
    const { data: sess } = await client.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null;
    if (!user) return null;
    const { data, error } = await client.from("admins").select("*").eq("user_id", user.id).maybeSingle();
    if (error || !data) return null;
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

  /* Catalog --------------------------------------------------------------- */
  API.fetchOverrides = async function () {
    const { data, error } = await client.from("tour_overrides").select("*");
    check(error, "Không tải được cấu hình tour");
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

  API.fetchContent = async function () {
    const { data, error } = await client.from("tour_content").select("tour_id, data");
    check(error, "Không tải được nội dung tour");
    const map = {};
    (data || []).forEach(function (row) {
      if (row.data && typeof row.data === "object") map[row.tour_id] = row.data;
    });
    return map;
  };

  API.fetchCatalog = async function () {
    const [overrides, content] = await Promise.all([API.fetchOverrides(), API.fetchContent()]);
    return { overrides: overrides, content: content };
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
    check(error, "Không gửi được đơn. Vui lòng thử lại.");
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

  function messageFromRow(r) {
    return {
      id: r.id,
      thread: r.thread,
      sender: r.sender,
      authorName: r.author_name || (r.sender === "admin" ? "Admin" : "Khách"),
      body: r.body,
      createdAt: r.created_at,
      adminRead: !!r.admin_read,
      customerRead: !!r.customer_read,
      mine: r.sender === "customer"
    };
  }

  function basePriceOf(tr) {
    return tr._basePrice != null ? tr._basePrice : tr.price;
  }

  function toursMerged(overrides, content) {
    const ov = overrides || {};
    const ct = content || {};
    return (DATA.tours || []).map(function (tr) {
      const item = JSON.parse(JSON.stringify(tr));
      const base = basePriceOf(tr);
      const o = ov[tr.id] || {};
      const c = ct[tr.id] || {};
      item._basePrice = base;
      item.price = typeof o.price === "number" ? o.price : base;
      item.active = o.active !== false;
      item.featured = o.featured === true;
      item._content = JSON.parse(JSON.stringify(c));
      deepMerge(item, c);
      return item;
    });
  }

  API.toursMerged = toursMerged;

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
    check(error, "Không lưu được thay đổi");

    const content = body.content || {};
    if (Object.keys(content).length) {
      const { error: cErr } = await client.from("tour_content").upsert({
        tour_id: id,
        data: content,
        updated_at: new Date().toISOString()
      });
      check(cErr, "Không lưu được nội dung tour");
    } else {
      const { error: cErr } = await client.from("tour_content").delete().eq("tour_id", id);
      check(cErr, "Không xóa được nội dung tour");
    }

    const catalog = await API.fetchCatalog();
    return toursMerged(catalog.overrides, catalog.content).find(function (t) { return t.id === id; });
  }

  /* Realtime -------------------------------------------------------------- */
  function channel(name, specs) {
    if (channels[name]) return channels[name];
    const ch = client.channel(name);
    specs.forEach(function (s) {
      ch.on("postgres_changes", s.spec, s.handler);
    });
    ch.subscribe();
    channels[name] = ch;
    return ch;
  }

  API.subscribeCatalog = function (onChange) {
    return channel("v4t-catalog", [
      { spec: { event: "*", schema: "public", table: "tour_overrides" }, handler: onChange },
      { spec: { event: "*", schema: "public", table: "tour_content" }, handler: onChange }
    ]);
  };

  API.subscribeBookings = function (onChange) {
    return channel("v4t-bookings", [
      { spec: { event: "*", schema: "public", table: "bookings" }, handler: onChange }
    ]);
  };

  /* Chat ------------------------------------------------------------------ */
  const chat = {};
  API.chat = chat;

  async function ensureSession() {
    const { data: sess } = await client.auth.getSession();
    if (sess && sess.session) return sess.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    check(error, "Không mở được phiên trò chuyện. Hãy bật Allow anonymous sign-ins trong Supabase.");
    return data && data.session ? data.session.user : null;
  }
  chat.ensureSession = ensureSession;

  chat.list = async function (thread) {
    await ensureSession();
    const { data, error } = await client.from("messages")
      .select("*").eq("thread", thread).order("created_at", { ascending: true }).limit(300);
    check(error, "Không tải được tin nhắn");
    return (data || []).map(messageFromRow);
  };

  chat.send = async function (thread, body, authorName) {
    const user = await ensureSession();
    const text = String(body || "").trim().slice(0, 2000);
    if (!text) throw fail("Nhập nội dung tin nhắn");
    const { data, error } = await client.from("messages").insert({
      thread: thread,
      sender: "customer",
      customer_uid: user.id,
      author_name: String(authorName || "Khách").trim().slice(0, 80) || "Khách",
      body: text
    }).select().single();
    check(error, "Không gửi được tin nhắn");
    return messageFromRow(data);
  };

  chat.markRead = async function (thread) {
    await ensureSession();
    const { error } = await client.rpc("mark_customer_read", { p_thread: thread });
    check(error, "Không cập nhật được tin nhắn");
  };

  chat.adminList = async function () {
    await requireAdmin();
    const { data, error } = await client.from("messages")
      .select("*").order("created_at", { ascending: true }).limit(500);
    check(error, "Không tải được tin nhắn");
    return (data || []).map(messageFromRow);
  };

  chat.adminReply = async function (thread, body, authorName) {
    const me = await requireAdmin();
    const text = String(body || "").trim().slice(0, 2000);
    if (!text) throw fail("Nhập nội dung trả lời");
    const { data, error } = await client.from("messages").insert({
      thread: thread,
      sender: "admin",
      customer_uid: null,
      author_name: String(authorName || me.displayName || "Admin").slice(0, 80),
      body: text
    }).select().single();
    check(error, "Không gửi được câu trả lời");
    return messageFromRow(data);
  };

  chat.adminMarkRead = async function (thread) {
    await requireAdmin();
    const { error } = await client.rpc("mark_thread_read", { p_thread: thread });
    check(error, "Không cập nhật được tin nhắn");
  };

  chat.subscribe = function (thread, onMessage) {
    return channel("v4t-chat-" + thread, [
      {
        spec: { event: "INSERT", schema: "public", table: "messages", filter: "thread=eq." + thread },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "insert"); }
      },
      {
        spec: { event: "UPDATE", schema: "public", table: "messages", filter: "thread=eq." + thread },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "update"); }
      }
    ]);
  };

  chat.subscribeAdmin = function (onMessage) {
    return channel("v4t-admin-chat", [
      {
        spec: { event: "INSERT", schema: "public", table: "messages" },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "insert"); }
      },
      {
        spec: { event: "UPDATE", schema: "public", table: "messages" },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "update"); }
      }
    ]);
  };

  /* Admin API shim — cùng path với API Node để js/admin.js không phải đổi */
  API.admin = {
    async login(email, password) {
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email || "").trim(),
        password: password
      });
      check(error, "Không đăng nhập được");
      if (!data.session) throw fail("Không đăng nhập được");
      const admin = await currentAdmin();
      if (!admin) {
        await client.auth.signOut();
        throw fail("Tài khoản này chưa được cấp quyền quản trị", 401);
      }
      return { admin: admin };
    },

    async api(path, options) {
      const opts = options || {};
      const method = (opts.method || "GET").toUpperCase();
      const body = opts.body || {};
      const parts = String(path).replace(/^\/+/, "").split("/");
      const head = parts[0];

      if (head === "me") return { admin: await requireAdmin() };

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
          if (STATUS_KEYS.indexOf(body.status) > -1) patch.status = body.status;
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
        const catalog = await API.fetchCatalog();
        return { tours: toursMerged(catalog.overrides, catalog.content) };
      }

      if (head === "tours" && parts[1]) {
        const id = decodeURIComponent(parts[1]);
        if (method === "PUT") return { tour: await saveTour(id, body) };
        if (method === "DELETE") {
          await requireAdmin();
          const { error } = await client.from("tour_overrides").delete().eq("tour_id", id);
          check(error, "Không khôi phục được giá gốc");
          const { error: cErr } = await client.from("tour_content").delete().eq("tour_id", id);
          check(cErr, "Không khôi phục được nội dung");
          const catalog = await API.fetchCatalog();
          return { tour: toursMerged(catalog.overrides, catalog.content).find(function (t) { return t.id === id; }) };
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
          if (body.displayName !== undefined) {
            const { error: dErr } = await client.from("admins")
              .update({ display_name: String(body.displayName).slice(0, 80) })
              .eq("user_id", me.id);
            check(dErr, "Không đổi được tên hiển thị");
            me.displayName = String(body.displayName);
          }
          if (body.password) {
            const { error } = await client.auth.updateUser({ password: body.password });
            check(error, "Không đổi được mật khẩu");
          }
          return { admin: me };
        }
        if (method === "DELETE") {
          if (String(id) === String(me.id)) throw fail("Không thể xóa chính mình");
          const { error } = await client.from("admins").delete().eq("user_id", id);
          check(error, "Không xóa được tài khoản");
          return { ok: true };
        }
      }

      throw fail("Thao tác này chưa được hỗ trợ ở chế độ Supabase");
    }
  };
})();
