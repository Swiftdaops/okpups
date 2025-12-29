"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "../../lib/api";
import { useCartPersistence, useCartStore } from "../../lib/useCart";

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs ${map[color] || map.gray}`}>{children}</span>;
}

export default function ProductDetailsPage() {
  useCartPersistence();
  const addItem = useCartStore((s) => s.addItem);

  const router = useRouter();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    api.get(`/products/${id}`)
      .then((d) => {
        setProduct(d.product);
        const imgs = (d.product?.images || []).filter(Boolean);
        const img = imgs.find((u) => (u || '').includes('cloudinary')) || imgs[0] || null;
        setMainImage(img);
        setThumbnails(imgs);
      })
      .catch((e) => setError(e.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  function onAddToCart() {
    if (!product) return;
    addItem({ _id: product._id, _type: 'product', name: product.name || 'Product', price: product.price || 0, qty: 1 });
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/shop" className="text-blue-600">Shop</Link>
        <span>/</span>
        <Link href="/shop/products" className="text-blue-600">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="relative mb-4 h-96 w-full overflow-hidden rounded-lg bg-gray-100 shadow-md">
            {mainImage && (
              <Image src={mainImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            )}
          </div>
          <div className="flex gap-2">
            {thumbnails.map((img, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => setMainImage(img)}
                className={`relative h-20 w-20 overflow-hidden rounded border-2 ${mainImage===img? 'border-blue-500' : 'border-gray-200'}`}
              >
                <Image
                  src={img}
                  alt={`thumb-${idx}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => {
                    setThumbnails((prev) => prev.filter((u) => u !== img));
                    if (mainImage === img) {
                      const next = (thumbnails || []).find((u) => u !== img) || null;
                      setMainImage(next);
                    }
                  }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
          <p className="mb-2 text-gray-600">{product.brand}</p>

          <div className="mb-2 flex flex-wrap gap-2">
            {(product.ageSuitability || []).map((a) => (<Badge key={a} color="yellow">{a}</Badge>))}
            {product.vetApproved && <Badge color="green">Vet Approved</Badge>}
            {(product.purpose || []).slice(0,2).map((p) => (<Badge key={p} color="blue">{p}</Badge>))}
          </div>

          <div className="mb-4 text-2xl font-bold text-blue-600">₦{Number(product.price || 0).toLocaleString()}</div>
          <p className={`mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <ul className="mb-4 space-y-1 text-gray-700">
            {product.specs?.weight && <li><strong>Weight:</strong> {product.specs.weight}</li>}
            {product.specs?.proteinPercent && <li><strong>Protein:</strong> {product.specs.proteinPercent}</li>}
            {product.specs?.fatPercent && <li><strong>Fat:</strong> {product.specs.fatPercent}</li>}
            {product.specs?.fiberPercent && <li><strong>Fiber:</strong> {product.specs.fiberPercent}</li>}
            {product.specs?.ingredients && <li><strong>Ingredients:</strong> {product.specs.ingredients}</li>}
          </ul>

          <div className="flex items-center gap-3">
            <button onClick={onAddToCart} className="rounded bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700">Add to Cart</button>
            <button onClick={() => router.back()} className="rounded border px-6 py-3">Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
