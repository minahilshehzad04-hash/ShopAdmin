import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
export function DashboardLayout({ children }: { children: ReactNode }) { return <div className="app-shell"><Sidebar /><main className="main-content"><Topbar />{children}</main></div>; }
