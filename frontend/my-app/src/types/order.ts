export type OrderItem = { id: number; order_id: number; product_id: number; product_name?: string | null; quantity: number; price: number };
export type Order = { id: number; customer_id?: number; customer_name?: string | null; customer_email?: string | null; total_amount: number; status: string; created_at?: string; updated_at?: string; items?: OrderItem[] };
