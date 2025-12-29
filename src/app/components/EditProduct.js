"use client";

import { useEffect, useState } from "react";
import { api, apiForm } from "../lib/api";

export default function EditProduct({ product, onUpdated, onDeleted, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => ({
    categoryId: product.categoryId || "",
    name: product.name || "",
    brand: product.brand || "",
    price: product.price || 0,
    stock: product.stock || 0,
    availabilityStatus: product.availabilityStatus || 'in_stock',
    speciesSuitability: product.speciesSuitability || [],
    ageSuitability: product.ageSuitability || (product.ageSuitability ? product.ageSuitability : ['all']),
    purpose: product.purpose || ['nutrition'],
    feedingInstructions: product.feedingInstructions || '',
    nutritionHighlights: product.nutritionHighlights || '',
    vetApproved: !!product.vetApproved,
    specs: product.specs || { weight: '', proteinPercent: '', fatPercent: '', fiberPercent: '', ingredients: '' },
    isActive: product.isActive,
  }));
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(() => (product.images || []).slice());
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((d) => setCategories((d.categories || []).filter((c) => c.type === 'product'))).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    return () => {
      // revoke any created object URLs
      (previewImages || []).forEach((u) => { try { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); } catch (e) {} });
    };
  }, [previewImages]);

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
      fd.append('categoryId', String(form.categoryId));
      fd.append('name', String(form.name));
      fd.append('brand', String(form.brand || ''));
      fd.append('price', String(form.price));
      fd.append('stock', String(form.stock));
      fd.append('availabilityStatus', String(form.availabilityStatus || 'in_stock'));
      fd.append('feedingInstructions', String(form.feedingInstructions || ''));
      fd.append('nutritionHighlights', String(form.nutritionHighlights || ''));
      fd.append('vetApproved', String(Boolean(form.vetApproved)));
      fd.append('isActive', String(Boolean(form.isActive)));

      (form.speciesSuitability || []).forEach((v) => fd.append('speciesSuitability', v));
      (form.ageSuitability || []).forEach((v) => fd.append('ageSuitability', v));
      (form.purpose || []).forEach((v) => fd.append('purpose', v));

      if (form.specs) fd.append('specs', JSON.stringify(form.specs));

      images.forEach((file) => fd.append('images', file));
      const data = await apiForm(`/products/admin/${product._id}`, fd, "PATCH");
      onUpdated?.(data.product);
    } catch (e) {
      setError(e.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    try {
      await api.del(`/products/admin/${product._id}`);
      onDeleted?.(product._id);
    } catch (e) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-semibold">Edit Product</h3>
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
          <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Active
        </label>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.vetApproved} onChange={(e) => update('vetApproved', e.target.checked)} /> Vet Approved
        </label>
        <div />
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
        <div>
          <div className="text-sm font-medium">Images</div>
          {previewImages && previewImages.length > 0 && (
            <div className="mt-2">
              <div className="mb-2">
                <img src={previewImages[0]} alt="primary" className="h-40 w-40 rounded object-cover" />
              </div>
              <div className="flex gap-2">
                {previewImages.map((u, i) => (
                  <div key={i} className="h-16 w-16 overflow-hidden rounded bg-gray-100">
                    <img src={u} alt={`img-${i}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <label className="flex flex-col gap-1 text-sm mt-3">
            <span>Add Images</span>
            <input type="file" multiple accept="image/*" onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages(files);
              // append previews for new files
              const fileUrls = files.map((f) => URL.createObjectURL(f));
              setPreviewImages((prev) => [...(prev || []), ...fileUrls]);
            }} />
          </label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={submit} className="rounded bg-black px-4 py-2 text-white">{busy ? "Saving..." : "Update"}</button>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>Cancel</button>
        <button type="button" className="rounded bg-red-600 px-4 py-2 text-white" onClick={remove}>Delete</button>
      </div>
    </div>
  );
}
