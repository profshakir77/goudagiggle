/**
 * Shared fetch wrapper for admin API calls.
 * Automatically redirects to /admin/login?expired=1 on 401.
 */
export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (res.status === 401) {
    window.location.href = "/admin/login?expired=1";
    // Return a promise that never resolves so callers don't continue processing
    return new Promise<never>(() => {});
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json();
}
