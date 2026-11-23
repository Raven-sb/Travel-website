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
    luxury: "Nghỉ dưỡng"
  };
  const PAYMENTS = { later: "Thanh toán sau", card: "Thẻ tín dụng" };
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
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };

  const state = {
    view: "dashboard",
    q: "",
    status: "all",
    me: null,
    bookings: [],
    tours: [],
    admins: [],
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
    tours: { title: "Quản lý tour", sub: "Giá bán, trạng thái và tour nổi bật" },
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
        const results = await Promise.all([api("/bookings"), api("/tours")]);
        state.bookings = results[0].bookings;
        state.tours = results[1].tours;
        updateBadge();
      } else if (view === "bookings") {
        state.bookings = (await api("/bookings")).bookings;
        updateBadge();
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

  /* Tours ----------------------------------------------------------------- */
  function toursHTML() {
    const cards = state.tours.map(function (tr) {
      const dest = V.destOf(tr.dest);
      const types = (tr.type || []).map(function (ty) { return TYPE_VI[ty] || ty; }).join(" · ");
      const dur = tr.duration <= 1 ? "1 ngày" : tr.duration + "N" + (tr.duration - 1) + "Đ";
      return (
        '<article class="adm-tour" data-tour-card="' + tr.id + '">' +
          '<div class="adm-tour__media">' +
            '<img src="' + tr.img + '" alt="' + V.esc(tr.title.vi) + '" loading="lazy" />' +
            '<span class="adm-tour__state' + (tr.active ? "" : " is-off") + '" data-tour-state>' + (tr.active ? "Đang bán" : "Tạm ẩn") + "</span>" +
          "</div>" +
          '<div class="adm-tour__body">' +
            '<a class="adm-tour__title" href="tour.html?id=' + tr.id + '" target="_blank">' + V.esc(tr.title.vi) + "</a>" +
            '<div class="adm-tour__meta">' + V.esc(dest ? dest.name.vi : "") + " · " + dur + " · " + V.esc(types) + "</div>" +
            '<div class="adm-tour__price-row">' +
              '<label for="tp-' + tr.id + '">Giá / khách</label>' +
              '<input id="tp-' + tr.id + '" type="number" inputmode="numeric" min="100000" step="50000" value="' + tr.price + '" data-tour-price />' +
            "</div>" +
            '<div class="adm-tour__switches">' +
              '<label class="adm-switch"><input type="checkbox" data-tour-active' + (tr.active ? " checked" : "") + " />Đang bán</label>" +
              '<label class="adm-switch"><input type="checkbox" data-tour-featured' + (tr.featured ? " checked" : "") + " />Nổi bật</label>" +
            "</div>" +
            '<div class="adm-tour__foot">' +
              '<button class="btn btn--primary btn--sm" type="button" data-tour-save>Lưu thay đổi</button>' +
              '<button class="btn btn--ghost btn--sm" type="button" data-tour-base>Giá gốc</button>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    return (
      '<div class="adm-tools" style="margin-bottom:14px">' +
        '<p style="font-size:.8rem;color:var(--muted);margin:0">' +
          (REMOTE
            ? "Thay đổi được lưu vào Supabase và áp dụng cho khách ngay khi họ tải lại trang."
            : "Thay đổi lưu trên máy chủ và áp dụng cho mọi khách truy cập ngay khi họ tải lại trang.") +
        "</p>" +
      "</div>" +
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
      featured: card.querySelector("[data-tour-featured]").checked
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

      const go = e.target.closest("[data-go]");
      if (go) { setView(go.dataset.go); return; }

      const row = e.target.closest("[data-booking]");
      if (row) { openBooking(row.dataset.booking); return; }

      const sf = e.target.closest("[data-status-filter]");
      if (sf) { state.status = sf.dataset.statusFilter; renderView(); return; }

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

      const card = e.target.closest("[data-tour-card]");
      if (!card) return;
      if (e.target.closest("[data-tour-save]")) saveTourCard(card);
      else if (e.target.closest("[data-tour-base]")) resetTourPrice(card);
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
