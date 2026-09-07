"use client";
import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import type { ProductQuery } from "@/services/productService";
export function useProducts(query: ProductQuery = {}) { const [data, setData] = useState<Product[]>([]); const [total, setTotal] = useState(0); const [pages, setPages] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); useEffect(() => { setLoading(true); productService.list(query).then((result) => { setData(result.items); setTotal(result.total); setPages(result.pages); }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)); }, [query.page, query.limit, query.search, query.category_id, query.status, query.stock, query.sort]); return { data, total, pages, loading, error, setData }; }
