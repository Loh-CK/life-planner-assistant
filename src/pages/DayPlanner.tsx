import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Plus, CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { usePlannerItems } from "@/hooks/usePlannerItems";

interface TimeBlock {
  id: string;
  item_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  title: string;
  category: string;
  description: string;
  completed: boolean;
}

const DAY_START = 6; // 6am
const DAY_END = 23; // 11pm
const HOUR_HEIGHT = 75; // pixels per hour (increased for breathing room)

const categoryColors: Record<string, string> = {
  work: "bg-primary",
  personal: "bg-secondary",
  health: "bg-green-200",
};

const DayPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
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

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    items: fetchedBlocks,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
  } = usePlannerItems("timeblock");

  // Sync local state with fetched blocks
  useEffect(() => {
    setBlocks(fetchedBlocks);
  }, [fetchedBlocks]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock: TimeBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      item_date: selectedDate,
      start_time: form.start,
      end_time: form.end,
      title: form.title,
      category: form.category,
      description: form.notes,
      completed: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setShowModal(false);
    setForm({
      title: "",
      category: "",
      start: "06:00",
      end: "07:00",
      notes: "",
    });
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setForm({
      title: block.title,
      category: block.category,
      start: block.start_time,
      end: block.end_time,
      notes: block.description,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.notes,
      item_date: selectedDate || null,
      start_time: form.start || null,
      end_time: form.end || null,
      category: form.category,
      completed: editingBlock?.completed ?? false,
      item_type: "timeblock",
    };
    if (editingBlock) {
      await updateItem(editingBlock.id, payload);
    } else {
      await addItem(payload);
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
    toggleCompleted(id);
  };

  const deleteBlock = (id: string) => {
    deleteItem(id);
  };

  const dayBlocks = blocks
    .filter((b) => b.item_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const containerHeight = (DAY_END - DAY_START + 1) * HOUR_HEIGHT;

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;
  const currentTimeOffset = isToday
    ? (new Date().getHours() * 60 + new Date().getMinutes() - DAY_START * 60) * (HOUR_HEIGHT / 60)
    : null;

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading blocks…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Date picker */}
      <div className="flex items-center space-x-2">
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-48"
        />
        <CalendarIcon className="h-4 w-4" />
      </div>

      {/* Timeline container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto border rounded-md"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Hour labels */}
        <div className="absolute left-0 top-0 w-16 flex flex-col">
          {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
            const hour = DAY_START + i;
            return (
              <div
                key={hour}
                className="h-[75px] flex items-center justify-end pr-2 text-sm font-medium text-muted-foreground"
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
            );
          })}
        </div>

        {/* Empty slots with hover affordance */}
        {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
          const hour = DAY_START + i;
          const topOffset = (hour - DAY_START) * HOUR_HEIGHT;
          const isAlternate = i % 2 === 0;
          return (
            <div
              key={hour}
              className={`absolute left-16 right-0 h-[75px] top-[${topOffset}px] ${
                isAlternate ? "bg-muted/10" : ""
              }`}
              style={{ top: `${topOffset}px` }}
              onClick={() => {
                setEditingBlock(null);
                setForm({
                  title: "",
                  category: "",
                  start: `${hour.toString().padStart(2, "0")}:00`,
                  end: `${(hour + 1).toString().padStart(2, "0")}:00`,
                  notes: "",
                });
                setShowModal(true);
              }}
            >
              <div className="h-full w-full border-dashed border-2 border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Plus className="h-6 w-6 mr-2 text-primary" />
                <span className="text-sm font-medium text-primary">Add</span>
              </div>
            </div>
          );
        })}

        {/* Time blocks */}
        {dayBlocks.map((block) => {
          // Guard against missing start_time or end_time
          if (!block.start_time || !block.end_time) {
            return null;
          }
          const startParts = block.start_time.split(":");
          const endParts = block.end_time.split(":");
          const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
          const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
          const top = (startMinutes - DAY_START * 60) * (HOUR_HEIGHT / 60);
          const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60);
          const bgClass = categoryColors[block.category] ?? "bg-primary";
          return (
            <div
              key={block.id}
              className={`absolute left-16 right-0 top-[${top}px] h-[${height}px] ${bgClass} rounded-md border-l-4 border-primary cursor-pointer transition-opacity ${
                block.completed ? "opacity-50" : ""
              }`}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => handleEditBlock(block)}
            >
              <div className="p-2 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{block.title}</span>
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      checked={block.completed}
                      onCheckedChange={() => toggleDone(block.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="ml-auto"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {block.start_time} – {block.end_time}
                </div>
                {block.description && (
                  <div className="text-xs text-muted-foreground">{block.description}</div>
                )}
                {block.completed && (
                  <div className="absolute top-1 left-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Current time line */}
        {isToday && currentTimeOffset !== null && currentTimeOffset >= 0 && currentTimeOffset <= containerHeight && (
          <div
            className="absolute left-0 right-0 h-px bg-red-500"
            style={{ top: `${currentTimeOffset}px` }}
          />
        )}

        {/* Empty state message */}
        {dayBlocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>No plans yet for this day — click any time slot to add one.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? "Edit Time Block" : "Add Time Block"}</DialogTitle>
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
              placeholder="Category"
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