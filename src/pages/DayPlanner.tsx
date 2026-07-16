import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckCircle, XCircle } from "lucide-react";

interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;   // HH:mm
  title: string;
  category: string;
  notes: string;
  done: boolean;
}

const DAY_START = 6; // 6am
const DAY_END = 23; // 11pm

const DayPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    start: "06:00",
    end: "07:00",
    notes: "",
  });

  // Load blocks from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("lifePlannerTimeBlocks") ?? "{}") as any;
    setBlocks(stored.blocks ?? []);
  }, []);

  // Persist blocks
  useEffect(() => {
    localStorage.setItem("lifePlannerTimeBlocks", JSON.stringify({ blocks }));
  }, [blocks]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
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
    setBlocks([...blocks, newBlock]);
    setShowModal(false);
    setForm({
      title: "",
      category: "",
      start: "06:00",
      end: "07:00",
      notes: "",
    });
  };

  const toggleDone = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, done: !b.done } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  // Filter blocks for selected date and sort by start time
  const dayBlocks = blocks
    .filter(b => b.date === selectedDate)
    .sort((a, b) => a.start.localeCompare(b.start));

  // Helper to compute row span for a block
  const getRowSpan = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startTotal = sh + sm / 60;
    const endTotal = eh + em / 60;
    return Math.ceil((endTotal - startTotal) * 1); // one hour per row
  };

  // Build a map of hour index to block that starts at that hour
  const blockMap: Record<number, TimeBlock> = {};
  dayBlocks.forEach(b => {
    const [sh] = b.start.split(":").map(Number);
    const hourIndex = sh - DAY_START;
    if (hourIndex >= 0 && hourIndex < DAY_END - DAY_START + 1) {
      blockMap[hourIndex] = b;
    }
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <label className="font-medium">Select Date:</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-48"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="w-20 text-left p-2">Time</th>
              <th className="text-left p-2">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => {
              const hour = DAY_START + i;
              const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
              const block = blockMap[i];
              if (block) {
                const rowSpan = getRowSpan(block.start, block.end);
                return (
                  <tr key={hour} className="border-b">
                    <td className="p-2">{hourLabel}</td>
                    <td className="p-2" rowSpan={rowSpan}>
                      <Card className="h-full flex flex-col justify-between">
                        <CardHeader className="p-2">
                          <CardTitle className="text-sm font-medium">
                            {block.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground">
                            {block.category}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {block.start} – {block.end}
                          </div>
                          {block.notes && (
                            <div className="text-xs text-muted-foreground">
                              {block.notes}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                              checked={block.done}
                              onCheckedChange={() => toggleDone(block.id)}
                            />
                            <span className={block.done ? "line-through text-muted-foreground" : ""}>
                              Done
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBlock(block.id)}
                              className="ml-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={hour} className="border-b">
                    <td className="p-2">{hourLabel}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full h-full text-left"
                        onClick={() => setShowModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Time Block</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBlock} className="space-y-4 mt-4">
            <Input
              name="title"
              placeholder="Activity Title"
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
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DayPlanner;