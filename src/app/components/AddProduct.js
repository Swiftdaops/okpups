"use client";

import { useEffect, useState } from "react";
import { api, apiForm } from "../lib/api";

export default function AddProduct({ onCreated, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    brand: "",
    price: 0,
    stock: 0,
    availabilityStatus: 'in_stock',
    speciesSuitability: [],
    ageSuitability: ['all'],
    purpose: ['nutrition'],
    feedingInstructions: '',
    nutritionHighlights: '',
    vetApproved: false,
    specs: { weight: '', proteinPercent: '', fatPercent: '', fiberPercent: '', ingredients: '' }
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((d) => setCategories((d.categories || []).filter((c) => c.type === 'product'))).catch(() => setCategories([]));
  }, []);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function toggleArray(field, value) {
    setForm((f) => {
      const arr = Array.isArray(f[field]) ? f[field].slice() : [];
      const idx = arr.indexOf(value);
      if (idx === -1) arr.push(value); else arr.splice(idx, 1);
      return { ...f, [field]: arr };
    });
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      // append simple fields
      fd.append('categoryId', String(form.categoryId));
      fd.append('name', String(form.name));
      fd.append('brand', String(form.brand || ''));
      fd.append('price', String(form.price));
      fd.append('stock', String(form.stock));
      fd.append('availabilityStatus', String(form.availabilityStatus || 'in_stock'));
      fd.append('feedingInstructions', String(form.feedingInstructions || ''));
      fd.append('nutritionHighlights', String(form.nutritionHighlights || ''));
      fd.append('vetApproved', String(Boolean(form.vetApproved)));

      // arrays as repeated fields
      (form.speciesSuitability || []).forEach((v) => fd.append('speciesSuitability', v));
      (form.ageSuitability || []).forEach((v) => fd.append('ageSuitability', v));
      (form.purpose || []).forEach((v) => fd.append('purpose', v));

      // specs as JSON string (backend accepts optional specs object)
      if (form.specs) {
        fd.append('specs', JSON.stringify(form.specs));
      }

      images.forEach((file) => fd.append("images", file));
      const data = await apiForm("/products/admin", fd, "POST");
      onCreated?.(data.product);
    } catch (e) {
      setError(e.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-semibold">Add Product</h3>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Category</span>
          <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="rounded border p-2">
            <option value="">Select category</option>
            {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input className="rounded border p-2" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Brand</span>
          <input className="rounded border p-2" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Price</span>
          <input type="number" step="0.01" className="rounded border p-2" value={form.price} onChange={(e) => update("price", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Stock</span>
          <input type="number" className="rounded border p-2" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.vetApproved} onChange={(e) => update('vetApproved', e.target.checked)} /> Vet Approved
        </label>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-sm font-medium">Species Suitability</div>
          <div className="flex gap-2 mt-1">
            {['dog','cat','poultry','livestock'].map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(form.speciesSuitability||[]).includes(s)} onChange={() => toggleArray('speciesSuitability', s)} /> {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Age Suitability</div>
          <div className="flex gap-2 mt-1">
            {['puppy','kitten','adult','all'].map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(form.ageSuitability||[]).includes(a)} onChange={() => toggleArray('ageSuitability', a)} /> {a}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-sm font-medium">Purpose</div>
        <div className="flex gap-2 mt-1">
          {['nutrition','health','grooming','farm_use','supplement'].map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(form.purpose||[]).includes(p)} onChange={() => toggleArray('purpose', p)} /> {p}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Feeding Instructions</span>
          <textarea className="rounded border p-2" value={form.feedingInstructions} onChange={(e) => update('feedingInstructions', e.target.value)} />
        </label>
      </div>
      <div className="mt-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Nutrition Highlights</span>
          <textarea className="rounded border p-2" value={form.nutritionHighlights} onChange={(e) => update('nutritionHighlights', e.target.value)} />
        </label>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Weight (e.g. 10kg)</span>
          <input className="rounded border p-2" value={form.specs.weight} onChange={(e) => update('specs', { ...form.specs, weight: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Protein %</span>
          <input className="rounded border p-2" value={form.specs.proteinPercent} onChange={(e) => update('specs', { ...form.specs, proteinPercent: e.target.value })} />
        </label>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Fat %</span>
          <input className="rounded border p-2" value={form.specs.fatPercent} onChange={(e) => update('specs', { ...form.specs, fatPercent: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Fiber %</span>
          <input className="rounded border p-2" value={form.specs.fiberPercent} onChange={(e) => update('specs', { ...form.specs, fiberPercent: e.target.value })} />
        </label>
      </div>
      <div className="mt-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Ingredients</span>
          <input className="rounded border p-2" value={form.specs.ingredients} onChange={(e) => update('specs', { ...form.specs, ingredients: e.target.value })} />
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
