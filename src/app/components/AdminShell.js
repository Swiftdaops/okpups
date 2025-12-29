"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useRequireAdmin } from "../lib/useRequireAdmin";
import { apiForm } from "../lib/api";

export default function AdminShell({ onLogout }) {
  const [open, setOpen] = useState(false);
  const { admin, reloadAdmin } = useRequireAdmin();
  let fileInputRef;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await apiForm('/admin/profile/photo', fd, 'POST');
      await reloadAdmin();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload avatar', err);
    }
  }

  return (
    <div className="relative">
      <header className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <button aria-label="Toggle sidebar" onClick={() => setOpen((s) => !s)} className="rounded p-2 hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>

          <div>
            <div className="text-lg font-semibold">Admin</div>
            <div className="text-sm text-gray-500">Dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-gray-600 md:block">Signed in as {admin?.email || "admin"}</div>
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            <input ref={(el) => (fileInputRef = el)} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <img
              onClick={() => fileInputRef?.click()}
              src={admin?.avatarUrl && admin.avatarUrl.length ? admin.avatarUrl : admin?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.email)}&size=80&background=111&color=fff` : "https://ui-avatars.com/api/?name=Admin&size=80&background=111&color=fff"}
              alt="admin"
              width={40}
              height={40}
              className="object-cover cursor-pointer"
            />
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      <div className={`fixed inset-0 z-20 transition-opacity ${open ? "block" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/30 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />

        <aside className={`fixed left-0 top-0 z-30 h-full w-64 transform bg-white p-4 shadow-lg transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-bold">Admin Menu</div>
            <button onClick={() => setOpen(false)} className="p-1">
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/admin/dashboard" className="rounded px-2 py-1 hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/animals" className="rounded px-2 py-1 hover:bg-gray-100">Animals</Link>
            <Link href="/admin/products" className="rounded px-2 py-1 hover:bg-gray-100">Products</Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
