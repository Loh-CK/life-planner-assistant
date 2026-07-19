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

interface Event {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  category: string;
  location: string;
}

const DAY_START = 6;
const DAY_END = 23;
const HOUR_HEIGHT = 60;

const Calendar = () => {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - day);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    start: "",
    end: "",
    category: "",
    location: "",
  });

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("lifePlannerEvents") ?? "{}",
    ) as any;
    setEvents(stored.events ?? []);
  }, []);

  useEffect(() => {
    localStorage.setItem("lifePlannerEvents", JSON.stringify({ events }));
  }, [events]);

  const formatDate = (y: number, m: number, d: number) => {
    const mm = (m + 1).toString().padStart(2, "0");
    const dd = d.toString().padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const eventsForDate = (date: string) => events.filter((e) => e.date === date);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: form.title,
      date: form.date,
      start: form.start,
      end: form.end,
      category: form.category,
      location: form.location,
    };
    setEvents((prev) => [...prev, newEvent]);
    setShowModal(false);
    setForm({
      title: "",
      date: "",
      start: "",
      end: "",
      category: "",
      location: "",
    });
  };

  const openAddModal = (dateStr?: string, start?: string, end?: string) => {
    setForm({
      title: "",
      date: dateStr ?? "",
      start: start ?? "",
      end: end ?? "",
      category: "",
      location: "",
    });
    setShowModal(true);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // ---------- Month view logic ----------
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;

  const monthWeeks: (number | null)[][] = [];
  let day = 1;
  let prevMonthDays = new Date(year, month, 0).getDate();
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

  // ---------- Week view logic ----------
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

  const containerHeight = (DAY_END - DAY_START + 1) * HOUR_HEIGHT;

  const categoryColors: Record<string, string> = {
    work: "bg-primary",
    personal: "bg-secondary",
    health: "bg-green-400",
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 flex flex-col">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
            <Button
              size="sm"
              variant={viewMode === "month" ? "default" : "ghost"}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={viewMode === "week" ? "default" : "ghost"}
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
          </div>
        </div>

        {viewMode === "month" ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handleMonthPrev}>
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
              <Button variant="ghost" size="icon" onClick={handleMonthNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
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
                const isToday = dateStr === todayStr;
                const dayEvents = eventsForDate(dateStr);
                return (
                  <div
                    key={idx}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      isCurrentMonth
                        ? "hover:bg-accent hover:text-accent-foreground"
                        : "text-muted-foreground/40 bg-muted/20 hover:bg-muted/30"
                    }`}
                    onClick={() => handleDayClick(date, isCurrentMonth)}
                  >
                    <div className="flex justify-end">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                          isToday ? "bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {dayEvents.map((e) => (
                          <span
                            key={e.id}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                        ))}
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
              <Button variant="ghost" size="icon" onClick={handleWeekPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">{weekLabel()}</h2>
                <Button variant="outline" size="sm" onClick={handleWeekToday}>
                  <CalendarIcon className="h-4 w-4 mr-1" /> Today
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={handleWeekNext}>
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
                const isToday = dateStr === todayStr;
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
                        const [sh, sm] = e.start.split(":").map(Number);
                        const [eh, em] = e.end.split(":").map(Number);
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
                            }}
                          >
                            <div className="font-medium truncate">
                              {e.title}
                            </div>
                            <div className="opacity-90">
                              {e.start}–{e.end}
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
          eventsForDate(selectedDate).length ? (
            <ul className="space-y-2">
              {eventsForDate(selectedDate).map((e) => (
                <li key={e.id} className="p-2 bg-card rounded">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {e.start} – {e.end} | {e.category} | {e.location}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No events for this day.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a day to view events.
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
              <DialogTitle>Create New Event</DialogTitle>
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
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  name="start"
                  value={form.start}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  type="time"
                  name="end"
                  value={form.end}
                  onChange={handleFormChange}
                  required
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
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
