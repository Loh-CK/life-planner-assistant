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

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;

  const weeks: (number | null)[][] = [];
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
    weeks.push(week);
  }

  const formatDate = (y: number, m: number, d: number) => {
    const mm = (m + 1).toString().padStart(2, "0");
    const dd = d.toString().padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const eventsForDate = (date: string) => events.filter((e) => e.date === date);

  const handlePrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = (date: Date, isCurrentMonth: boolean) => {
    const dateStr = formatDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    if (!isCurrentMonth) {
      setCurrentMonth(date);
    }
    setSelectedDate(dateStr);
  };

  const todayStr = new Date().toISOString().split("T")[0];

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

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString("default", { month: "long" })} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              <CalendarIcon className="h-4 w-4 mr-1" /> Today
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNext}>
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
          {weeks.flat().map((_, idx) => {
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
            <Button className="mt-4 w-full" variant="outline">
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
