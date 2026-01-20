"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "./lib/api";

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // navigate immediately and prefetch search results in background
    const q = query.trim();
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    api.get(`/animals?q=${encodeURIComponent(q)}`).catch(() => null);
    api.get(`/products?q=${encodeURIComponent(q)}`).catch(() => null);
  };

  // Suggestions: debounced fetch
  useEffect(() => {
    const q = (query || "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) {
      setSuggestions([]); setShowSuggestions(false); setSLoading(false); setHighlight(-1);
      return;
    }
    setSLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          api.get(`/animals?q=${encodeURIComponent(q)}`).catch(() => ({ animals: [] })),
          api.get(`/products?q=${encodeURIComponent(q)}`).catch(() => ({ products: [] })),
        ]);
        const animals = (aRes && aRes.animals) || [];
        const products = (pRes && pRes.products) || [];
        const mapped = [
          ...animals.slice(0, 4).map((a) => ({ id: a._id, label: a.name, sub: a.breed || a.species || '', type: 'animal' })),
          ...products.slice(0, 6).map((p) => ({ id: p._id, label: p.name, sub: p.brand || (p.purpose || []).join(', '), type: 'product' })),
        ].slice(0, 6);
        setSuggestions(mapped);
        setShowSuggestions(mapped.length > 0);
        setHighlight(-1);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSLoading(false);
      }
    }, 260);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // keyboard navigation
  const onKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && suggestions[highlight]) {
        e.preventDefault(); selectSuggestion(suggestions[highlight]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false); setHighlight(-1);
    }
  };

  const selectSuggestion = (s) => {
    setQuery(s.label);
    setShowSuggestions(false);
    // navigate to specific item page when possible
    if (s.type === 'animal') router.push(`/animals/${s.id}`);
    else router.push(`/products/${s.id}`);
  };

  const quickLinks = [
    { label: "Dog Food", type: "products", category: "dog-food" },
    { label: "Cat Food", type: "products", category: "cat-food" },
    { label: "Livestock Feed", type: "products", category: "livestock-feed" },
    { label: "Puppies", type: "animals", species: "dog" },
    { label: "Kittens", type: "animals", species: "cat" }
  ];

  const handleQuickLink = (link) => {
    const qs = new URLSearchParams();
    if (link.category) qs.set('category', link.category);
    // backend/shop pages expect `category` as the query key for species/category filtering
    if (link.species) qs.set('category', link.species);
    const params = qs.toString();
    const pushPath = `/shop/${link.type}${params ? `?${params}` : ''}`;
    router.push(pushPath);
    // warm cache
    const url = `/${link.type === 'products' ? 'products' : 'animals'}${params ? `?${params}` : ''}`;
    api.get(url).catch(() => null);
  };

  return (
    <section className="relative bg-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Find the Perfect Pet or Product
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl mb-8 text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Vet-approved pets, premium food, and accessories – all in one place.
        </motion.p>

        <motion.form
          className="max-w-xl mx-auto relative"
          onSubmit={handleSearch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              onKeyDown={onKeyDown}
              type="text"
              placeholder="Search for an item, puppies, cats, dogs or dog food…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
              className="flex-1 rounded-l-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-r-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <ul className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded border bg-white shadow-md">
              {sLoading && <li className="p-2 text-sm text-gray-500">Loading…</li>}
              {!sLoading && suggestions.map((s, idx) => (
                <li
                  key={`${s.type}-${s.id}`}
                  onClick={() => selectSuggestion(s)}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`cursor-pointer px-4 py-2 flex items-center justify-between text-sm ${highlight===idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-800">{s.label}</div>
                    {s.sub && <div className="text-xs text-gray-500">{s.sub}</div>}
                  </div>
                  <div className="ml-4 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{s.type === 'animal' ? 'Animal' : 'Product'}</div>
                </li>
              ))}
              {!sLoading && suggestions.length === 0 && (
                <li className="p-2 text-sm text-gray-500">No suggestions</li>
              )}
            </ul>
          )}
        </motion.form>

        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleQuickLink(link)}
              className="px-5 py-3 bg-white rounded shadow hover:bg-blue-50 transition font-medium text-gray-800"
            >
              {link.label}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
