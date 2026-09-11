"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Search, X } from "lucide-react";
import { API_URL } from "@/lib/api";

interface SearchResult {
  type: "product" | "order" | "customer";
  id: number;
  label: string;
  sub: string;
  href: string;
}

async function globalSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return [];
  const base = `${API_URL}/api`;
  const results: SearchResult[] = [];

  try {
    const [prodRes, ordRes, custRes] = await Promise.allSettled([
      fetch(`${base}/products/?search=${encodeURIComponent(q)}&limit=4`).then((r) => r.json()),
      fetch(`${base}/orders/?search=${encodeURIComponent(q)}&limit=4`).then((r) => r.json()),
      fetch(`${base}/customers/?search=${encodeURIComponent(q)}&limit=4`).then((r) => r.json()),
    ]);

    if (prodRes.status === "fulfilled") {
      const items = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value.items ?? [];
      for (const p of items) {
        results.push({ type: "product", id: p.id, label: p.name, sub: `SKU: ${p.sku ?? "—"} · $${p.price}`, href: "/products" });
      }
    }
    if (ordRes.status === "fulfilled") {
      const items = Array.isArray(ordRes.value) ? ordRes.value : ordRes.value.items ?? [];
      for (const o of items) {
        results.push({ type: "order", id: o.id, label: `Order #${o.id}`, sub: `${o.status} · $${o.total ?? "—"}`, href: "/orders" });
      }
    }
    if (custRes.status === "fulfilled") {
      const items = Array.isArray(custRes.value) ? custRes.value : custRes.value.items ?? [];
      for (const c of items) {
        results.push({ type: "customer", id: c.id, label: c.name, sub: c.email ?? "Customer", href: "/customers" });
      }
    }
  } catch {
    // silently fail
  }
  return results;
}

const TYPE_ICON: Record<string, string> = {
  product: "📦",
  order: "🛒",
  customer: "👤",
};

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Theme init ─────────────────────────── */
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("shopadmin-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  /* ── Ctrl+K shortcut ────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
      if (e.key === "Escape") {
        setShowDropdown(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Close on outside click ─────────────── */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* ── Debounced search ───────────────────── */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await globalSearch(query);
      setResults(res);
      setSearching(false);
    }, 350);
  }, [query]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("shopadmin-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function handleSelect(result: SearchResult) {
    setShowDropdown(false);
    setQuery("");
    router.push(result.href);
  }

  return (
    <header className="topbar">
      {/* ── Global Search ── */}
      <div className="search-wrap" ref={dropdownRef}>
        <div className={`search ${showDropdown ? "search-active" : ""}`}>
          <Search size={15} className="search-icon" />
          <input
            ref={inputRef}
            id="global-search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search products, orders, customers…"
            autoComplete="off"
          />
          {query ? (
            <button
              className="search-clear"
              onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd>Ctrl K</kbd>
          )}
        </div>

        {/* ── Dropdown ── */}
        {showDropdown && query.trim() && (
          <div className="search-dropdown">
            {searching && <p className="search-state">Searching…</p>}
            {!searching && results.length === 0 && (
              <p className="search-state">No results for &ldquo;{query}&rdquo;</p>
            )}
            {!searching && results.length > 0 && (
              <ul className="search-results">
                {results.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <button className="search-result-item" onClick={() => handleSelect(r)}>
                      <span className="search-result-icon">{TYPE_ICON[r.type]}</span>
                      <span className="search-result-meta">
                        <span className="search-result-label">{r.label}</span>
                        <span className="search-result-sub">{r.sub}</span>
                      </span>
                      <span className={`search-result-badge search-badge-${r.type}`}>{r.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="top-actions">
        <button
          className={`top-action-btn theme-toggle-btn ${theme === "dark" ? "active-dark" : ""}`}
          aria-label="Toggle dark/light theme"
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark theme"}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={19} className="theme-icon sun-icon" />
            ) : (
              <Moon size={19} className="theme-icon moon-icon" />
            )
          ) : (
            <Moon size={19} className="theme-icon moon-icon" />
          )}
        </button>

        <div className="profile">
          <span className="avatar">A</span>
          <span>
            <b>Admin</b>
            <small>Super Admin</small>
          </span>
          <span>⌄</span>
        </div>
      </div>
    </header>
  );
}
