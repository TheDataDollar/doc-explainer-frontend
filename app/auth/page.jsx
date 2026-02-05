"use client";

import { useState } from "react";

export default function AuthPage() {
  const API = "https://doc-explainer-api.onrender.com";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");

  async function register() {
    setMsg("Registering...");
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return setMsg(`❌ ${data.detail || "Register failed"}`);

    setToken(data.token);
    setMsg("✅ Registered! Token saved below.");
  }

  async function login() {
    setMsg("Logging in...");
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return setMsg(`❌ ${data.detail || "Login failed"}`);

    setToken(data.token);
    setMsg("✅ Logged in! Token saved below.");
  }

  async function getMe() {
    setMsg("Calling /me ...");
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) return setMsg(`❌ ${data.detail || "Me failed"}`);

    setMsg("✅ /me success:\n" + JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial", maxWidth: 520 }}>
      <h1>Auth</h1>

      <label>Email</label>
      <input
        style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
      />

      <label>Password</label>
      <input
        style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={register} style={{ padding: "10px 14px" }}>
          Register
        </button>
        <button onClick={login} style={{ padding: "10px 14px" }}>
          Login
        </button>
      </div>

      <label>Token</label>
      <textarea
        style={{ width: "100%", padding: 10, height: 120, marginTop: 6 }}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="token will appear here"
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={getMe} style={{ padding: "10px 14px" }}>
          Test /me
        </button>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{msg}</pre>
    </div>
  );
}
