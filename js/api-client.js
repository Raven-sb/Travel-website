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
  const BASE_IDS = {};
  (DATA.tours || []).forEach(function (t) { BASE_IDS[t.id] = true; });
  const STATUS_KEYS = ["new", "confirmed", "done", "cancelled"];
  const channels = {};

  // Realtime cần JWT hiện tại để RLS biết auth.uid() là khách nào.
  function syncRealtimeAuth(session) {
    if (!session || !session.access_token) return;
    if (client.realtime && typeof client.realtime.setAuth === "function") {
      client.realtime.setAuth(session.access_token);
    }
  }

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
    syncRealtimeAuth(sess && sess.session);
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
    const [overrides, content, base] = await Promise.all([
      API.fetchOverrides(),
      API.fetchContent(),
      client.from("tours").select("id, price, title_vi")
    ]);
    check(base.error, "Không tải được danh sách tour");
    return {
      overrides: overrides,
      content: content,
      tours: (base.data || []).map(function (r) {
        return { id: r.id, price: r.price, titleVi: r.title_vi || "" };
      })
    };
  };

  /* Newsletter ------------------------------------------------------------ */
  API.subscribeNewsletter = async function (email) {
    const { error } = await client.rpc("subscribe_newsletter", { p_email: String(email || "").trim() });
    check(error, "Không đăng ký được. Vui lòng thử lại.");
    return true;
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

  function remoteTourSkeleton(row, patch) {
    const title = (patch && patch.title) || {};
    return {
      id: row.id,
      dest: "",
      region: "",
      type: [],
      duration: 1,
      title: { vi: title.vi || row.titleVi || row.id, en: title.en || row.titleVi || row.id },
      tagline: { vi: "", en: "" },
      price: row.price,
      oldPrice: null,
      rating: 0,
      reviews: 0,
      badge: "",
      img: "assets/img/hero.jpg",
      gallery: [],
      departure: { vi: "", en: "" },
      group: { vi: "", en: "" },
      highlights: [],
      itinerary: []
    };
  }

  function toursMerged(overrides, content, baseRows) {
    const ov = overrides || {};
    const ct = content || {};
    const rows = baseRows || [];
    const list = (DATA.tours || []).map(function (tr) {
      const row = rows.find(function (r) { return r.id === tr.id; });
      const item = JSON.parse(JSON.stringify(tr));
      const base = row ? row.price : basePriceOf(tr);
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
    rows.forEach(function (row) {
      if (BASE_IDS[row.id] || list.some(function (t) { return t.id === row.id; })) return;
      const o = ov[row.id] || {};
      const c = ct[row.id] || {};
      const item = remoteTourSkeleton(row, c);
      item._custom = true;
      item._basePrice = row.price;
      item.price = typeof o.price === "number" ? o.price : row.price;
      item.active = o.active !== false;
      item.featured = o.featured === true;
      item._content = JSON.parse(JSON.stringify(c));
      deepMerge(item, c);
      list.push(item);
    });
    return list;
  }

  API.toursMerged = toursMerged;

  function validPrice(value) {
    const price = Math.round(Number(value));
    if (!(price >= 100000 && price <= 200000000)) {
      throw fail("Giá phải từ 100.000₫ đến 200.000.000₫");
    }
    return price;
  }

  function validTourId(value) {
    const id = String(value || "").trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+){1,60}$/.test(id)) {
      throw fail("Mã tour chỉ dùng chữ thường, số và dấu gạch ngang (vd: Phu-Quoc-3n2d → phu-quoc-3n2d)");
    }
    return id;
  }

  function titleFrom(body, fallback) {
    const c = body.content || {};
    return String(body.titleVi || (c.title && c.title.vi) || fallback || "").trim().slice(0, 200);
  }

  async function writeContent(id, content) {
    if (Object.keys(content).length) {
      const { error } = await client.from("tour_content").upsert({
        tour_id: id,
        data: content,
        updated_at: new Date().toISOString()
      });
      check(error, "Không lưu được nội dung tour");
    } else {
      const { error } = await client.from("tour_content").delete().eq("tour_id", id);
      check(error, "Không xóa được nội dung tour");
    }
  }

  async function mergedTour(id) {
    const catalog = await API.fetchCatalog();
    return toursMerged(catalog.overrides, catalog.content, catalog.tours).find(function (t) { return t.id === id; });
  }

  API.createTour = async function (body) {
    await requireAdmin();
    const id = validTourId(body.id);
    const catalog = await API.fetchCatalog();
    if ((DATA.tours || []).some(function (t) { return t.id === id; }) ||
        catalog.tours.some(function (t) { return t.id === id; })) {
      throw fail("Mã tour này đã tồn tại");
    }
    const price = validPrice(body.price);
    const titleVi = titleFrom(body, id) || id;
    const { error } = await client.from("tours").insert({ id: id, price: price, title_vi: titleVi });
    check(error, "Không tạo được tour");
    await writeContent(id, body.content || {});
    const active = body.active !== false;
    const featured = body.featured === true;
    if (!active || featured) {
      const { error: oErr } = await client.from("tour_overrides").upsert({
        tour_id: id,
        price: null,
        active: active ? null : false,
        featured: featured ? true : null,
        updated_at: new Date().toISOString()
      });
      check(oErr, "Không lưu được trạng thái tour");
    }
    return mergedTour(id);
  };

  async function saveTour(id, body) {
    await requireAdmin();
    const catalog = await API.fetchCatalog();
    const row = catalog.tours.find(function (t) { return t.id === id; });
    if (!row) throw fail("Không tìm thấy tour");
    const isBase = !!BASE_IDS[id];
    const baseTour = (DATA.tours || []).find(function (t) { return t.id === id; });
    const base = isBase && baseTour ? basePriceOf(baseTour) : row.price;
    const price = validPrice(body.price);
    const active = body.active !== false;
    const featured = body.featured === true;

    if (!isBase) {
      const { error: tErr } = await client.from("tours").update({
        price: price,
        title_vi: titleFrom(body, row.titleVi) || row.titleVi || id
      }).eq("id", id);
      check(tErr, "Không cập nhật được tour");
    }

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

    await writeContent(id, body.content || {});
    return mergedTour(id);
  }

  API.deleteTour = async function (id) {
    await requireAdmin();
    const catalog = await API.fetchCatalog();
    const row = catalog.tours.find(function (t) { return t.id === id; });
    if (!row) throw fail("Không tìm thấy tour");
    if (BASE_IDS[id]) throw fail("Không thể xóa tour gốc. Bạn có thể ẩn tour bằng công tắc Đang bán.");
    const { error } = await client.from("tours").delete().eq("id", id);
    check(error, "Không xóa được tour");
    return true;
  };

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
      { spec: { event: "*", schema: "public", table: "tours" }, handler: onChange },
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
    if (sess && sess.session) {
      syncRealtimeAuth(sess.session);
      return sess.session.user;
    }
    const { data, error } = await client.auth.signInAnonymously();
    check(error, "Không mở được phiên trò chuyện. Hãy bật Allow anonymous sign-ins trong Supabase.");
    syncRealtimeAuth(data && data.session);
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
    await ensureSession();
    const text = String(body || "").trim().slice(0, 2000);
    if (!text) throw fail("Nhập nội dung tin nhắn");
    // Đi qua RPC để DB áp giới hạn tần suất (8 tin / khách / phút).
    const { data, error } = await client.rpc("send_customer_message", {
      p_thread: thread,
      p_name: String(authorName || "Khách").trim().slice(0, 80),
      p_body: text
    });
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
    const { data, error } = await client.rpc("send_admin_reply", {
      p_thread: thread,
      p_body: text,
      p_name: String(authorName || me.displayName || "Admin").slice(0, 80)
    });
    check(error, "Không gửi được câu trả lời");
    return messageFromRow(data);
  };

  chat.adminMarkRead = async function (thread) {
    await requireAdmin();
    const { error } = await client.rpc("mark_thread_read", { p_thread: thread });
    check(error, "Không cập nhật được tin nhắn");
  };

  chat.adminDeleteMessage = async function (id) {
    await requireAdmin();
    const { error } = await client.rpc("delete_message", { p_id: id });
    check(error, "Không xóa được tin nhắn");
    return true;
  };

  chat.adminDeleteThread = async function (thread) {
    await requireAdmin();
    const { error } = await client.rpc("delete_thread", { p_thread: thread });
    check(error, "Không xóa được cuộc hội thoại");
    return true;
  };

  function deletePayload(payload) {
    const old = payload.old || {};
    return { id: old.id, thread: old.thread, sender: old.sender };
  }

  chat.subscribe = async function (thread, onMessage) {
    await ensureSession();
    return channel("v4t-chat-" + thread, [
      {
        spec: { event: "INSERT", schema: "public", table: "messages", filter: "thread=eq." + thread },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "insert"); }
      },
      {
        spec: { event: "UPDATE", schema: "public", table: "messages", filter: "thread=eq." + thread },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "update"); }
      },
      {
        spec: { event: "DELETE", schema: "public", table: "messages", filter: "thread=eq." + thread },
        handler: function (payload) { onMessage(deletePayload(payload), "delete"); }
      }
    ]);
  };

  chat.subscribeAdmin = async function (onMessage) {
    const { data: sess } = await client.auth.getSession();
    syncRealtimeAuth(sess && sess.session);
    return channel("v4t-admin-chat", [
      {
        spec: { event: "INSERT", schema: "public", table: "messages" },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "insert"); }
      },
      {
        spec: { event: "UPDATE", schema: "public", table: "messages" },
        handler: function (payload) { onMessage(messageFromRow(payload.new), "update"); }
      },
      {
        spec: { event: "DELETE", schema: "public", table: "messages" },
        handler: function (payload) { onMessage(deletePayload(payload), "delete"); }
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

      if (head === "subscribers" && parts.length === 1 && method === "GET") {
        await requireAdmin();
        const { data, error } = await client.from("subscribers")
          .select("email, created_at").order("created_at", { ascending: false });
        check(error, "Không tải được danh sách đăng ký nhận tin");
        return {
          subscribers: (data || []).map(function (s) {
            return { email: s.email, createdAt: s.created_at };
          })
        };
      }

      if (head === "tours" && parts.length === 1 && method === "GET") {
        await requireAdmin();
        const catalog = await API.fetchCatalog();
        return { tours: toursMerged(catalog.overrides, catalog.content, catalog.tours) };
      }

      if (head === "tours" && parts.length === 1 && method === "POST") {
        return { tour: await API.createTour(body) };
      }

      if (head === "tours" && parts[1]) {
        const id = decodeURIComponent(parts[1]);
        if (method === "PUT") return { tour: await saveTour(id, body) };
        if (method === "DELETE") {
          if (!BASE_IDS[id]) {
            await API.deleteTour(id);
            return { ok: true };
          }
          await requireAdmin();
          const { error } = await client.from("tour_overrides").delete().eq("tour_id", id);
          check(error, "Không khôi phục được giá gốc");
          const { error: cErr } = await client.from("tour_content").delete().eq("tour_id", id);
          check(cErr, "Không khôi phục được nội dung");
          return { tour: await mergedTour(id) };
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
