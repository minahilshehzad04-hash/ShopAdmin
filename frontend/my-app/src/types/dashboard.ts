import type { Category } from "./category";
import type { Customer } from "./customer";
import type { Order } from "./order";
import type { Product } from "./product";

export type DashboardSummary = { stats: { total_sales: number; total_orders: number; total_products: number; total_customers: number; low_stock_items: number; sales_change?: number | null; orders_change?: number | null }; sales: { date: string; total: number }[]; orders: { status: string; count: number }[]; categories: { name: string; total: number }[]; top_products: { id: number; name: string; price: number; units: number }[]; low_stock: { id: number; name: string; stock: number }[] };
export type DashboardData = { products: Product[]; orders: Order[]; customers: Customer[]; categories: Category[]; summary: DashboardSummary };
