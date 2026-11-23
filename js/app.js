/* Vietnam4trip — shared UI runtime */
(function () {
  "use strict";

  const DATA = window.VV_DATA;
  const LS_LANG = "vv:lang";
  const LS_FAVS = "vv:favs";
  const LS_TOUR_OVERRIDES = "v4t:tourOverrides";
  const LS_TOUR_CONTENT = "v4t:tourContent";
  const LS_TOURS = "v4t:tours";
  const LS_CHAT_THREAD = "v4t:chatThread";
  const LS_CHAT_NAME = "v4t:chatName";
  const state = { lang: localStorage.getItem(LS_LANG) === "en" ? "en" : "vi" };
  const PAGE = document.body ? document.body.dataset.page || "" : "";

  const ICONS = {
    pin: '<path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',
    heart: '<path d="M12 20.2S4.5 15.5 4.5 10A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 19.5 10c0 5.5-7.5 10.2-7.5 10.2Z"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12"/><path d="M10 11v6M14 11v6"/>',
    send: '<path d="m4 12 16-8-6 16-2.5-6.5L4 12Z"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.5"/><path d="M17 11a3.5 3.5 0 1 0 0-7"/><path d="M19.5 20v-1.5a4 4 0 0 0-3-3.8"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
    phone: '<path d="M7 3h3.2l1.9 4.6-2.4 1.5a13.5 13.5 0 0 0 5.2 5.2l1.5-2.4L21 13.8V17a2.5 2.5 0 0 1-2.7 2.5A17.8 17.8 0 0 1 4.5 5.7 2.5 2.5 0 0 1 7 3Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/>',
    bank: '<path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3l9 5H3l9-5Z"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M16 12.5h2.5"/><path d="M3 9h13a2 2 0 0 0 2-2V6"/>',
    tag: '<path d="M20 12.5 12.5 20 4 11.5V4h7.5L20 12.5Z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    printer: '<path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 13h10v7H7z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    leaf: '<path d="M20 4c-8 0-14 4-14 10a6 6 0 0 0 6 6c6 0 8-7 8-16Z"/><path d="M4 21c2-5 6-8 11-10"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    sliders: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.4"/><circle cx="15" cy="17" r="2.4"/>',
    camera: '<path d="M4 8h3l1.6-2h6.8L17 8h3a1.6 1.6 0 0 1 1.6 1.6v8.8A1.6 1.6 0 0 1 20 20H4a1.6 1.6 0 0 1-1.6-1.6V9.6A1.6 1.6 0 0 1 4 8Z"/><circle cx="12" cy="13.5" r="3.4"/>',
    chat: '<path d="M12 4.2a7.8 7.8 0 1 0 0 15.6c.9 0 1.8-.1 2.6-.4L19 21l-.4-4.1a7.8 7.8 0 0 0-6.6-12.7Z"/><path d="M8.6 12h.01M12 12h.01M15.4 12h.01"/>',
    messenger: '<path d="M12 3.5A8.4 8.4 0 0 0 3.6 16L2.9 20.5l4.6-.9A8.4 8.4 0 1 0 12 3.5Z"/><path d="m7.9 14 3.4-4 .3 3.2 3-.7L11.2 16l-.3-3.2-3 .7Z"/>',
    whatsapp: '<path d="M12 3.5a8.4 8.4 0 0 0-7.3 12.6L3.7 20.4l4.5-1.1A8.4 8.4 0 1 0 12 3.5Z"/><path d="M9.4 8.2c.2-.4.6-.4.8-.1l.9 1.5c.1.3.1.5-.1.7l-.5.5a6.4 6.4 0 0 0 2.9 2.9l.5-.5c.2-.2.4-.2.7-.1l1.5.9c.3.2.3.6-.1.9-.6.5-1.5.7-2.3.5-2.5-.7-4.5-2.7-5.2-5.2-.2-.8 0-1.7.9-2Z"/>'
  };

  function icon(name, size, cls) {
    const s = size || 18;
    return '<svg class="ic ' + (cls || "") + '" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") + "</svg>";
  }

  const STAR = '<svg class="star" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z"/></svg>';

  function t(key) {
    const dict = window.I18N[state.lang] || {};
    if (dict[key] != null) return dict[key];
    return (window.I18N.vi && window.I18N.vi[key]) || key;
  }

  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return vars && vars[k] != null ? String(vars[k]) : "";
    });
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtNum(n) {
    return Number(n).toLocaleString(state.lang === "vi" ? "vi-VN" : "en-US");
  }

  function price(vnd) {
    if (state.lang === "en") {
      const usd = Math.round(Number(vnd) / DATA.usdRate);
      return "$" + usd.toLocaleString("en-US");
    }
    return fmtNum(vnd) + "₫";
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const val = raw ? JSON.parse(raw) : null;
      return val == null ? fallback : val;
    } catch (e) {
      return fallback;
    }
  }

  function getTourOverrides() {
    const ov = readJSON(LS_TOUR_OVERRIDES, {});
    return ov && typeof ov === "object" ? ov : {};
  }

  function deepMerge(target, patch) {
    if (!patch || typeof patch !== "object") return target;
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

  function applyTourOverrides(ovArg) {
    const ov = ovArg || window.VV_TOUR_OVERRIDES || getTourOverrides();
    DATA.tours.forEach(function (tr) {
      const o = ov[tr.id] || {};
      if (tr._basePrice == null) tr._basePrice = tr.price;
      if (typeof o.price === "number" && o.price > 0) tr.price = o.price;
      tr.active = o.active !== false;
      tr.featured = o.featured === true;
    });
  }

  function applyTourContent(contentArg) {
    const content = contentArg || readJSON(LS_TOUR_CONTENT, {}) || {};
    DATA.tours.forEach(function (tr) {
      deepMerge(tr, content[tr.id] || {});
    });
  }

  function remoteTourSkeleton(row) {
    const name = row.titleVi || row.id;
    return {
      id: row.id,
      dest: "", region: "", type: [], duration: 1,
      title: { vi: name, en: name },
      tagline: { vi: "", en: "" },
      price: row.price,
      oldPrice: null, rating: 0, reviews: 0, badge: "",
      img: "assets/img/hero.jpg", gallery: [],
      departure: { vi: "", en: "" }, group: { vi: "", en: "" },
      highlights: [], itinerary: []
    };
  }

  function applyRemoteTours(rows, overrides) {
    (rows || []).forEach(function (row) {
      if (!row || !row.id || !row.price) return;
      let tr = DATA.tours.find(function (t) { return t.id === row.id; });
      if (!tr) {
        tr = remoteTourSkeleton(row);
        tr._custom = true;
        DATA.tours.push(tr);
      }
      tr._basePrice = row.price;
      const o = (overrides || {})[row.id] || {};
      if (!(typeof o.price === "number" && o.price > 0)) tr.price = row.price;
    });
  }

  applyRemoteTours(readJSON(LS_TOURS, []) || [], {});
  applyTourOverrides();
  applyTourContent();

  let overridesReady = Promise.resolve();
  if (window.V4T_API && window.V4T_API.enabled) {
    const api = window.V4T_API;
    const applyCatalog = function (cat) {
      try {
        localStorage.setItem(LS_TOUR_OVERRIDES, JSON.stringify(cat.overrides || {}));
        localStorage.setItem(LS_TOUR_CONTENT, JSON.stringify(cat.content || {}));
        localStorage.setItem(LS_TOURS, JSON.stringify(cat.tours || []));
      } catch (e) { /* ignore */ }
      applyRemoteTours(cat.tours || [], cat.overrides || {});
      applyTourOverrides(cat.overrides || {});
      applyTourContent(cat.content || {});
      window.dispatchEvent(new CustomEvent("vv:overrides"));
    };
    const fetched = api.fetchCatalog().then(applyCatalog)
      .catch(function () { /* giữ bản cache, không chặn trang */ });
    const timeout = new Promise(function (resolve) { setTimeout(resolve, 4000); });
    overridesReady = Promise.race([fetched, timeout]);

    // Admin đổi giá / nội dung → khách đang mở trang cũng cập nhật ngay.
    api.subscribeCatalog(function () {
      api.fetchCatalog().then(applyCatalog).catch(function () { /* ignore */ });
    });
  }

  function whenReady(fn) {
    const run = function () { overridesReady.then(function () { fn(); }); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  function ratingHTML(tour) {
    return '<span class="rating">' + STAR + '<b>' + tour.rating + '</b><span class="rating__count">(' + fmtNum(tour.reviews) + ')</span></span>';
  }

  function durationLabel(days) {
    if (days <= 1) return state.lang === "vi" ? "1 ngày" : "1 day";
    return state.lang === "vi" ? days + "N" + (days - 1) + "Đ" : days + "D" + (days - 1) + "N";
  }

  function destOf(key) {
    return DATA.destinations.find(function (d) { return d.key === key; });
  }

  function tourOf(id) {
    return DATA.tours.find(function (tr) { return tr.id === id; });
  }

  function typeNames(tour) {
    return tour.type.map(function (ty) { return t("type." + ty); }).join(" · ");
  }

  function badgeHTML(badge) {
    if (!badge) return "";
    return '<span class="badge badge--' + badge + '">' + esc(t("badge." + badge)) + "</span>";
  }

  function getFavs() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_FAVS) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function tourCardHTML(tour, index) {
    const d = destOf(tour.dest) || { name: { vi: "", en: "" } };
    const fav = getFavs().indexOf(tour.id) > -1;
    const label = esc(tour.title[state.lang]);
    const destName = esc(d.name[state.lang]);
    return (
      '<article class="tour-card reveal" style="--rd:' + ((index || 0) * 60) + 'ms" data-id="' + tour.id + '">' +
        '<div class="tour-card__media">' +
          '<a class="tour-card__imagelink" href="tour.html?id=' + tour.id + '" aria-label="' + label + '">' +
            '<img src="' + tour.img + '" alt="' + label + " — " + destName + '" loading="lazy" />' +
          "</a>" +
          (tour.badge ? badgeHTML(tour.badge) : "") +
          '<span class="tour-card__duration">' + icon("clock", 13) + durationLabel(tour.duration) + "</span>" +
          '<button class="fav-btn' + (fav ? " is-active" : "") + '" type="button" data-fav="' + tour.id + '" aria-pressed="' + fav + '" aria-label="' + esc(fav ? t("toast.unfav") : t("toast.fav")) + '">' + icon("heart", 18) + "</button>" +
        "</div>" +
        '<div class="tour-card__body">' +
          '<div class="tour-card__row">' +
            '<span class="tour-card__loc">' + icon("pin", 13) + destName + "</span>" +
            ratingHTML(tour) +
          "</div>" +
          '<h3 class="tour-card__title"><a href="tour.html?id=' + tour.id + '">' + label + "</a></h3>" +
          '<p class="tour-card__tag">' + esc(tour.tagline[state.lang]) + "</p>" +
          '<div class="tour-card__meta">' + esc(typeNames(tour)) + '<span class="dot"></span>' + esc(tour.group[state.lang]) + "</div>" +
          '<div class="tour-card__foot">' +
            '<div class="price-wrap">' +
              (tour.oldPrice ? '<span class="price-old">' + price(tour.oldPrice) + "</span>" : "") +
              '<span class="price-new">' + price(tour.price) + "<small>" + esc(t("common.perPerson")) + "</small></span>" +
            "</div>" +
            '<a class="btn btn--ghost btn--sm" href="tour.html?id=' + tour.id + '">' + esc(t("common.viewDetails")) + icon("arrow", 14) + "</a>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function logo(light) {
    return (
      '<span class="brand__mark" aria-hidden="true">' +
        '<svg viewBox="0 0 48 48" width="42" height="42">' +
          '<rect width="48" height="48" rx="14" fill="' + (light ? "#f7f1e8" : "#0f4a3c") + '"/>' +
          '<path d="M10 31c5-8 9-8 14 0s9 8 14 0" stroke="' + (light ? "#0f4a3c" : "#f7f1e8") + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<path d="M14 24.5c4-6 7.5-6 11.5 0" stroke="#e4603f" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<circle cx="34" cy="14.5" r="3.4" fill="#d9a441"/>' +
        "</svg>" +
      "</span>" +
      '<span class="brand__text">Vietnam4trip<small>VIETNAM, SLOWLY</small></span>'
    );
  }

  function headerHTML() {
    const page = PAGE;
    const isTours = page === "tours" || page === "tour" || page === "booking";
    const link = function (key, href, active) {
      return '<a class="nav__link' + (active ? " is-active" : "") + '" href="' + href + '"' + (active ? ' aria-current="page"' : "") + ' data-i18n="' + key + '"></a>';
    };
    return (
      '<div class="topbar">' +
        '<div class="container topbar__inner">' +
          '<p class="topbar__note">' + icon("sparkles", 15) + '<span data-i18n="topbar.note"></span></p>' +
          '<div class="topbar__right">' +
            '<a class="topbar__phone" href="tel:+84935549164">' + icon("phone", 14) + "<span>0935 549 164</span></a>" +
            '<div class="lang-switch" role="group" aria-label="Language">' +
              '<button type="button" class="lang-btn" data-lang="vi">VI</button><span class="lang-sep">/</span><button type="button" class="lang-btn" data-lang="en">EN</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<header class="site-header" id="siteHeader">' +
        '<div class="container header__inner">' +
          '<a class="brand" href="index.html" aria-label="Vietnam4trip">' + logo(false) + "</a>" +
          '<nav class="nav" id="mainNav" aria-label="Main navigation">' +
            link("nav.home", "index.html", page === "home") +
            link("nav.tours", "tours.html", isTours) +
            link("nav.destinations", "index.html#destinations", false) +
            link("nav.about", "index.html#about", false) +
            link("nav.contact", "index.html#contact", false) +
            '<div class="nav__mobile-extra">' +
              '<a class="btn btn--primary btn--block" href="tours.html"><span data-i18n="nav.cta"></span>' + icon("arrow", 16) + "</a>" +
              '<div class="lang-switch lang-switch--drawer"><button type="button" class="lang-btn" data-lang="vi">VI</button><span class="lang-sep">/</span><button type="button" class="lang-btn" data-lang="en">EN</button></div>' +
            "</div>" +
          "</nav>" +
          '<div class="header__actions">' +
            '<a class="header__hotline" href="tel:+84935549164">' + icon("phone", 16) + "<span><small>" + esc(t("common.hotline")) + "</small>0935 549 164</span></a>" +
            '<a class="btn btn--primary header__cta" href="tours.html"><span data-i18n="nav.cta"></span>' + icon("arrow", 16) + "</a>" +
            '<button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Menu"><span></span><span></span><span></span></button>' +
          "</div>" +
        "</div>" +
      "</header>" +
      '<button class="nav-backdrop" id="navBackdrop" type="button" tabindex="-1" aria-hidden="true"></button>'
    );
  }

  function footerHTML() {
    return (
      '<footer class="site-footer" id="contact">' +
        '<div class="container footer__grid">' +
          '<div class="footer__brand">' +
            '<a class="brand brand--footer" href="index.html" aria-label="Vietnam4trip">' + logo(true) + "</a>" +
            '<p class="footer__about" data-i18n="footer.about"></p>' +
            '<ul class="footer__contact">' +
              "<li>" + icon("pin", 15) + '<span data-i18n="footer.address"></span></li>' +
              "<li>" + icon("phone", 15) + '<a href="tel:+84935549164">0935 549 164</a></li>' +
              "<li>" + icon("mail", 15) + '<a href="mailto:khanhquang94cva@gmail.com">khanhquang94cva@gmail.com</a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="footer__col">' +
            '<h3 data-i18n="footer.explore"></h3>' +
            "<ul>" +
              '<li><a href="tours.html" data-i18n="nav.tours"></a></li>' +
              '<li><a href="index.html#destinations" data-i18n="nav.destinations"></a></li>' +
              '<li><a href="index.html#about" data-i18n="nav.about"></a></li>' +
              '<li><a href="tours.html?sort=rating" data-i18n="sort.rating"></a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="footer__col">' +
            '<h3 data-i18n="footer.support"></h3>' +
            "<ul>" +
              '<li><a href="index.html#contact" data-i18n="footer.contactTitle"></a></li>' +
              '<li><a href="index.html#contact" data-i18n="footer.faq"></a></li>' +
              '<li><a href="index.html#contact" data-i18n="footer.policy"></a></li>' +
              '<li><a href="index.html#contact" data-i18n="footer.terms"></a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="footer__col footer__news">' +
            '<h3 data-i18n="footer.newsletter"></h3>' +
            '<p data-i18n="footer.newsletterSub"></p>' +
            '<form class="newsletter" id="newsletterForm" novalidate>' +
              '<label class="sr-only" for="newsletterEmail" data-i18n="footer.emailPh"></label>' +
              '<input id="newsletterEmail" type="email" autocomplete="email" data-i18n-ph="footer.emailPh" />' +
              '<button class="btn btn--primary btn--sm" type="submit"><span data-i18n="footer.subscribe"></span></button>' +
            "</form>" +
            '<p class="footer__made" data-i18n="footer.madeWith"></p>' +
          "</div>" +
        "</div>" +
        '<div class="container footer__bottom">' +
          '<div class="footer__meta">' +
            '<p data-i18n="footer.rights"></p>' +
            '<a class="footer__admin" href="admin.html" rel="nofollow">Quản trị</a>' +
          "</div>" +
          '<div class="pay-badges" aria-label="Payment methods">' +
            '<span class="pay-badge">VISA</span><span class="pay-badge">Mastercard</span><span class="pay-badge">JCB</span><span class="pay-badge">VNPay</span><span class="pay-badge">MoMo</span>' +
          "</div>" +
        "</div>" +
      "</footer>"
    );
  }

  function fabHTML() {
    const item = function (cls, href, iconName, labelKey, external) {
      return '<a class="fab-item fab-item--' + cls + '" href="' + href + '"' +
        (external ? ' target="_blank" rel="noopener"' : "") + ">" +
        '<span class="fab-label" data-i18n="' + labelKey + '"></span>' +
        '<span class="fab-item__ico">' + icon(iconName, 22) + "</span>" +
      "</a>";
    };
    return (
      '<div class="vv-fab__list" id="fabList">' +
        item("call", "tel:+84935549164", "phone", "fab.call", false) +
        item("messenger", "https://m.me/61596965545949", "messenger", "fab.messenger", true) +
        item("whatsapp", "https://wa.me/84935549164", "whatsapp", "fab.whatsapp", true) +
        item("email", "mailto:khanhquang94cva@gmail.com", "mail", "fab.email", false) +
      "</div>" +
      '<button class="fab-toggle" id="fabToggle" type="button" aria-expanded="false" aria-controls="fabList" data-i18n-aria="fab.title">' +
        icon("phone", 24, "fab-ico fab-ico--main") +
        icon("x", 24, "fab-ico fab-ico--close") +
      "</button>"
    );
  }

  function bindFab() {
    const wrap = document.getElementById("vvFab");
    const toggle = document.getElementById("fabToggle");
    if (!wrap || !toggle) return;

    function setFabOpen(next) {
      wrap.classList.toggle("is-open", next);
      toggle.setAttribute("aria-expanded", String(next));
    }

    toggle.addEventListener("click", function () {
      const open = !wrap.classList.contains("is-open");
      setFabOpen(open);
      // Chỉ một menu floating được mở tại một thời điểm.
      if (open) window.dispatchEvent(new CustomEvent("vv:chat:close"));
    });
    document.addEventListener("click", function (e) {
      if (wrap.classList.contains("is-open") && !wrap.contains(e.target)) setFabOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && wrap.classList.contains("is-open")) {
        setFabOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("vv:contact:close", function () { setFabOpen(false); });
    wrap.querySelectorAll(".fab-item").forEach(function (a) {
      a.addEventListener("click", function () { setFabOpen(false); });
    });
  }

  function chatThreadId() {
    let id = "";
    try { id = localStorage.getItem(LS_CHAT_THREAD) || ""; } catch (e) { /* ignore */ }
    if (!id) {
      const bytes = new Uint8Array(16);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
      else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      id = "th_" + Array.from(bytes).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      try { localStorage.setItem(LS_CHAT_THREAD, id); } catch (e) { /* ignore */ }
    }
    return id;
  }

  function chatHTML() {
    return (
      '<button class="v4t-chat__fab" id="v4tChatFab" type="button" aria-expanded="false" aria-controls="v4tChatPanel">' +
        icon("chat", 22) +
        '<em class="v4t-chat__badge" id="v4tChatBadge" hidden>0</em>' +
      "</button>" +
      '<section class="v4t-chat__panel" id="v4tChatPanel" hidden>' +
        '<header class="v4t-chat__head"><strong>Trò chuyện với Vietnam4trip</strong>' +
          '<button class="v4t-chat__close" id="v4tChatClose" type="button" aria-label="Đóng">' + icon("x", 16) + "</button>" +
        "</header>" +
        '<div class="v4t-chat__msgs" id="v4tChatMsgs"></div>' +
        '<p class="v4t-chat__note" id="v4tChatNote" hidden></p>' +
        '<form class="v4t-chat__form" id="v4tChatForm" novalidate>' +
          '<input id="v4tChatName" type="text" maxlength="80" autocomplete="name" placeholder="Tên của bạn" />' +
          '<div class="v4t-chat__row">' +
            '<input id="v4tChatInput" type="text" maxlength="2000" autocomplete="off" placeholder="Nhập tin nhắn…" />' +
            '<button type="submit" aria-label="Gửi">' + icon("send", 17) + "</button>" +
          "</div>" +
        "</form>" +
      "</section>"
    );
  }

  function initChat() {
    const api = window.V4T_API;
    if (!api || !api.enabled || !api.chat) return;
    const wrap = document.getElementById("v4tChat");
    if (!wrap) return;

    const fab = document.getElementById("v4tChatFab");
    const panel = document.getElementById("v4tChatPanel");
    const msgsEl = document.getElementById("v4tChatMsgs");
    const noteEl = document.getElementById("v4tChatNote");
    const form = document.getElementById("v4tChatForm");
    const input = document.getElementById("v4tChatInput");
    const nameInput = document.getElementById("v4tChatName");
    const badge = document.getElementById("v4tChatBadge");
    const thread = chatThreadId();

    let messages = [];
    let open = false;
    let unread = 0;
    let subscribed = false;
    let subscribing = false;
    let loadedOnce = false;
    let busy = false;

    try { nameInput.value = localStorage.getItem(LS_CHAT_NAME) || ""; } catch (e) { /* ignore */ }

    function note(msg) {
      noteEl.textContent = msg || "";
      noteEl.hidden = !msg;
    }

    function paint() {
      msgsEl.innerHTML = messages.length
        ? messages.map(function (m) {
            const time = new Date(m.createdAt).toLocaleTimeString(state.lang === "vi" ? "vi-VN" : "en-GB", {
              hour: "2-digit", minute: "2-digit"
            });
            return '<div class="v4t-chat__msg' + (m.sender === "admin" ? " is-admin" : "") + '">' +
              "<small>" + esc(m.authorName) + " · " + esc(time) + "</small>" +
              "<p>" + esc(m.body) + "</p></div>";
          }).join("")
        : '<p class="v4t-chat__empty">Chưa có tin nhắn. Gửi câu hỏi để chúng tôi hỗ trợ ngay!</p>';
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    function paintBadge() {
      badge.hidden = unread === 0;
      badge.textContent = unread > 99 ? "99+" : String(unread);
    }

    function setOpen(next) {
      open = next;
      wrap.classList.toggle("is-open", open);
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", String(open));
      if (open) {
        unread = 0;
        paintBadge();
        loadMessages();
        input.focus();
      }
    }

    window.addEventListener("vv:chat:close", function () {
      if (open) setOpen(false);
    });

    async function loadMessages() {
      try {
        const prevIds = {};
        messages.forEach(function (m) { prevIds[m.id] = true; });
        messages = (await api.chat.list(thread)).filter(function (m) { return !m.deletedAt; });
        if (!open && loadedOnce) {
          let added = 0;
          messages.forEach(function (m) {
            if (m.sender === "admin" && !prevIds[m.id]) added++;
          });
          if (added) { unread += added; paintBadge(); }
        }
        loadedOnce = true;
        paint();
        note("");
        if (open && messages.length) await api.chat.markRead(thread);
      } catch (err) {
        note(err && err.message ? err.message : "Không tải được tin nhắn.");
      }
    }

    async function subscribe() {
      if (subscribed || subscribing) return;
      subscribing = true;
      try {
        await api.chat.subscribe(thread, function (m, kind) {
          let added = false;
          if (kind === "insert") {
            if (!messages.some(function (x) { return x.id === m.id; })) {
              messages.push(m);
              added = true;
            }
            if (added && m.sender === "admin" && !open) { unread++; paintBadge(); }
          } else if (kind === "update") {
            const idx = messages.findIndex(function (x) { return x.id === m.id; });
            if (m.deletedAt) {
              // Tin bị admin ẩn → gỡ khỏi khung chat.
              if (idx > -1) messages.splice(idx, 1);
            } else if (idx > -1) {
              messages[idx] = m;
            } else {
              // Tin được hiện lại → thêm vào, giữ đúng thứ tự thời gian.
              messages.push(m);
              messages.sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); });
            }
          } else if (kind === "delete") {
            messages = messages.filter(function (x) { return x.id !== m.id; });
          }
          paint();
          if (open && messages.length) api.chat.markRead(thread).catch(function () { /* ignore */ });
        });
        subscribed = true;
        note("");
      } catch (err) {
        note("Chưa kết nối được tin nhắn trực tiếp. Sẽ tự thử lại.");
      } finally {
        subscribing = false;
      }
    }

    // Dự phòng: Realtime có thể bị mạng/proxy chặn, nên vẫn poll định kỳ.
    window.setInterval(function () {
      if (!subscribed && !subscribing) subscribe();
      if (!document.hidden && !busy) loadMessages();
    }, 5000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) loadMessages();
    });
    window.addEventListener("focus", function () { loadMessages(); });

    fab.addEventListener("click", function () {
      if (!open) window.dispatchEvent(new CustomEvent("vv:contact:close"));
      setOpen(!open);
      subscribe();
    });
    document.getElementById("v4tChatClose").addEventListener("click", function () { setOpen(false); fab.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) { setOpen(false); fab.focus(); }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || busy) return;
      const name = nameInput.value.trim();
      if (name) { try { localStorage.setItem(LS_CHAT_NAME, name); } catch (err) { /* ignore */ } }
      busy = true;
      form.querySelector("button[type=submit]").disabled = true;
      try {
        await api.chat.send(thread, text, name || "Khách");
        input.value = "";
        note("");
        await loadMessages();
      } catch (err) {
        note(err && err.message ? err.message : "Không gửi được tin nhắn.");
      } finally {
        busy = false;
        form.querySelector("button[type=submit]").disabled = false;
        input.focus();
      }
    });

    loadMessages();
    subscribe();
  }

  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.dataset.i18nPh));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    const metaKey = PAGE ? "meta." + PAGE : "";
    if (metaKey && t(metaKey) !== metaKey) document.title = t(metaKey);
    const hot = document.querySelector(".header__hotline small");
    if (hot) hot.textContent = t("common.hotline");
  }

  function hydrateIcons() {
    document.querySelectorAll("[data-icon]:not([data-icon-ready])").forEach(function (el) {
      el.innerHTML = icon(el.dataset.icon, Number(el.dataset.iconSize) || 18);
      el.setAttribute("data-icon-ready", "1");
    });
  }

  function updateLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      const on = btn.dataset.lang === state.lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setLang(lang) {
    if (lang !== "vi" && lang !== "en") return;
    if (lang === state.lang) return;
    state.lang = lang;
    try { localStorage.setItem(LS_LANG, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-en", lang === "en");
    applyStatic();
    updateLangButtons();
    window.dispatchEvent(new CustomEvent("vv:lang", { detail: { lang: lang } }));
  }

  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById("vv-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "vv-toast";
      el.className = "vv-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add("is-show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-show"); }, 3200);
  }

  const revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;

  function reveal() {
    document.querySelectorAll(".reveal:not(.is-observed)").forEach(function (el) {
      el.classList.add("is-observed");
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("in-view");
    });
  }

  function closeNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.getElementById("navToggle");
    if (!header) return;
    header.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initHeaderBehavior() {
    const header = document.getElementById("siteHeader");
    const toggle = document.getElementById("navToggle");
    const backdrop = document.getElementById("navBackdrop");
    if (toggle) {
      toggle.addEventListener("click", function () {
        const open = header.classList.toggle("is-open");
        document.body.classList.toggle("nav-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    if (backdrop) backdrop.addEventListener("click", closeNav);
    document.querySelectorAll(".nav__link").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    const onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      const btn = form.querySelector('button[type="submit"]');
      const value = input ? input.value.trim() : "";
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!ok) {
        toast(t("toast.newsletterErr"));
        if (input) { input.focus(); input.classList.add("is-invalid"); }
        return;
      }
      if (input) input.classList.remove("is-invalid");
      const api = window.V4T_API;
      if (api && api.enabled) {
        if (btn) btn.disabled = true;
        try {
          await api.subscribeNewsletter(value);
          if (input) input.value = "";
          toast(t("toast.newsletter"));
        } catch (err) {
          toast(err && err.message ? err.message : t("toast.newsletterErr"));
        } finally {
          if (btn) btn.disabled = false;
        }
        return;
      }
      // Chế độ Node/local: giữ hành vi cũ (chỉ toast).
      if (input) input.value = "";
      toast(t("toast.newsletter"));
    });
  }

  function bindFavoriteButtons() {
    if (document.body.dataset.favBound === "1") return;
    document.body.dataset.favBound = "1";
    document.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-fav]");
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.fav;
      const favs = getFavs();
      const idx = favs.indexOf(id);
      let active;
      if (idx > -1) { favs.splice(idx, 1); active = false; toast(t("toast.unfav")); }
      else { favs.push(id); active = true; toast(t("toast.fav")); }
      try { localStorage.setItem(LS_FAVS, JSON.stringify(favs)); } catch (err) { /* ignore */ }
      document.querySelectorAll('[data-fav="' + id + '"]').forEach(function (b) {
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
        b.setAttribute("aria-label", active ? t("toast.unfav") : t("toast.fav"));
      });
    });
  }

  function bindLanguage() {
    if (document.body.dataset.langBound === "1") return;
    document.body.dataset.langBound = "1";
    document.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-lang]");
      if (!btn) return;
      setLang(btn.dataset.lang);
    });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(state.lang === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }

  function bookUrl(tourId, opts) {
    const o = opts || {};
    const params = new URLSearchParams();
    params.set("id", tourId);
    if (o.date) params.set("date", o.date);
    if (o.adults) params.set("adults", o.adults);
    if (o.children != null) params.set("children", o.children);
    return "booking.html?" + params.toString();
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  window.VV = {
    data: DATA,
    state: state,
    t: t,
    fill: fill,
    esc: esc,
    icon: icon,
    star: STAR,
    fmtNum: fmtNum,
    price: price,
    ratingHTML: ratingHTML,
    durationLabel: durationLabel,
    destOf: destOf,
    tourOf: tourOf,
    typeNames: typeNames,
    badgeHTML: badgeHTML,
    tourCardHTML: tourCardHTML,
    getFavs: getFavs,
    applyStatic: applyStatic,
    setLang: setLang,
    toast: toast,
    reveal: reveal,
    closeNav: closeNav,
    fmtDate: fmtDate,
    toISO: toISO,
    tomorrowISO: tomorrowISO,
    bookUrl: bookUrl,
    param: param,
    hydrateIcons: hydrateIcons,
    getTourOverrides: getTourOverrides,
    applyTourOverrides: applyTourOverrides,
    whenReady: whenReady
  };

  function init() {
    document.documentElement.classList.add("js");
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");
    if (headerMount) headerMount.innerHTML = headerHTML();
    if (footerMount) footerMount.innerHTML = footerHTML();
    if (PAGE !== "admin") {
      const fab = document.createElement("div");
      fab.className = "vv-fab";
      fab.id = "vvFab";
      fab.innerHTML = fabHTML();
      document.body.appendChild(fab);

      if (window.V4T_API && window.V4T_API.enabled) {
        const chat = document.createElement("div");
        chat.className = "v4t-chat";
        chat.id = "v4tChat";
        chat.innerHTML = chatHTML();
        document.body.appendChild(chat);
      }
    }
    document.documentElement.lang = state.lang;
    document.body.classList.toggle("lang-en", state.lang === "en");
    applyStatic();
    hydrateIcons();
    updateLangButtons();
    initHeaderBehavior();
    initNewsletter();
    bindFavoriteButtons();
    bindLanguage();
    bindFab();
    initChat();
    reveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
