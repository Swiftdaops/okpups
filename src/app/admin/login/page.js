"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (!email || !password) return setError("Enter email and password");
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE_URL || "https://okpupsbackend-7gv3.onrender.com") +
          "/auth/login",
        {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Login failed");
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-[#0b0b0b]">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Admin Login</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Sign in to manage animals and products.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded border px-3 py-2"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded border px-3 py-2"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-between gap-2">
            <button className="mt-2 inline-flex items-center rounded bg-black px-4 py-2 text-white" type="submit">
              Sign in (demo)
            </button>
            <span className="mt-2 text-xs text-gray-500">Use your admin credentials.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
