import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ShopAdmin Dashboard", description: "A clear view of your store operations." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
