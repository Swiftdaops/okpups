"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ShopHero({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch(query);
  };

  return (
    <section className="relative bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Find the Perfect Pet or Product
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl mb-8 text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Vet-approved, high-quality pets and products for your furry friends.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          className="max-w-xl mx-auto flex items-center gap-2"
          onSubmit={handleSearch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <input
            type="text"
            placeholder="Search breed, product, or age…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </motion.form>

        {/* Quick Category Buttons (call onSearch) */}
        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {["Puppies", "Kittens", "Livestock", "Poultry", "Products"].map((cat) => (
            <button
              key={cat}
              onClick={() => onSearch && onSearch(cat.toLowerCase())}
              className="px-4 py-2 bg-white rounded shadow hover:bg-blue-50 transition text-gray-800 font-medium"
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
