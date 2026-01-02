"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-neutral-950 text-neutral-200 px-6 py-14"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand & Positioning */}
        <div>
          <div itemProp="name" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dzifobwnx/image/upload/v1766686429/ChatGPT_Image_Dec_25__2025__06_32_34_PM-removebg-preview_xeevlc.png"
              alt="OKPUPS logo"
              width={160}
              height={160}
              className="object-contain"
            />
            <span className="sr-only">OKPUPS</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300">
            A <strong>vet-approved, welfare-first platform</strong> for puppies,
            companion animals, livestock, and essential pet care products.
            We help responsible owners make confident, informed choices.
          </p>

          <meta itemProp="url" content="https://okpups.com" />
        </div>

        {/* What We Offer */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            What We Do
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>Vet-checked puppies & animal babies</li>
            <li>Purpose-based matching (Companion, Security, Breeding, Farming)</li>
            <li>Transparent health & age information</li>
            <li>Curated vet-approved products</li>
          </ul>
        </div>

        {/* Trust & Ethics */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Our Promise
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>Animal welfare comes first</li>
            <li>No adult animal resales</li>
            <li>Ethical breeders & partners only</li>
            <li>Education before transaction</li>
          </ul>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/animals" className="hover:text-white">
                Browse Animals
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">
                Vet Products
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About OKPUPS
              </Link>
            </li>
            {/* Contact page removed: use support channels externally if needed */}
          </ul>
        </div>
      </div>

      {/* Conversion Line */}
      <div className="max-w-7xl mx-auto mt-12 border-t border-neutral-800 pt-6 text-center">
        <p className="text-sm text-neutral-400">
          You’re here because you care.  
          <span className="text-neutral-200 font-medium">
            {" "}OKPUPS helps you choose right — for life.
          </span>
        </p>

        <p className="mt-3 text-xs text-neutral-500">
          © {new Date().getFullYear()} OKPUPS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
