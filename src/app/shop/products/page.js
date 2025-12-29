"use client";

import Link from 'next/link';

const SampleProductCard = ({ p }) => (
  <div className="border rounded p-3">
    <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">Image</div>
    <h4 className="font-semibold">{p.name}</h4>
    <div className="text-sm text-gray-600">{p.brand}</div>
    <div className="mt-2 flex items-center justify-between">
      <div className="text-lg font-bold">${p.price}</div>
      <Link href="#" className="text-blue-600 text-sm">View</Link>
    </div>
  </div>
);

export default function ProductsPage() {
  const sample = [
    { _id: '1', name: 'Sample Puppy Food', brand: 'Acme', price: '45.00' },
    { _id: '2', name: 'Grooming Shampoo', brand: 'CleanCo', price: '12.50' }
  ];

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Products (placeholder)</h1>
      <p className="text-gray-700 mb-6">This is a placeholder products page. Replace with a dynamic product listing later.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {sample.map((p) => <SampleProductCard key={p._id} p={p} />)}
      </div>

      <div className="mt-6">
        <Link href="/shop" className="text-blue-600">Back to Shop</Link>
      </div>
    </main>
  );
}
