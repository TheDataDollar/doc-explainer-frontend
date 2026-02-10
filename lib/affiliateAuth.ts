"use client";

const TOKEN_KEY = "affiliate_token";

export function setAffiliateToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAffiliateToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAffiliateToken() {
  localStorage.removeItem(TOKEN_KEY);
}
