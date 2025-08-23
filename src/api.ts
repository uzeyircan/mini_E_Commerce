import { API_URL } from "./config";
import { getToken } from "./store/auth"; // veya "@/store/auth"

export async function api<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getToken(); // 👈 ÖNEMLİ: await

  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || res.statusText);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json")
    ? ((await res.json()) as T)
    : ((await res.text()) as unknown as T);
}
