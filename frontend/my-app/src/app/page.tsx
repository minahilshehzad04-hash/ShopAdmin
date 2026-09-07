"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LowStockProducts } from "@/components/dashboard/LowStockProducts";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { SalesByCategory } from "@/components/dashboard/SalesByCategory";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopSellingProducts } from "@/components/dashboard/TopSellingProducts";
import { StatCard } from "@/components/dashboard/StatCard";
import { PerformanceStrip } from "@/components/dashboard/PerformanceStrip";
import { dashboardService } from "@/services/dashboardService";
import { money } from "@/lib/utils";
import type { DashboardData } from "@/types/dashboard";

const emptyDashboard: DashboardData = { products: [], orders: [], customers: [], categories: [], summary: { stats: { total_sales: 0, total_orders: 0, total_products: 0, total_customers: 0, low_stock_items: 0 }, sales: [], orders: [], categories: [], top_products: [], low_stock: [] } };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setLoading(true);
    dashboardService.load(period).then(setData).catch(() => setError(true)).finally(() => setLoading(false));
  }, [period]);

  return (
    <DashboardLayout>
      <div className="content">
        <div className="page-heading dashboard-heading"><div><h1>Dashboard <span className="wave">👋</span></h1><p className="subtitle">Here&apos;s what&apos;s happening with your store today.</p></div><div className="date-filter-wrap"><select id="dashboard-period" className="date-filter dashboard-date" value={period} onChange={(e) => setPeriod(Number(e.target.value))}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 3 months</option><option value="365">Last 12 months</option></select></div></div>
        {error && <p className="dashboard-notice">Dashboard data could not be loaded. Start the FastAPI server and refresh this page.</p>}
        <section className="metric-grid"><StatCard label="Total sales" value={loading ? "—" : money(data.summary.stats.total_sales)} tone="violet" change={data.summary.stats.sales_change} /><StatCard label="Total orders" value={loading ? "—" : data.summary.stats.total_orders.toLocaleString()} tone="blue" change={data.summary.stats.orders_change} /><StatCard label="Total products" value={loading ? "—" : data.summary.stats.total_products.toLocaleString()} tone="green" /><StatCard label="Total customers" value={loading ? "—" : data.summary.stats.total_customers.toLocaleString()} tone="amber" /><StatCard label="Low stock items" value={loading ? "—" : data.summary.stats.low_stock_items.toLocaleString()} tone="red" /></section>
        <section className="dashboard-grid"><SalesChart sales={data.summary.sales} period={period} onPeriodChange={setPeriod} /><OrdersChart orders={data.summary.orders} /><SalesByCategory items={data.summary.categories} /></section>
        <section className="lower-grid"><LowStockProducts products={data.products} /><RecentOrders orders={data.orders} /><TopSellingProducts topProducts={data.summary.top_products} products={data.products} /></section>
        <PerformanceStrip />
      </div>
    </DashboardLayout>
  );
}
