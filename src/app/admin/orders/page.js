"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import ShareOrderModal from "../../components/ShareOrderModal";

export default function AdminOrdersPage() {
  const { admin, loading } = useRequireAdmin();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

      {/* Share modal */}
      <ShareOrderModal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} />

      <div className="mt-4">
        {orders.length === 0 ? (
          <div className="p-6 text-gray-600">No orders yet.</div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{o.customerName}</div>
                        {o.cid && <div className="text-xs text-gray-500">{o.cid}</div>}
                      </TableCell>
                      <TableCell>{o.customerWhatsApp}</TableCell>
                      <TableCell>{o.items?.length || 0}</TableCell>
                      <TableCell>${o.subtotal}</TableCell>
                      <TableCell>
                        <button
                          className="rounded bg-black px-2 py-1 text-white text-sm"
                          onClick={() => setSelectedOrder(o)}
                        >
                          Share
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden grid gap-4">
              {orders.map((o) => (
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
                    <div className="mt-3 flex justify-end">
                      <button
                        className="rounded bg-black px-3 py-1 text-white text-sm"
                        onClick={() => setSelectedOrder(o)}
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
