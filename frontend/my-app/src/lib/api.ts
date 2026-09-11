const API_URL = "https://shopadmin-backend-2026-dyefd2ctamcnb0ga.westus3-01.azurewebsites.net";

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options?.headers }, cache: "no-store" });
  if (!response.ok) throw new Error((await response.text()) || `Request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json();
}

export { API_URL };
