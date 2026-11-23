/* Vietnam4trip — tour detail page */
(function () {
  "use strict";

  const V = window.VV;
  const DATA = V.data;
  const main = document.getElementById("tourMain");
  let currentTour = null;

  const state = {
    date: "",
    adults: 2,
    children: 0,
    openDay: 1,
    galleryIdx: 0
  };

  function byId(id) { return document.getElementById(id); }

  function lowerFirst(str) {
    return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
  }

  function childPrice(tour) {
    return Math.round(tour.price * 0.6);
  }

  function calcTotal() {
    if (!currentTour) return 0;
    return state.adults * currentTour.price + state.children * childPrice(currentTour);
  }

  function updateTotals() {
    const total = V.price(calcTotal());
    ["bkTotal", "mobilePrice"].forEach(function (id) {
      const el = byId(id);
      if (el) el.textContent = total;
    });
    const a = byId("qtyAdults");
    const c = byId("qtyChildren");
    if (a) a.textContent = state.adults;
    if (c) c.textContent = state.children;
    const minusA = main.querySelector('[data-step="adults"][data-dir="-1"]');
    const plusA = main.querySelector('[data-step="adults"][data-dir="1"]');
    const minusC = main.querySelector('[data-step="children"][data-dir="-1"]');
    const plusC = main.querySelector('[data-step="children"][data-dir="1"]');
    if (minusA) minusA.disabled = state.adults <= 1;
    if (plusA) plusA.disabled = state.adults >= 20;
    if (minusC) minusC.disabled = state.children <= 0;
    if (plusC) plusC.disabled = state.children >= 10;
  }

  function goBook() {
    const dateInput = byId("bkDate");
    if (dateInput && dateInput.value) state.date = dateInput.value;
    if (!state.date) {
      V.toast(V.t("book.errRequired"));
      if (dateInput) dateInput.focus();
      return;
    }
    window.location.href = V.bookUrl(currentTour.id, {
      date: state.date,
      adults: state.adults,
      children: state.children
    });
  }

  function relatedTours() {
    const pool = DATA.tours.filter(function (t) { return t.active !== false; });
    const same = pool.filter(function (t) {
      return t.id !== currentTour.id && t.region === currentTour.region;
    });
    const rest = pool.filter(function (t) {
      return t.id !== currentTour.id && same.indexOf(t) === -1;
    });
    return same.concat(rest).slice(0, 3);
  }

  function overviewText(tour, dest) {
    const dur = V.durationLabel(tour.duration);
    const dep = tour.departure[V.state.lang];
    const name = dest.name[V.state.lang];
    const tag = lowerFirst(tour.tagline[V.state.lang]);
    const group = lowerFirst(tour.group[V.state.lang]);
    if (V.state.lang === "vi") {
      return "Hành trình " + dur + " khởi hành từ " + dep + " sẽ đưa bạn qua " + name + ": " + tag +
        ". Chúng tôi giữ nhóm nhỏ — " + group + " — để bạn có không gian thật sự cho từng trải nghiệm. " +
        "Từ đưa đón, bữa ăn đến vé tham quan đều đã được chuẩn bị sẵn; bạn chỉ cần mang theo sự tò mò.";
    }
    return "This " + dur + " journey departs from " + dep + " and takes you through " + name + ": " + tag +
      ". Groups stay small — " + group + " — so there is real space for every experience. " +
      "Transfers, meals and entrance tickets are all arranged; just bring your curiosity.";
  }

  function galleryHTML(tour) {
    const g = tour.gallery && tour.gallery.length ? tour.gallery : [tour.img];
    const activeIdx = Math.min(state.galleryIdx, g.length - 1);
    const title = V.esc(tour.title[V.state.lang]);
    const thumbs = g.slice(1).map(function (src, i) {
      const idx = i + 1;
      return (
        '<button class="gallery__item' + (idx === activeIdx ? " is-active" : "") + '" type="button" data-gallery-index="' + idx +
        '" aria-label="' + title + ' — ' + (idx + 1) + '">' +
          '<img src="' + src + '" alt="' + title + ' — ' + (idx + 1) + '" loading="lazy" />' +
        "</button>"
      );
    }).join("");
    return (
      '<div class="gallery">' +
        '<div class="gallery__item gallery__item--main">' +
          '<img id="galleryMain" src="' + g[activeIdx] + '" alt="' + title + '" />' +
          '<span class="gallery__count">' + V.icon("camera", 15) + g.length + "</span>" +
        "</div>" +
        thumbs +
      "</div>"
    );
  }

  function itineraryHTML(tour) {
    return (
      '<div class="accordion">' +
        tour.itinerary.map(function (day, i) {
          const open = day.day === state.openDay;
          return (
            '<div class="acc-item' + (open ? " is-open" : "") + '" data-day="' + day.day + '">' +
              '<button class="acc-head" type="button" aria-expanded="' + open + '" aria-controls="accBody' + day.day + '">' +
                '<span class="acc-day">' + V.esc(V.fill(V.t("tour.dayLabel"), { n: day.day })) + "</span>" +
                '<span class="acc-title">' + V.esc(day.title[V.state.lang]) + "</span>" +
                '<span class="acc-chevron">' + V.icon("chevron", 16) + "</span>" +
              "</button>" +
              '<div class="acc-body" id="accBody' + day.day + '">' +
                "<div><p>" + V.esc(day.desc[V.state.lang]) + "</p></div>" +
              "</div>" +
            "</div>"
          );
        }).join("") +
      "</div>"
    );
  }

  function reviewsHTML(tour) {
    const dist = [
      { star: 5, pct: 86 },
      { star: 4, pct: 10 },
      { star: 3, pct: 3 },
      { star: 2, pct: 1 },
      { star: 1, pct: 0 }
    ];
    const stars = new Array(5).fill(V.star).join("");
    const bars = dist.map(function (row) {
      return (
        '<div class="review-bar">' +
          "<span>" + row.star + "★</span>" +
          '<div class="review-bar__track"><div class="review-bar__fill" style="width:' + row.pct + '%"></div></div>' +
          "<span>" + row.pct + "%</span>" +
        "</div>"
      );
    }).join("");

    const cards = DATA.testimonialList.slice(0, 2).map(function (item) {
      const cardStars = new Array(item.rating || 5).fill(V.star).join("");
      return (
        '<article class="review-card">' +
          '<div class="review-card__head">' +
            '<span class="avatar" style="background:' + item.color + '" aria-hidden="true">' + V.esc(item.initials) + "</span>" +
            "<div>" +
              '<div class="review-card__name">' + V.esc(item.name) + "</div>" +
              '<div class="testi-card__role">' + V.esc(item.role[V.state.lang]) + "</div>" +
            "</div>" +
            '<span class="review-card__tag">' + V.icon("shield", 12) + V.esc(V.t("reviews.verified")) + "</span>" +
          "</div>" +
          "<p>" + V.esc(item.quote[V.state.lang]) + "</p>" +
          '<div class="rating">' + cardStars + "</div>" +
        "</article>"
      );
    }).join("");

    return (
      '<div class="reviews-summary">' +
        '<div class="reviews-score">' +
          "<strong>" + (V.state.lang === "vi" ? String(tour.rating).replace(".", ",") : tour.rating) + "</strong>" +
          '<div class="stars">' + stars + "</div>" +
          "<small>" + V.esc(V.fill(V.t("tour.basedOn"), { n: V.fmtNum(tour.reviews) })) + "</small>" +
        "</div>" +
        '<div class="review-bars">' + bars + "</div>" +
      "</div>" +
      '<div class="review-cards">' + cards + "</div>"
    );
  }

  function bookingCardHTML(tour) {
    const total = V.price(calcTotal());
    return (
      '<aside class="booking-card" aria-label="' + V.esc(V.t("tour.bookTitle")) + '">' +
        '<div class="bk-price-row">' +
          "<div>" +
            '<div class="bk-price-label">' + V.esc(V.t("common.from")) + "</div>" +
            '<div class="bk-price">' +
              "<strong>" + V.price(tour.price) + "</strong>" +
              "<small>" + V.esc(V.t("common.perPerson")) + "</small>" +
              (tour.oldPrice ? "<del>" + V.price(tour.oldPrice) + "</del>" : "") +
            "</div>" +
          "</div>" +
          '<span class="bk-hold">' + V.icon("check", 12) + V.esc(V.t("tour.freeHold")) + "</span>" +
        "</div>" +
        '<div class="bk-divider"></div>' +
        '<div class="bk-field">' +
          '<label for="bkDate">' + V.esc(V.t("tour.date")) + "</label>" +
          '<input type="date" id="bkDate" min="' + V.tomorrowISO() + '" value="' + state.date + '" />' +
        "</div>" +
        '<div style="margin-top:8px">' +
          '<div class="qty-row">' +
            '<div class="qty-row__label">' + V.esc(V.t("tour.adults")) + "</div>" +
            '<div class="qty">' +
              '<button type="button" data-step="adults" data-dir="-1" aria-label="−">−</button>' +
              '<span id="qtyAdults">' + state.adults + "</span>" +
              '<button type="button" data-step="adults" data-dir="1" aria-label="+">+</button>' +
            "</div>" +
          "</div>" +
          '<div class="qty-row">' +
            "<div>" +
              '<div class="qty-row__label">' + V.esc(V.t("tour.children")) + "</div>" +
              '<div class="qty-row__hint">' + V.esc(V.t("tour.childrenPrice")) + "</div>" +
            "</div>" +
            '<div class="qty">' +
              '<button type="button" data-step="children" data-dir="-1" aria-label="−">−</button>' +
              '<span id="qtyChildren">' + state.children + "</span>" +
              '<button type="button" data-step="children" data-dir="1" aria-label="+">+</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="bk-divider"></div>' +
        '<div class="bk-total"><span>' + V.esc(V.t("tour.total")) + '</span><strong id="bkTotal">' + total + "</strong></div>" +
        '<p class="sum-taxes">' + V.esc(V.t("common.taxes")) + "</p>" +
        '<button class="btn btn--primary btn--block" type="button" data-book>' +
          V.esc(V.t("tour.bookNow")) + V.icon("arrow", 16) +
        "</button>" +
        '<ul class="bk-notes">' +
          "<li>" + V.icon("shield", 14) + V.esc(V.t("common.cancelFree")) + "</li>" +
          "<li>" + V.icon("lock", 14) + V.esc(V.t("book.secureNote")) + "</li>" +
        "</ul>" +
        '<div class="bk-help">' +
          "<strong>" + V.esc(V.t("tour.needHelp")) + "</strong>" +
          "<span>" + V.esc(V.t("tour.helpSub")) + "</span>" +
          '<a href="tel:+84935549164">' + V.icon("phone", 14) + "0935 549 164</a>" +
        "</div>" +
      "</aside>"
    );
  }

  function render() {
    if (!main) return;
    const id = V.param("id");
    const tour = V.tourOf(id);

    if (!tour) {
      main.innerHTML =
        '<section class="section">' +
          '<div class="container">' +
            '<div class="booking-empty">' +
              '<div class="booking-empty__ico">' + V.icon("compass", 26) + "</div>" +
              "<h1>" + V.esc(V.t("tour.notFound")) + "</h1>" +
              "<p>" + V.esc(V.t("tour.notFoundSub")) + "</p>" +
              '<a class="btn btn--primary" href="tours.html">' + V.esc(V.t("tour.seeAll")) + V.icon("arrow", 16) + "</a>" +
            "</div>" +
          "</div>" +
        "</section>";
      document.title = V.t("tour.notFound") + " – Vietnam4trip";
      return;
    }

    currentTour = tour;
    const lang = V.state.lang;
    const dest = V.destOf(tour.dest) || { name: { vi: "", en: "" }, tag: { vi: "", en: "" } };
    const title = V.esc(tour.title[lang]);
    const destName = V.esc(dest.name[lang]);
    const badgeLabel = tour.badge ? V.t("badge." + tour.badge) : V.t("type." + tour.type[0]);
    const highlights = tour.highlights.map(function (h) {
      return '<div class="highlight">' + V.icon("check", 16) + "<span>" + V.esc(h[lang]) + "</span></div>";
    }).join("");
    const includes = (DATA.includes[lang] || []).map(function (it) {
      return "<li>" + V.icon("check", 15) + "<span>" + V.esc(it) + "</span></li>";
    }).join("");
    const excludes = (DATA.excludes[lang] || []).map(function (it) {
      return "<li>" + V.icon("x", 15) + "<span>" + V.esc(it) + "</span></li>";
    }).join("");
    const policies = (DATA.policies[lang] || []).map(function (it) {
      return "<li>" + V.esc(it) + "</li>";
    }).join("");

    const relatedGrid = relatedTours().map(V.tourCardHTML).join("");
    const total = V.price(calcTotal());

    main.innerHTML =
      '<div class="detail-page">' +
        '<div class="container">' +
          '<nav class="breadcrumb breadcrumb--dark" aria-label="Breadcrumb">' +
            '<a href="index.html">' + V.esc(V.t("common.home")) + "</a><span>/</span>" +
            '<a href="tours.html">' + V.esc(V.t("nav.tours")) + "</a><span>/</span>" +
            "<span>" + title + "</span>" +
          "</nav>" +
          galleryHTML(tour) +
          '<div class="detail-head">' +
            '<div class="detail-head__row">' +
              '<span class="detail-badge">' + V.icon("sparkles", 13) + V.esc(badgeLabel) + "</span>" +
              '<span class="detail-rating">' + V.star + "<b>" + tour.rating + "</b><span>(" + V.fmtNum(tour.reviews) + " " + V.esc(V.t("common.reviews")) + ")</span></span>" +
            "</div>" +
            '<h1 class="detail-title">' + title + "</h1>" +
            '<div class="detail-meta">' +
              '<span class="meta-chip">' + V.icon("clock", 15) + V.esc(V.durationLabel(tour.duration)) + "</span>" +
              '<span class="meta-chip">' + V.icon("pin", 15) + V.esc(V.t("common.departure")) + ": " + V.esc(tour.departure[lang]) + "</span>" +
              '<span class="meta-chip">' + V.icon("users", 15) + V.esc(tour.group[lang]) + "</span>" +
              '<span class="meta-chip">' + V.icon("compass", 15) + V.esc(V.typeNames(tour)) + "</span>" +
            "</div>" +
          "</div>" +

          '<div class="detail-layout">' +
            '<div class="detail-main">' +
              '<section class="detail-section">' +
                "<h2>" + V.esc(V.t("tour.overview")) + "</h2>" +
                "<p>" + V.esc(overviewText(tour, dest)) + "</p>" +
              "</section>" +

              '<section class="detail-section">' +
                "<h2>" + V.esc(V.t("tour.highlights")) + "</h2>" +
                '<div class="highlight-grid">' + highlights + "</div>" +
              "</section>" +

              '<section class="detail-section">' +
                "<h2>" + V.esc(V.t("tour.itinerary")) + "</h2>" +
                itineraryHTML(tour) +
              "</section>" +

              '<section class="detail-section">' +
                '<div class="two-col">' +
                  '<div class="info-card info-card--in">' +
                    "<h3>" + V.icon("check", 16) + V.esc(V.t("tour.includes")) + "</h3>" +
                    "<ul>" + includes + "</ul>" +
                  "</div>" +
                  '<div class="info-card info-card--out">' +
                    "<h3>" + V.icon("x", 16) + V.esc(V.t("tour.excludes")) + "</h3>" +
                    "<ul>" + excludes + "</ul>" +
                  "</div>" +
                "</div>" +
              "</section>" +

              '<section class="detail-section">' +
                "<h2>" + V.esc(V.t("tour.notes")) + "</h2>" +
                '<div class="notes-card"><ul>' + policies + "</ul></div>" +
              "</section>" +

              '<section class="detail-section">' +
                "<h2>" + V.esc(V.t("tour.reviews")) + "</h2>" +
                reviewsHTML(tour) +
              "</section>" +

              '<section class="related-section">' +
                "<h2>" + V.esc(V.t("tour.related")) + "</h2>" +
                '<div class="tours-grid">' + relatedGrid + "</div>" +
              "</section>" +
            "</div>" +

            bookingCardHTML(tour) +
          "</div>" +

          '<div class="mobile-cta">' +
            '<div class="mobile-cta__price"><small>' + V.esc(V.t("tour.total")) + '</small><strong id="mobilePrice">' + total + "</strong></div>" +
            '<button class="btn btn--primary" type="button" data-book>' + V.esc(V.t("tour.bookNow")) + V.icon("arrow", 15) + "</button>" +
          "</div>" +
        "</div>" +
      "</div>";

    document.title = tour.title[lang] + " – Vietnam4trip";
    updateTotals();
    V.reveal();
  }

  function bind() {
    main.addEventListener("click", function (e) {
      const thumb = e.target.closest("[data-gallery-index]");
      if (thumb && currentTour) {
        e.preventDefault();
        const idx = Number(thumb.dataset.galleryIndex);
        const g = currentTour.gallery || [currentTour.img];
        if (g[idx]) {
          state.galleryIdx = idx;
          const mainImg = byId("galleryMain");
          if (mainImg) {
            mainImg.src = g[idx];
            mainImg.alt = currentTour.title[V.state.lang];
          }
          main.querySelectorAll("[data-gallery-index]").forEach(function (b) {
            b.classList.toggle("is-active", b === thumb);
          });
        }
        return;
      }

      const step = e.target.closest("[data-step]");
      if (step) {
        const key = step.dataset.step;
        const dir = Number(step.dataset.dir);
        if (key === "adults") state.adults = Math.min(20, Math.max(1, state.adults + dir));
        else state.children = Math.min(10, Math.max(0, state.children + dir));
        updateTotals();
        return;
      }

      const acc = e.target.closest(".acc-head");
      if (acc) {
        const item = acc.closest(".acc-item");
        const wasOpen = item.classList.contains("is-open");
        main.querySelectorAll(".acc-item").forEach(function (it) {
          it.classList.remove("is-open");
          const head = it.querySelector(".acc-head");
          if (head) head.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          acc.setAttribute("aria-expanded", "true");
          state.openDay = Number(item.dataset.day);
        } else {
          state.openDay = 0;
        }
        return;
      }

      if (e.target.closest("[data-book]")) {
        goBook();
      }
    });

    main.addEventListener("change", function (e) {
      if (e.target.id === "bkDate") state.date = e.target.value;
    });

    window.addEventListener("vv:lang", render);

    window.addEventListener("vv:overrides", function () {
      if (currentTour) render();
    });
  }

  function init() {
    const pd = V.param("date");
    state.date = (/^\d{4}-\d{2}-\d{2}$/.test(pd || "") && pd >= V.tomorrowISO()) ? pd : V.tomorrowISO();
    const pa = parseInt(V.param("adults") || "", 10);
    const pc = parseInt(V.param("children") || "", 10);
    if (!isNaN(pa)) state.adults = Math.min(20, Math.max(1, pa));
    if (!isNaN(pc)) state.children = Math.min(10, Math.max(0, pc));
    bind();
    render();
  }

  V.whenReady(init);
})();
