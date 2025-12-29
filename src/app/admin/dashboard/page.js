"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import { LineChart, Package, PawPrint } from "lucide-react";

export default function AdminDashboard() {
  const { admin, loading } = useRequireAdmin();
  const [topAnimals, setTopAnimals] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const ta = await api.get("/animals/admin/stats/top?by=likes&limit=5");
        const tp = await api.get("/products/admin/stats/top?by=orders&limit=5");
        setTopAnimals(ta.items || []);
        setTopProducts(tp.items || []);
      } catch (e) {
        setError(e.message || "Failed to load stats");
      }
    })();
  }, [loading]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!admin) return null;

  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LineChart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/animals" className="rounded border px-3 py-2">Manage Animals</Link>
            <Link href="/admin/products" className="rounded border px-3 py-2">Manage Products</Link>
          </div>
        </header>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><PawPrint className="h-5 w-5" /> Top Animals (likes)</h2>
            {!topAnimals.length && <div className="text-sm text-gray-500">No data yet.</div>}
            <ul className="space-y-2">
              {topAnimals.map((s) => (
                <li key={s._id} className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">{String(s.animalId)}</div>
                  <div className="text-sm">Likes: {s.likesCount}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Package className="h-5 w-5" /> Top Products (orders)</h2>
            {!topProducts.length && <div className="text-sm text-gray-500">No data yet.</div>}
            <ul className="space-y-2">
              {topProducts.map((s) => (
                <li key={s._id} className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">{String(s.productId)}</div>
                  <div className="text-sm">Orders: {s.orderCount}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
