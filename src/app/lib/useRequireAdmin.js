"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, clearAuthToken } from "./api";

export function useRequireAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = await api.get("/auth/me");
        if (!alive) return;
        setAdmin(data.admin);
      } catch (e) {
        if (!alive) return;
        if (e?.status === 401) clearAuthToken();
        router.replace("/admin/login");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, pathname]);

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
