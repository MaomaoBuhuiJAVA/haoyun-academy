export type ApiResource = {
  id: string;
  title: string;
  image: string;
  filterTag: string;
  tags: string[];
  readTime: string;
  colSpan: string;
  author: string;
  content: string;
};

type Role = "patient" | "doctor" | "admin";

function getRole(): Role {
  const raw = localStorage.getItem("role") ?? "patient";
  return raw === "doctor" || raw === "admin" ? raw : "patient";
}

function getUserId() {
  return localStorage.getItem("userId") ?? "wechat_9527";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const timeoutMs = 25000;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(path, {
        ...init,
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-user-id": getUserId(),
          "x-role": getRole(),
          ...(init?.headers ?? {}),
        },
      });
      clearTimeout(timer);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API_ERROR ${res.status} ${text}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      clearTimeout(timer);
      const msg = String((e as Error)?.message ?? e);
      const isTimeout = msg.includes("aborted") || msg.includes("AbortError");
      const isNetwork = msg.includes("fetch failed");
      if (attempt < maxAttempts && (isTimeout || isNetwork)) continue;
      if (isTimeout) throw new Error("API_TIMEOUT");
      throw e;
    }
  }

  throw new Error("API_TIMEOUT");
}

export async function listResources(params: { q?: string; filter?: string }) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.filter) usp.set("filter", params.filter);
  const qs = usp.toString();
  const data = await apiFetch<{ items: ApiResource[] }>(`/api/resources${qs ? `?${qs}` : ""}`);
  return data.items;
}

export async function getFavoriteIds() {
  const data = await apiFetch<{ ids: string[] }>("/api/favorites/ids");
  return new Set(data.ids);
}

export async function listFavorites() {
  const data = await apiFetch<{ items: ApiResource[] }>("/api/favorites");
  return data.items;
}

export async function addFavorite(resourceId: string) {
  await apiFetch<{ ok: true }>("/api/favorites", { method: "POST", body: JSON.stringify({ resourceId }) });
}

export async function removeFavorite(resourceId: string) {
  await apiFetch<{ ok: true }>(`/api/favorites/${resourceId}`, { method: "DELETE" });
}

export async function submitDoctorArticle(input: {
  title: string;
  category: string;
  tags: string[];
  coverImage?: string;
  content: string;
}) {
  const data = await apiFetch<{ item: { id: string } }>("/api/submissions", { method: "POST", body: JSON.stringify(input) });
  return data.item;
}

export async function listPendingReviews() {
  const data = await apiFetch<{ items: any[] }>("/api/admin/reviews");
  return data.items;
}

export async function approveReview(id: string, note?: string) {
  await apiFetch("/api/admin/reviews/" + id + "/approve", { method: "POST", body: JSON.stringify({ note }) });
}

export async function rejectReview(id: string, note: string) {
  await apiFetch("/api/admin/reviews/" + id + "/reject", { method: "POST", body: JSON.stringify({ note }) });
}

