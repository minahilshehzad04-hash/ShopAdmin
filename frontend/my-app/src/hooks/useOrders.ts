"use client";
import { useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import type { Order } from "@/types/order";
import type { OrderQuery } from "@/services/orderService";
export function useOrders(query: OrderQuery = {}) { const [data, setData] = useState<Order[]>([]); const [total, setTotal] = useState(0); const [pages, setPages] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); useEffect(() => { setLoading(true); orderService.list(query).then((result) => { setData(result.items); setTotal(result.total); setPages(result.pages); }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)); }, [query.page, query.limit, query.search, query.status, query.start_date, query.end_date]); return { data, total, pages, loading, error, setData }; }
