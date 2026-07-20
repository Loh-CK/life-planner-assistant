import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { CalendarDays, ListTodo, DollarSign, StickyNote, Timer, Sparkles } from "lucide-react";

const sections = [
  {
    icon: CalendarDays,
    title: "Calendar & Day Planner",
    body: "Switch between month and week views on the Calendar page, or block out your day hour-by-hour in the Day Planner. Click any slot to create an event or time block.",
  },
  {
    icon: ListTodo,
    title: "Tasks",
    body: "Add tasks with a priority, due date, and project. Use the search box and filters to narrow the list, and check items off as you complete them.",
  },
  {
    icon: DollarSign,
    title: "Expenses",
    body: "Log income and expenses, set monthly budgets per category, and track spending against your budget with the progress bars and charts.",
  },
  {
    icon: StickyNote,
    title: "Notes",
    body: "Quick notes are saved locally on this device. Click + to start a new note, then select any note in the list to edit it.",
  },
  {
    icon: Timer,
    title: "Pomodoro",
    body: "Run focus and break timers with configurable durations. Session history is kept so you can see how much focused time you've logged.",
  },
  {
    icon: Sparkles,
    title: "AI Advisor",
    body: "The AI Advisor panel talks to a local Ollama server. Set the server URL and model in Settings, then ask it to plan your day, prioritize tasks, or review spending.",
  },
];

const Help = () => (
  <div className="p-4 space-y-6">
    <PageHeader title="Help" description="A quick guide to what each part of Life Planner does." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map(({ icon: Icon, title, body }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Help;
