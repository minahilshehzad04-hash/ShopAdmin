import { apiRequest } from "@/lib/api";
import type { Order } from "@/types/order";
export type OrderQuery = { page?: number; limit?: number; search?: string; status?: string; start_date?: string; end_date?: string };
export type OrderList = { items: Order[]; total: number; page: number; limit: number; pages: number };
export type OrderInput = { customer_id: number; total_amount: number; status: string; items?: { product_id: number; quantity: number; price: number }[] };
export const orderService = { list: (query: OrderQuery = {}) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => value && params.set(key, String(value))); return apiRequest<OrderList>(`/api/orders/${params.toString() ? `?${params}` : ""}`); }, get: (id: string) => apiRequest<Order>(`/api/orders/${id}`), create: (data: OrderInput) => apiRequest<Order>("/api/orders/", { method: "POST", body: JSON.stringify(data) }), updateStatus: (id: string, status: string) => apiRequest<Order>(`/api/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" }) };
