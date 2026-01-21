"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ShopHero from "./ShopHero";
import { api } from "../lib/api";
import { useCartStore, useCartPersistence } from "../lib/useCart";
import { formatCurrency } from "../lib/formatCurrency";

// real data will be fetched from backend

// ----------------------------
// Badges
// ----------------------------
function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

// ----------------------------
// Animal Card
// ----------------------------
function AnimalCard({ a, onAdd }) {
  const router = useRouter();
  const lowQty = Number(a.quantityAvailable || 0) > 0 && Number(a.quantityAvailable || 0) <= 3;
  const validImages = (a.images || []).filter(Boolean);
  const imgSrc = validImages.find((u) => (u || '').includes('cloudinary')) || validImages[0] || null;
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="%23f3f4f6" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="20">No image</text></svg>';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/animals/${a._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/animals/${a._id}`);
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded border hover:shadow-lg transition"
    >
      <div className="w-full bg-gray-100">
        <div className="relative w-full pb-[100%] overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={a.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholder; }}
            />
          ) : (
            <img src={placeholder} alt="no image" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1 flex gap-1 flex-wrap">
          {a.vetApproved && <Badge color="green">Vet Approved</Badge>}
          {(a.purpose || []).slice(0, 2).map((p) => <Badge key={p} color="blue">{p}</Badge>)}
        </div>
        <div className="font-semibold">{a.name} • {a.breed}</div>
        <div className="text-sm text-gray-600">Age: {a.ageWeeks}w • Sex: {a.sex}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold">{formatCurrency(a.price)}</div>
          {lowQty && <Badge color="red">Only {a.quantityAvailable} left!</Badge>}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-2 bg-white/90 p-2 group-hover:flex">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(a);
          }}
          className="rounded bg-black px-3 py-1 text-white"
        >
          Add to Cart
        </button>
        <Link href={`/animals/${a._id}`} className="rounded border px-3 py-1 text-sm">Quick View</Link>
      </div>
    </div>
  );
}

// ----------------------------
// Product Card
// ----------------------------
function ProductCard({ p, onAdd }) {
  const router = useRouter();
  const low = Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5;
  const validImages = (p.images || []).filter(Boolean);
  const imgSrc = validImages.find((u) => (u || '').includes('cloudinary')) || validImages[0] || null;
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="%23f3f4f6" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="20">No image</text></svg>';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/products/${p._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/products/${p._id}`);
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded border hover:shadow-lg transition"
    >
      <div className="w-full bg-gray-100">
        <div className="relative w-full pb-[100%] overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholder; }}
            />
          ) : (
            <img src={placeholder} alt="no image" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1 flex flex-wrap gap-1">
          {p.vetApproved && <Badge color="green">Vet Approved</Badge>}
          {(p.ageSuitability || []).slice(0, 2).map((t) => <Badge key={t} color="yellow">{t}</Badge>)}
          {(p.purpose || []).slice(0, 2).map((t) => <Badge key={t} color="blue">{t}</Badge>)}
        </div>
        <div className="font-semibold">{p.name} • {p.brand}</div>
        <div className="text-sm text-gray-600">Stock: {p.stock} {low ? "(Low)" : ""}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold">{formatCurrency(p.price)}</div>
          {low && <Badge color="red">Only {p.stock} left!</Badge>}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-2 bg-white/90 p-2 group-hover:flex">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(p);
          }}
          className="rounded bg-black px-3 py-1 text-white"
        >
          Add to Cart
        </button>
        <Link href={`/products/${p._id}`} className="rounded border px-3 py-1 text-sm">Quick View</Link>
      </div>
    </div>
  );
}

// ----------------------------
// Shop Page Component
// ----------------------------
function resolveCategory(categories, rawKey) {
  const key = String(rawKey || '').trim().toLowerCase();
  if (!key) return null;
  const normalized = key.replace(/[^a-z0-9]+/g, '-');
  const candidates = [normalized, normalized.endsWith('s') ? normalized.slice(0, -1) : `${normalized}s`];
  return (
    (categories || []).find((c) => c?.slug && candidates.includes(String(c.slug).toLowerCase())) ||
    (categories || []).find((c) => c?.species && candidates.includes(String(c.species).toLowerCase())) ||
    null
  );
}

function ShopPageInner() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState("animals"); // animals | products
  const [visibleCount, setVisibleCount] = useState(6);
  const [filterQuery, setFilterQuery] = useState("");
  const [categoryKey, setCategoryKey] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  useCartPersistence();

  const [animals, setAnimals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null);
    Promise.all([api.get('/animals'), api.get('/products'), api.get('/categories')])
      .then(([aRes, pRes, cRes]) => {
        if (!mounted) return;
        setAnimals(aRes.animals || []);
        setProducts(pRes.products || []);
        setCategories(cRes.categories || []);
      })
      .catch((e) => { if (mounted) setError(e.message || 'Failed to load'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Sync state from URL so Home buttons control /shop
  useEffect(() => {
    const nextTab = (searchParams?.get('tab') || '').toLowerCase();
    const nextCategory = (searchParams?.get('category') || '').toLowerCase();
    const nextSearch = (searchParams?.get('search') || '').toLowerCase();

    if (nextTab === 'animals' || nextTab === 'products') setTab(nextTab);
    if (typeof nextCategory === 'string') setCategoryKey(nextCategory);
    if (typeof nextSearch === 'string') setFilterQuery(nextSearch);
    setVisibleCount(6);
  }, [searchParams]);

  const filteredAnimals = useMemo(() => {
    const q = (filterQuery || "").toLowerCase().trim();
    const key = (categoryKey || '').toLowerCase().trim();

    let list = (animals || []);
    if (key) {
      const nonProductCategories = (categories || []).filter((c) => c && c.type !== 'product');
      const found = resolveCategory(nonProductCategories, key);
      if (found?._id) {
        list = list.filter((a) => String(a.categoryId || '') === String(found._id));
      } else {
        list = list.filter((a) => String(a.species || '').toLowerCase() === key);
      }
    }

    if (!q) return list;
    return (animals || []).filter((a) => {
      const hay = [a.name, a.breed, a.species, (a.purpose || []).join(" "), (a.temperament || []).join(" ")]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q) || q === "puppies" && (a.ageWeeks && a.ageWeeks <= 16);
    });
  }, [animals, categories, categoryKey, filterQuery]);

  const filteredProducts = useMemo(() => {
    const q = (filterQuery || "").toLowerCase().trim();
    const key = (categoryKey || '').toLowerCase().trim();

    let list = (products || []);
    if (key) {
      const productCategories = (categories || []).filter((c) => c && c.type === 'product');
      const found = resolveCategory(productCategories, key);
      if (found?._id) {
        list = list.filter((p) => String(p.categoryId || '') === String(found._id));
      }
    }

    if (!q) return list;
    return (products || []).filter((p) => {
      const hay = [p.name, p.brand, (p.purpose || []).join(" "), (p.ageSuitability || []).join(" ")]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q) || q === "products";
    });
  }, [products, categories, categoryKey, filterQuery]);

  const showList = tab === "animals" ? filteredAnimals : filteredProducts;
  const visible = showList.slice(0, visibleCount);

  const handleHeroSearch = (q) => {
    if (!q) return;
    const slug = q.toLowerCase();
    if (slug === "products") setTab("products");
    else setTab("animals");
    setFilterQuery(slug);
    setVisibleCount(6);
  };

  return (
    <main className="max-w-7xl mx-auto ">
      <ShopHero onSearch={handleHeroSearch} />
      {/* Tabs removed per request */}

      {/* Grid with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}-${categoryKey}-${filterQuery}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map(item => tab==="animals" ? (
            <AnimalCard key={item._id} a={item} onAdd={(a)=>addItem({_id:a._id,_type:'animal',name:a.name,price:a.price,qty:1})} />
          ) : (
            <ProductCard key={item._id} p={item} onAdd={(p)=>addItem({_id:p._id,_type:'product',name:p.name,price:p.price,qty:1})} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Infinite Scroll */}
      {visibleCount < showList.length && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 rounded border bg-blue-50" onClick={()=>setVisibleCount(vc=>vc+6)}>
            Show more ({showList.length-visibleCount} remaining)
          </button>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="max-w-7xl mx-auto" />}>
      <ShopPageInner />
    </Suspense>
  );
}
