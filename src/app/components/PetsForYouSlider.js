"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "../lib/formatCurrency";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from 'swiper/modules';
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

import { api } from "../lib/api";

export default function PetsForYouSlider() {
  const router = useRouter();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/animals")
      .then((d) => {
        if (!mounted) return;
        setAnimals(d.animals || []);
      })
      .catch(() => {
        if (!mounted) return;
        setAnimals([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="%23f3f4f6" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="20">No image</text></svg>';

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-900">Pets for you</h2>

      {loading && <div className="mt-3 text-sm text-gray-500">Loading…</div>}

      {!loading && animals.length === 0 && (
        <div className="mt-3 text-sm text-gray-500">No pets found.</div>
      )}

      {animals.length > 0 && (
        <div className="mt-5">
          <Swiper
            modules={[FreeMode, Scrollbar]}
            spaceBetween={16}
            slidesPerView={1.2}
            grabCursor={true}
            freeMode={true}
            scrollbar={{ draggable: true, hide: false }}
            navigation={false}
            breakpoints={{
              320: { slidesPerView: 1.1 },
              480: { slidesPerView: 1.6 },
              640: { slidesPerView: 2.2 },
              768: { slidesPerView: 3.0 },
              1024: { slidesPerView: 4.0 },
            }}
            className="py-2"
          >
            {animals.map((a) => {
              const validImages = (a.images || []).filter(Boolean);
              const imgSrc =
                validImages.find((u) => (u || "").includes("cloudinary")) ||
                validImages[0] ||
                null;

              return (
                <SwiperSlide key={a._id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/animals/${a._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/animals/${a._id}`);
                      }
                    }}
                    className="group cursor-pointer overflow-hidden rounded border bg-white shadow-sm hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="relative w-full pb-[85%] bg-gray-100">
                      <img
                        src={imgSrc || placeholder}
                        alt={a.name || a.nameOrTag || "Animal"}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholder;
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-gray-900">
                        {a.name || a.nameOrTag}
                      </div>
                      <div className="text-sm text-gray-600">
                        {a.species}
                        {a.breed ? ` • ${a.breed}` : ""}
                      </div>
                      {typeof a.price !== "undefined" && a.price !== null && (
                        <div className="mt-2 font-bold text-gray-900">
                          {formatCurrency(a.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </section>
  );
}
