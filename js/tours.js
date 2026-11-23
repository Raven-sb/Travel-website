/* Vietnam4trip — tours listing & filters */
(function () {
  "use strict";

  const V = window.VV;
  const DATA = V.data;
  const TYPE_KEYS = ["nature", "culture", "beach", "adventure", "luxury"];
  const DURATIONS = ["1", "2-3", "4"];
  const BUDGETS = ["under1", "1-3", "3-5", "over5"];
  const SORTS = ["recommended", "priceAsc", "priceDesc", "rating", "duration"];

  const state = {
    q: "",
    dest: "",
    region: "",
    types: [],
    duration: "",
    budget: "",
    sort: "recommended",
    date: ""
  };

  const els = {};

  function byId(id) { return document.getElementById(id); }

  function one(name) {
    return document.querySelector('input[name="' + name + '"]:checked');
  }

  function readURL() {
    const p = new URLSearchParams(window.location.search);
    const dest = p.get("dest") || "";
    const region = p.get("region") || "";
    const duration = p.get("duration") || "";
    const budget = p.get("budget") || "";
    const sort = p.get("sort") || "";

    state.q = (p.get("q") || "").trim();
    state.dest = DATA.destinations.some(function (d) { return d.key === dest; }) ? dest : "";
    state.region = ["north", "central", "south"].indexOf(region) > -1 ? region : "";
    state.types = (p.get("type") || "").split(",").filter(function (ty) {
      return TYPE_KEYS.indexOf(ty) > -1;
    });
    state.duration = DURATIONS.indexOf(duration) > -1 ? duration : "";
    state.budget = BUDGETS.indexOf(budget) > -1 ? budget : "";
    state.sort = SORTS.indexOf(sort) > -1 ? sort : "recommended";
    const date = p.get("date") || "";
    state.date = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  }

  function renderDestOptions() {
    if (!els.dest) return;
    els.dest.innerHTML =
      '<option value="">' + V.esc(V.t("search.all")) + "</option>" +
      DATA.destinations.map(function (d) {
        return '<option value="' + d.key + '">' + V.esc(d.name[V.state.lang]) + "</option>";
      }).join("");
    els.dest.value = state.dest;
  }

  function syncControls() {
    if (els.search) els.search.value = state.q;
    renderDestOptions();
    if (els.sort) els.sort.value = state.sort;

    document.querySelectorAll(".region-pill").forEach(function (pill) {
      const on = (pill.dataset.region === "all" && !state.region) || pill.dataset.region === state.region;
      pill.classList.toggle("is-active", on);
      pill.setAttribute("aria-pressed", on ? "true" : "false");
    });

    document.querySelectorAll('input[name="type"]').forEach(function (box) {
      box.checked = state.types.indexOf(box.value) > -1;
    });

    const dur = one("duration");
    if (dur) dur.checked = false;
    const durEl = document.querySelector('input[name="duration"][value="' + state.duration + '"]');
    if (durEl) durEl.checked = true;

    const bud = one("budget");
    if (bud) bud.checked = false;
    const budEl = document.querySelector('input[name="budget"][value="' + state.budget + '"]');
    if (budEl) budEl.checked = true;
  }

  function matches(tour) {
    if (state.q) {
      const d = V.destOf(tour.dest);
      const hay = [
        tour.title.vi, tour.title.en, tour.tagline.vi, tour.tagline.en,
        d ? d.name.vi : "", d ? d.name.en : ""
      ].join(" ").toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    if (state.dest && tour.dest !== state.dest) return false;
    if (state.region && tour.region !== state.region) return false;
    if (state.types.length && !state.types.some(function (ty) { return tour.type.indexOf(ty) > -1; })) return false;
    if (state.duration === "1" && tour.duration > 1) return false;
    if (state.duration === "2-3" && (tour.duration < 2 || tour.duration > 3)) return false;
    if (state.duration === "4" && tour.duration < 4) return false;
    if (state.budget === "under1" && tour.price >= 1000000) return false;
    if (state.budget === "1-3" && (tour.price < 1000000 || tour.price >= 3000000)) return false;
    if (state.budget === "3-5" && (tour.price < 3000000 || tour.price > 5000000)) return false;
    if (state.budget === "over5" && tour.price <= 5000000) return false;
    return true;
  }

  function sortList(list) {
    if (state.sort === "priceAsc") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "priceDesc") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    else if (state.sort === "duration") list.sort(function (a, b) { return a.duration - b.duration; });
    return list;
  }

  function updateCount(n) {
    if (!els.count) return;
    const tpl = V.t("tours.results");
    if (tpl.indexOf("{n}") > -1) {
      const parts = tpl.split("{n}");
      els.count.innerHTML = V.esc(parts[0]) + "<strong>" + V.fmtNum(n) + "</strong>" + V.esc(parts[1] || "");
    } else {
      els.count.textContent = tpl;
    }
  }

  function decorateDates() {
    if (!state.date) return;
    els.grid.querySelectorAll('a[href^="tour.html?id="]').forEach(function (a) {
      a.setAttribute("href", a.getAttribute("href") + "&date=" + encodeURIComponent(state.date));
    });
  }

  function renderResults() {
    const list = sortList(DATA.tours.filter(function (tr) {
      return tr.active !== false && matches(tr);
    }));
    els.grid.innerHTML = list.map(V.tourCardHTML).join("");
    els.grid.hidden = list.length === 0;
    if (els.empty) els.empty.hidden = list.length > 0;
    decorateDates();
    updateCount(list.length);
    V.reveal();
  }

  function updateURL() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.dest) p.set("dest", state.dest);
    if (state.region) p.set("region", state.region);
    if (state.types.length) p.set("type", state.types.join(","));
    if (state.duration) p.set("duration", state.duration);
    if (state.budget) p.set("budget", state.budget);
    if (state.sort !== "recommended") p.set("sort", state.sort);
    if (state.date) p.set("date", state.date);
    const qs = p.toString();
    try {
      window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
    } catch (e) { /* ignore */ }
  }

  function apply(updateUrl) {
    renderResults();
    if (updateUrl !== false) updateURL();
  }

  function resetFilters() {
    state.q = "";
    state.dest = "";
    state.region = "";
    state.types = [];
    state.duration = "";
    state.budget = "";
    state.sort = "recommended";
    syncControls();
    apply();
  }

  function openFilters(open) {
    document.body.classList.toggle("filters-open", open);
    if (els.toggle) els.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function bind() {
    let timer = null;
    if (els.search) {
      els.search.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = els.search.value.trim();
          apply();
        }, 200);
      });
    }

    if (els.dest) {
      els.dest.addEventListener("change", function () {
        state.dest = els.dest.value;
        apply();
      });
    }

    if (els.sort) {
      els.sort.addEventListener("change", function () {
        state.sort = els.sort.value;
        apply();
      });
    }

    document.querySelectorAll('input[name="type"]').forEach(function (box) {
      box.addEventListener("change", function () {
        state.types = Array.prototype.map.call(
          document.querySelectorAll('input[name="type"]:checked'),
          function (b) { return b.value; }
        );
        apply();
      });
    });

    document.querySelectorAll('input[name="duration"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.duration = radio.value;
        apply();
      });
    });

    document.querySelectorAll('input[name="budget"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.budget = radio.value;
        apply();
      });
    });

    document.querySelectorAll(".region-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        state.region = pill.dataset.region === "all" ? "" : pill.dataset.region;
        syncControls();
        apply();
      });
    });

    if (els.reset) els.reset.addEventListener("click", resetFilters);
    if (els.emptyClear) els.emptyClear.addEventListener("click", resetFilters);
    if (els.toggle) els.toggle.addEventListener("click", function () { openFilters(true); });
    if (els.close) els.close.addEventListener("click", function () { openFilters(false); });
    if (els.applyMobile) els.applyMobile.addEventListener("click", function () { openFilters(false); });
    if (els.backdrop) els.backdrop.addEventListener("click", function () { openFilters(false); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") openFilters(false);
    });

    window.addEventListener("vv:lang", function () {
      renderDestOptions();
      renderResults();
    });

    window.addEventListener("vv:overrides", renderResults);
  }

  function init() {
    els.search = byId("filterSearch");
    els.dest = byId("filterDest");
    els.sort = byId("sortSelect");
    els.grid = byId("toursGrid");
    els.count = byId("resultsCount");
    els.empty = byId("emptyState");
    els.emptyClear = byId("emptyClear");
    els.reset = byId("resetFilters");
    els.toggle = byId("filtersToggle");
    els.close = byId("filtersClose");
    els.applyMobile = byId("applyFilters");
    els.backdrop = byId("filtersBackdrop");

    readURL();
    syncControls();
    bind();
    apply(false);
    V.hydrateIcons();
  }

  V.whenReady(init);
})();
