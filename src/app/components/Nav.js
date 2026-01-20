"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/formatCurrency";
import { useCartPersistence, useCartStore } from "../lib/useCart";
import CartDrawer from "./CartDrawer";

export default function Nav() {
  useCartPersistence();
  const cartCount = useCartStore((s) => (s.items || []).reduce((n, it) => n + Number(it.qty || 0), 0));
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dzifobwnx/image/upload/v1766686429/ChatGPT_Image_Dec_25__2025__06_32_34_PM-removebg-preview_xeevlc.png"
              alt="OKPUPS"
              width={80}
              height={80}
              className="h-9 w-9 object-contain sm:h-11 sm:w-11 md:h-14 md:w-14"
            />
            <span className="sr-only">OKPUPS</span>
          </Link>
          <span className="hidden text-sm text-gray-500 sm:inline">Pet store</span>
        </div>

        <nav className="flex items-center gap-3">
          <SearchForm />

          <button
            type="button"
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-9 items-center justify-center rounded border bg-white px-3 text-sm"
          >
            Cart
            {cartCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function SearchForm() {
  const [q, setQ] = useState('');
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      // focus after animation starts
      const id = setTimeout(() => inputRef.current?.focus?.(), 50);
      return () => clearTimeout(id);
    }
  }, [mobileOpen]);

  function navigateToSearch() {
    const trimmed = String(q || '').trim();
    const path = trimmed ? `/shop/products?q=${encodeURIComponent(trimmed)}` : '/shop/products';
    router.push(path);
    setMobileOpen(false);
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
      {/* Desktop search */}
      <form onSubmit={handleSubmit} className="hidden items-center gap-2 sm:flex">
        <input
          aria-label="Search"
          placeholder="Search products or animals"
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          className="w-64 rounded border p-2 text-sm"
        />
        <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
          Search
        </button>
      </form>

      {/* Mobile search (icon → expanding input) */}
      <div className="flex items-center sm:hidden">
        <AnimatePresence initial={false} mode="wait">
          {!mobileOpen ? (
            <motion.button
              key="open"
              type="button"
              aria-label="Open search"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded border bg-white"
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </motion.button>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
              initial={{ opacity: 0, scaleX: 0.85 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }}
              style={{ transformOrigin: "right" }}
            >
              <input
                ref={inputRef}
                aria-label="Search"
                placeholder="Search..."
                value={q}
                onChange={(e) => handleChange(e.target.value)}
                className="w-[68vw] max-w-90 rounded border p-2 text-sm"
              />
              <button type="submit" aria-label="Search" className="rounded bg-black px-3 py-2 text-sm text-white">
                Go
              </button>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setMobileOpen(false)}
                className="rounded border bg-white px-3 py-2 text-sm"
              >
                ×
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {(results.length || loading || error) && (
        <div className="absolute left-0 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded border bg-white shadow z-50 sm:w-80">
          {loading && <div className="p-2 text-sm text-gray-500">Searching...</div>}
          {error && <div className="p-2 text-sm text-red-500">{error}</div>}
          {results.map((r) => (
            <a key={`${r.type}-${r.id}`} href={r.type === 'product' ? `/products/${r.id}` : `/animals/${r.id}`} className="block p-2 text-sm hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
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
                {r.price && <div className="text-sm font-medium">{formatCurrency(r.price)}</div>}
              </div>
            </a>
          ))}
          {!loading && !results.length && !error && <div className="p-2 text-sm text-gray-500">No results</div>}
        </div>
      )}
    </div>
  );
}
