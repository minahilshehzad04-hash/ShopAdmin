import { titleCase } from "@/lib/utils";
export function OrderStatus({ status }: { status: string }) { return <span className={`status status-${status.toLowerCase()}`}>{titleCase(status)}</span>; }
