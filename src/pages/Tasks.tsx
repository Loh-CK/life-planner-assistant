"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ListTodo } from "lucide-react";
import { usePlannerItems, type PlannerItem } from "@/hooks/usePlannerItems";
import { PageHeader } from "@/components/PageHeader";

interface Task {
  id: string;
  title: string;
  item_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  priority: "high" | "medium" | "low";
  category: string;
  description: string;
  completed: boolean;
}

const priorityBadgeVariant: Record<Task["priority"], "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const Tasks = () => {
  const {
    items: tasks,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
  } = usePlannerItems("task");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    item_date: "",
    start_time: "",
    priority: "low",
    category: "",
    description: "",
  });
  const [isNewCategorySelected, setIsNewCategorySelected] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const openAddModal = () => {
    setEditingTask(null);
    setForm({
      title: "",
      item_date: "",
      start_time: "",
      priority: "low",
      category: "",
      description: "",
    });
    setIsNewCategorySelected(false);
    setNewCategoryName("");
    setModalOpen(true);
  };

  const openEditModal = (task: PlannerItem) => {
    setEditingTask(task as Task);
    setForm({
      title: task.title,
      item_date: task.item_date,
      start_time: task.start_time,
      priority: task.priority as Task["priority"],
      category: task.category,
      description: task.description,
    });
    setIsNewCategorySelected(false);
    setNewCategoryName("");
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const category = isNewCategorySelected ? newCategoryName.trim() : form.category;
  const payload = {
    title: form.title,
    description: form.description,
    item_date: form.item_date || null,
    start_time: form.start_time || null,
    end_time: null,
    category,
    priority: form.priority,
    location: null,
    completed: editingTask?.completed ?? false,
    item_type: "task",
  };
    if (editingTask) {
      await updateItem(editingTask.id, payload);
    } else {
      await addItem(payload);
    }
    setModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    toggleCompleted(id);
  };

  const deleteTask = (id: string) => {
    deleteItem(id);
  };

  const projects = Array.from(new Set(tasks.map(t => t.category))).filter(Boolean);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    const matchesProject =
      projectFilter === "all" || t.category === projectFilter;
    return matchesSearch && matchesPriority && matchesProject;
  });

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <span className="text-muted-foreground">Loading tasks…</span>
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
    <div className="p-4 space-y-4">
      <PageHeader
        title="Tasks"
        description="Track and prioritize what needs to get done."
        actions={<Button onClick={openAddModal}>Add Task</Button>}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      <div className="grid gap-3">
        {filteredTasks.map(task => (
          <Card key={task.id} className="flex items-center justify-between p-4 transition-shadow hover:shadow-md">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleComplete(task.id)}
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant={priorityBadgeVariant[task.priority]} className="capitalize">
                    {task.priority}
                  </Badge>
                  {task.category && (
                    <Badge variant="outline">{task.category}</Badge>
                  )}
                </div>
                <h3
                  className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Due: {task.item_date}
                  {task.start_time && ` at ${task.start_time}`}
                </p>
                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit task "${task.title}"`}
                onClick={() => openEditModal(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete task "${task.title}"`}
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filteredTasks.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <ListTodo className="h-10 w-10 opacity-50" />
            <p>No tasks found.</p>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden"></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the task details below."
                : "Fill in the task details."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleFormChange}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                name="item_date"
                value={form.item_date}
                onChange={handleFormChange}
                required
              />
              <Input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleFormChange}
              />
            </div>
            <Select
              value={form.priority}
              onValueChange={val => setForm(prev => ({ ...prev, priority: val as Task["priority"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isNewCategorySelected ? "new" : form.category}
              onValueChange={val => {
                if (val === "new") {
                  setIsNewCategorySelected(true);
                  setNewCategoryName("");
                } else {
                  setIsNewCategorySelected(false);
                  setForm(prev => ({ ...prev, category: val }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Project / Category" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add new project/category...</SelectItem>
              </SelectContent>
            </Select>
            {isNewCategorySelected && (
              <Input
                placeholder="New project / category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                required
              />
            )}
            <Input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
            />
            <DialogFooter>
              <Button type="submit">{editingTask ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
