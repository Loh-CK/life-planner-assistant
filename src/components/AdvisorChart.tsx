import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ChartSpec } from "@/lib/advisorChart";

const PALETTE = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export const AdvisorChart = ({ spec }: { spec: ChartSpec }) => {
  return (
    <div className="my-2 rounded-md border bg-background p-2">
      {spec.title && <p className="mb-1 text-sm font-medium">{spec.title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        {spec.type === "pie" ? (
          <PieChart>
            <Pie data={spec.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {spec.data.map((entry, i) => (
                <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={spec.data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {spec.data.map((entry, i) => (
                <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
