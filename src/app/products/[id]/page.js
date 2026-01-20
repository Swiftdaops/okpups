"use client";

import { useEffect, useState, Suspense } from "react"; // Added Suspense
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/formatCurrency";
import { useCartPersistence, useCartStore } from "../../lib/useCart";

// 1. Updated Badge to use your Stone/Slate palette
function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-slate-300 text-stone-800",
    blue: "bg-blue-200 text-blue-900",
    green: "bg-emerald-200 text-emerald-900",
    red: "bg-red-200 text-red-900",
    yellow: "bg-amber-200 text-amber-900",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${map[color] || map.gray}`}>{children}</span>;
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
  const isUnoptimized = (src) => typeof src === 'string' && src.includes('placehold.co');

  useEffect(() => {
    if (!id) return;
    setLoading(true); 
    setError(null);
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
    addItem({ _id: product._id, _type: 'product', name: product.name, price: product.price || 0, qty: 1 });
  }

  if (loading) return <div className="p-6 text-stone-950">Loading product details...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!product) return <div className="p-6 text-stone-950">Product not found</div>;

  return (
    // 2. Applied your requested bg-slate-200 and text-stone-950
    <div className="min-h-screen bg-slate-200 text-stone-950 p-6">
      
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-stone-600">
        <Link href="/shop" className="hover:underline">Shop</Link>
        <span>/</span>
        <Link href="/shop/products" className="hover:underline">Products</Link>
        <span>/</span>
        <span className="font-semibold text-stone-950">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 max-w-7xl mx-auto">
        {/* Left: Images */}
        <div>
          <div className="relative mb-4 h-[500px] w-full overflow-hidden rounded-xl bg-slate-300 shadow-inner">
            {mainImage && (
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                priority
                sizes="(max-width: 1024px) 100vw, 50vw" 
                className="object-cover" 
                unoptimized={isUnoptimized(mainImage)}
              />
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {thumbnails.map((img, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMainImage(img)}
                className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${mainImage === img ? 'border-stone-950' : 'border-slate-400'}`}
              >
                <Image src={img} alt={`thumb-${idx}`} fill sizes="96px" className="object-cover" unoptimized={isUnoptimized(img)} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-stone-950">{product.name}</h1>
          <p className="mb-4 text-lg text-stone-600 italic">{product.brand}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            {(product.ageSuitability || []).map((a) => (<Badge key={a} color="yellow">{a}</Badge>))}
            {product.vetApproved && <Badge color="green">Vet Approved</Badge>}
          </div>

          <div className="mb-6 text-3xl font-bold">
            {formatCurrency(product.price)}
          </div>

          <div className={`mb-6 inline-flex items-center gap-2 font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
          </div>

          <div className="mb-8 rounded-xl bg-slate-300/50 p-6 border border-slate-300">
            <h3 className="mb-3 font-bold text-stone-900 uppercase tracking-wider text-sm">Product Specifications</h3>
            <ul className="space-y-2 text-stone-800">
              {product.specs?.weight && <li><strong>Weight:</strong> {product.specs.weight}</li>}
              {product.specs?.proteinPercent && <li><strong>Protein Content:</strong> {product.specs.proteinPercent}</li>}
              {product.specs?.ingredients && <li className="text-sm leading-relaxed"><strong>Ingredients:</strong> {product.specs.ingredients}</li>}
            </ul>
          </div>

          <div className="mt-auto flex items-center gap-4">
            <button 
              disabled={product.stock <= 0}
              onClick={onAddToCart} 
              className="flex-1 rounded-lg bg-stone-950 px-8 py-4 text-white font-bold transition hover:bg-stone-800 disabled:bg-stone-400"
            >
              Add to Cart
            </button>
            <button onClick={() => router.back()} className="rounded-lg border-2 border-stone-950 px-8 py-4 font-bold hover:bg-stone-950 hover:text-white transition">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}