/* Vietnam4trip — admin console (Node API) */
(function () {
  "use strict";

  const V = window.VV;
  const API = "/api/admin";
  const REMOTE = window.V4T_API && window.V4T_API.enabled ? window.V4T_API : null;

  const STATUS = [
    { key: "new", label: "Mới" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "done", label: "Hoàn tất" },
    { key: "cancelled", label: "Đã hủy" }
  ];
  const TYPE_VI = {
    nature: "Thiên nhiên",
    culture: "Văn hóa",
    beach: "Biển đảo",
    adventure: "Phiêu lưu",
    luxury: "Nghỉ dưỡng",
    transfer: "Đưa đón",
    food: "Ẩm thực"
  };
  const PAYMENTS = { later: "Thanh toán sau", card: "Thẻ tín dụng", transfer: "Chuyển khoản" };
  const COUNTRIES = { vn: "Việt Nam", us: "Hoa Kỳ", uk: "Anh", au: "Úc", fr: "Pháp" };

  const ICONS = {
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    inbox: '<path d="M4 5.5h16v13H4Z"/><path d="M4 13h4.5l1.6 2.5h3.8L15.5 13H20"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10"/>',
    logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M9 8l-4 4 4 4"/><path d="M5 12h10"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><path d="M16.5 14.5h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.5"/><path d="M17 11a3.5 3.5 0 1 0 0-7"/><path d="M19.5 20v-1.5a4 4 0 0 0-3-3.8"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9 7V4.8h6V7"/><path d="M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    edit: '<path d="M4 20h4L18.5 9.5 14.5 5.5 4 16v4Z"/><path d="m13 6.9 4.1 4.1"/>',
    restore: '<path d="M4 11a8 8 0 1 1 2.6 6"/><path d="M4 5v6h6"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chat: '<path d="M12 4.2a7.8 7.8 0 1 0 0 15.6c.9 0 1.8-.1 2.6-.4L19 21l-.4-4.1a7.8 7.8 0 0 0-6.6-12.7Z"/><path d="M8.6 12h.01M12 12h.01M15.4 12h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    send: '<path d="m4 12 16-8-6 16-2.5-6.5L4 12Z"/>'
  };

  const state = {
    view: "dashboard",
    q: "",
    status: "all",
    me: null,
    bookings: [],
    tours: [],
    admins: [],
    messages: [],
    subscribers: [],
    chatThread: null,
    msgFilter: "active",
    tourFilter: "active",
    contentTourId: null,
    modalCode: null,
    modalMode: null,
    accountTarget: null
  };

  const els = {};

  function byId(id) { return document.getElementById(id); }

  function icon(name, size) {
    const s = size || 18;
    return '<svg class="ic" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") + "</svg>";
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-adm-icon]").forEach(function (el) {
      el.innerHTML = icon(el.dataset.admIcon, 18);
      el.removeAttribute("data-adm-icon");
    });
  }

  function num(n) {
    return Number(n || 0).toLocaleString("vi-VN");
  }

  function money(n) {
    return num(n) + "₫";
  }

  function fdate(iso) {
    if (!iso) return "—";
    const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  function fdatetime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return fdate(iso.slice(0, 10)) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function deepMerge(target, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) return target;
    Object.keys(patch).forEach(function (k) {
      const v = patch[k];
      if (v === undefined) return;
      const cur = target[k];
      if (v && typeof v === "object" && !Array.isArray(v) &&
          cur && typeof cur === "object" && !Array.isArray(cur)) deepMerge(cur, v);
      else target[k] = v;
    });
    return target;
  }

  function statusOf(rec) {
    return STATUS.some(function (s) { return s.key === rec.status; }) ? rec.status : "new";
  }

  function statusLabel(key) {
    const found = STATUS.find(function (s) { return s.key === key; });
    return found ? found.label : key;
  }

  function badge(key) {
    return '<span class="adm-badge adm-badge--' + key + '">' + statusLabel(key) + "</span>";
  }

  function updateBadge() {
    const n = state.bookings.filter(function (b) { return statusOf(b) === "new"; }).length;
    els.newBadge.hidden = n === 0;
    els.newBadge.textContent = n > 99 ? "99+" : String(n);
  }

  function updateMsgBadge() {
    const n = state.messages.filter(function (m) { return m.sender === "customer" && !m.adminRead && !m.deletedAt; }).length;
    if (!els.msgBadge) return;
    els.msgBadge.hidden = n === 0;
    els.msgBadge.textContent = n > 99 ? "99+" : String(n);
  }

  /* API ------------------------------------------------------------------- */
  async function api(path, options) {
    if (REMOTE) {
      try {
        return await REMOTE.admin.api(path, options);
      } catch (err) {
        if (err && err.status === 401) {
          showLogin();
          throw new Error(err.message || "Phiên đăng nhập đã hết hạn");
        }
        throw err;
      }
    }
    const opts = Object.assign({ method: "GET" }, options || {});
    opts.headers = Object.assign({}, opts.headers || {});
    if (opts.body !== undefined && typeof opts.body !== "string") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    let res;
    try {
      res = await fetch(API + path, opts);
    } catch (e) {
      throw new Error("Không kết nối được máy chủ");
    }
    let data = {};
    try { data = await res.json(); } catch (e) { /* ignore */ }
    if (res.status === 401) {
      showLogin();
      throw new Error(data.error || "Phiên đăng nhập đã hết hạn");
    }
    if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại");
    return data;
  }

  /* Login / session ------------------------------------------------------- */
  function showLogin() {
    state.me = null;
    state.bookings = [];
    els.shell.hidden = true;
    els.login.hidden = false;
    closeModal();
    byId("admPass").focus();
  }

  let realtimeStarted = false;
  function subscribeRealtime() {
    if (!REMOTE || realtimeStarted) return;
    realtimeStarted = true;
    let timer = null;
    const refresh = function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (els.shell.hidden || document.hidden) return;
        load();
      }, 250);
    };
    REMOTE.subscribeCatalog(refresh);
    REMOTE.subscribeBookings(refresh);
    REMOTE.chat.subscribeAdmin(function (m, kind) {
      if (kind === "insert" && !state.messages.some(function (x) { return x.id === m.id; })) {
        state.messages.push(m);
      } else if (kind === "update") {
        const idx = state.messages.findIndex(function (x) { return x.id === m.id; });
        if (idx > -1) state.messages[idx] = m;
        else state.messages.push(m);
      } else if (kind === "delete") {
        const idx = state.messages.findIndex(function (x) { return x.id === m.id; });
        const thread = idx > -1 ? state.messages[idx].thread : m.thread;
        if (idx > -1) state.messages.splice(idx, 1);
        if (thread && state.chatThread === thread && !els.modal.hidden) {
          if (state.messages.some(function (x) { return x.thread === thread; })) openChat(thread);
          else { state.chatThread = null; closeModal(); }
        }
      }
      updateMsgBadge();
      if (state.view === "messages") refresh();
      if (state.chatThread === m.thread && !els.modal.hidden) {
        if (kind === "insert") {
          refreshChatModal();
          REMOTE.chat.adminMarkRead(m.thread).then(function () {
            state.messages.forEach(function (x) { if (x.thread === m.thread) x.adminRead = true; });
            updateMsgBadge();
            if (state.view === "messages") renderView();
          }).catch(function () { /* ignore */ });
        } else if (kind === "update") {
          // Ẩn / hiện lại tin nhắn cũng là UPDATE → vẽ lại modal.
          refreshChatModal();
        }
      }
    });
  }

  function enterShell(admin) {
    state.me = admin;
    els.login.hidden = true;
    els.shell.hidden = false;
    els.loginErr.hidden = true;
    hydrateIcons(document);
    els.today.textContent = new Date().toLocaleDateString("vi-VN", {
      weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
    });
    els.who.textContent = "Chào, " + (admin.displayName || admin.username);
    renderChrome();
    load();
    subscribeRealtime();
  }

  async function loginSubmit(e) {
    e.preventDefault();
    const username = byId("admUserInput").value.trim();
    const password = byId("admPass").value;
    const btn = els.loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    els.loginErr.hidden = true;
    try {
      if (REMOTE) {
        const res = await REMOTE.admin.login(username, password);
        byId("admPass").value = "";
        enterShell(res.admin);
        return;
      }
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        els.loginErr.textContent = data.error || "Không đăng nhập được";
        els.loginErr.hidden = false;
        return;
      }
      byId("admPass").value = "";
      enterShell(data.admin);
    } catch (err) {
      els.loginErr.textContent = REMOTE
        ? (err.message || "Không đăng nhập được")
        : "Không kết nối được máy chủ. Hãy chạy npm start.";
      els.loginErr.hidden = false;
    } finally {
      btn.disabled = false;
    }
  }

  async function logout() {
    try { await api("/logout", { method: "POST" }); } catch (e) { /* ignore */ }
    showLogin();
  }

  /* Views ----------------------------------------------------------------- */
  const VIEW_META = {
    dashboard: { title: "Dashboard", sub: "Tổng quan hoạt động kinh doanh" },
    bookings: { title: "Đơn đăng ký", sub: "Theo dõi và xử lý đơn của khách" },
    messages: { title: "Tin nhắn", sub: "Trò chuyện trực tiếp với khách hàng" },
    subscribers: { title: "Đăng ký nhận tin", sub: "Email khách đã đăng ký nhận tin tức & ưu đãi" },
    tours: { title: "Quản lý tour", sub: "Giá bán, nội dung và trạng thái tour" },
    accounts: { title: "Tài khoản", sub: "Người dùng được vào khu quản trị" }
  };

  function renderChrome() {
    const meta = VIEW_META[state.view] || VIEW_META.dashboard;
    els.title.textContent = meta.title;
    els.sub.textContent = meta.sub;
    document.querySelectorAll("[data-view]").forEach(function (btn) {
      const on = btn.dataset.view === state.view;
      btn.classList.toggle("is-active", on);
      if (on) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    document.body.classList.remove("adm-side-open");
    els.burger.setAttribute("aria-expanded", "false");
  }

  function setView(view) {
    state.view = VIEW_META[view] ? view : "dashboard";
    renderChrome();
    window.scrollTo({ top: 0 });
    load();
  }

  function loadingHTML() {
    return '<div class="adm-empty"><p>Đang tải dữ liệu…</p></div>';
  }

  function errorHTML(message) {
    return (
      '<div class="adm-empty"><h3>Không tải được dữ liệu</h3>' +
        "<p>" + V.esc(message) + "</p>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-retry>Tải lại</button>' +
      "</div>"
    );
  }

  async function load() {
    const view = state.view;
    els.view.innerHTML = loadingHTML();
    try {
      if (view === "dashboard") {
        const jobs = [api("/bookings"), api("/tours")];
        if (REMOTE) jobs.push(REMOTE.chat.adminList());
        const results = await Promise.all(jobs);
        state.bookings = results[0].bookings;
        state.tours = results[1].tours;
        if (REMOTE) { state.messages = results[2]; updateMsgBadge(); }
        updateBadge();
      } else if (view === "bookings") {
        state.bookings = (await api("/bookings")).bookings;
        updateBadge();
      } else if (view === "messages") {
        if (!REMOTE) throw new Error("Tính năng chat cần kết nối Supabase.");
        state.messages = await REMOTE.chat.adminList();
        updateMsgBadge();
      } else if (view === "subscribers") {
        if (!REMOTE) throw new Error("Tính năng này cần kết nối Supabase.");
        state.subscribers = (await api("/subscribers")).subscribers;
      } else if (view === "tours") {
        state.tours = (await api("/tours")).tours;
      } else if (view === "accounts") {
        state.admins = (await api("/admins")).admins;
      }
      renderView();
    } catch (err) {
      if (els.shell.hidden) return;
      els.view.innerHTML = errorHTML(err.message);
    }
  }

  function renderView() {
    if (state.view === "bookings") els.view.innerHTML = bookingsHTML();
    else if (state.view === "messages") els.view.innerHTML = messagesHTML();
    else if (state.view === "subscribers") els.view.innerHTML = subscribersHTML();
    else if (state.view === "tours") els.view.innerHTML = toursHTML();
    else if (state.view === "accounts") els.view.innerHTML = accountsHTML();
    else els.view.innerHTML = dashboardHTML();
  }

  /* Dashboard ------------------------------------------------------------- */
  function dashboardHTML() {
    const bookings = state.bookings;
    const activeCount = state.tours.filter(function (t) { return t.active !== false; }).length;
    const confirmed = bookings.filter(function (b) { return statusOf(b) === "confirmed" || statusOf(b) === "done"; });
    const revenue = confirmed.reduce(function (sum, b) { return sum + Number(b.total || 0); }, 0);
    const newOnes = bookings.filter(function (b) { return statusOf(b) === "new"; }).length;

    const kpis =
      '<div class="adm-kpis">' +
        kpi("inbox", "Tổng đơn", num(bookings.length), "trên hệ thống", "--coral") +
        kpi("clock", "Đơn mới", num(newOnes), "chờ xác nhận", "") +
        kpi("wallet", "Doanh thu đã xác nhận", money(revenue), confirmed.length + " đơn đã chốt", "--gold") +
        kpi("map", "Tour đang bán", num(activeCount) + " / " + state.tours.length, "tour hiển thị cho khách", "") +
      "</div>";

    const recentRows = bookings.slice(0, 5).map(bookingRowHTML).join("");

    const recentPanel =
      '<section class="adm-panel">' +
        '<div class="adm-panel__head"><h2>Đơn gần đây</h2>' +
          (bookings.length ? '<button class="link" type="button" data-go="bookings">Xem tất cả →</button>' : "") +
        "</div>" +
        (bookings.length
          ? '<div class="adm-table-wrap" style="border:0;border-radius:0"><table class="adm-table adm-table--bookings"><thead><tr>' +
              "<th>Mã đơn</th><th>Khách</th><th>Tour</th><th>Ngày đi</th><th>Tổng</th><th>Trạng thái</th>" +
            "</tr></thead><tbody>" + recentRows + "</tbody></table></div>"
          : emptyHTML("Chưa có đơn nào", "Đơn khách gửi từ trang đặt tour sẽ xuất hiện tại đây.")) +
      "</section>";

    const bars = STATUS.map(function (s) {
      const n = bookings.filter(function (b) { return statusOf(b) === s.key; }).length;
      const pct = bookings.length ? Math.round((n / bookings.length) * 100) : 0;
      return (
        '<div class="adm-status-bar adm-status-bar--' + s.key + '">' +
          "<span>" + s.label + "</span>" +
          '<div class="adm-status-bar__track"><div class="adm-status-bar__fill" style="width:' + pct + '%"></div></div>' +
          "<b>" + n + "</b>" +
        "</div>"
      );
    }).join("");

    const mixPanel =
      '<section class="adm-panel"><div class="adm-panel__head"><h2>Trạng thái đơn</h2></div>' +
        '<div class="adm-status-bars">' + bars + "</div>" +
      "</section>";

    return kpis + '<div class="adm-grid2">' + recentPanel + mixPanel + "</div>";
  }

  function kpi(ico, label, value, foot, mod) {
    return (
      '<article class="adm-kpi' + (mod ? " adm-kpi" + mod : "") + '">' +
        '<div class="adm-kpi__top"><span class="adm-kpi__ico">' + icon(ico, 20) + "</span></div>" +
        '<span class="adm-kpi__label">' + V.esc(label) + "</span>" +
        '<span class="adm-kpi__value">' + V.esc(value) + "</span>" +
        '<span class="adm-kpi__foot">' + V.esc(foot) + "</span>" +
      "</article>"
    );
  }

  function bookingRowHTML(b) {
    return (
      '<tr data-booking="' + V.esc(b.code) + '">' +
        "<td>" + '<span class="adm-code">' + V.esc(b.code) + "</span>" +
          '<span class="adm-sub">' + fdatetime(b.createdAt) + "</span>" +
          (b.note ? ' <span class="adm-note-flag">●</span>' : "") +
        "</td>" +
        "<td>" + V.esc(b.contact && b.contact.name ? b.contact.name : "—") +
          '<span class="adm-sub">' + V.esc(b.contact && b.contact.phone ? b.contact.phone : "") + "</span></td>" +
        '<td><span class="adm-tour-name">' + V.esc(b.tourTitle || "—") + "</span></td>" +
        "<td>" + fdate(b.date) + "</td>" +
        '<td class="adm-money">' + money(b.total) + "</td>" +
        "<td>" + badge(statusOf(b)) + "</td>" +
        '<td><button class="adm-row-btn" type="button" data-booking="' + V.esc(b.code) + '">Chi tiết</button></td>' +
      "</tr>"
    );
  }

  function emptyHTML(title, sub) {
    return (
      '<div class="adm-empty">' +
        "<h3>" + V.esc(title) + "</h3>" +
        "<p>" + V.esc(sub) + "</p>" +
      "</div>"
    );
  }

  /* Bookings -------------------------------------------------------------- */
  function bookingsFiltered() {
    const q = state.q.toLowerCase();
    return state.bookings.filter(function (b) {
      if (state.status !== "all" && statusOf(b) !== state.status) return false;
      if (!q) return true;
      const c = b.contact || {};
      const hay = [b.code, c.name, c.phone, c.email, b.tourTitle].join(" ").toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  function bookingsHTML() {
    const all = state.bookings;
    const list = bookingsFiltered();

    const tabs = [{ key: "all", label: "Tất cả", n: all.length }]
      .concat(STATUS.map(function (s) {
        return { key: s.key, label: s.label, n: all.filter(function (b) { return statusOf(b) === s.key; }).length };
      }))
      .map(function (s) {
        return (
          '<button class="adm-tab' + (state.status === s.key ? " is-active" : "") + '" type="button" data-status-filter="' + s.key + '">' +
            V.esc(s.label) + "<em>" + s.n + "</em>" +
          "</button>"
        );
      }).join("");

    const table = list.length
      ? '<div class="adm-table-wrap"><table class="adm-table adm-table--bookings"><thead><tr>' +
          "<th>Mã đơn</th><th>Khách</th><th>Tour</th><th>Ngày đi</th><th>Tổng</th><th>Trạng thái</th><th></th>" +
        "</tr></thead><tbody>" + list.map(bookingRowHTML).join("") + "</tbody></table></div>"
      : '<div class="adm-table-wrap">' + (all.length ? emptyHTML("Không tìm thấy đơn", "Thử từ khóa khác hoặc bỏ bộ lọc trạng thái.") : emptyHTML("Chưa có đơn nào", "Khi khách đặt tour trên website, đơn sẽ xuất hiện tại đây.")) + "</div>";

    return (
      '<div class="adm-tools">' +
        '<div class="adm-search"><span class="adm-nav__ico">' + icon("search", 17) + "</span>" +
          '<input type="search" id="admSearch" placeholder="Tìm mã đơn, tên, SĐT, email…" value="' + V.esc(state.q) + '" />' +
        "</div>" +
        '<div class="adm-tabs">' + tabs + "</div>" +
      "</div>" + table
    );
  }

  /* Messages -------------------------------------------------------------- */
  function isSuperAdmin() {
    const email = window.V4T_API && window.V4T_API.SUPER_ADMIN_EMAIL;
    return !!(email && state.me && String(state.me.username || "").toLowerCase() === String(email).toLowerCase());
  }

  function chatThreads() {
    const map = {};
    state.messages.forEach(function (m) {
      const cur = map[m.thread] || { thread: m.thread, last: null, lastAny: m, unread: 0, name: "Khách", count: 0, hidden: 0 };
      if (m.sender === "customer") cur.name = m.authorName || cur.name;
      if (String(m.createdAt) > String(cur.lastAny.createdAt)) cur.lastAny = m;
      if (m.deletedAt) {
        cur.hidden++;
      } else {
        if (!cur.last || String(m.createdAt) > String(cur.last.createdAt)) cur.last = m;
        if (m.sender === "customer" && !m.adminRead) cur.unread++;
      }
      cur.count++;
      map[m.thread] = cur;
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return String(b.lastAny.createdAt).localeCompare(String(a.lastAny.createdAt)); });
  }

  function messagesHTML() {
    const all = chatThreads();
    const active = all.filter(function (t) { return !!t.last; });
    const hidden = all.filter(function (t) { return !t.last; });
    const showHidden = state.msgFilter === "hidden";
    const list = showHidden ? hidden : active;
    const tabs =
      '<button class="adm-tab' + (!showHidden ? " is-active" : "") + '" type="button" data-msg-filter="active">Đang hiện <em>' + active.length + "</em></button>" +
      '<button class="adm-tab' + (showHidden ? " is-active" : "") + '" type="button" data-msg-filter="hidden">Đã ẩn <em>' + hidden.length + "</em></button>";
    const head =
      '<section class="adm-panel">' +
        '<div class="adm-panel__head"><h2>Hội thoại với khách</h2>' +
          '<span class="adm-sub">Ẩn hội thoại đã kết thúc cho gọn — khách vẫn thấy toàn bộ tin nhắn.</span></div>' +
        '<div class="adm-tools"><div class="adm-tabs">' + tabs + "</div></div>";
    if (!list.length) {
      const empty = showHidden
        ? emptyHTML("Chưa có hội thoại nào bị ẩn", "Bấm nút thùng rác ở một hội thoại để ẩn nó vào đây.")
        : emptyHTML("Chưa có tin nhắn", "Khách gửi tin từ nút trò chuyện trên trang web sẽ xuất hiện tại đây.");
      return head + empty + "</section>";
    }
    const rows = list.map(function (t) {
      const preview = showHidden ? String(t.lastAny.body || "").slice(0, 90) : String(t.last.body || "").slice(0, 90);
      const previewSender = showHidden ? t.lastAny.sender : t.last.sender;
      return (
        '<tr data-chat-thread="' + V.esc(t.thread) + '"' + (showHidden ? ' class="adm-chat-row--hidden"' : "") + ">" +
          "<td><strong>" + V.esc(t.name) + "</strong>" +
            '<span class="adm-sub">' + t.count + " tin nhắn</span></td>" +
          "<td>" + V.esc((previewSender === "admin" ? "Bạn: " : "") + preview) + "</td>" +
          "<td>" + fdatetime(t.lastAny.createdAt) + "</td>" +
          "<td>" + (t.unread ? '<span class="adm-badge adm-badge--new">' + t.unread + " mới</span>" : "—") + "</td>" +
          '<td class="adm-chat-actions">' +
            '<button class="adm-row-btn" type="button" data-chat-thread="' + V.esc(t.thread) + '">Mở</button>' +
            (showHidden
              ? '<button class="adm-row-btn" type="button" data-chat-restore-thread="' + V.esc(t.thread) + '" aria-label="Hiện lại hội thoại" title="Hiện lại trong danh sách">' + icon("eye", 14) + "</button>" +
                (isSuperAdmin()
                  ? '<button class="adm-row-btn adm-row-btn--danger" type="button" data-chat-purge-thread="' + V.esc(t.thread) + '" aria-label="Xóa vĩnh viễn hội thoại" title="Xóa vĩnh viễn (không thể khôi phục)">' + icon("trash", 14) + "</button>"
                  : "")
              : '<button class="adm-row-btn adm-row-btn--danger" type="button" data-chat-del-thread="' + V.esc(t.thread) + '" aria-label="Ẩn hội thoại" title="Ẩn khỏi danh sách admin (khách vẫn thấy)">' + icon("trash", 14) + "</button>") +
          "</td>" +
        "</tr>"
      );
    }).join("");
    return (
      head +
        '<div class="adm-table-wrap" style="border:0;border-radius:0">' +
          '<table class="adm-table"><thead><tr><th>Khách</th><th>Tin gần nhất</th><th>Thời gian</th><th>Chưa đọc</th><th></th></tr></thead>' +
          "<tbody>" + rows + "</tbody></table>" +
        "</div>" +
      "</section>"
    );
  }

  function chatModalHTML(thread) {
    const all = state.messages.filter(function (m) { return m.thread === thread; });
    const msgs = all.slice(-100);
    const allHidden = all.length > 0 && all.every(function (m) { return !!m.deletedAt; });
    const name = (msgs.find(function (m) { return m.sender === "customer"; }) || {}).authorName || "Khách";
    const bubbles = msgs.map(function (m) {
      return '<div class="adm-chat-bubble' + (m.sender === "admin" ? " is-admin" : "") + '">' +
        "<small>" + V.esc(m.authorName) + " · " + fdatetime(m.createdAt) + "</small>" +
        "<p>" + V.esc(m.body) + "</p>" +
        "</div>";
    }).join("");
    return (
      '<div class="adm-modal__head">' +
        '<div><h2 id="admModalTitle">' + V.esc(name) + "</h2><small>" +
          (allHidden ? "Đã ẩn khỏi danh sách — khách vẫn thấy tin nhắn" : "Trò chuyện trực tiếp") + "</small></div>" +
        '<button class="adm-modal__close" type="button" data-close aria-label="Đóng">' + icon("x", 16) + "</button>" +
      "</div>" +
      '<div class="adm-modal__body">' +
        '<div class="adm-chat-log">' + (bubbles || '<p class="adm-sub">Chưa có tin nhắn.</p>') + "</div>" +
        '<div class="adm-field"><label for="admChatText">Trả lời khách</label>' +
          '<textarea id="admChatText" class="adm-note-area" rows="3" placeholder="Nhập câu trả lời…"></textarea></div>' +
      "</div>" +
      '<div class="adm-modal__foot">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-close>Đóng</button>' +
        (allHidden
          ? '<button class="btn btn--ghost btn--sm" type="button" data-chat-restore-thread>' + icon("eye", 15) + " Hiện lại hội thoại</button>" +
            (isSuperAdmin()
              ? '<button class="btn btn--danger btn--sm" type="button" data-chat-purge-thread>' + icon("trash", 15) + " Xóa vĩnh viễn</button>"
              : "")
          : '<button class="btn btn--danger btn--sm" type="button" data-chat-del-thread>' + icon("trash", 15) + " Ẩn hội thoại</button>") +
        '<button class="btn btn--primary btn--sm" type="button" data-chat-send>' + icon("send", 15) + " Gửi trả lời</button>" +
      "</div>"
    );
  }

  // Vẽ lại modal chat nhưng giữ nội dung đang gõ dở trong ô trả lời.
  function refreshChatModal() {
    if (!state.chatThread || els.modal.hidden) return;
    const draft = byId("admChatText");
    const text = draft ? draft.value : "";
    openModal(chatModalHTML(state.chatThread));
    const input = byId("admChatText");
    if (input) input.value = text;
    const log = els.modalCard.querySelector(".adm-chat-log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  function openChat(thread) {
    state.chatThread = thread;
    openModal(chatModalHTML(thread));
    const log = els.modalCard.querySelector(".adm-chat-log");
    if (log) log.scrollTop = log.scrollHeight;
    if (REMOTE) {
      REMOTE.chat.adminMarkRead(thread).then(function () {
        state.messages.forEach(function (m) { if (m.thread === thread) m.adminRead = true; });
        updateMsgBadge();
        if (state.view === "messages") renderView();
      }).catch(function () { /* ignore */ });
    }
  }

  async function sendChatReply() {
    if (!state.chatThread || !REMOTE) return;
    const input = byId("admChatText");
    const text = input ? input.value.trim() : "";
    if (!text) { V.toast("Nhập nội dung trả lời"); return; }
    try {
      const msg = await REMOTE.chat.adminReply(state.chatThread, text, state.me.displayName);
      state.messages.push(msg);
      if (input) input.value = "";
      openChat(state.chatThread);
      V.toast("Đã gửi câu trả lời");
    } catch (err) {
      V.toast(err.message);
    }
  }

  function afterChatMutation() {
    updateMsgBadge();
    refreshChatModal();
    if (state.view === "messages") renderView();
  }

  function setThreadDeleted(thread, deleted) {
    const stamp = deleted ? new Date().toISOString() : null;
    state.messages.forEach(function (m) { if (m.thread === thread) m.deletedAt = stamp; });
  }

  async function hideChatThread(thread) {
    if (!REMOTE || !thread) return;
    if (!window.confirm("Ẩn hội thoại này khỏi danh sách admin cho gọn? Khách vẫn thấy toàn bộ tin nhắn. Bạn có thể hiện lại bất cứ lúc nào.")) return;
    try {
      await REMOTE.chat.adminDeleteThread(thread);
      setThreadDeleted(thread, true);
      afterChatMutation();
      V.toast("Đã ẩn hội thoại khỏi danh sách");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function restoreChatThread(thread) {
    if (!REMOTE || !thread) return;
    try {
      await REMOTE.chat.adminRestoreThread(thread);
      setThreadDeleted(thread, false);
      afterChatMutation();
      V.toast("Đã hiện lại hội thoại");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function purgeChatThread(thread) {
    if (!REMOTE || !thread || !isSuperAdmin()) return;
    if (!window.confirm(
      "XÓA VĨNH VIỄN toàn bộ hội thoại này?\n\n" +
      "Dữ liệu sẽ mất vĩnh viễn, không thể khôi phục. Khách cũng sẽ không còn thấy tin nhắn. " +
      "Chỉ nên dùng với hội thoại đã kết thúc."
    )) return;
    try {
      await REMOTE.chat.adminPurgeThread(thread);
      state.messages = state.messages.filter(function (m) { return m.thread !== thread; });
      updateMsgBadge();
      if (state.chatThread === thread) { state.chatThread = null; closeModal(); }
      if (state.view === "messages") renderView();
      V.toast("Đã xóa vĩnh viễn hội thoại");
    } catch (err) {
      V.toast(err.message);
    }
  }

  /* Newsletter ------------------------------------------------------------- */
  function subscribersHTML() {
    const rows = state.subscribers.map(function (s, i) {
      return "<tr>" +
        "<td>" + (i + 1) + "</td>" +
        '<td><span class="adm-code">' + V.esc(s.email) + "</span></td>" +
        "<td>" + V.esc(V.fmtDate(s.createdAt)) + "</td>" +
        "</tr>";
    }).join("");
    return (
      '<div class="adm-tools" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        '<p style="font-size:.8rem;color:var(--muted);margin:0">Tổng: <strong>' + state.subscribers.length + "</strong> email đăng ký nhận tin.</p>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-sub-export>' + icon("external", 14) + " Xuất CSV</button>" +
      "</div>" +
      (rows
        ? '<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>#</th><th>Email</th><th>Ngày đăng ký</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
        : '<div class="adm-empty"><h3>Chưa có email nào</h3><p>Khách đăng ký ở footer trang chủ sẽ xuất hiện tại đây.</p></div>')
    );
  }

  function exportSubscribers() {
    const lines = ["email,created_at"].concat(state.subscribers.map(function (s) {
      return '"' + String(s.email).replace(/"/g, '""') + '","' + String(s.createdAt || "") + '"';
    }));
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vietnam4trip-subscribers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  /* Tours ----------------------------------------------------------------- */
  function toursHTML() {
    const active = state.tours.filter(function (tr) { return !tr._deleted; });
    const deleted = state.tours.filter(function (tr) { return !!tr._deleted; });
    const showDeleted = state.tourFilter === "deleted";
    const list = showDeleted ? deleted : active;
    const tabs =
      '<div class="adm-tabs">' +
        '<button class="adm-tab' + (showDeleted ? "" : " is-active") + '" type="button" data-tour-filter="active">Đang dùng <em>' + active.length + "</em></button>" +
        '<button class="adm-tab' + (showDeleted ? " is-active" : "") + '" type="button" data-tour-filter="deleted">Đã xóa <em>' + deleted.length + "</em></button>" +
      "</div>";
    const cards = list.map(function (tr) {
      const dest = V.destOf(tr.dest);
      const types = (tr.type || []).map(function (ty) { return TYPE_VI[ty] || ty; }).join(" · ");
      const dur = tr.duration <= 1 ? "1 ngày" : tr.duration + "N" + (tr.duration - 1) + "Đ";
      const stateLabel = showDeleted ? "Đã xóa" : (tr.active ? "Đang bán" : "Tạm ẩn");
      const foot = showDeleted
        ? '<div class="adm-tour__foot">' +
            '<button class="btn btn--primary btn--sm adm-tour__wide" type="button" data-tour-restore="' + V.esc(tr.id) + '">' +
              icon("restore", 14) + " Khôi phục tour" +
            "</button>" +
          "</div>"
        : '<div class="adm-tour__foot">' +
            '<button class="btn btn--primary btn--sm adm-tour__wide" type="button" data-tour-save>' + icon("check", 14) + " Lưu thay đổi</button>" +
            '<div class="adm-tour__foot-sub">' +
              (tr._custom ? "" : '<button class="btn btn--ghost btn--sm" type="button" data-tour-base title="Khôi phục giá gốc">Giá gốc</button>') +
              (REMOTE ? '<button class="btn btn--ghost btn--sm" type="button" data-tour-content>' + icon("edit", 14) + " Sửa</button>" : "") +
              (REMOTE ? '<button class="btn btn--danger btn--sm" type="button" data-tour-delete-card="' + V.esc(tr.id) + '" title="Xóa tour">' + icon("trash", 14) + " Xóa</button>" : "") +
            "</div>" +
          "</div>";
      return (
        '<article class="adm-tour' + (showDeleted ? " is-deleted" : "") + '" data-tour-card="' + V.esc(tr.id) + '">' +
          '<div class="adm-tour__media">' +
            '<img src="' + tr.img + '" alt="' + V.esc(tr.title.vi) + '" loading="lazy" />' +
            '<span class="adm-tour__state' + (showDeleted || !tr.active ? " is-off" : "") + '" data-tour-state>' + stateLabel + "</span>" +
          "</div>" +
          '<div class="adm-tour__body">' +
            '<a class="adm-tour__title" href="tour.html?id=' + V.esc(tr.id) + '" target="_blank">' + V.esc(tr.title.vi) + "</a>" +
            '<div class="adm-tour__meta">' + V.esc(dest ? dest.name.vi : "") + " · " + dur + " · " + V.esc(types) +
              (tr._custom ? ' · <span class="adm-badge adm-badge--new">Tour tạo mới</span>' : "") + "</div>" +
            '<div class="adm-tour__price-row">' +
              '<label for="tp-' + V.esc(tr.id) + '">Giá / khách</label>' +
              '<input id="tp-' + V.esc(tr.id) + '" type="number" inputmode="numeric" min="100000" step="50000" value="' + tr.price + '" data-tour-price />' +
            "</div>" +
            '<div class="adm-tour__switches">' +
              '<label class="adm-switch"><input type="checkbox" data-tour-active' + (tr.active ? " checked" : "") + " />Đang bán</label>" +
              '<label class="adm-switch"><input type="checkbox" data-tour-featured' + (tr.featured ? " checked" : "") + " />Nổi bật</label>" +
            "</div>" +
            foot +
          "</div>" +
        "</article>"
      );
    }).join("");
    if (!list.length) {
      const msg = showDeleted
        ? "Chưa có tour nào bị xóa. Các tour bạn xóa sẽ xuất hiện ở đây để khôi phục."
        : "Chưa có tour nào.";
      return '<section class="adm-panel">' + tabs + emptyHTML("Trống", msg) + "</section>";
    }
    return (
      '<div class="adm-tools" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        "<p style=\"font-size:.8rem;color:var(--muted);margin:0\">" +
          (showDeleted
            ? "Tour đã xóa vẫn giữ dữ liệu. Bấm Khôi phục để đưa lại lên website."
            : (REMOTE
              ? "Lưu trên Supabase — khách thấy thay đổi ngay (Realtime). Chỉnh sửa tiêu đề, ảnh, lịch trình…"
              : "Thay đổi lưu trên máy chủ và áp dụng cho mọi khách truy cập ngay khi họ tải lại trang.")) +
        "</p>" +
        (REMOTE && !showDeleted ? '<button class="btn btn--primary btn--sm" type="button" data-tour-add>' + icon("plus", 14) + " Thêm tour</button>" : "") +
      "</div>" +
      tabs +
      '<div class="adm-tour-grid">' + cards + "</div>"
    );
  }

  function tourFromCard(card) {
    return state.tours.find(function (t) { return t.id === card.dataset.tourCard; });
  }

  function currentTourState(card, withPrice) {
    const input = card.querySelector("[data-tour-price]");
    const tour = tourFromCard(card);
    const price = withPrice && input ? Math.round(Number(input.value)) : (tour ? tour.price : NaN);
    return {
      price: price,
      active: card.querySelector("[data-tour-active]").checked,
      featured: card.querySelector("[data-tour-featured]").checked,
      content: tour ? JSON.parse(JSON.stringify(tour._content || {})) : {}
    };
  }

  function paintTour(card, tour) {
    const stateEl = card.querySelector("[data-tour-state]");
    if (stateEl) {
      stateEl.textContent = tour.active ? "Đang bán" : "Tạm ẩn";
      stateEl.classList.toggle("is-off", !tour.active);
    }
    const input = card.querySelector("[data-tour-price]");
    if (input) {
      input.value = tour.price;
      input.closest(".adm-tour__price-row").classList.remove("adm-tour__dirty");
    }
    const activeBox = card.querySelector("[data-tour-active]");
    const featuredBox = card.querySelector("[data-tour-featured]");
    if (activeBox) activeBox.checked = tour.active;
    if (featuredBox) featuredBox.checked = tour.featured;
    const idx = state.tours.findIndex(function (t) { return t.id === tour.id; });
    if (idx > -1) state.tours[idx] = tour;
  }

  async function saveTourCard(card) {
    const body = currentTourState(card, true);
    if (!body.price || body.price < 100000) {
      V.toast("Giá phải từ 100.000₫ trở lên");
      const input = card.querySelector("[data-tour-price]");
      if (input) input.focus();
      return;
    }
    try {
      const res = await api("/tours/" + encodeURIComponent(card.dataset.tourCard), { method: "PUT", body: body });
      paintTour(card, res.tour);
      V.toast("Đã lưu thay đổi cho \"" + res.tour.title.vi + "\"");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function toggleTourFlag(card, key) {
    const body = currentTourState(card, false);
    try {
      const res = await api("/tours/" + encodeURIComponent(card.dataset.tourCard), { method: "PUT", body: body });
      paintTour(card, res.tour);
      V.toast(key === "active"
        ? (res.tour.active ? "Tour đang hiển thị cho khách" : "Đã tạm ẩn tour")
        : (res.tour.featured ? "Đã gắn nhãn nổi bật" : "Đã bỏ nhãn nổi bật"));
    } catch (err) {
      paintTour(card, tourFromCard(card));
      V.toast(err.message);
    }
  }

  async function resetTourPrice(card) {
    const tour = tourFromCard(card);
    if (!tour) return;
    const body = {
      price: tour.basePrice,
      active: card.querySelector("[data-tour-active]").checked,
      featured: card.querySelector("[data-tour-featured]").checked
    };
    try {
      const res = await api("/tours/" + encodeURIComponent(tour.id), { method: "PUT", body: body });
      paintTour(card, res.tour);
      V.toast("Đã khôi phục giá gốc");
    } catch (err) {
      V.toast(err.message);
    }
  }

  function v_esc(v) { return V.esc(v == null ? "" : v); }

  function langFields(label, prefix, obj) {
    const o = obj || {};
    return (
      '<div class="adm-field"><label>' + label + " (VI)</label><input id=\"" + prefix + "Vi\" type=\"text\" value=\"" + v_esc(o.vi) + "\" /></div>" +
      '<div class="adm-field"><label>' + label + " (EN)</label><input id=\"" + prefix + "En\" type=\"text\" value=\"" + v_esc(o.en) + "\" /></div>"
    );
  }

  function highlightRow(item) {
    const o = item || {};
    return '<div class="adm-repeater__row" data-row>' +
      '<input data-hl="vi" type="text" placeholder="Tiếng Việt" value="' + v_esc(o.vi) + '" />' +
      '<input data-hl="en" type="text" placeholder="English" value="' + v_esc(o.en) + '" />' +
      '<button class="adm-icon-btn" type="button" data-remove-row aria-label="Xóa">' + icon("trash", 15) + "</button></div>";
  }

  function itineraryRow(item) {
    const o = item || {};
    const title = o.title || {};
    const desc = o.desc || {};
    return '<div class="adm-repeat-card" data-row>' +
      '<div class="adm-repeat-card__top">' +
        '<label>Ngày <input data-it="day" type="number" min="1" max="60" value="' + v_esc(o.day == null ? 1 : o.day) + '" /></label>' +
        '<button class="adm-icon-btn" type="button" data-remove-row aria-label="Xóa">' + icon("trash", 15) + "</button>" +
      "</div>" +
      '<input data-it="titleVi" type="text" placeholder="Tiêu đề (VI)" value="' + v_esc(title.vi) + '" />' +
      '<input data-it="titleEn" type="text" placeholder="Title (EN)" value="' + v_esc(title.en) + '" />' +
      '<textarea data-it="descVi" rows="3" placeholder="Mô tả (VI)">' + v_esc(desc.vi) + "</textarea>" +
      '<textarea data-it="descEn" rows="3" placeholder="Description (EN)">' + v_esc(desc.en) + "</textarea>" +
    "</div>";
  }

  function galleryRow(url) {
    return '<div class="adm-repeater__row" data-row>' +
      '<input data-gallery type="text" placeholder="assets/img/... hoặc https://..." value="' + v_esc(url) + '" />' +
      '<button class="adm-icon-btn" type="button" data-remove-row aria-label="Xóa">' + icon("trash", 15) + "</button></div>";
  }

  function tourEditorHTML(tour, isNew) {
    const c = tour._content || {};
    const fallback = isNew ? {} : tour;
    const title = c.title || fallback.title || {};
    const tagline = c.tagline || fallback.tagline || {};
    const departure = c.departure || fallback.departure || {};
    const group = c.group || fallback.group || {};
    const sourceHighlights = c.highlights || fallback.highlights || [];
    const sourceItinerary = c.itinerary || fallback.itinerary || [];
    const sourceGallery = c.gallery || fallback.gallery || [];
    const highlights = (sourceHighlights.length ? sourceHighlights : [{}]).map(highlightRow).join("");
    const itinerary = (sourceItinerary.length ? sourceItinerary : [{}]).map(itineraryRow).join("");
    const gallery = (sourceGallery.length ? sourceGallery : [""]).map(galleryRow).join("");
    const destKeys = (window.VV_DATA.destinations || []).map(function (d) { return d.key; });
    const curDest = c.dest || fallback.dest || "";
    const curRegion = c.region || fallback.region || "";
    const curTypes = c.type || fallback.type || [];
    if (curDest && destKeys.indexOf(curDest) < 0) destKeys.unshift(curDest);
    const destOptions = '<option value="">— Chọn điểm đến —</option>' + destKeys.map(function (key) {
      const d = (window.VV_DATA.destinations || []).find(function (x) { return x.key === key; });
      return '<option value="' + v_esc(key) + '"' + (curDest === key ? " selected" : "") + ">" +
        v_esc(d ? d.name.vi : key) + "</option>";
    }).join("");
    const regionOptions = '<option value="">— Chọn —</option>' + ["north", "central", "south"].map(function (r) {
      const label = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" }[r];
      return '<option value="' + r + '"' + (curRegion === r ? " selected" : "") + ">" + label + "</option>";
    }).join("");
    const typeBoxes = Object.keys(TYPE_VI).map(function (key) {
      const checked = curTypes.indexOf(key) > -1 ? " checked" : "";
      return '<label class="adm-switch"><input type="checkbox" data-te-type value="' + key + '"' + checked + " />" + TYPE_VI[key] + "</label>";
    }).join("");

    return (
      '<div class="adm-modal__head">' +
        '<div><h2 id="admModalTitle">' + (isNew ? "Thêm tour mới" : "Chỉnh sửa tour") + "</h2><small>" + V.esc(tour.title.vi) + "</small></div>" +
        '<button class="adm-modal__close" type="button" data-close aria-label="Đóng">' + icon("x", 16) + "</button>" +
      "</div>" +
      '<div class="adm-modal__body">' +
        '<div class="adm-form">' +
          '<div class="adm-form__2col">' +
            (isNew ? '<div class="adm-field"><label for="teId">Mã tour (slug, không đổi sau này)</label><input id="teId" type="text" placeholder="phu-quoc-3n2d" /></div>' : "") +
            '<div class="adm-field"><label for="tePrice">Giá / khách (₫)</label><input id="tePrice" type="number" min="100000" step="50000" value="' + v_esc(tour.price) + '" /></div>' +
            langFields("Tiêu đề", "teTitle", title) +
            langFields("Mô tả ngắn", "teTag", tagline) +
            '<div class="adm-field"><label for="teDest">Điểm đến</label><select id="teDest">' + destOptions + "</select></div>" +
            '<div class="adm-field"><label for="teRegion">Miền</label><select id="teRegion">' + regionOptions + "</select></div>" +
            '<div class="adm-field"><label for="teDuration">Số ngày</label><input id="teDuration" type="number" min="1" max="60" value="' + v_esc(c.duration == null ? tour.duration : c.duration) + '" /></div>' +
            '<div class="adm-field"><label for="teImg">Ảnh đại diện (URL/file)</label><input id="teImg" type="text" value="' + v_esc(c.img == null ? tour.img : c.img) + '" /></div>' +
            '<div class="adm-field"><label for="teBadge">Nhãn (bestseller/sale/new…)</label><input id="teBadge" type="text" value="' + v_esc(c.badge || fallback.badge) + '" /></div>' +
            '<div class="adm-field"><label for="teRating">Đánh giá</label><input id="teRating" type="number" min="0" max="5" step="0.1" value="' + v_esc(c.rating == null ? (fallback.rating || 0) : c.rating) + '" /></div>' +
            '<div class="adm-field"><label for="teReviews">Số lượt đánh giá</label><input id="teReviews" type="number" min="0" value="' + v_esc(c.reviews == null ? (fallback.reviews || 0) : c.reviews) + '" /></div>' +
            '<div class="adm-field"><label for="teOldPrice">Giá cũ (₫, trống = không có)</label><input id="teOldPrice" type="number" min="0" step="50000" value="' + v_esc(c.oldPrice == null ? (fallback.oldPrice || "") : c.oldPrice) + '" /></div>' +
          "</div>" +
          langFields("Khởi hành", "teDeparture", departure) +
          langFields("Quy mô đoàn", "teGroup", group) +
          '<div class="adm-field"><label>Loại tour</label><div class="adm-switch-row">' + typeBoxes + "</div></div>" +
          '<div class="adm-field"><label class="adm-switch"><input id="teActive" type="checkbox"' + (tour.active !== false ? " checked" : "") + " />Đang bán</label>" +
            '<label class="adm-switch"><input id="teFeatured" type="checkbox"' + (tour.featured ? " checked" : "") + " />Nổi bật</label></div>" +

          '<div class="adm-section">' +
            '<div class="adm-section__head"><h3>Điểm nhấn</h3><button class="btn btn--ghost btn--sm" type="button" data-add="highlights">' + icon("plus", 14) + " Thêm</button></div>" +
            '<div class="adm-repeater" id="teRows-highlights">' + highlights + "</div>" +
          "</div>" +
          '<div class="adm-section">' +
            '<div class="adm-section__head"><h3>Lịch trình</h3><button class="btn btn--ghost btn--sm" type="button" data-add="itinerary">' + icon("plus", 14) + " Thêm ngày</button></div>" +
            '<div class="adm-repeater" id="teRows-itinerary">' + itinerary + "</div>" +
          "</div>" +
          '<div class="adm-section">' +
            '<div class="adm-section__head"><h3>Thư viện ảnh</h3><button class="btn btn--ghost btn--sm" type="button" data-add="gallery">' + icon("plus", 14) + " Thêm ảnh</button></div>" +
            '<div class="adm-repeater" id="teRows-gallery">' + gallery + "</div>" +
          "</div>" +
          '<div class="adm-field"><label for="teJson">Nội dung nâng cao (JSON) — dùng cho trường đặc biệt ngoài giao diện</label>' +
            '<textarea id="teJson" class="adm-note-area adm-json" rows="8" spellcheck="false">' + V.esc(JSON.stringify(c, null, 2)) + "</textarea></div>" +
          '<p class="adm-sub">Các field ở trên sẽ ghi đè vào JSON. JSON ở cuối là nguồn gốc; chỉnh sửa cẩn thận.</p>' +
        "</div>" +
      "</div>" +
      '<div class="adm-modal__foot">' +
        (isNew ? "" : '<button class="btn btn--danger btn--sm" type="button" data-tour-delete>' + icon("trash", 14) + " Xóa tour</button>") +
        '<button class="btn btn--ghost btn--sm" type="button" data-close>Hủy</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-content-save>Lưu tour</button>' +
      "</div>"
    );
  }

  function openTourEditor(card) {
    const isNew = !card;
    const tour = isNew
      ? { id: "", price: 1990000, title: { vi: "Tour mới" }, active: true, featured: false, img: "assets/img/hero.jpg", duration: 3, rating: 4.8, reviews: 0, _content: {} }
      : tourFromCard(card);
    if (!tour) return;
    state.contentTourId = isNew ? "__new__" : tour.id;
    state.modalMode = isNew ? "add" : "edit";
    openModal(tourEditorHTML(tour, isNew));
  }

  function readLang(prefix) {
    const vi = byId(prefix + "Vi");
    const en = byId(prefix + "En");
    return { vi: vi ? vi.value.trim() : "", en: en ? en.value.trim() : "" };
  }

  function readRepeatRows(key, mapper) {
    const wrap = byId("teRows-" + key);
    if (!wrap) return [];
    return Array.prototype.map.call(wrap.querySelectorAll("[data-row]"), mapper)
      .filter(function (v) { return v && JSON.stringify(v).replace(/["{}\s:,]/g, "").length > 0; });
  }

  async function saveTourContent() {
    const isNew = state.modalMode === "add";
    const tour = isNew ? null : state.tours.find(function (t) { return t.id === state.contentTourId; });
    if (!isNew && !tour) return;

    let patch;
    try {
      patch = JSON.parse(byId("teJson").value || "{}");
      if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error("bad json");
    } catch (e) {
      V.toast("JSON không hợp lệ. Kiểm tra lại nội dung nâng cao.");
      return;
    }

    const title = readLang("teTitle");
    const tagline = readLang("teTag");
    const departure = readLang("teDeparture");
    const group = readLang("teGroup");
    if (title.vi || title.en) patch.title = title;
    if (tagline.vi || tagline.en) patch.tagline = tagline;
    if (departure.vi || departure.en) patch.departure = departure;
    if (group.vi || group.en) patch.group = group;

    const text = function (id) { const el = byId(id); return el ? el.value.trim() : ""; };
    const num = function (id) { const el = byId(id); return el && el.value !== "" ? Number(el.value) : null; };
    ["teImg", "teBadge", "teDest", "teRegion"].forEach(function (id) {
      const key = { teImg: "img", teBadge: "badge", teDest: "dest", teRegion: "region" }[id];
      const v = text(id);
      if (v) patch[key] = v;
    });
    const duration = num("teDuration");
    if (duration) patch.duration = duration;
    const rating = num("teRating");
    if (rating != null) patch.rating = rating;
    const reviews = num("teReviews");
    if (reviews != null) patch.reviews = reviews;
    const oldPrice = num("teOldPrice");
    patch.oldPrice = oldPrice;
    patch.type = Array.prototype.map.call(document.querySelectorAll("[data-te-type]:checked"), function (el) { return el.value; });

    patch.highlights = readRepeatRows("highlights", function (row) {
      const vi = row.querySelector('[data-hl="vi"]').value.trim();
      const en = row.querySelector('[data-hl="en"]').value.trim();
      return vi || en ? { vi: vi, en: en } : null;
    });
    patch.itinerary = readRepeatRows("itinerary", function (row) {
      const get = function (k) { return row.querySelector('[data-it="' + k + '"]'); };
      const titleVi = get("titleVi").value.trim();
      const titleEn = get("titleEn").value.trim();
      const descVi = get("descVi").value.trim();
      const descEn = get("descEn").value.trim();
      const day = Number(get("day").value) || 1;
      return titleVi || titleEn || descVi || descEn
        ? { day: day, title: { vi: titleVi, en: titleEn }, desc: { vi: descVi, en: descEn } }
        : null;
    });
    patch.gallery = readRepeatRows("gallery", function (row) {
      return row.querySelector("[data-gallery]").value.trim();
    }).filter(function (url) { return !!url; });

    const price = num("tePrice");
    const body = {
      price: price,
      active: byId("teActive").checked,
      featured: byId("teFeatured").checked,
      titleVi: title.vi || (isNew ? text("teId") : tour.title.vi),
      content: patch
    };
    if (isNew) body.id = text("teId");

    try {
      const res = isNew
        ? await api("/tours", { method: "POST", body: body })
        : await api("/tours/" + encodeURIComponent(tour.id), { method: "PUT", body: body });
      if (isNew) {
        state.tours.push(res.tour);
      } else {
        const card = document.querySelector('[data-tour-card="' + tour.id + '"]');
        if (card) paintTour(card, res.tour);
        else state.tours[state.tours.indexOf(tour)] = res.tour;
      }
      closeModal();
      renderView();
      V.toast("Đã lưu tour \"" + res.tour.title.vi + "\"");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function deleteTour(id) {
    if (!REMOTE || !id) return;
    if (!window.confirm(
      "Xóa tour này khỏi website?\n\n" +
      "Khách sẽ không còn thấy tour nữa. Dữ liệu vẫn được giữ lại — " +
      "bạn có thể khôi phục trong tab 'Đã xóa'."
    )) return;
    try {
      await api("/tours/" + encodeURIComponent(id), { method: "DELETE" });
      // Đọc lại từ DB để chắc chắn cờ deleted đã lưu (không tin state locally).
      state.tours = (await api("/tours")).tours;
      closeModal();
      renderView();
      const gone = state.tours.some(function (t) { return t.id === id && t._deleted; });
      V.toast(gone ? "Đã xóa tour — vào tab 'Đã xóa' để khôi phục" : "Xóa chưa lưu được vào Supabase. Kiểm tra lại SQL/RPC set_tour_deleted.");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function restoreTour(id) {
    if (!REMOTE || !id) return;
    try {
      await api("/tours/" + encodeURIComponent(id) + "/restore", { method: "POST" });
      state.tours = (await api("/tours")).tours;
      renderView();
      V.toast("Đã khôi phục tour");
    } catch (err) {
      V.toast(err.message);
    }
  }

  /* Accounts -------------------------------------------------------------- */
  function accountsHTML() {
    const rows = state.admins.map(function (a) {
      const canReset = !REMOTE || a.isSelf;
      return (
        "<tr>" +
          '<td><span class="adm-code">' + V.esc(a.username) + "</span>" +
            (a.isSelf ? ' <span class="adm-badge adm-badge--done">Bạn</span>' : "") + "</td>" +
          "<td>" + V.esc(a.displayName || "—") + "</td>" +
          "<td>" + fdate(a.createdAt ? a.createdAt.slice(0, 10) : "") + "</td>" +
          '<td><div class="adm-row-actions">' +
            (canReset ? '<button class="adm-row-btn" type="button" data-acc-pass="' + V.esc(String(a.id)) + '" data-username="' + V.esc(a.username) + '">Đổi mật khẩu</button>' : "") +
            (a.isSelf ? "" : '<button class="adm-row-btn adm-row-btn--danger" type="button" data-acc-del="' + V.esc(String(a.id)) + '" data-username="' + V.esc(a.username) + '">Xóa</button>') +
          "</div></td>" +
        "</tr>"
      );
    }).join("");

    const hint = REMOTE
      ? "Tạo người dùng trước trong Supabase → Authentication → Users, sau đó bấm Thêm tài khoản để cấp quyền quản trị bằng email."
      : "Mọi tài khoản trong danh sách đều đăng nhập được vào khu quản trị. Mật khẩu tối thiểu 8 ký tự.";

    return (
      '<section class="adm-panel">' +
        '<div class="adm-panel__head">' +
          "<h2>Tài khoản quản trị</h2>" +
          '<button class="btn btn--primary btn--sm" type="button" data-acc-add>' + icon("plus", 15) + " Thêm tài khoản</button>" +
        "</div>" +
        '<div style="padding:14px 22px 0;font-size:.8rem;color:var(--muted)">' + V.esc(hint) + "</div>" +
        '<div class="adm-table-wrap" style="border:0;border-radius:0">' +
          '<table class="adm-table adm-table--accounts"><thead><tr><th>' + (REMOTE ? "Email" : "Tên đăng nhập") + '</th><th>Tên hiển thị</th><th>Ngày tạo</th><th></th></tr></thead>' +
          "<tbody>" + rows + "</tbody></table>" +
        "</div>" +
      "</section>"
    );
  }

  function accountModalHTML(mode, target) {
    const title = mode === "add" ? "Thêm tài khoản" : "Đổi mật khẩu";
    const sub = mode === "add"
      ? (REMOTE ? "Cấp quyền quản trị cho một tài khoản đã có trong Supabase Authentication." : "Tài khoản mới có toàn quyền quản trị.")
      : "Đặt mật khẩu mới cho " + (target ? target.username : "");
    const addFields = REMOTE
      ? '<div class="adm-field"><label for="accUser">Email tài khoản</label><input id="accUser" type="email" autocomplete="off" placeholder="email@example.com" /></div>' +
        '<div class="adm-field"><label for="accName">Tên hiển thị</label><input id="accName" type="text" autocomplete="off" placeholder="Tên người dùng" /></div>' +
        '<p style="font-size:.76rem;color:var(--muted);margin:0">Người dùng cần được tạo trước ở Supabase → Authentication → Users (Add user, bật Auto Confirm).</p>'
      : '<div class="adm-field"><label for="accUser">Tên đăng nhập</label><input id="accUser" type="text" autocomplete="off" placeholder="vd: khanh, sale1…" /></div>' +
        '<div class="adm-field"><label for="accName">Tên hiển thị</label><input id="accName" type="text" autocomplete="off" placeholder="Tên người dùng" /></div>' +
        '<div class="adm-field"><label for="accPass">Mật khẩu</label><input id="accPass" type="password" autocomplete="new-password" placeholder="Ít nhất 8 ký tự" /></div>' +
        '<div class="adm-field"><label for="accPass2">Nhập lại mật khẩu</label><input id="accPass2" type="password" autocomplete="new-password" /></div>';
    const fields = mode === "add"
      ? addFields
      : '<div class="adm-field"><label for="accPass">Mật khẩu mới</label><input id="accPass" type="password" autocomplete="new-password" placeholder="Ít nhất 8 ký tự" /></div>' +
        '<div class="adm-field"><label for="accPass2">Nhập lại mật khẩu</label><input id="accPass2" type="password" autocomplete="new-password" /></div>';

    return (
      '<div class="adm-modal__head">' +
        '<div><h2 id="admModalTitle">' + V.esc(title) + "</h2><small>" + V.esc(sub) + "</small></div>" +
        '<button class="adm-modal__close" type="button" data-close aria-label="Đóng">' + icon("x", 16) + "</button>" +
      "</div>" +
      '<div class="adm-modal__body">' +
        '<div class="adm-form">' + fields +
          '<p class="adm-login__err" id="accErr" hidden></p>' +
        "</div>" +
      "</div>" +
      '<div class="adm-modal__foot">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-close>Hủy</button>' +
        '<button class="btn btn--primary btn--sm" type="button" ' + (mode === "add" ? "data-acc-create" : "data-acc-reset") + ">" +
          (mode === "add" ? "Tạo tài khoản" : "Lưu mật khẩu") +
        "</button>" +
      "</div>"
    );
  }

  function openAccountModal(mode, target) {
    state.modalMode = mode;
    state.accountTarget = target || null;
    openModal(accountModalHTML(mode, target));
    const first = els.modalCard.querySelector("input");
    if (first) first.focus();
  }

  function accError(msg) {
    const p = byId("accErr");
    if (p) {
      p.textContent = msg;
      p.hidden = false;
    }
  }

  function readPasswords() {
    const p1 = byId("accPass") ? byId("accPass").value : "";
    const p2 = byId("accPass2") ? byId("accPass2").value : "";
    if (p1.length < 8) { accError("Mật khẩu phải có ít nhất 8 ký tự"); return null; }
    if (p1 !== p2) { accError("Mật khẩu nhập lại không khớp"); return null; }
    return p1;
  }

  async function createAccount() {
    const username = byId("accUser").value.trim();
    const displayName = byId("accName").value.trim();
    if (REMOTE) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(username)) {
        accError("Nhập đúng email của tài khoản đã tạo trong Supabase Authentication");
        return;
      }
      try {
        await api("/admins", { method: "POST", body: { username: username, displayName: displayName } });
        closeModal();
        V.toast("Đã cấp quyền quản trị cho " + username);
        load();
      } catch (err) {
        accError(err.message);
      }
      return;
    }
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
      accError("Tên đăng nhập 3–32 ký tự, chỉ gồm chữ, số, dấu chấm, gạch");
      return;
    }
    const password = readPasswords();
    if (!password) return;
    try {
      await api("/admins", { method: "POST", body: { username: username, displayName: displayName, password: password } });
      closeModal();
      V.toast("Đã tạo tài khoản " + username);
      load();
    } catch (err) {
      accError(err.message);
    }
  }

  async function resetAccountPassword() {
    const password = readPasswords();
    if (!password || !state.accountTarget) return;
    const target = state.accountTarget;
    try {
      await api("/admins/" + target.id, { method: "PATCH", body: { password: password } });
      closeModal();
      V.toast("Đã đổi mật khẩu cho " + target.username);
      if (String(target.id) === String(state.me.id)) {
        showLogin();
        els.loginErr.textContent = "Mật khẩu đã đổi. Vui lòng đăng nhập lại.";
        els.loginErr.hidden = false;
      } else {
        load();
      }
    } catch (err) {
      accError(err.message);
    }
  }

  async function deleteAccount(id, username) {
    const msg = REMOTE
      ? "Thu hồi quyền quản trị của \"" + username + "\"? Tài khoản Supabase vẫn còn nhưng không vào khu quản trị được nữa."
      : "Xóa tài khoản \"" + username + "\"? Người dùng này sẽ không đăng nhập được nữa.";
    if (!window.confirm(msg)) return;
    try {
      await api("/admins/" + id, { method: "DELETE" });
      V.toast("Đã xóa tài khoản " + username);
      load();
    } catch (err) {
      V.toast(err.message);
    }
  }

  /* Booking modal --------------------------------------------------------- */
  function bookingModalHTML(b) {
    const c = b.contact || {};
    const st = statusOf(b);
    const statusButtons = STATUS.map(function (s) {
      return (
        '<button type="button" data-set-status="' + s.key + '"' + (st === s.key ? ' class="is-active"' : "") + ">" +
          s.label + "</button>"
      );
    }).join("");

    return (
      '<div class="adm-modal__head">' +
        "<div><h2 id=\"admModalTitle\">" + V.esc(b.code) + "</h2>" +
          "<small>Đặt lúc " + fdatetime(b.createdAt) + " · " + badge(st) + "</small></div>" +
        '<button class="adm-modal__close" type="button" data-close aria-label="Đóng">' + icon("x", 16) + "</button>" +
      "</div>" +
      '<div class="adm-modal__body">' +
        '<div class="adm-detail-grid">' +
          '<div class="adm-detail-block">' +
            "<h3>Khách hàng</h3>" +
            detailRow("Họ tên", V.esc(c.name || "—")) +
            detailRow("Điện thoại", c.phone ? '<a href="tel:' + V.esc(c.phone) + '">' + V.esc(c.phone) + "</a>" : "—") +
            detailRow("Email", c.email ? '<a href="mailto:' + V.esc(c.email) + '">' + V.esc(c.email) + "</a>" : "—") +
            detailRow("Quốc gia", V.esc(COUNTRIES[c.country] || (c.country ? c.country.toUpperCase() : "—"))) +
            detailRow("Yêu cầu riêng", V.esc(c.requests || "—")) +
          "</div>" +
          '<div class="adm-detail-block">' +
            "<h3>Chuyến đi</h3>" +
            detailRow("Tour", V.esc(b.tourTitle || "—")) +
            detailRow("Ngày khởi hành", fdate(b.date)) +
            detailRow("Số khách", num(b.adults || 0) + " người lớn" + (b.children ? " · " + num(b.children) + " trẻ em" : "")) +
            detailRow("Thanh toán", V.esc(PAYMENTS[b.payment] || b.payment || "—") + (b.promo ? " · " + V.esc(b.promo) : "")) +
            '<div class="adm-detail-total"><span>Tổng tiền</span><b>' + money(b.total) + "</b></div>" +
          "</div>" +
        "</div>" +
        '<div class="adm-detail-block">' +
          "<h3>Trạng thái xử lý</h3>" +
          '<div class="adm-status-picker">' + statusButtons + "</div>" +
        "</div>" +
        '<div class="adm-detail-block">' +
          "<h3>Ghi chú nội bộ</h3>" +
          '<textarea class="adm-note-area" id="admNote" placeholder="Ví dụ: đã gọi xác nhận, khách cần đón tại khách sạn…">' + V.esc(b.note || "") + "</textarea>" +
          '<div class="adm-note-actions"><span style="font-size:.72rem;color:var(--muted)">Khách không nhìn thấy ghi chú này.</span>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-save-note>Lưu ghi chú</button></div>' +
        "</div>" +
      "</div>" +
      '<div class="adm-modal__foot">' +
        '<button class="btn btn--danger btn--sm" type="button" data-delete-booking>' + icon("trash", 15) + " Xóa đơn</button>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-close>Đóng</button>' +
      "</div>"
    );
  }

  function detailRow(label, valueHTML) {
    return '<div class="adm-detail-row"><span>' + V.esc(label) + "</span><strong>" + valueHTML + "</strong></div>";
  }

  function openModal(html) {
    els.modalCard.innerHTML = html;
    els.modal.hidden = false;
    const closeBtn = els.modalCard.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    els.modal.hidden = true;
    els.modalCard.innerHTML = "";
    state.modalCode = null;
    state.modalMode = null;
    state.accountTarget = null;
    state.contentTourId = null;
    state.chatThread = null;
  }

  function openBooking(code) {
    const rec = state.bookings.find(function (b) { return b.code === code; });
    if (!rec) return;
    state.modalCode = code;
    openModal(bookingModalHTML(rec));
  }

  function replaceBooking(updated) {
    const idx = state.bookings.findIndex(function (b) { return b.code === updated.code; });
    if (idx > -1) state.bookings[idx] = updated;
    updateBadge();
  }

  async function setBookingStatus(key) {
    if (!state.modalCode) return;
    try {
      const res = await api("/bookings/" + state.modalCode, { method: "PATCH", body: { status: key } });
      replaceBooking(res.booking);
      renderView();
      openBooking(res.booking.code);
      V.toast("Đã cập nhật trạng thái");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function saveBookingNote() {
    if (!state.modalCode) return;
    const note = byId("admNote") ? byId("admNote").value.trim() : "";
    try {
      const res = await api("/bookings/" + state.modalCode, { method: "PATCH", body: { note: note } });
      replaceBooking(res.booking);
      renderView();
      V.toast("Đã lưu ghi chú");
    } catch (err) {
      V.toast(err.message);
    }
  }

  async function deleteBooking() {
    if (!state.modalCode) return;
    const code = state.modalCode;
    if (!window.confirm("Xóa đơn " + code + "? Thao tác này không thể hoàn tác.")) return;
    try {
      await api("/bookings/" + code, { method: "DELETE" });
      state.bookings = state.bookings.filter(function (b) { return b.code !== code; });
      updateBadge();
      closeModal();
      renderView();
      V.toast("Đã xóa đơn " + code);
    } catch (err) {
      V.toast(err.message);
    }
  }

  /* Events ---------------------------------------------------------------- */
  function bind() {
    els.loginForm.addEventListener("submit", loginSubmit);
    byId("admLogout").addEventListener("click", logout);

    document.querySelectorAll("[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () { setView(btn.dataset.view); });
    });

    els.burger.addEventListener("click", function () {
      const open = !document.body.classList.contains("adm-side-open");
      document.body.classList.toggle("adm-side-open", open);
      els.burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    els.backdrop.addEventListener("click", function () {
      document.body.classList.remove("adm-side-open");
      els.burger.setAttribute("aria-expanded", "false");
    });

    els.view.addEventListener("click", function (e) {
      if (e.target.closest("[data-retry]")) { load(); return; }

      const purgeThreadBtn = e.target.closest("[data-chat-purge-thread]");
      if (purgeThreadBtn) { purgeChatThread(purgeThreadBtn.dataset.chatPurgeThread); return; }

      const restoreThreadBtn = e.target.closest("[data-chat-restore-thread]");
      if (restoreThreadBtn) { restoreChatThread(restoreThreadBtn.dataset.chatRestoreThread); return; }

      const delThreadBtn = e.target.closest("[data-chat-del-thread]");
      if (delThreadBtn) { hideChatThread(delThreadBtn.dataset.chatDelThread); return; }

      const chatRow = e.target.closest("[data-chat-thread]");
      if (chatRow) { openChat(chatRow.dataset.chatThread); return; }

      const go = e.target.closest("[data-go]");
      if (go) { setView(go.dataset.go); return; }

      const row = e.target.closest("[data-booking]");
      if (row) { openBooking(row.dataset.booking); return; }

      const sf = e.target.closest("[data-status-filter]");
      if (sf) { state.status = sf.dataset.statusFilter; renderView(); return; }

      const mf = e.target.closest("[data-msg-filter]");
      if (mf) { state.msgFilter = mf.dataset.msgFilter; renderView(); return; }

      if (e.target.closest("[data-acc-add]")) { openAccountModal("add"); return; }

      const passBtn = e.target.closest("[data-acc-pass]");
      if (passBtn) {
        openAccountModal("reset", { id: passBtn.dataset.accPass, username: passBtn.dataset.username });
        return;
      }

      const delBtn = e.target.closest("[data-acc-del]");
      if (delBtn) {
        deleteAccount(delBtn.dataset.accDel, delBtn.dataset.username);
        return;
      }

      if (e.target.closest("[data-sub-export]")) { exportSubscribers(); return; }
      if (e.target.closest("[data-tour-add]")) { openTourEditor(null); return; }

      const tf = e.target.closest("[data-tour-filter]");
      if (tf) { state.tourFilter = tf.dataset.tourFilter; renderView(); return; }

      const restoreTourBtn = e.target.closest("[data-tour-restore]");
      if (restoreTourBtn) { restoreTour(restoreTourBtn.dataset.tourRestore); return; }

      const delTourCard = e.target.closest("[data-tour-delete-card]");
      if (delTourCard) { deleteTour(delTourCard.dataset.tourDeleteCard); return; }

      const card = e.target.closest("[data-tour-card]");
      if (!card) return;
      if (e.target.closest("[data-tour-save]")) saveTourCard(card);
      else if (e.target.closest("[data-tour-base]")) resetTourPrice(card);
      else if (e.target.closest("[data-tour-content]")) openTourEditor(card);
    });

    els.view.addEventListener("change", function (e) {
      const card = e.target.closest("[data-tour-card]");
      if (!card) return;
      if (e.target.matches("[data-tour-active]")) toggleTourFlag(card, "active");
      else if (e.target.matches("[data-tour-featured]")) toggleTourFlag(card, "featured");
    });

    els.view.addEventListener("input", function (e) {
      if (e.target.matches("[data-tour-price]")) {
        const rowEl = e.target.closest(".adm-tour__price-row");
        if (rowEl) rowEl.classList.add("adm-tour__dirty");
      } else if (e.target.id === "admSearch") {
        state.q = e.target.value;
        renderView();
        const input = byId("admSearch");
        if (input) {
          input.focus();
          const len = input.value.length;
          try { input.setSelectionRange(len, len); } catch (err) { /* ignore */ }
        }
      }
    });

    els.view.addEventListener("keydown", function (e) {
      if (e.target.id === "admSearch" && e.key === "Escape") {
        e.target.value = "";
        state.q = "";
        renderView();
      }
    });

    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) { closeModal(); return; }
      if (e.target.closest("[data-close]")) { closeModal(); return; }

      if (e.target.closest("[data-acc-create]")) { createAccount(); return; }
      if (e.target.closest("[data-acc-reset]")) { resetAccountPassword(); return; }
      if (e.target.closest("[data-chat-purge-thread]")) { purgeChatThread(state.chatThread); return; }
      if (e.target.closest("[data-chat-restore-thread]")) { restoreChatThread(state.chatThread); return; }
      if (e.target.closest("[data-chat-del-thread]")) { hideChatThread(state.chatThread); return; }
      if (e.target.closest("[data-chat-send]")) { sendChatReply(); return; }
      if (e.target.closest("[data-content-save]")) { saveTourContent(); return; }

      const addBtn = e.target.closest("[data-add]");
      if (addBtn) {
        const map = {
          highlights: highlightRow,
          itinerary: itineraryRow,
          gallery: galleryRow
        };
        const make = map[addBtn.dataset.add];
        const wrap = byId("teRows-" + addBtn.dataset.add);
        if (make && wrap) wrap.insertAdjacentHTML("beforeend", make({}));
        return;
      }
      const removeBtn = e.target.closest("[data-remove-row]");
      if (removeBtn) {
        const row = removeBtn.closest("[data-row]");
        if (row) row.remove();
        return;
      }
      if (e.target.closest("[data-tour-delete]") && state.contentTourId && state.contentTourId !== "__new__") {
        deleteTour(state.contentTourId);
        return;
      }

      if (!state.modalCode) return;

      const statusBtn = e.target.closest("[data-set-status]");
      if (statusBtn) { setBookingStatus(statusBtn.dataset.setStatus); return; }
      if (e.target.closest("[data-save-note]")) { saveBookingNote(); return; }
      if (e.target.closest("[data-delete-booking]")) { deleteBooking(); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.modal.hidden) closeModal();
    });
  }

  async function init() {
    els.login = byId("admLogin");
    els.loginForm = byId("admLoginForm");
    els.loginErr = byId("admLoginErr");
    els.shell = byId("admShell");
    els.view = byId("admView");
    els.title = byId("admTitle");
    els.sub = byId("admSub");
    els.today = byId("admToday");
    els.who = byId("admWho");
    els.newBadge = byId("admNewBadge");
    els.msgBadge = byId("admMsgBadge");
    els.burger = byId("admBurger");
    els.backdrop = byId("admBackdrop");
    els.modal = byId("admModal");
    els.modalCard = byId("admModalCard");

    bind();

    if (REMOTE) {
      const input = byId("admUserInput");
      if (input) input.type = "email";
    }

    try {
      const data = await api("/me");
      enterShell(data.admin);
    } catch (err) {
      showLogin();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
