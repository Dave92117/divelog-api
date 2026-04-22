const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getDives(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/dives${query ? "?" + query : ""}`, {
    headers: headers(),
  });
  return res.json();
}

export async function getDive(id) {
  const res = await fetch(`${BASE_URL}/dives/${id}`, { headers: headers() });
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/dives/stats`, { headers: headers() });
  return res.json();
}

export async function logDive(data) {
  const res = await fetch(`${BASE_URL}/dives`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDive(id) {
  const res = await fetch(`${BASE_URL}/dives/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
}

export async function getSites() {
  const res = await fetch(`${BASE_URL}/sites`);
  return res.json();
}
