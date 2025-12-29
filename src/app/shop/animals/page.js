"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, apiBase } from "../../lib/api";

function getClientId() {
  try {
    let cid = localStorage.getItem('okpups_cid');
    if (!cid) {
      cid = `cid_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('okpups_cid', cid);
    }
    return cid;
  } catch (e) {
    return null;
  }
}

function hasLocalLiked(id) {
  try {
    const raw = localStorage.getItem('okpups_likes');
    const arr = raw ? JSON.parse(raw) : [];
    return arr.includes(id);
  } catch (e) { return false; }
}

function setLocalLiked(id) {
  try {
    const raw = localStorage.getItem('okpups_likes');
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem('okpups_likes', JSON.stringify(arr));
    }
  } catch (e) {}
}

function AnimalCard({ a }) {
  const validImages = (a.images || []).filter(Boolean);
  const img = validImages.find((u) => (u || "").includes("cloudinary")) || validImages[0] || null;
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(() => hasLocalLiked(a._id));

  useEffect(() => {
    let mounted = true;
    api.get(`/animals/${a._id}/stats`).then((d) => {
      if (!mounted) return;
      setLikes(d.stats?.likesCount || 0);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [a._id]);

  async function handleLike() {
    if (liked) return;
    const cid = getClientId();
    try {
      const res = await fetch(`${apiBase()}/animals/${a._id}/like`, {
        method: 'POST',
        headers: { 'x-client-id': cid },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.created) {
        setLiked(true);
        setLocalLiked(a._id);
        setLikes(data.stats?.likesCount ?? (likes + 1));
      } else if (data.alreadyLiked) {
        setLiked(true);
        setLocalLiked(a._id);
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="border rounded p-3">
      {img ? (
        <div className="h-40 mb-3 overflow-hidden rounded bg-gray-100">
          <img
            src={img}
            alt={a.name || a.nameOrTag}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No image</div>
      )}
      <h4 className="font-semibold">{a.name || a.nameOrTag}</h4>
      <div className="text-sm text-gray-600">{a.species} {a.breed ? `• ${a.breed}` : ""}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold">${a.price}</div>
        <div className="flex items-center gap-2">
          <button onClick={handleLike} className={`rounded px-2 py-1 text-sm ${liked ? 'bg-red-500 text-white' : 'border'}`}>
            ❤️ {likes}
          </button>
          <Link href={`/animals/${a._id}`} className="text-blue-600 text-sm">View</Link>
        </div>
      </div>
    </div>
  );
}

export default function ShopAnimalsPage() {
  const [categories, setCategories] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadCategories(); loadAnimals(); }, []);

  async function loadCategories() {
    try {
      const d = await api.get("/categories");
      setCategories((d.categories || []).filter((c) => c.type === 'animal'));
    } catch (e) {
      // ignore
    }
  }

  async function loadAnimals(opts = {}) {
    setLoading(true);
    setError(null);
    try {
      const q = opts.categoryId || categoryId;
      const path = q ? `/animals?categoryId=${q}` : "/animals";
      const d = await api.get(path);
      setAnimals(d.animals || []);
    } catch (e) {
      setError(e.message || "Failed to load animals");
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(e) {
    setCategoryId(e.target.value);
    loadAnimals({ categoryId: e.target.value });
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shop Animals</h1>
      <div className="mb-4 flex items-center gap-3">
        <select value={categoryId} onChange={handleCategoryChange} className="rounded border p-2">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <button className="rounded border px-3 py-1" onClick={() => loadAnimals()}>Refresh</button>
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        {animals.map((a) => <AnimalCard key={a._id} a={a} />)}
      </div>

      <div className="mt-6">
        <Link href="/shop" className="text-blue-600">Back to Shop</Link>
      </div>
    </main>
  );
}
