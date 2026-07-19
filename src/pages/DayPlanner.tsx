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
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";

interface TimeBlock {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  category: string;
  notes: string;
  done: boolean;
}

const DAY_START = 6;
const DAY_END = 23;
const HOUR_HEIGHT = 60;

const categoryColors: Record<string, string> = {
  work: "bg-primary",
  personal: "bg-secondary",
  health: "bg-green-300",
};

const DayPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    start: "06:00",
    end: "07:00",
    notes: "",
  });

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("lifePlannerTimeBlocks") ?? "{}",
    ) as any;
    setBlocks(stored.blocks ?? []);
  }, []);

  useEffect(() => {
    localStorage.setItem("lifePlannerTimeBlocks", JSON.stringify({ blocks }));
  }, [blocks]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = (start?: string, end?: string) => {
    setEditingBlock(null);
    setForm({
      title: "",
      category: "",
      start: start ?? "06:00",
      end: end ?? "07:00",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (block: TimeBlock) => {
    setEditingBlock(block);
    setForm({
      title: block.title,
      category: block.category,
      start: block.start,
      end: block.end,
      notes: block.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlock) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === editingBlock.id ? { ...b, ...form, date: selectedDate } : b,
        ),
      );
    } else {
      const newBlock: TimeBlock = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        date: selectedDate,
        start: form.start,
        end: form.end,
        title: form.title,
        category: form.category,
        notes: form.notes,
        done: false,
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
    setShowModal(false);
    setEditingBlock(null);
    setForm({
      title: "",
      category: "",
      start: "06:00",
      end: "07:00",
      notes: "",
    });
  };

  const toggleDone = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const dayBlocks = blocks
    .filter((b) => b.date === selectedDate)
    .sort((a, b) => a.start.localeCompare(b.start));

  const containerHeight = (DAY_END - DAY_START + 1) * HOUR_HEIGHT;
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;
  const currentTimeOffset = isToday
    ? new Date().getHours() * 60 + new Date().getMinutes() - DAY_START * 60
    : null;

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-48"
        />
        <CalendarIcon className="h-4 w-4" />
      </div>

      <div
        className="relative flex-1 overflow-y-auto border rounded-md"
        style={{ height: `${containerHeight}px` }}
      >
        <div className="absolute left-0 top-0 w-16 flex flex-col">
          {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
            const hour = DAY_START + i;
            return (
              <div
                key={hour}
                className="flex items-center justify-end pr-2 text-xs text-muted-foreground border-t"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
            );
          })}
        </div>

        {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
          const hour = DAY_START + i;
          const topOffset = i * HOUR_HEIGHT;
          return (
            <div
              key={hour}
              className="absolute left-16 right-0 cursor-pointer group"
              style={{ top: `${topOffset}px`, height: `${HOUR_HEIGHT}px` }}
              onClick={() =>
                openAddModal(
                  `${hour.toString().padStart(2, "0")}:00`,
                  `${(hour + 1).toString().padStart(2, "0")}:00`,
                )
              }
            >
              <div className="h-full w-full flex items-center justify-center text-transparent group-hover:text-muted-foreground group-hover:bg-muted/30 transition-colors">
                +
              </div>
            </div>
          );
        })}

        {dayBlocks.map((block) => {
          const [sh, sm] = block.start.split(":").map(Number);
          const [eh, em] = block.end.split(":").map(Number);
          const startMinutes = sh * 60 + sm;
          const endMinutes = eh * 60 + em;
          const top = startMinutes - DAY_START * 60;
          const height = Math.max(endMinutes - startMinutes, 20);
          const bgClass = categoryColors[block.category] ?? "bg-primary";
          return (
            <div
              key={block.id}
              className={`absolute left-16 right-2 rounded-md border-l-4 border-primary cursor-pointer transition-opacity overflow-hidden ${bgClass} ${
                block.done ? "opacity-50" : ""
              }`}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => openEditModal(block)}
            >
              <div className="p-2 h-full flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {block.title}
                  </span>
                  <div
                    className="flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={block.done}
                      onCheckedChange={() => toggleDone(block.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs opacity-90">
                  {block.start} – {block.end}
                </div>
              </div>
              {block.done && (
                <div className="absolute top-1 left-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {isToday &&
          currentTimeOffset !== null &&
          currentTimeOffset >= 0 &&
          currentTimeOffset <= containerHeight && (
            <div
              className="absolute left-16 right-0 h-px bg-destructive z-10"
              style={{ top: `${currentTimeOffset}px` }}
            />
          )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Edit Time Block" : "Add Time Block"}
            </DialogTitle>
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
              name="category"
              placeholder="Category (work / personal / health)"
              value={form.category}
              onChange={handleFormChange}
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
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleFormChange}
            />
            <DialogFooter>
              <Button type="submit">{editingBlock ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DayPlanner;
