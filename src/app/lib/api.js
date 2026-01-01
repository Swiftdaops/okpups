const DEFAULT_BASE = "https://okpupsbackend-7gv3.onrender.com";

export function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

async function request(path, { method = "GET", body, headers } = {}) {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export async function apiForm(path, formData, method = "POST") {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    method,
    credentials: "include",
    body: formData,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
