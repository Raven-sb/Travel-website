import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { db, rootDir } from "./db.js";

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(resolve(rootDir, "js", "data.js"), "utf8"), sandbox, { filename: "data.js" });
export const DATA = sandbox.window.VV_DATA;

export const BASE_TOURS = DATA.tours;

export function overridesMap() {
  const rows = db.prepare("SELECT tour_id, price, active, featured FROM tour_overrides").all();
  const out = {};
  for (const row of rows) {
    const o = {};
    if (row.price != null) o.price = row.price;
    if (row.active != null) o.active = row.active === 1;
    if (row.featured != null) o.featured = row.featured === 1;
    if (Object.keys(o).length) out[row.tour_id] = o;
  }
  return out;
}

export function toursWithOverrides() {
  const ov = overridesMap();
  return BASE_TOURS.map((t) => {
    const o = ov[t.id] || {};
    return {
      id: t.id,
      dest: t.dest,
      duration: t.duration,
      type: t.type,
      title: t.title,
      img: t.img,
      basePrice: t.price,
      price: typeof o.price === "number" ? o.price : t.price,
      active: o.active !== false,
      featured: o.featured === true
    };
  });
}

export function tourById(id) {
  return toursWithOverrides().find((t) => t.id === id);
}

export function publicOverridesScript() {
  return "window.VV_TOUR_OVERRIDES = " + JSON.stringify(overridesMap()) + ";\n";
}
