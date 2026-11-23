/* Vietnam4trip — booking flow */
(function () {
  "use strict";

  const V = window.VV;
  const state = {
    tour: null,
    date: "",
    adults: 2,
    children: 0,
    step: 1,
    discountRate: 0,
    payment: "later",
    contact: { name: "", email: "", phone: "", country: "vn", requests: "" },
    success: null
  };
  const els = {};

  function byId(id) { return document.getElementById(id); }

  function cache() {
    els.form = byId("bookingForm");
    els.layout = byId("bookingLayout");
    els.empty = byId("bookingEmpty");
    els.progress = byId("progressSteps");
    els.summaryCard = byId("summaryCard");
    els.summaryTour = byId("summaryTour");
    els.sumRows = byId("sumRows");
    els.sumTotals = byId("sumTotals");
    els.bookTotal = byId("bookTotal");
    els.bookAdults = byId("bookAdults");
    els.bookChildren = byId("bookChildren");
    els.bookDate = byId("bookDate");
    els.cardFields = byId("cardFields");
    els.cardNumber = byId("cardNumber");
    els.cardName = byId("cardName");
    els.cardExp = byId("cardExp");
    els.cardCvc = byId("cardCvc");
    els.termsLine = byId("termsLine");
    els.termsBox = byId("termsBox");
    els.termsError = byId("termsError");
    els.promoInput = byId("promoInput");
    els.promoBtn = byId("promoBtn");
    els.backBtn = byId("backBtn");
    els.successWrap = byId("successWrap");
    els.successCard = byId("successCard");
  }

  function totals() {
    const tour = state.tour;
    if (!tour) return { sub: 0, disc: 0, total: 0, childPrice: 0 };
    const childPrice = Math.round(tour.price * 0.6);
    const sub = state.adults * tour.price + state.children * childPrice;
    const disc = Math.round(sub * state.discountRate);
    return { sub: sub, disc: disc, total: sub - disc, childPrice: childPrice };
  }

  function renderSummary() {
    const tour = state.tour;
    if (!tour) return;
    const lang = V.state.lang;
    const dest = V.destOf(tour.dest);
    const t = totals();

    els.summaryTour.innerHTML =
      '<div class="summary-tour">' +
        '<img src="' + tour.img + '" alt="' + V.esc(tour.title[lang]) + '" />' +
        "<div>" +
          '<div class="summary-tour__title">' + V.esc(tour.title[lang]) + "</div>" +
          '<div class="summary-tour__meta">' + V.esc(V.durationLabel(tour.duration)) + " · " + V.esc(dest ? dest.name[lang] : "") + "</div>" +
          '<div class="summary-tour__meta">' + V.esc(V.t("common.departure")) + ": " + V.esc(tour.departure[lang]) + "</div>" +
        "</div>" +
      "</div>";

    els.bookAdults.textContent = state.adults;
    els.bookChildren.textContent = state.children;

    let rows =
      '<div class="sum-row"><span>' + V.fmtNum(state.adults) + " × " + V.price(tour.price) + "</span><span>" +
      V.price(state.adults * tour.price) + "</span></div>";
    if (state.children > 0) {
      rows +=
        '<div class="sum-row"><span>' + V.fmtNum(state.children) + " × " + V.price(t.childPrice) + " (60%)</span><span>" +
        V.price(state.children * t.childPrice) + "</span></div>";
    }
    els.sumRows.innerHTML = rows;

    let totalsHTML =
      '<div class="sum-row"><span>' + V.esc(V.t("tour.total")) + "</span><span>" + V.price(t.sub) + "</span></div>";
    if (t.disc > 0) {
      totalsHTML +=
        '<div class="sum-row sum-row--discount"><span>' + V.esc(V.t("book.discount")) + " (" +
        Math.round(state.discountRate * 100) + "%)</span><span>−" + V.price(t.disc) + "</span></div>";
    }
    els.sumTotals.innerHTML = totalsHTML;
    els.bookTotal.textContent = V.price(t.total);

    if (document.activeElement !== els.bookDate) els.bookDate.value = state.date;
    els.bookDate.min = V.tomorrowISO();

    const btn = function (key, dir) {
      return els.layout.querySelector('[data-bstep="' + key + '"][data-dir="' + dir + '"]');
    };
    const aMinus = btn("adults", "-1");
    const aPlus = btn("adults", "1");
    const cMinus = btn("children", "-1");
    const cPlus = btn("children", "1");
    if (aMinus) aMinus.disabled = state.adults <= 1;
    if (aPlus) aPlus.disabled = state.adults >= 20;
    if (cMinus) cMinus.disabled = state.children <= 0;
    if (cPlus) cPlus.disabled = state.children >= 10;
  }

  function syncStep() {
    document.querySelectorAll(".progress-step").forEach(function (el) {
      const n = Number(el.dataset.step);
      el.classList.toggle("is-active", n === state.step);
      el.classList.toggle("is-done", n < state.step);
    });
    document.querySelectorAll(".form-step").forEach(function (el) {
      el.classList.toggle("is-active", Number(el.dataset.formStep) === state.step);
    });
  }

  function goStep(n) {
    state.step = n;
    syncStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setFieldError(input, msgKey) {
    if (!input) return;
    const field = input.closest(".field");
    if (!field) return;
    field.classList.add("is-invalid");
    const err = field.querySelector(".field-error");
    if (err) err.textContent = V.t(msgKey);
  }

  function validateContact() {
    const name = byId("contactName");
    const email = byId("contactEmail");
    const phone = byId("contactPhone");
    let firstInvalid = null;

    document.querySelectorAll(".form-step[data-form-step='1'] .field").forEach(function (f) {
      f.classList.remove("is-invalid");
    });

    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, "book.errRequired");
      firstInvalid = firstInvalid || name;
    }

    const emailVal = email.value.trim();
    if (!emailVal) {
      setFieldError(email, "book.errRequired");
      firstInvalid = firstInvalid || email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)) {
      setFieldError(email, "book.errEmail");
      firstInvalid = firstInvalid || email;
    }

    const phoneVal = phone.value.trim();
    if (!phoneVal) {
      setFieldError(phone, "book.errRequired");
      firstInvalid = firstInvalid || phone;
    } else if (!/^\+?\d{8,15}$/.test(phoneVal.replace(/[\s().-]/g, ""))) {
      setFieldError(phone, "book.errPhone");
      firstInvalid = firstInvalid || phone;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    state.contact = {
      name: name.value.trim(),
      email: emailVal,
      phone: phoneVal,
      country: byId("contactCountry").value,
      requests: byId("contactRequests").value.trim()
    };
    return true;
  }

  function validatePayment() {
    let ok = true;
    let firstInvalid = null;

    els.termsLine.classList.remove("is-invalid");
    els.termsError.classList.remove("is-visible");
    [els.cardNumber, els.cardName, els.cardExp, els.cardCvc].forEach(function (input) {
      const field = input.closest(".field");
      if (field) field.classList.remove("is-invalid");
    });

    if (!els.termsBox.checked) {
      ok = false;
      els.termsLine.classList.add("is-invalid");
      els.termsError.textContent = V.t("book.errTerms");
      els.termsError.classList.add("is-visible");
      firstInvalid = els.termsBox;
    }

    if (!state.date || state.date < V.tomorrowISO()) {
      ok = false;
      V.toast(V.t("book.errRequired"));
      if (!firstInvalid) firstInvalid = els.bookDate;
    }

    if (state.payment === "card") {
      const digits = els.cardNumber.value.replace(/\s/g, "");
      if (!/^\d{16}$/.test(digits)) {
        setFieldError(els.cardNumber, "book.errCard");
        ok = false;
        if (!firstInvalid) firstInvalid = els.cardNumber;
      }
      if (!els.cardName.value.trim()) {
        setFieldError(els.cardName, "book.errRequired");
        ok = false;
        if (!firstInvalid) firstInvalid = els.cardName;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(els.cardExp.value)) {
        setFieldError(els.cardExp, "book.errExp");
        ok = false;
        if (!firstInvalid) firstInvalid = els.cardExp;
      } else {
        const parts = els.cardExp.value.split("/");
        const mm = Number(parts[0]);
        const yy = 2000 + Number(parts[1]);
        const now = new Date();
        if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) {
          setFieldError(els.cardExp, "book.errExp");
          ok = false;
          if (!firstInvalid) firstInvalid = els.cardExp;
        }
      }
      if (!/^\d{3,4}$/.test(els.cardCvc.value)) {
        setFieldError(els.cardCvc, "book.errCvc");
        ok = false;
        if (!firstInvalid) firstInvalid = els.cardCvc;
      }
    }

    if (!ok && firstInvalid) {
      try { firstInvalid.focus({ preventScroll: true }); } catch (e) { firstInvalid.focus(); }
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  let submitting = false;

  async function completeBooking() {
    if (submitting) return;
    submitting = true;
    const buttons = els.form.querySelectorAll('button[type="submit"]');
    buttons.forEach(function (b) { b.disabled = true; });

    try {
      const api = window.V4T_API;
      const payload = {
        tourId: state.tour.id,
        date: state.date,
        adults: state.adults,
        children: state.children,
        payment: state.payment,
        promo: state.discountRate ? "VIETNAM10" : "",
        contact: state.contact
      };
      let data;
      if (api && api.enabled) {
        data = await api.createBooking(payload);
      } else {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        data = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(data.error || "");
      }
      state.success = {
        code: data.code,
        total: data.total,
        date: state.date,
        adults: state.adults,
        children: state.children
      };
      state.step = 3;
      els.layout.hidden = true;
      els.successWrap.hidden = false;
      syncStep();
      renderSuccess();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      V.toast(err && err.message ? err.message : V.t("book.errServer"));
    } finally {
      submitting = false;
      buttons.forEach(function (b) { b.disabled = false; });
    }
  }

  function renderSuccess() {
    const tour = state.tour;
    const s = state.success;
    if (!tour || !s) return;
    const lang = V.state.lang;
    const guests = state.adults + " " + V.t(state.adults === 1 ? "common.adult" : "common.adults") +
      (state.children ? " · " + state.children + " " + V.t(state.children === 1 ? "common.child" : "common.children") : "");
    const subText = V.fill(V.t("book.successSub"), {
      name: state.contact.name || V.t("book.fullName"),
      email: state.contact.email
    });

    els.successCard.innerHTML =
      '<div class="success-icon">' + V.icon("check", 34) + "</div>" +
      "<h1>" + V.esc(V.t("book.successTitle")) + "</h1>" +
      "<p>" + V.esc(subText) + "</p>" +
      '<button class="code-chip" type="button" data-copy-code title="' + V.esc(V.t("toast.copy")) + '">' +
        "<span>" + V.esc(V.t("book.bookingCode")) + "</span>" +
        "<strong>" + V.esc(s.code) + "</strong>" +
        V.icon("tag", 14) +
      "</button>" +
      '<div class="success-grid">' +
        "<div><small>" + V.esc(V.t("common.tours")) + "</small><strong>" + V.esc(tour.title[lang]) + "</strong></div>" +
        "<div><small>" + V.esc(V.t("book.date")) + "</small><strong>" + V.esc(V.fmtDate(s.date)) + "</strong></div>" +
        "<div><small>" + V.esc(V.t("book.guests")) + "</small><strong>" + V.esc(guests) + "</strong></div>" +
        "<div><small>" + V.esc(V.t("book.total")) + "</small><strong>" + V.price(s.total) + "</strong></div>" +
      "</div>" +
      '<p class="success-note">' + V.esc(V.t("book.successNote")) + "</p>" +
      '<div class="success-actions">' +
        '<button class="btn btn--ghost" type="button" data-print>' + V.icon("printer", 16) + V.esc(V.t("book.print")) + "</button>" +
        '<a class="btn btn--ghost" href="tours.html">' + V.esc(V.t("book.browse")) + "</a>" +
        '<a class="btn btn--primary" href="index.html">' + V.esc(V.t("book.home")) + V.icon("arrow", 16) + "</a>" +
      "</div>" +
      '<p class="demo-tag">' + V.esc(V.t("book.demoNote")) + "</p>";
  }

  function applyPromo() {
    const code = (els.promoInput.value || "").trim().toUpperCase();
    if (code === "VIETNAM10") {
      state.discountRate = 0.1;
      V.toast(V.t("toast.promoOk"));
    } else {
      state.discountRate = 0;
      V.toast(V.t("toast.promoErr"));
    }
    renderSummary();
  }

  function copyCode() {
    if (!state.success) return;
    const code = state.success.code;
    const done = function () { V.toast(V.t("toast.copy")); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(done).catch(function () { fallbackCopy(code); done(); });
    } else {
      fallbackCopy(code);
      done();
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove();
  }

  function bind() {
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.step === 1) {
        if (validateContact()) goStep(2);
      } else if (state.step === 2) {
        if (validatePayment()) completeBooking();
      }
    });

    els.form.addEventListener("input", function (e) {
      const field = e.target.closest(".field");
      if (field) field.classList.remove("is-invalid");
    });

    els.termsBox.addEventListener("change", function () {
      if (els.termsBox.checked) {
        els.termsLine.classList.remove("is-invalid");
        els.termsError.classList.remove("is-visible");
      }
    });

    if (els.backBtn) els.backBtn.addEventListener("click", function () { goStep(1); });

    document.querySelectorAll('input[name="payment"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        state.payment = radio.value;
        els.cardFields.classList.toggle("is-visible", radio.value === "card");
      });
    });

    if (els.promoBtn) els.promoBtn.addEventListener("click", applyPromo);
    if (els.promoInput) {
      els.promoInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          applyPromo();
        }
      });
    }

    if (els.cardNumber) {
      els.cardNumber.addEventListener("input", function () {
        const digits = this.value.replace(/\D/g, "").slice(0, 16);
        this.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      });
    }
    if (els.cardExp) {
      els.cardExp.addEventListener("input", function () {
        const digits = this.value.replace(/\D/g, "").slice(0, 4);
        this.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
      });
    }
    if (els.cardCvc) {
      els.cardCvc.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 4);
      });
    }

    if (els.bookDate) {
      els.bookDate.addEventListener("change", function () {
        state.date = els.bookDate.value;
      });
    }

    els.layout.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-bstep]");
      if (!btn) return;
      const key = btn.dataset.bstep;
      const dir = Number(btn.dataset.dir);
      if (key === "adults") state.adults = Math.min(20, Math.max(1, state.adults + dir));
      else state.children = Math.min(10, Math.max(0, state.children + dir));
      renderSummary();
    });

    if (els.successCard) {
      els.successCard.addEventListener("click", function (e) {
        if (e.target.closest("[data-copy-code]")) copyCode();
        else if (e.target.closest("[data-print]")) window.print();
      });
    }

    window.addEventListener("vv:lang", function () {
      if (!state.tour) return;
      renderSummary();
      if (state.step === 3) {
        renderSuccess();
      } else if (els.termsError.classList.contains("is-visible")) {
        els.termsError.textContent = V.t("book.errTerms");
      }
    });
  }

  function init() {
    cache();
    state.tour = V.tourOf(V.param("id"));

    const pd = V.param("date");
    state.date = (/^\d{4}-\d{2}-\d{2}$/.test(pd || "") && pd >= V.tomorrowISO()) ? pd : V.tomorrowISO();

    const pa = parseInt(V.param("adults") || "", 10);
    const pc = parseInt(V.param("children") || "", 10);
    if (!isNaN(pa)) state.adults = Math.min(20, Math.max(1, pa));
    if (!isNaN(pc)) state.children = Math.min(10, Math.max(0, pc));

    if (!state.tour) {
      els.empty.hidden = false;
      els.progress.hidden = true;
      return;
    }

    els.layout.hidden = false;
    els.bookDate.min = V.tomorrowISO();
    els.bookDate.value = state.date;

    bind();
    renderSummary();
    syncStep();
    V.hydrateIcons();
  }

  V.whenReady(init);
})();
