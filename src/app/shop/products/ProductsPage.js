"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/formatCurrency';

function ProductCard({ p }) {
  const router = useRouter();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/products/${p._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/products/${p._id}`);
        }
      }}
      className="border rounded p-3 cursor-pointer"
    >
      <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
        {p.images && p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          'Image'
        )}
      </div>
      <h4 className="font-semibold">{p.name}</h4>
      <div className="text-sm text-gray-600">{p.brand}</div>
        <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold">{formatCurrency(p.price)}</div>
        <Link onClick={(e) => e.stopPropagation()} href={`/products/${p._id}`} className="text-blue-600 text-sm">View</Link>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = searchParams.get('category') || null;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        if (!mounted) return;
        setCategories(res.categories || []);
      } catch (e) {
        setCategories([]);
      }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        // if category slug is provided, find its id
        let catId = null;
        if (categorySlug) {
          // try to find in local categories first
          const found = categories.find((c) => c.slug === categorySlug);
          if (found) catId = found._id;
          else {
            // fallback: fetch categories fresh
            const res = await api.get('/categories');
            const f = (res.categories || []).find((c) => c.slug === categorySlug);
            if (f) catId = f._id;
          }
        }

        const path = catId ? `/products?categoryId=${encodeURIComponent(catId)}` : '/products';
        const res = await api.get(path);
        if (!mounted) return;
        setProducts(res.products || []);
      } catch (e) {
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProducts();
    return () => { mounted = false; };
  }, [categorySlug, categories]);

  function onCategoryChange(e) {
    const slug = e.target.value || '';
    // update URL query param
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (slug) params.set('category', slug);
    else params.delete('category');
    router.push(`/shop/products?${params.toString()}`);
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <div>
          <label className="mr-2 text-sm">Category</label>
          <select value={categorySlug || ''} onChange={onCategoryChange} className="border rounded px-2 py-1">
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        {products.length ? products.map((p) => <ProductCard key={p._id} p={p} />) : (
          <div className="text-gray-600">No products found.</div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/shop" className="text-blue-600">Back to Shop</Link>
      </div>
    </main>
  );
}
