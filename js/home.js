/* Vietnam4trip — home page */
(function () {
  "use strict";

  const V = window.VV;
  const DATA = V.data;
  const TYPES = ["nature", "culture", "beach", "adventure", "luxury", "transfer", "food"];
  const DEST_TILES = ["halong", "sapa", "hoian", "hagiang", "phuquoc", "mekong"];
  let activeTab = "all";

  function byId(id) {
    return document.getElementById(id);
  }

  function renderHeroSelects() {
    const destSel = byId("heroDest");
    const typeSel = byId("heroType");
    if (!destSel || !typeSel) return;

    const prevDest = destSel.value;
    const prevType = typeSel.value;

    destSel.innerHTML =
      '<option value="">' + V.esc(V.t("search.all")) + "</option>" +
      DATA.destinations
        .map(function (d) {
          return '<option value="' + d.key + '">' + V.esc(d.name[V.state.lang]) + "</option>";
        })
        .join("");

    typeSel.innerHTML =
      '<option value="">' + V.esc(V.t("common.all")) + "</option>" +
      TYPES.map(function (ty) {
        return '<option value="' + ty + '">' + V.esc(V.t("type." + ty)) + "</option>";
      }).join("");

    if (prevDest) destSel.value = prevDest;
    if (prevType) typeSel.value = prevType;
  }

  function renderTabs() {
    const el = byId("featuredTabs");
    if (!el) return;
    const items = [{ key: "all", label: V.t("common.all") }].concat(
      TYPES.map(function (ty) {
        return { key: ty, label: V.t("type." + ty) };
      })
    );
    el.innerHTML = items
      .map(function (it) {
        const on = it.key === activeTab;
        return (
          '<button class="tab' + (on ? " is-active" : "") + '" type="button" data-tab="' + it.key +
          '" role="tab" aria-selected="' + on + '">' + V.esc(it.label) + "</button>"
        );
      })
      .join("");
  }

  function renderFeatured() {
    const grid = byId("featuredGrid");
    if (!grid) return;
    let list = DATA.tours.filter(function (tr) {
      if (tr.active === false) return false;
      return activeTab === "all" || tr.type.indexOf(activeTab) > -1;
    });
    list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    if (activeTab === "all") list = list.slice(0, 6);
    grid.innerHTML = list.map(V.tourCardHTML).join("");
    V.reveal();
  }

  function renderDests() {
    const grid = byId("destGrid");
    if (!grid) return;
    grid.innerHTML = DEST_TILES.map(function (key, idx) {
      const d = V.destOf(key);
      if (!d) return "";
      const name = d.name[V.state.lang];
      const count = DATA.tours.filter(function (tr) { return tr.dest === key && tr.active !== false; }).length;
      const caption = count > 1 ? V.fill(V.t("dest.tours"), { n: V.fmtNum(count) }) : d.tag[V.state.lang];
      return (
        '<a class="dest-tile reveal" style="--rd:' + (idx * 60) + 'ms" href="tours.html?dest=' + key + '" aria-label="' +
        V.esc(name + " — " + V.t("dest.explore")) + '">' +
          '<img src="' + d.img + '" alt="' + V.esc(name) + '" loading="lazy" />' +
          '<div class="dest-tile__content">' +
            "<div>" +
              '<div class="dest-tile__name">' + V.esc(name) + "</div>" +
              '<span class="dest-tile__count">' + V.esc(caption) + "</span>" +
            "</div>" +
            '<span class="dest-tile__arrow" aria-hidden="true">' + V.icon("arrow", 16) + "</span>" +
          "</div>" +
        "</a>"
      );
    }).join("");
    V.reveal();
  }

  function renderTestimonials() {
    const grid = byId("testiGrid");
    if (!grid) return;
    grid.innerHTML = DATA.testimonialList
      .map(function (item, idx) {
        const stars = new Array(item.rating || 5)
          .fill(V.star)
          .join("");
        return (
          '<article class="testi-card reveal" style="--rd:' + (idx * 90) + 'ms">' +
            '<div class="testi-card__quote" aria-hidden="true">“</div>' +
            '<div class="rating">' + stars + "</div>" +
            '<p class="testi-card__text">' + V.esc(item.quote[V.state.lang]) + "</p>" +
            '<div class="testi-card__author">' +
              '<span class="avatar" style="background:' + item.color + '" aria-hidden="true">' + V.esc(item.initials) + "</span>" +
              "<div>" +
                '<div class="testi-card__name">' + V.esc(item.name) + "</div>" +
                '<div class="testi-card__role">' + V.esc(item.role[V.state.lang]) + "</div>" +
              "</div>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");
    V.reveal();
  }

  function renderStats() {
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      const num = Number(el.dataset.stat);
      if (el.dataset.statRating) {
        el.textContent = V.fmtNum(num) + "/5";
      } else {
        el.textContent = V.fmtNum(num) + (el.dataset.statSuffix || "");
      }
    });
  }

  function bindSearch() {
    const form = byId("heroSearch");
    const date = byId("heroDate");
    if (date) date.min = V.tomorrowISO();
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const params = new URLSearchParams();
      ["dest", "type", "date"].forEach(function (name) {
        const field = form.elements[name];
        if (field && field.value) params.set(name, field.value);
      });
      const qs = params.toString();
      window.location.href = "tours.html" + (qs ? "?" + qs : "");
    });
  }

  function init() {
    renderHeroSelects();
    renderTabs();
    renderFeatured();
    renderDests();
    renderTestimonials();
    renderStats();
    bindSearch();
    V.hydrateIcons();

    const tabs = byId("featuredTabs");
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-tab]");
        if (!btn) return;
        activeTab = btn.dataset.tab;
        renderTabs();
        renderFeatured();
      });
    }

    window.addEventListener("vv:lang", function () {
      renderHeroSelects();
      renderTabs();
      renderFeatured();
      renderDests();
      renderTestimonials();
      renderStats();
    });

    window.addEventListener("vv:overrides", function () {
      renderFeatured();
      renderDests();
    });
  }

  V.whenReady(init);
})();
