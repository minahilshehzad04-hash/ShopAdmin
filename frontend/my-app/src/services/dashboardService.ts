import { categoryService } from "./categoryService";
import { customerService } from "./customerService";
import { orderService } from "./orderService";
import { productService } from "./productService";
import { apiRequest } from "@/lib/api";
import type { DashboardSummary } from "@/types/dashboard";
export const dashboardService = { load: async (days = 30) => { const [productResult, orderResult, customers, categories, summary] = await Promise.all([productService.list(), orderService.list(), customerService.list(), categoryService.list(), apiRequest<DashboardSummary>(`/api/dashboard?days=${days}`)]); return { products: productResult.items, orders: orderResult.items, customers, categories, summary }; } };
