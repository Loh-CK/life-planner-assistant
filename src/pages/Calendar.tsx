import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { localDateString } from "@/lib/date";

interface Event {
  id: string;
  title: string;
  item_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  category: string;
  location: string;
  completed: boolean;
}

const DAY_START = 6;
const DAY_END = 23;
const HOUR_HEIGHT = 60;

const Calendar = () => {
  const {
    items: events,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
  } = usePlannerItems("event");

  const { items: tasks, loading: tasksLoading, error: tasksError } = usePlannerItems("task");

  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - day);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    title: "",
    item_date: "",
    start_time: "",
    end_time: "",
    category: "",
    location: "",
  });

  const formatDate = (y: number, m: number, d: number) => {
    const mm = (m + 1).toString().padStart(2, "0");
    const dd = d.toString().padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const eventsForDate = (date: string) => events.filter((e) => e.item_date === date);
  const tasksForDate = (date: string) => tasks.filter((t) => t.item_date === date);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      item_date: form.item_date || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      category: form.category,
      location: form.location,
      completed: false,
      item_type: "event",
    };
    if (editingEvent) {
      await updateItem(editingEvent.id, { ...payload, completed: editingEvent.completed });
    } else {
      await addItem(payload);
    }
    setShowModal(false);
    setEditingEvent(null);
    setForm({
      title: "",
      item_date: "",
      start_time: "",
      end_time: "",
      category: "",
      location: "",
    });
  };

  const openAddModal = (dateStr?: string, start?: string, end?: string) => {
    setEditingEvent(null);
    setForm({
      title: "",
      item_date: dateStr ?? "",
      start_time: start ?? "",
      end_time: end ?? "",
      category: "",
      location: "",
    });
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      item_date: event.item_date,
      start_time: event.start_time,
      end_time: event.end_time,
      category: event.category,
      location: event.location,
    });
    setShowModal(true);
  };

  const deleteEvent = (id: string) => {
    deleteItem(id);
  };

  const today = localDateString();
  const isToday = selectedDate === today;
  const currentTimeOffset = isToday
    ? (new Date().getHours() * 60 + new Date().getMinutes() - DAY_START * 60) * (HOUR_HEIGHT / 60)
    : null;

  const containerHeight = (DAY_END - DAY_START + 1) * HOUR_HEIGHT;

  const monthWeeks: (number | null)[][] = [];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;

  let day = 1;
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if (w === 0 && d < startWeekday) {
        week.push(prevMonthDays - (startWeekday - d - 1));
      } else if (day > daysInMonth) {
        week.push(day - daysInMonth);
        day++;
      } else {
        week.push(day);
        day++;
      }
    }
    monthWeeks.push(week);
  }

  const handleMonthPrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleMonthNext = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleMonthToday = () => setCurrentMonth(new Date());

  const handleDayClick = (date: Date, isCurrentMonth: boolean) => {
    const dateStr = formatDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    if (!isCurrentMonth) setCurrentMonth(date);
    setSelectedDate(dateStr);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleWeekPrev = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };
  const handleWeekNext = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };
  const handleWeekToday = () => {
    const d = new Date();
    const dayIdx = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayIdx);
    setCurrentWeekStart(d);
  };

  const weekLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${currentWeekStart.toLocaleDateString("default", opts)} – ${end.toLocaleDateString(
      "default",
      opts,
    )}, ${end.getFullYear()}`;
  };

  const categoryColors: Record<string, string> = {
    work: "bg-primary",
    personal: "bg-secondary",
    health: "bg-green-400",
  };

  if (loading || tasksLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading events…</span>
      </div>
    );
  }

  if (error || tasksError) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-destructive">{error ?? tasksError}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 flex flex-col">
        {/* Month / Week toggle */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <div className="inline-flex rounded-md border p-0.5">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              className="rounded-sm"
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-sm"
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
          </div>
        </div>

        {viewMode === "month" && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={handleMonthPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {year}
            </h2>
            <Button variant="outline" size="sm" onClick={handleMonthToday}>
              <CalendarIcon className="h-4 w-4 mr-1" /> Today
            </Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={handleMonthNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        )}

        {viewMode === "month" ? (
          <>
            <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Event
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-blue-500 bg-blue-500/10" /> Task
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthWeeks.flat().map((_, idx) => {
                const weekIndex = Math.floor(idx / 7);
                const dayIndex = idx % 7;
                const offset = weekIndex * 7 + dayIndex - startWeekday;
                const date = new Date(year, month, 1 + offset);
                const dateStr = formatDate(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                );
                const isCurrentMonth = date.getMonth() === month;
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayEvents = eventsForDate(dateStr);
                const dayTasks = tasksForDate(dateStr);
                const dayEntries = [
                  ...dayEvents.map((e) => ({
                    id: `event-${e.id}`,
                    title: e.title,
                    time: e.start_time,
                    type: "event" as const,
                    category: e.category,
                    completed: false,
                  })),
                  ...dayTasks.map((t) => ({
                    id: `task-${t.id}`,
                    title: t.title,
                    time: t.start_time,
                    type: "task" as const,
                    category: t.category,
                    completed: t.completed,
                  })),
                ];
                return (
                  <div
                    key={idx}
                    className={`min-h-[5.5rem] p-2 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground border-primary"
                        : isCurrentMonth
                          ? "hover:bg-accent hover:text-accent-foreground"
                          : "text-muted-foreground/40 bg-muted/20 hover:bg-muted/30"
                    }`}
                    onClick={() => handleDayClick(date, isCurrentMonth)}
                  >
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : isSelected
                              ? "ring-2 ring-primary ring-inset"
                              : ""
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    {dayEntries.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayEntries.slice(0, 3).map((entry) => (
                          <div
                            key={entry.id}
                            className={`truncate rounded px-1 py-0.5 text-xs ${
                              entry.type === "event"
                                ? `text-white ${categoryColors[entry.category] ?? "bg-primary"}`
                                : `border ${entry.completed ? "border-muted-foreground/40 text-muted-foreground line-through" : "border-blue-500 text-blue-700 bg-blue-500/10"}`
                            }`}
                            title={`${entry.type === "event" ? "Event" : "Task"}: ${entry.title}`}
                          >
                            {entry.time ? `${entry.time} ` : ""}
                            {entry.title}
                          </div>
                        ))}
                        {dayEntries.length > 3 && (
                          <div className="px-1 text-xs text-muted-foreground">
                            +{dayEntries.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" aria-label="Previous week" onClick={handleWeekPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">{weekLabel()}</h2>
                <Button variant="outline" size="sm" onClick={handleWeekToday}>
                  <CalendarIcon className="h-4 w-4 mr-1" /> Today
                </Button>
              </div>
              <Button variant="ghost" size="icon" aria-label="Next week" onClick={handleWeekNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b mb-1">
              <div />
              {weekDays.map((d) => {
                const dateStr = formatDate(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate(),
                );
                const isToday = dateStr === today;
                return (
                  <div key={dateStr} className="text-center pb-2">
                    <div className="text-xs text-muted-foreground">
                      {d.toLocaleDateString("default", { weekday: "short" })}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                        isToday ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="flex-1 overflow-y-auto relative"
              style={{ height: `${containerHeight}px` }}
            >
              <div className="grid grid-cols-[60px_repeat(7,1fr)] absolute inset-0">
                {/* Hour labels column */}
                <div className="relative">
                  {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground text-right pr-2 border-t"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                      {(DAY_START + i).toString().padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDays.map((d) => {
                  const dateStr = formatDate(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate(),
                  );
                  const dayEvents = eventsForDate(dateStr);
                  return (
                    <div key={dateStr} className="relative border-l">
                      {Array.from(
                        { length: DAY_END - DAY_START + 1 },
                        (_, i) => {
                          const hour = DAY_START + i;
                          return (
                            <div
                              key={i}
                              className="border-t cursor-pointer group"
                              style={{ height: `${HOUR_HEIGHT}px` }}
                              onClick={() =>
                                openAddModal(
                                  dateStr,
                                  `${hour.toString().padStart(2, "0")}:00`,
                                  `${(hour + 1).toString().padStart(2, "0")}:00`,
                                )
                              }
                            >
                              <div className="h-full w-full flex items-center justify-center text-transparent group-hover:text-muted-foreground group-hover:bg-muted/30 transition-colors text-xs">
                                +
                              </div>
                            </div>
                          );
                        },
                      )}
                      {dayEvents.map((e) => {
                        // Guard against missing start_time or end_time
                        if (!e.start_time || !e.end_time) {
                          return null;
                        }
                        const [sh, sm] = e.start_time.split(":").map(Number);
                        const [eh, em] = e.end_time.split(":").map(Number);
                        const top = sh * 60 + sm - DAY_START * 60;
                        const height = Math.max(
                          eh * 60 + em - (sh * 60 + sm),
                          20,
                        );
                        const bg = categoryColors[e.category] ?? "bg-primary";
                        return (
                          <div
                            key={e.id}
                            className={`absolute left-1 right-1 rounded-md p-1 text-white text-xs overflow-hidden ${bg}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedDate(dateStr);
                              openEditModal(e);
                            }}
                          >
                            <div className="font-medium truncate">
                              {e.title}
                            </div>
                            <div className="opacity-90">
                              {e.start_time}–{e.end_time}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-80 p-4 border-l hidden md:block">
        <h3 className="text-lg font-semibold mb-2">Events</h3>
        {selectedDate ? (
          <>
            <div>
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                <span className="h-2 w-2 rounded-sm bg-primary" /> Events
              </h4>
              {eventsForDate(selectedDate).length ? (
                <ul className="space-y-2">
                  {eventsForDate(selectedDate).map((e) => (
                    <li key={e.id} className="p-2 bg-card rounded">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {e.start_time}–{e.end_time} | {e.category} | {e.location}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No events for this day.</p>
              )}
            </div>
            <div className="mt-4">
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                <span className="h-2 w-2 rounded-sm border border-blue-500 bg-blue-500/10" /> Tasks Due
              </h4>
              {tasksForDate(selectedDate).length ? (
                <ul className="space-y-2">
                  {tasksForDate(selectedDate).map((t) => (
                    <li key={t.id} className="p-2 bg-card rounded">
                      <div className={`font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.start_time ? `Due at ${t.start_time} | ` : ""}
                        {t.priority} priority
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No tasks due this day.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a day to view events and tasks.
          </p>
        )}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => openAddModal(selectedDate ?? "")}
            >
              <Plus className="h-4 w-4 mr-2" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>Fill in the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleFormChange}
                required
              />
              <Input
                type="date"
                name="item_date"
                value={form.item_date}
                onChange={handleFormChange}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleFormChange}
                />
                <Input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleFormChange}
                />
              </div>
              <Input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleFormChange}
              />
              <Input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleFormChange}
              />
              <DialogFooter>
                <Button type="submit">{editingEvent ? "Save changes" : "Create event"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
