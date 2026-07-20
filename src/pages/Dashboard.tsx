import { useState, useEffect } from "react";
import { KpiCard } from "@/components/KpiCard";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon, Calendar, CheckCircle, Clock, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlannerItems } from "@/hooks/usePlannerItems";

interface Event {
  id: string;
  title: string;
  item_date: string;
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

  const {
    items: expenses,
    loading: expensesLoading,
    error: expensesError,
    addItem: addExpense,
  } = usePlannerItems("expense");

  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [intention, setIntention] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lifePlannerData") ?? "{}") as any;
    setFocusSessions(data.focusSessions ?? []);
    setIntention(data.intention ?? '');
    try {
      const settings = JSON.parse(localStorage.getItem("lifePlannerSettings") ?? "{}");
      setDisplayName(settings?.preferences?.displayName ?? "");
    } catch {
      setDisplayName("");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "lifePlannerData",
      JSON.stringify({ events, tasks, focusSessions, intention })
    );
  }, [events, tasks, focusSessions, intention]);

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

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

  const todaysTasks = tasks.filter((t) => t.item_date === today);
  const completedToday = todaysTasks.filter((t) => t.completed).length;
  const totalToday = todaysTasks.length;

  const todaysAgenda = [
    ...events.filter((e) => e.item_date === today),
    ...tasks.filter((t) => t.item_date === today),
  ].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  // Compute this month's spending from expenses
  const monthStart = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-01`;
  const monthEnd = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-31`;
  const thisMonthSpending = expenses
    .filter(
      (e) =>
        e.transaction_type === "expense" &&
        e.item_date >= monthStart &&
        e.item_date <= monthEnd
    )
    .reduce((sum, e) => sum + e.amount, 0);

  if (eventsLoading || tasksLoading || expensesLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading dashboard…</span>
      </div>
    );
  }

  if (eventsError || tasksError || expensesError) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-destructive">
          {eventsError ?? tasksError ?? expensesError ?? "Error loading data"}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>
        {nextItem ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{nextItem.title}</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              {nextItem.item_type === "event" ? (
                <CalendarIcon className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              <span>{nextItem.item_type === "event" ? "Event" : "Task"}</span>
            </Badge>
            <span className="text-muted-foreground">
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
          </div>
        ) : (
          <span className="text-muted-foreground">
            Nothing on the horizon — enjoy the calm, or plan something!
          </span>
        )}
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDays.map((d) => {
          const dStr = d.toISOString().split("T")[0];
          const isToday = dStr === today;
          return (
            <div
              key={dStr}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 min-w-[3.5rem] border transition-colors ${
                isToday
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-muted/50"
              }`}
            >
              <span className="text-xs opacity-80">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="font-semibold">{d.getDate()}</span>
              <Badge variant={isToday ? "outline" : "secondary"} className={isToday ? "border-primary-foreground/40 text-primary-foreground" : ""}>
                {countForDay(d)}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Today's Events" value={events.filter(e => e.item_date === today).length} icon={<CalendarIcon />} />
        <KpiCard title="Open Tasks" value={tasks.filter(t => !t.completed).length} icon={<ListCheckIcon />} />
        <KpiCard title="This Month's Spending" value={`$${thisMonthSpending}`} icon={<DollarSignIcon />} />
        <KpiCard title="Focus Sessions Today" value={focusSessions.filter(f => f.date === today).length} icon={<TimerIcon />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysAgenda.length ? (
                <ul className="space-y-2">
                  {todaysAgenda.map(item => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-3 bg-muted/40 hover:bg-muted/70 rounded-md transition-colors"
                    >
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${item.item_type === "task" && item.completed ? "line-through text-muted-foreground" : ""}`}>
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.item_type === "event"
                            ? item.start_time
                              ? `${item.start_time} – ${item.end_time}`
                              : "No time set"
                            : item.start_time
                              ? `Due at ${item.start_time}`
                              : "No time set"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                        {item.item_type === "event" ? (
                          <CalendarIcon className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        <span>{item.item_type === "event" ? "Event" : "Task"}</span>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Nothing scheduled for today.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                      <li key={t.id} className="flex items-center justify-between gap-2 p-3 bg-muted/40 hover:bg-muted/70 rounded-md transition-colors">
                        <span className="font-medium truncate">{t.title}</span>
                        <Badge
                          variant={t.priority === "high" ? "destructive" : t.priority === "medium" ? "secondary" : "outline"}
                          className="shrink-0 capitalize"
                        >
                          {t.priority}
                        </Badge>
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Daily Intention</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Write one sentence for today"
                value={intention}
                onChange={e => setIntention(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

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
