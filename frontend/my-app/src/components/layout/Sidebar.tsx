"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

type IconName = "dashboard" | "products" | "categories" | "orders" | "customers" | "inventory" | "report" | "settings" | "logout";
const links: { href: string; icon: IconName; label: string }[] = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/products", icon: "products", label: "Products" },
  { href: "/categories", icon: "categories", label: "Categories" },
  { href: "/orders", icon: "orders", label: "Orders" },
  { href: "/customers", icon: "customers", label: "Customers" },
  { href: "/inventory", icon: "inventory", label: "Inventory" },
];

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    dashboard: "M3 3h7v7H3V3zm11 0h7v5h-7V3zM3 14h7v7H3v-7zm11-3h7v10h-7V11z",
    products: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
    categories: "M4 5h7v7H4V5zm9 0h7v7h-7V5zM4 14h7v7H4v-7zm9 0h7v7h-7v-7z",
    orders: "M3 4h2l2 11h10l2-7H7M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0z",
    customers: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20m6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 1v-1a3 3 0 0 0-3-3m0-4a3 3 0 0 1 0 6",
    inventory: "M4 6h16v14H4V6zm3-3h10v3H7V3zm2 7h6m-6 4h6",
    report: "M4 20V4m0 16h17M8 16l4-5 3 3 5-7",
    settings: "M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm0-12.2v2m0 14v2m9-9h-2M5 12H3m15.4 6.4-1.4-1.4M7 7 5.6 5.6m12.8 0L17 7M7 17l-1.4 1.4",
    logout: "M10 4H5v16h5m4-4 4-4-4-4m4 4H9",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  return <aside className="sidebar"><div className="brand"><span className="brand-mark"><ShoppingBag size={19} strokeWidth={2.4} /></span><span>ShopAdmin</span></div><nav><p className="nav-label">Workspace</p>{links.map(({ href, icon, label }) => <Link className={`nav-item ${isActive(href) ? "active" : ""}`} href={href} key={href}><span className="nav-icon"><Icon name={icon} /></span>{label}</Link>)}<p className="nav-label spaced">Reports</p><Link className={`nav-item ${isActive("/stock-report") ? "active" : ""}`} href="/stock-report" prefetch={false}><span className="nav-icon"><Icon name="report" /></span>Stock report</Link><p className="nav-label spaced">Tools</p><Link className="nav-item" href="/settings"><span className="nav-icon"><Icon name="settings" /></span>Settings</Link></nav><Link className="nav-item logout" style={{ marginTop: "auto" }} href="/"><span className="nav-icon"><Icon name="logout" /></span>Log out</Link></aside>;
}
