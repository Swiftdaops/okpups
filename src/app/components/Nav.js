"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function Nav() {
  return (
    <header className="w-full border-b bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dzifobwnx/image/upload/v1766686429/ChatGPT_Image_Dec_25__2025__06_32_34_PM-removebg-preview_xeevlc.png" alt="OKPUPS" width={80} height={80} className="object-contain" />
            <span className="sr-only">OKPUPS</span>
          </Link>
          <span className="text-sm text-gray-500">Pet store</span>
        </div>

        <nav className="flex items-center gap-4">
          <SearchForm />
        </nav>
      </div>
    </header>
  );
}

function SearchForm() {
  const [q, setQ] = useState('');
  const router = useRouter();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  function navigateToSearch() {
    const trimmed = String(q || '').trim();
    const path = trimmed ? `/shop/products?q=${encodeURIComponent(trimmed)}` : '/shop/products';
    router.push(path);
  }

  async function doSearch(term) {
    const t = String(term || '').trim();
    if (!t) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
      try {
      const [pRes, aRes] = await Promise.all([
        api.get(`/products?q=${encodeURIComponent(t)}`),
        api.get(`/animals?q=${encodeURIComponent(t)}`)
      ]);
      function pickImage(arr) {
        if (!arr || !arr.length) return null;
        // prefer cloudinary-hosted images if available
        const cloud = arr.find((u) => typeof u === 'string' && u.includes('cloudinary'));
        if (cloud) return cloud;
        // prefer absolute https urls
        const https = arr.find((u) => typeof u === 'string' && u.startsWith('https://'));
        if (https) return https;
        // fallback to first
        return String(arr[0]);
      }

      const products = (pRes.products || []).slice(0, 4).map((p) => ({
        type: 'product',
        id: p._id,
        name: p.name,
        extra: p.brand,
        price: p.price,
        image: pickImage(p.images)
      }));
      const animals = (aRes.animals || []).slice(0, 4).map((a) => ({
        type: 'animal',
        id: a._id,
        name: a.name,
        extra: a.breed,
        price: a.price,
        image: pickImage(a.images)
      }));
      setResults([...products, ...animals].slice(0, 6));
    } catch (e) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigateToSearch();
  }

  function handleChange(v) {
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(v), 350);
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          aria-label="Search"
          placeholder="Search products or animals"
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          className="rounded border p-2 text-sm w-64"
        />
        <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">Search</button>
      </form>

      { (results.length || loading || error) && (
        <div className="absolute left-0 mt-2 w-80 bg-white border rounded shadow z-50">
          {loading && <div className="p-2 text-sm text-gray-500">Searching...</div>}
          {error && <div className="p-2 text-sm text-red-500">{error}</div>}
          {results.map((r) => (
            <a key={`${r.type}-${r.id}`} href={r.type === 'product' ? `/products/${r.id}` : `/animals/${r.id}`} className="block p-2 text-sm hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">img</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.type} • {r.extra}</div>
                </div>
                {r.price && <div className="text-sm font-medium">₦{r.price}</div>}
              </div>
            </a>
          ))}
          {!loading && !results.length && !error && <div className="p-2 text-sm text-gray-500">No results</div>}
        </div>
      )}
    </div>
  );
}
