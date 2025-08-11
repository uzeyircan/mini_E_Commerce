import { API_URL } from "./config";
import { getToken } from "./store/auth";
export async function api<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as any),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  // @ts-ignore
  return res.text();
}
