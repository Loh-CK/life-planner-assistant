import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Types for stored data
interface Event { id: string; title: string; start: string; end: string; }
interface Task { id: string; title: string; priority: number; completed: boolean; }
interface Expense { id: string; amount: number; description: string; }
interface FocusSession { id: string; date: string; duration: number; }

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [intention, setIntention] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lifePlannerData") ?? "{}") as any;
    setEvents(data.events ?? []);
    setTasks(data.tasks ?? []);
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

  const today = new Date().toLocaleDateString();
  const kpis = {
    events: events.filter(e => new Date(e.start).toLocaleDateString() === today).length,
    tasks: tasks.filter(t => !t.completed).length,
    spending: expenses.reduce((sum, e) => sum + e.amount, 0),
    focus: focusSessions.filter(f => f.date === today).length,
  };

  const todaysEvents = events.filter(e => new Date(e.start).toLocaleDateString() === today);
  const priorityTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.priority - b.priority);

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
                      {new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(e.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
