import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon } from "lucide-react";

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    events: 0,
    tasks: 0,
    spending: 0,
    focus: 0,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("lifePlannerData") ?? "{}") as any;
    setKpis({
      events: stored.events?.length ?? 0,
      tasks: stored.tasks?.filter((t: any) => !t.completed).length ?? 0,
      spending: stored.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) ?? 0,
      focus: stored.focusSessions?.filter((s: any) => s.date === new Date().toDateString()).length ?? 0,
    });
  }, []);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Today's Events" value={kpis.events} icon={<CalendarIcon />} />
        <KpiCard title="Open Tasks" value={kpis.tasks} icon={<ListCheckIcon />} />
        <KpiCard title="This Month's Spending" value={`$${kpis.spending}`} icon={<DollarSignIcon />} />
        <KpiCard title="Focus Sessions Today" value={kpis.focus} icon={<TimerIcon />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="bg-card rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">Today's Schedule</h3>
            {/* Placeholder for schedule */}
            <p>No events scheduled.</p>
          </div>
        </div>
        <div>
          <div className="bg-card rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">Priority Tasks</h3>
            {/* Placeholder for tasks */}
            <p>No tasks.</p>
          </div>
        </div>
        <div>
          <div className="bg-card rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">Daily Intention</h3>
            <input type="text" placeholder="Write one sentence for today" className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
