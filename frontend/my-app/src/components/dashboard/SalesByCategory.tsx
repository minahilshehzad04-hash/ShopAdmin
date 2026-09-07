import Link from "next/link";

const PALETTE = [
  { bar: "#5b4bdf", bg: "#edeaff", icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" },  // purple – Electronics
  { bar: "#1880e7", bg: "#e3f0ff", icon: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" },            // blue – Accessories
  { bar: "#20bd65", bg: "#e5faf0", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" }, // green – Audio
  { bar: "#ee9b0c", bg: "#fff7e2", icon: "M9 3h6l2 3H7L9 3zM3 6h18v4H3V6zm0 5h18v10H3V11zm6 2v6h6v-6H9z" },                                                        // amber – Computers
  { bar: "#ef4444", bg: "#ffe9e9", icon: "M12 2a7 7 0 0 1 7 7c0 4.25-4.5 10.5-7 13.5-2.5-3-7-9.25-7-13.5a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" }, // red – Others
  { bar: "#2592ae", bg: "#e2f5fb", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },                            // teal – extra
  { bar: "#8b5cf6", bg: "#f0ebff", icon: "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm3 1v2h10V6H7zm0 5v2h10v-2H7zm0 5v2h6v-2H7z" },  // violet – extra
  { bar: "#f97316", bg: "#fff3eb", icon: "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" },                                                                // orange – extra
];

function CategoryIcon({ d, bg, color }: { d: string; bg: string; color: string }) {
  return (
    <span className="cat-icon-badge" style={{ background: bg }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ color }}>
        <path d={d} />
      </svg>
    </span>
  );
}

export function SalesByCategory({ items }: { items: { name: string; total: number }[] }) {
  const top5 = items.slice(0, 5);
  const maximum = Math.max(...top5.map((item) => item.total), 1);

  return (
    <article className="panel category-panel">
      <div className="panel-heading">
        <h2>Sales by category</h2>
        <Link href="/categories" className="panel-view-all">View All</Link>
      </div>

      <div className="cat-list">
        {top5.map((item, i) => {
          const palette = PALETTE[i % PALETTE.length];
          const pct = (item.total / maximum) * 90;
          return (
            <div className="cat-item" key={item.name}>
              <CategoryIcon d={palette.icon} bg={palette.bg} color={palette.bar} />
              <div className="cat-meta">
                <span className="cat-name">{item.name}</span>
                <div className="cat-bar-track">
                  <span
                    className="cat-bar-fill"
                    style={{ width: `${pct}%`, background: palette.bar }}
                  />
                </div>
              </div>
              <span className="cat-amount">
                ${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
