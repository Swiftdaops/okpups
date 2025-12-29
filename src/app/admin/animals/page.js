"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import AddAnimal from "../../components/AddAnimal";
import EditAnimal from "../../components/EditAnimal";

export default function AdminAnimalsPage() {
  const { admin, loading } = useRequireAdmin();
  const [animals, setAnimals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    load();
  }, [loading]);

  async function load() {
    setError(null);
    try {
      const d = await api.get("/animals/admin/list");
      setAnimals(d.animals || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    }
  }

  function handleCreated(a) {
    setShowAdd(false);
    setAnimals((list) => [a, ...list]);
  }

  function handleUpdated(a) {
    setEditing(null);
    setAnimals((list) => list.map((x) => (x._id === a._id ? a : x)));
  }

  function handleDeleted(id) {
    setEditing(null);
    setAnimals((list) => list.filter((x) => x._id !== id));
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!admin) return null;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Animals</h1>
        <button className="rounded bg-black px-3 py-2 text-white" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add New Animal"}
        </button>
      </div>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      {showAdd && <AddAnimal onCreated={handleCreated} onCancel={() => setShowAdd(false)} />}

      <div className="mt-6 grid gap-4">
        {animals.map((a) => {
          const img = (a.images || []).find((u) => (u || '').includes('cloudinary')) || (a.images && a.images[0]) || null;
          return (
            <div key={a._id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {img && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <img src={img} alt={a.name || a.nameOrTag} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{a.name || a.nameOrTag} — {a.species} {a.breed ? `(${a.breed})` : ""}</div>
                    <div className="text-sm text-gray-600">Age: {a.ageWeeks}w • Price: ${a.price} • Qty: {a.quantityAvailable}</div>
                  </div>
                </div>
                <button className="rounded border px-3 py-1" onClick={() => setEditing(a)}>Edit</button>
              </div>
              {editing?._id === a._id && (
                <div className="mt-3">
                  <EditAnimal animal={a} onUpdated={handleUpdated} onDeleted={handleDeleted} onCancel={() => setEditing(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
