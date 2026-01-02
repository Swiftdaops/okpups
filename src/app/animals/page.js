export default function AnimalsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Browse Animals (Demo)</h1>
      <p className="mb-4 text-gray-600">This is a demo listing page. Use the shop to view categorized animals.</p>
      <ul className="space-y-3">
        <li className="p-4 border rounded">Sample Animal — <strong>German Shepherd Puppy</strong></li>
        <li className="p-4 border rounded">Sample Animal — <strong>Bulldog Puppy</strong></li>
        <li className="p-4 border rounded">Sample Animal — <strong>Tabby Kitten</strong></li>
      </ul>
    </div>
  );
}
