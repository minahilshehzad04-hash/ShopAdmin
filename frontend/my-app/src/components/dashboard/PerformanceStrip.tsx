import { Activity, Clock3, Repeat2, ShoppingBag } from "lucide-react";

export function PerformanceStrip() {
  return <section className="performance-strip"><div><i><ShoppingBag size={17} />
  </i><span>Average Order Value</span><strong>$68.02</strong><b>↑ 14.6%</b></div><div><i><Activity size={17} />
  </i><span>Conversion Rate</span><strong>2.45%</strong><b>↑ 8.2%</b></div>
    <div><i><Repeat2 size={17} /></i><span>Return Rate</span><strong>1.32%</strong><b className="danger-text">↓ 2.1%</b></div><div><i><Activity size={17} /></i><span>Customer Growth</span>
      <strong>18.6%</strong><b>↑ 12.4%</b></div><div><i><Clock3 size={17} /></i>
      <span>Repeat Customers</span><strong>65.3%</strong><b>↑ 9.8%</b>
    </div></section>;
}