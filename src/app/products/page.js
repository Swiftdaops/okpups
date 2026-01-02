export default function ProductsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Vet Products (Demo)</h1>
      <p className="mb-4 text-gray-600">Demo product listings for vet-approved items.</p>
      <ul className="space-y-3">
        <li className="p-4 border rounded">Sample Product — <strong>Premium Puppy Food</strong></li>
        <li className="p-4 border rounded">Sample Product — <strong>Worming Tablets</strong></li>
        <li className="p-4 border rounded">Sample Product — <strong>Flea Collar</strong></li>
      </ul>
    </div>
  );
}
