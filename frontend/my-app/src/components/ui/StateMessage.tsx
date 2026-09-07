import type { ReactNode } from "react";
export function StateMessage({ children }: { children: ReactNode }) { return <div className="panel empty-state">{children}</div>; }
