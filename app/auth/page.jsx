"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const existing = localStorage.getItem("token") || "";
      if (existing) setToken(existing);
    } catch {
      // ignore
    }
  }, []);

  function persistToken(next) {
    setToken(next);
    try {
      localStorage.setItem("token", next);
    } catch {
      // ignore
    }
  }

  async function register() {
    setMsg("Registering...");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(`❌ ${data.detail || "Register failed"}`);

      if (!data.token) return setMsg("❌ No token returned from server.");

      persistToken(data.token);
      setMsg("✅ Registered! Token saved. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (e) {
      setMsg(`❌ Register error: ${e?.message || "Unknown error"}`);
    }
  }

  async function login() {
    setMsg("Logging in...");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(`❌ ${data.detail || "Login failed"}`);

      if (!data.token) return setMsg("❌ No token returned from server.");

      persistToken(data.token);
      setMsg("✅ Logged in! Token saved. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (e) {

      setMsg(`❌ Login error: ${e?.message || "Unknown error"}`);
    }
  }

  async function getMe() {
    setMsg("Calling /me ...");
    try {
      const t = token || localStorage.getItem("token") || "";
      if (!t) return setMsg("❌ No token saved yet.");

      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(`❌ ${data.detail || "Me failed"}`);

      setMsg("✅ /me success:\n" + JSON.stringify(data, null, 2));
    } catch (e) {

      setMsg(`❌ /me error: ${e?.message || "Unknown error"}`);
    }
  }

  function saveTokenManually() {
    if (!token.trim()) return setMsg("❌ Token box is empty.");
    persistToken(token.trim());
    setMsg("✅ Token saved to localStorage.");
  }

  function logout() {
    try {
      localStorage.removeItem("token");
    } catch {}
    setToken("");
    setMsg("Logged out (token removed).");
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial", maxWidth: 520 }}>
      <h1>Auth</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        API: <b>{API}</b>
      </p>

      <label>Email</label>
      <input
        style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        autoCapitalize="none"
        autoCorrect="off"
      />

      <label>Password</label>
      <input
        style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={register} style={{ padding: "10px 14px" }}>
          Register
        </button>
        <button onClick={login} style={{ padding: "10px 14px" }}>
          Login
        </button>
        <button onClick={() => router.push("/dashboard")} style={{ padding: "10px 14px" }}>
          Go dashboard
        </button>
      </div>

      <label>Token (saved to localStorage)</label>
      <textarea
        style={{ width: "100%", padding: 10, height: 120, marginTop: 6 }}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="token will appear here"
      />

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={saveTokenManually} style={{ padding: "10px 14px" }}>
          Save token
        </button>
        <button onClick={getMe} style={{ padding: "10px 14px" }}>
          Test /me
        </button>
        <button onClick={logout} style={{ padding: "10px 14px" }}>
          Logout
        </button>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{msg}</pre>
    </div>
  );
}
