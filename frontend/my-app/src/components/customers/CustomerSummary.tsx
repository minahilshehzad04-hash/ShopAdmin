import type { Customer } from "@/types/customer";
export function CustomerSummary({ customer }: { customer: Customer }) { return <div className="panel"><div className="row-name"><i className="avatar">{customer.name[0]}</i><b>{customer.name}</b></div><p className="subtitle">{customer.email}</p><p className="subtitle">{customer.phone || "No phone number"}</p></div>; }
