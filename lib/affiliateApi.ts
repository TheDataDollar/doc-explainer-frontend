// lib/affiliateApi.ts

import { getAffiliateToken } from "@/lib/affiliateAuth";

const AFFILIATE_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://doc-explainer-api.onrender.com";

export async function affiliateFetch(path: string, options: RequestInit = {}) {
  const token = getAffiliateToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${AFFILIATE_API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
