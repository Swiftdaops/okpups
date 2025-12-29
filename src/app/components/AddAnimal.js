"use client";

import { useEffect, useState } from "react";
import { api, apiForm } from "../lib/api";

export default function AddAnimal({ onCreated, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    species: "",
    breed: "",
    ageWeeks: 0,
    sex: "unknown",
    price: 0,
    quantityAvailable: 1,
    purpose: ["companion"],
    temperament: "",
    experienceLevel: "beginner",
    livingSpace: "apartment",
    expectedAdultSize: "medium",
    availabilityStatus: "available",
    location: ""
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      // append arrays and comma-separated fields properly
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((it) => fd.append(k, it));
        else fd.append(k, String(v ?? ''));
      });
      images.forEach((file) => fd.append("images", file));
      const data = await apiForm("/animals/admin", fd, "POST");
      onCreated?.(data.animal);
    } catch (e) {
      setError(e.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-semibold">Add Animal</h3>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Category</span>
          <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="rounded border p-2">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input className="rounded border p-2" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Species</span>
          <input className="rounded border p-2" value={form.species} onChange={(e) => update("species", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Breed</span>
          <input className="rounded border p-2" value={form.breed} onChange={(e) => update("breed", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Age (weeks)</span>
          <input type="number" className="rounded border p-2" value={form.ageWeeks} onChange={(e) => update("ageWeeks", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Sex</span>
          <select className="rounded border p-2" value={form.sex} onChange={(e) => update("sex", e.target.value)}>
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Price</span>
          <input type="number" step="0.01" className="rounded border p-2" value={form.price} onChange={(e) => update("price", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Quantity</span>
          <input type="number" className="rounded border p-2" value={form.quantityAvailable} onChange={(e) => update("quantityAvailable", e.target.value)} />
        </label>

        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="text-sm">Purpose</legend>
          <div className="flex gap-3 flex-wrap">
            {['companion', 'security', 'breeding', 'farming'].map((p) => (
              <label key={p} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(form.purpose) ? form.purpose.includes(p) : false}
                  onChange={() => {
                    setForm((f) => {
                      const cur = Array.isArray(f.purpose) ? [...f.purpose] : [];
                      const idx = cur.indexOf(p);
                      if (idx === -1) cur.push(p); else cur.splice(idx, 1);
                      return { ...f, purpose: cur };
                    });
                  }}
                  className="h-4 w-4"
                />
                <span className="capitalize">{p}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span>Temperament (comma separated)</span>
          <input className="rounded border p-2" value={form.temperament} onChange={(e) => update("temperament", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Experience Level</span>
          <select className="rounded border p-2" value={form.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Living Space</span>
          <select className="rounded border p-2" value={form.livingSpace} onChange={(e) => update("livingSpace", e.target.value)}>
            <option value="apartment">Apartment</option>
            <option value="compound">Compound</option>
            <option value="farm">Farm</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Expected Adult Size</span>
          <select className="rounded border p-2" value={form.expectedAdultSize} onChange={(e) => update("expectedAdultSize", e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Availability</span>
          <select className="rounded border p-2" value={form.availabilityStatus} onChange={(e) => update("availabilityStatus", e.target.value)}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Location</span>
          <input className="rounded border p-2" value={form.location} onChange={(e) => update("location", e.target.value)} />
        </label>
      </div>

      <div className="mt-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Images (max 6)</span>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={submit} className="rounded bg-black px-4 py-2 text-white">{busy ? "Saving..." : "Create"}</button>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
