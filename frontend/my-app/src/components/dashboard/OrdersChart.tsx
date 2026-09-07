import Link from "next/link";

export function OrdersChart({ orders }: { orders: { status: string; count: number }[] }) {
	const statuses = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];
	const colors = ["#5434e7", "#1980eb", "#ef3d46", "#f59a08", "#22b96a"];
	const counts = statuses.map((status) => orders.find((order) => order.status.toLowerCase() === status.toLowerCase())?.count || 0);
	const total = counts.reduce((sum, count) => sum + count, 0);
	let offset = 0;
	const gradient = total
		? counts.map((count, index) => {
			const start = (offset / total) * 100;
			offset += count;
			return `${colors[index]} ${start}% ${(offset / total) * 100}%`;
		}).join(", ")
		: "#e8ebf2 0% 100%";

	return <article className="panel orders-panel"><div className="panel-heading">
		<h2>Orders overview</h2>
		<Link href="/orders" className="panel-view-all">View details</Link>
	</div><div className="donut-wrap">
			<div className="donut" style={{ background: `radial-gradient(circle, #fff 0 53px, transparent 54px), conic-gradient(${gradient})` }}>
				<strong>{total.toLocaleString()}</strong><small>Total orders</small>
			</div>
			<div className="legend">{statuses.map((status, index) => {
				const percentage = total > 0 ? ((counts[index] / total) * 100).toFixed(1) : "0.0";
				return (
					<div key={status}>
						<i className={`dot dot-${index}`} />
						<span>{status}</span>
						<span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
							<b>{counts[index]}</b>
							<small style={{ color: '#888' }}>({percentage}%)</small>
						</span>
					</div>
				);
			})}
			</div>
		</div>
	</article>;
}
