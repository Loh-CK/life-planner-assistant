import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePlannerItems } from "@/hooks/usePlannerItems";

interface Event {
  id: string;
  title: string;
  item_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  category: string;
  location: string;
}

interface Task {
  id: string;
  title: string;
  item_date: string;
  start_time: string;
  end_time: string;
  category: string;
  description: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const Dashboard = () => {
  const {
    items: events,
    loading: eventsLoading,
    error: eventsError,
  } = usePlannerItems("event");

  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
  } = usePlannerItems("task");

  const [expenses, setExpenses] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [intention, setIntention] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lifePlannerData") ?? "{}") as any;
    setExpenses(data.expenses ?? []);
    setFocusSessions(data.focusSessions ?? []);
    setIntention(data.intention ?? '');
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem(
      "lifePlannerData",
      JSON.stringify({ events, tasks, expenses, focusSessions, intention })
    );
  }, [events, tasks, expenses, focusSessions, intention]);

  const today = new Date().toISOString().split("T")[0];
  const kpis = {
    events: events.filter(e => e.item_date === today).length,
    tasks: tasks.filter(t => !t.completed).length,
    spending: expenses.reduce((sum, e) => sum + e.amount, 0),
    focus: focusSessions.filter(f => f.date === today).length,
  };

  const todaysEvents = events
    .filter(e => e.item_date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const priorityTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (eventsLoading || tasksLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading dashboard…</span>
      </div>
    );
  }

  if (eventsError || tasksError) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-destructive">
          {eventsError?.message ?? tasksError?.message ?? "Error loading data"}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Today's Events" value={kpis.events} icon={<CalendarIcon />} />
        <KpiCard title="Open Tasks" value={kpis.tasks} icon={<ListCheckIcon />} />
        <KpiCard title="This Month's Spending" value={`$${kpis.spending}`} icon={<DollarSignIcon />} />
        <KpiCard title="Focus Sessions Today" value={kpis.focus} icon={<TimerIcon />} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysEvents.length ? (
                <ul className="space-y-2">
                  {todaysEvents.map(e => (
                    <li key={e.id} className="p-2 bg-card rounded">
                      <strong>{e.title}</strong> <br/>
                      {e.start_time} – {e.end_time}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events scheduled for today.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Priority Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {priorityTasks.length ? (
                <ul className="space-y-2">
                  {priorityTasks.map(t => (
                    <li key={t.id} className="p-2 bg-card rounded">
                      <strong>{t.title}</strong> (Priority {t.priority})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pending tasks.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Intention */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Daily Intention</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="Write one sentence for today"
                className="w-full p-2 border rounded"
                value={intention}
                onChange={e => setIntention(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;