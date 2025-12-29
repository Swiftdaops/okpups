"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AddProduct from "../../components/AddProduct";
import EditProduct from "../../components/EditProduct";

export default function AdminProductsPage() {
  const { admin, loading } = useRequireAdmin();
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function load() {
    setError(null);
    try {
      const d = await api.get("/products/admin/list");
      setProducts(d.products || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    }
  }

  function handleCreated(p) { setShowAdd(false); setProducts((list) => [p, ...list]); }
  function handleUpdated(p) { setEditing(null); setProducts((list) => list.map((x) => (x._id === p._id ? p : x))); }
  function handleDeleted(id) { setEditing(null); setProducts((list) => list.filter((x) => x._id !== id)); }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!admin) return null;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <button className="rounded bg-black px-3 py-2 text-white" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add New Product"}
        </button>
      </div>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      {showAdd && <AddProduct onCreated={handleCreated} onCancel={() => setShowAdd(false)} />}

      <div className="mt-6 grid gap-4">
        {products.map((p) => {
          const img = (p.images || []).find((u) => (u || '').includes('cloudinary')) || (p.images && p.images[0]) || null;
          return (
            <div key={p._id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {img && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{p.name} {p.brand ? `(${p.brand})` : ""}</div>
                    <div className="text-sm text-gray-600">Price: ${p.price} • Stock: {p.stock}</div>
                  </div>
                </div>
                <button className="rounded border px-3 py-1" onClick={() => setEditing(p)}>Edit</button>
              </div>
              {editing?._id === p._id && (
                <div className="mt-3">
                  <EditProduct product={p} onUpdated={handleUpdated} onDeleted={handleDeleted} onCancel={() => setEditing(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
