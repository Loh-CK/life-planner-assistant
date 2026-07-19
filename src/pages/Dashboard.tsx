import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon, Calendar, CheckCircle, AlertCircle, Clock, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Event {
  id: string;
  title: string;
  item_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  category: string;
  location: string;
  item_type: "event";
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
  item_type: "task";
}

const Dashboard = () => {
  const {
    items: events,
    loading: eventsLoading,
    error: eventsError,
    addItem: addEvent,
  } = usePlannerItems("event");

  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
    addItem: addTask,
  } = usePlannerItems("task");

  const { email } = useCurrentUser();

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

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Greeting
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  // Next Up
  const upcoming = [...events, ...tasks]
    .map((e) => {
      const dt = e.start_time
        ? new Date(`${e.item_date}T${e.start_time}`)
        : null;
      return { ...e, datetime: dt };
    })
    .filter((e) => e.datetime && e.datetime >= now)
    .sort((a, b) => a.datetime!.getTime() - b.datetime!.getTime());

  const formatCountdown = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours < 24) {
      return `in ${diffHours}h ${diffMinutes}m`;
    }
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `in ${diffDays}d`;
  };

  const nextItem = upcoming[0];

  // Weekly overview
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const countForDay = (date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    const ev = events.filter((e) => e.item_date === dStr).length;
    const tk = tasks.filter((t) => t.item_date === dStr).length;
    return ev + tk;
  };

  // Today's tasks completion
  const todaysTasks = tasks.filter((t) => t.item_date === today);
  const completedToday = todays...import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon, Calendar, CheckCircle, AlertCircle, Clock, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Event {
  id: string;
  title: string;
  item_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  category: string;
  location: string;
  item_type: "event";
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
  item_type: "task";
}

const Dashboard = () => {
  const {
    items: events,
    loading: eventsLoading,
    error: eventsError,
    addItem: addEvent,
  } = usePlannerItems("event");

  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
    addItem: addTask,
  } = usePlannerItems("task");

  const { email } = useCurrentUser();

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

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Greeting
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  // Next Up
  const upcoming = [...events, ...tasks]
    .map((e) => {
      const dt = e.start_time
        ? new Date(`${e.item_date}T${e.start_time}`)
        : null;
      return { ...e, datetime: dt };
    })
    .filter((e) => e.datetime && e.datetime >= now)
    .sort((a, b) => a.datetime!.getTime() - b.datetime!.getTime());

  const formatCountdown = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours < 24) {
      return `in ${diffHours}h ${diffMinutes}m`;
    }
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `in ${diffDays}d`;
  };

  const nextItem = upcoming[0];

  // Weekly overview
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const countForDay = (date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    const ev = events.filter((e) => e.item_date === dStr).length;
    const tk = tasks.filter((t) => t.item_date === dStr).length;
    return ev + tk;
  };

  // Today's tasks completion
  const todaysTasks = tasks.filter((t) => t.item_date === today);
  const completedToday = todaysTasks.filter((t) => t.completed).length;
  const totalToday = todaysTasks.length;

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
      {/* Greeting */}
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-semibold">{greeting}</h2>
      </div>

      {/* Next Up */}
      <Card className="flex items-center p-4">
        <Clock className="h-6 w-6 mr-2 text-primary" />
        {nextItem ? (
          <>
            <span className="font-medium">{nextItem.title}</span>
            <Badge variant="secondary" className="ml-2 flex items-center space-x-1">
              {nextItem.item_type === "event" ? (
                <CalendarIcon className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              <span>{nextItem.item_type === "event" ? "Event" : "Task"}</span>
            </Badge>
            <span className="ml-2 text-muted-foreground">
              {nextItem.datetime!.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {nextItem.datetime!.toISOString().split("T")[0] === today
                ? ` at ${nextItem.datetime!.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ` (${formatCountdown(nextItem.datetime!)})`}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Nothing on the horizon — enjoy the calm, or plan something!
          </span>
        )}
      </Card>

      {/* Weekly Overview */}
      <div className="flex space-x-2 overflow-x-auto">
        {weekDays.map((d) => {
          const dStr = d.toISOString().split("T")[0];
          const isToday = dStr === today;
          return (
            <div
              key={dStr}
              className={`flex flex-col items-center p-2 rounded ${
                isToday ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              <span className="text-xs">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="font-medium">{d.getDate()}</span>
              <Badge variant="secondary" className="mt-1">
                {countForDay(d)}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Today's Events" value={events.filter(e => e.item_date === today).length} icon={<CalendarIcon />} />
        <KpiCard title="Open Tasks" value={tasks.filter(t => !t.completed).length} icon={<ListCheckIcon />} />
        <KpiCard title="This Month's Spending" value={`$${expenses.reduce((sum, e) => sum + e.amount, 0)}`} icon={<DollarSignIcon />} />
        <KpiCard title="Focus Sessions Today" value={focusSessions.filter(f => f.date === today).length} icon={<TimerIcon />} />
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
              {events.filter(e => e.item_date === today).length ? (
                <ul className="space-y-2">
                  {events
                    .filter(e => e.item_date === today)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map(e => (
                      <li key={e.id} className="p-2 bg-card rounded">
                        <strong>{e.title}</strong> <br/>
                        {e.start_time} – {e.end_time}
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>No events scheduled for today.</span>
                </div>
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
              {tasks.filter(t => !t.completed).length ? (
                <ul className="space-y-2">
                  {tasks
                    .filter(t => !t.completed)
                    .sort((a, b) => {
                      const order = { high: 1, medium: 2, low: 3 };
                      return order[a.priority] - order[b.priority];
                    })
                    .map(t => (
                      <li key={t.id} className="p-2 bg-card rounded">
                        <strong>{t.title}</strong> (Priority {t.priority})
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5" />
                  <span>No pending tasks.</span>
                </div>
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

      {/* Today's Tasks Completion */}
      {totalToday > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Today's Tasks Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              {completedToday} of {totalToday} tasks done today
            </p>
            <Progress value={(completedToday / totalToday) * 100} />
          </CardContent>
        </Card>
      )}

      {/* Quick Add Floating Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-8 right-8 rounded-full h-16 w-16 flex items-center justify-center shadow-lg"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
            <DialogDescription>Select type and fill in details.</DialogDescription>
          </DialogHeader>
          <QuickAddForm addEvent={addEvent} addTask={addTask} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const QuickAddForm = ({
  addEvent,
  addTask,
}: {
  addEvent: (data: any) => Promise<void>;
  addTask: (data: any) => Promise<void>;
}) => {
  const [type, setType] = useState<"event" | "task">("event");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      item_date: date || null,
      start_time: time || null,
      end_time: type === "event" ? (time || null) : null,
      category: "",
      location: "",
      description: "",
      completed: false,
      item_type: type,
    };
    if (type === "event") {
      await addEvent(payload);
    } else {
      await addTask(payload);
    }
    setTitle("");
    setDate("");
    setTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={type === "event" ? "default" : "outline"}
          onClick={() => setType("event")}
        >
          Event
        </Button>
        <Button
          type="button"
          variant={type === "task" ? "default" : "outline"}
          onClick={() => setType("task")}
        >
          Task
        </Button>
      </div>
      <Input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <Input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />
      <Input
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
      />
      <DialogFooter>
        <Button type="submit">Add</Button>
      </DialogFooter>
    </form>
  );
};

export default Dashboard;