"use client";
import { useEffect, useState } from "react";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";
export function useCustomers(search = "") { const [data, setData] = useState<Customer[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); useEffect(() => { setLoading(true); customerService.list(search).then(setData).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)); }, [search]); return { data, loading, error, setData }; }
