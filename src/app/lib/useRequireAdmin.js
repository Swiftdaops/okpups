"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

export function useRequireAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.get("/auth/me");
        if (!alive) return;
        setAdmin(data.admin);
      } catch (e) {
        if (!alive) return;
        router.replace("/admin/login");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  async function reloadAdmin() {
    try {
      const data = await api.get('/auth/me');
      setAdmin(data.admin);
      return data.admin;
    } catch (e) {
      return null;
    }
  }

  return { admin, loading, reloadAdmin };
}
