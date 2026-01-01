import React, { Suspense } from 'react';
import ProductsPage from './ProductsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
      <ProductsPage />
    </Suspense>
  );
}
