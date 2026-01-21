"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/formatCurrency";
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

export default function AnimalDetailsPage() {
  useCartPersistence();
  const addItem = useCartStore((s) => s.addItem);

  const router = useRouter();
  const { id } = useParams();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const isUnoptimized = (src) => typeof src === 'string' && src.includes('placehold.co');

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    api.get(`/animals/${id}`)
      .then((d) => {
        setAnimal(d.animal);
        const imgs = (d.animal?.images || []).filter(Boolean);
        const img = imgs.find((u) => (u || '').includes('cloudinary')) || imgs[0] || null;
        setMainImage(img);
        setThumbnails(imgs);
      })
      .catch((e) => setError(e.message || "Failed to load animal"))
      .finally(() => setLoading(false));
  }, [id]);

  const [thumbnails, setThumbnails] = useState(() => (animal?.images || []).filter(Boolean));

  function onAddToCart() {
    if (!animal) return;
    addItem({ _id: animal._id, _type: 'animal', name: animal.name || animal.nameOrTag || animal.breed || 'Animal', price: animal.price || 0, qty: 1 });
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!animal) return <div className="p-6">Animal not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/shop" className="text-blue-600">Shop</Link>
        <span>/</span>
        <Link href="/shop/animals" className="text-blue-600">Animals</Link>
        <span>/</span>
        <span>{animal.breed || animal.species || animal.name || 'Details'}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Section */}
        <div>
          <div className="relative mb-4 h-96 w-full overflow-hidden rounded-lg bg-gray-100 shadow-md">
            {mainImage && (
              <Image
                src={mainImage}
                alt={animal.name || animal.breed || 'animal'}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized={isUnoptimized(mainImage)}
              />
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
                  unoptimized={isUnoptimized(img)}
                  onError={() => {
                    // remove broken image from thumbnails and if it was main, switch to next
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

        {/* Info Section */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">{animal.breed ? `${animal.breed}` : (animal.name || 'Animal')} {animal.name ? `- ${animal.name}` : ''}</h1>
          <p className="mb-2 text-gray-600">{animal.ageWeeks} weeks old • {animal.sex}</p>

          <div className="mb-2 flex flex-wrap gap-2">
            {(animal.purpose || []).map((p) => (
              <Badge key={p} color="blue">{p}</Badge>
            ))}
          </div>

          <div className="mb-4 text-2xl font-bold text-blue-600">{formatCurrency(animal.price)}</div>
          {animal.availabilityStatus && (
            <p className={`mb-4 ${animal.availabilityStatus !== 'available' ? 'text-red-500' : 'text-green-600'}`}>
              {String(animal.availabilityStatus).replace(/_/g,' ')}
            </p>
          )}

          <ul className="mb-4 space-y-1 text-gray-700">
            {Array.isArray(animal.temperament) && <li><strong>Temperament:</strong> {animal.temperament.join(', ')}</li>}
            {animal.experienceLevel && <li><strong>Experience Level:</strong> {animal.experienceLevel}</li>}
            {animal.livingSpace && <li><strong>Living Space:</strong> {animal.livingSpace}</li>}
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
