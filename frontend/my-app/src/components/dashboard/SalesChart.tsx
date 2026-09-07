export function SalesChart({ sales, period, onPeriodChange }: { sales: { date: string; total: number }[]; period: number; onPeriodChange: (days: number) => void }) {
	const maximum = Math.max(...sales.map((item) => item.total), 1);
	// Smooth out the line if possible, or just keep the lines. Let's add fill under it.
	const path = sales.length > 1 ? sales.map((item, index) => `${index ? "L" : "M"}${(index / (sales.length - 1)) * 600} ${180 - (item.total / maximum) * 160}`).join(" ") : "M0 180 L600 180";
	
	// Create a filled path for the area under the line
	const areaPath = `${path} L600 190 L0 190 Z`;
	
	// Determine which dates to show on x-axis (e.g., 5 evenly spaced dates)
	const numLabels = Math.min(sales.length, 5);
	const xAxisDates = [];
	if (sales.length > 0) {
		for (let i = 0; i < numLabels; i++) {
			const index = Math.floor(i * (sales.length - 1) / Math.max(numLabels - 1, 1));
			xAxisDates.push(sales[index].date);
		}
	}

	return (
		<article className="panel sales-panel">
			<div className="panel-heading">
				<h2>Sales overview</h2>
				<select value={period} onChange={(event) => onPeriodChange(Number(event.target.value))}>
					<option value="7">Last 7 days</option>
					<option value="30">Last 30 days</option>
					<option value="90">Last 3 months</option>
					<option value="365">Last 12 months</option>
				</select>
			</div>
			<div className="chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
				<div className="chart" style={{ flexGrow: 1, position: 'relative' }}>
					<div className="y-axis">
						<span>${maximum.toLocaleString()}</span>
						<span>${(maximum * .75).toLocaleString()}</span>
						<span>${(maximum * .5).toLocaleString()}</span>
						<span>${(maximum * .25).toLocaleString()}</span>
						<span>$0</span>
					</div>
					<svg viewBox="0 0 600 190" preserveAspectRatio="none" aria-label="Sales trend">
						<defs>
							<linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="rgba(91, 75, 223, 0.2)" />
								<stop offset="100%" stopColor="rgba(91, 75, 223, 0)" />
							</linearGradient>
						</defs>
						<path d={areaPath} fill="url(#gradient-fill)" />
						<path d={path} fill="none" stroke="#5b4bdf" strokeWidth="3" />
					</svg>
				</div>
				<div className="x-axis" style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '40px', marginTop: '10px', fontSize: '12px', color: '#666' }}>
					{xAxisDates.map((date, index) => (
						<span key={index}>{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
					))}
				</div>
			</div>
		</article>
	);
}
