"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

export default function AdminOrdersPage() {
  const { admin, loading } = useRequireAdmin();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function load() {
    setError(null);
    try {
      const d = await api.get("/orders");
      setOrders(d.orders || []);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!admin) return null;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-xl font-semibold mb-4">Orders</h1>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="p-6 text-gray-600">No orders yet.</div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{o.customerName} {o.cid ? `(${o.cid})` : ''}</div>
                <div className="text-sm text-gray-600">WhatsApp: {o.customerWhatsApp}</div>
                <div className="text-sm text-gray-600">Subtotal: ${o.subtotal}</div>
                <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-3 text-sm">
              {o.items && o.items.map((it, i) => (
                <div key={i} className="border-t pt-2 mt-2">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-600">Type: {it.itemType} • Qty: {it.qty} • Price: ${it.price}</div>
                </div>
              ))}
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
