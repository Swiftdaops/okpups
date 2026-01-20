"use client";

import { useEffect, useState } from "react";
import { api, apiForm } from "../lib/api";

export default function EditAnimal({ animal, onUpdated, onDeleted, onCancel }) {
  const [categories, setCategories] = useState([]);
  const initialCategoryId =
    animal && typeof animal.categoryId === 'object' && animal.categoryId && animal.categoryId._id
      ? String(animal.categoryId._id)
      : String(animal?.categoryId || '');
  const initialPurpose = Array.isArray(animal?.purpose)
    ? animal.purpose
    : typeof animal?.purpose === 'string'
      ? animal.purpose.split(',').map((s) => s.trim()).filter(Boolean)
      : ['companion'];
  const initialTemperament = Array.isArray(animal?.temperament)
    ? animal.temperament.join(',')
    : String(animal?.temperament || '');
  const [form, setForm] = useState(() => ({
    categoryId: initialCategoryId,
    name: animal.name || animal.nameOrTag || "",
    species: animal.species || "",
    breed: animal.breed || "",
    ageWeeks: animal.ageWeeks || 0,
    sex: animal.sex || "unknown",
    price: animal.price || 0,
    quantityAvailable: animal.quantityAvailable || 1,
    purpose: initialPurpose,
    temperament: initialTemperament,
    experienceLevel: animal.experienceLevel || 'beginner',
    livingSpace: animal.livingSpace || 'apartment',
    expectedAdultSize: animal.expectedAdultSize || 'medium',
    availabilityStatus: animal.availabilityStatus || 'available',
    location: animal.location || '',
    isActive: typeof animal.isActive === 'boolean' ? animal.isActive : true,
  }));
  const [images, setImages] = useState([]); // [{ file, url }]
  const [previewImages, setPreviewImages] = useState(() => (animal.images || []).map((url) => ({ url, kind: 'existing' })));
  const [removedExisting, setRemovedExisting] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    return () => {
      (previewImages || []).forEach((it) => {
        try {
          if (it?.kind === 'new' && it?.url && it.url.startsWith('blob:')) URL.revokeObjectURL(it.url);
        } catch (e) {}
      });
    };
  }, [previewImages]);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      const arrayFieldName = (k) => (k === "purpose" || k === "temperament" || k === "vaccinations" ? `${k}[]` : k);
      // ensure temperament string -> array
      const payload = { ...form };
      if (payload && typeof payload.categoryId === 'object' && payload.categoryId && payload.categoryId._id) {
        payload.categoryId = String(payload.categoryId._id);
      }
      if (typeof payload.purpose === 'string') {
        payload.purpose = payload.purpose
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof payload.temperament === 'string') {
        payload.temperament = payload.temperament
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      for (const [k, v] of Object.entries(payload)) {
        if (v === null || typeof v === 'undefined') continue;
        if (Array.isArray(v)) {
          if (!v.length) continue;
          v.forEach((it) => fd.append(arrayFieldName(k), String(it)));
          continue;
        }
        if (typeof v === 'string') {
          const s = v.trim();
          if (!s) continue;
          fd.append(k, s);
          continue;
        }
        if (typeof v === 'number' || typeof v === 'boolean') {
          fd.append(k, String(v));
          continue;
        }
        // objects (nested) -> JSON
        fd.append(k, JSON.stringify(v));
      }
      (images || []).forEach((it) => fd.append("images", it.file));
      // include any existing images the user removed
      (removedExisting || []).forEach((url) => fd.append('removeImages[]', url));
      const data = await apiForm(`/animals/admin/${animal._id}`, fd, "PATCH");
      onUpdated?.(data.animal);
    } catch (e) {
      const details =
        e?.data?.issues && Array.isArray(e.data.issues) && e.data.issues.length
          ? `${e.data.issues[0].path?.join('.') || 'field'}: ${e.data.issues[0].message}`
          : null;
      setError(details || e.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this animal?")) return;
    try {
      await api.del(`/animals/admin/${animal._id}`);
      onDeleted?.(animal._id);
    } catch (e) {
      setError(e.message || "Failed to delete");
    }
  }

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-semibold">Edit Animal</h3>
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Active
        </label>
      </div>

      <div className="mt-2">
        <div className="text-sm font-medium">Images</div>
        {previewImages && previewImages.length > 0 && (
          <div className="mt-2">
            <div className="mb-2">
              <img src={previewImages[0].url} alt="primary" className="h-40 w-40 rounded object-cover" />
            </div>
            <div className="flex gap-2">
              {previewImages.map((it, i) => (
                <div key={it.url || i} className="relative h-16 w-16 overflow-hidden rounded bg-gray-100">
                  <img src={it.url} alt={`img-${i}`} className="h-full w-full object-cover" />
                  {it.kind === 'new' && (
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute right-1 top-1 z-20 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white text-sm shadow-lg hover:bg-red-700"
                      onClick={() => {
                        setPreviewImages((cur) => (cur || []).filter((x) => x.url !== it.url));
                        setImages((cur) => (cur || []).filter((x) => x.url !== it.url));
                        try {
                          if (it?.url && it.url.startsWith('blob:')) URL.revokeObjectURL(it.url);
                        } catch (e) {}
                      }}
                    >
                      ×
                    </button>
                  )}
                  {it.kind === 'existing' && (
                    <button
                      type="button"
                      aria-label="Remove existing image"
                      className="absolute left-1 top-1 z-20 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white text-sm shadow-lg hover:bg-red-700"
                      onClick={() => {
                        // mark existing image for removal
                        setPreviewImages((cur) => (cur || []).filter((x) => x.url !== it.url));
                        setRemovedExisting((cur) => [...(cur || []), it.url]);
                      }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="flex flex-col gap-1 text-sm mt-3">
          <span>Add Images</span>
          <input type="file" multiple accept="image/*" onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
            setImages(next);
            setPreviewImages((prev) => [...(prev || []), ...next.map((x) => ({ url: x.url, kind: 'new' }))]);
          }} />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={submit} className="rounded bg-black px-4 py-2 text-white">{busy ? "Saving..." : "Update"}</button>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>Cancel</button>
        <button type="button" className="rounded bg-red-600 px-4 py-2 text-white" onClick={remove}>Delete</button>
      </div>
    </div>
  );
}
