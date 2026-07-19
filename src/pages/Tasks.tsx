"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { usePlannerItems } from "@/hooks/usePlannerItems";

interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: "high" | "medium" | "low";
  project: string;
  description: string;
  completed: boolean;
}

const priorityColors = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-green-500 text-white",
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
    dueDate: "",
    dueTime: "",
    priority: "low",
    project: "",
    description: "",
  });

  const openAddModal = () => {
    setEditingTask(null);
    setForm({
      title: "",
      dueDate: "",
      dueTime: "",
      priority: "low",
      project: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      dueDate: task.dueDate,
      dueTime: task.dueTime ?? "",
      priority: task.priority,
      project: task.project,
      description: task.description,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      item_date: form.dueDate,
      start_time: form.dueTime ?? "",
      end_time: "",
      category: form.project,
      priority: form.priority,
      location: "",
      completed: false,
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

  const projects = Array.from(new Set(tasks.map(t => t.project))).filter(Boolean);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    const matchesProject =
      projectFilter === "all" || t.project === projectFilter;
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
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Button onClick={openAddModal} variant="primary">
          Add Task
        </Button>
      </div>

      {/* Task list */}
      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleComplete(task.id)}
              />
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700`}
                  >
                    {task.project}
                  </span>
                </div>
                <h3
                  className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Due: {task.dueDate}
                  {task.dueTime && ` at ${task.dueTime}`}
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
                onClick={() => openEditModal(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-muted-foreground">No tasks found.</p>
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
                name="dueDate"
                value={form.dueDate}
                onChange={handleFormChange}
                required
              />
              <Input
                type="time"
                name="dueTime"
                value={form.dueTime}
                onChange={handleFormChange}
              />
            </div>
            <select
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              className="border rounded px-2 py-1"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Input
              name="project"
              placeholder="Project / Category"
              value={form.project}
              onChange={handleFormChange}
            />
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