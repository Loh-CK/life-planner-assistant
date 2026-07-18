"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Download, Settings, X } from "lucide-react";
import { ContextScopeSelect, ContextScope } from "@/components/ContextScopeSelect";

interface SettingsData {
  ollama: {
    url: string;
    model: string;
    temperature: number;
    contextWindow: number;
  };
  preferences: {
    displayName: string;
    currency: string;
    weekStart: string;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  ollama: {
    url: "http://localhost:11434",
    model: "gpt-oss:20b-cloud",
    temperature: 0.6,
    contextWindow: 8192,
  },
  preferences: {
    displayName: "",
    currency: "USD",
    weekStart: "Monday",
  },
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AIAdvisorPanel = () => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [scope, setScope] = useState<string>("Today");
  const [contextSummary, setContextSummary] = useState<any>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load settings
  useEffect(() => {
    const stored = localStorage.getItem("lifePlannerSettings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  // Build context summary when scope changes
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const eventsData = JSON.parse(localStorage.getItem("lifePlannerEvents") ?? "{}");
    const tasksData = JSON.parse(localStorage.getItem("lifePlannerTasks") ?? "{}");
    const expensesData = JSON.parse(localStorage.getItem("lifePlannerExpenses") ?? "{}");

    const events = eventsData.events ?? [];
    const tasks = tasksData.tasks ?? [];
    const expenses = expensesData.transactions ?? [];

    let summary: any = {};

    switch (scope) {
      case "Today":
        summary.events = events.filter((e: any) => e.date === today);
        summary.tasks = tasks.filter((t: any) => t.dueDate === today);
        summary.expenses = expenses.filter((e: any) => e.date === today);
        break;
      case "Tasks":
        summary.tasks = tasks;
        break;
      case "Finance":
        summary.expenses = expenses;
        break;
      case "Full Planner":
        summary.events = events;
        summary.tasks = tasks;
        summary.expenses = expenses;
        break;
      default:
        summary = {};
    }

    setContextSummary(summary);
  }, [scope]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parseMarkdown = (text: string) => {
    // Bold
    let html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Bullet lists
    const lines = html.split("\n");
    const processed: string[] = [];
    let inList = false;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) {
          processed.push("<ul>");
          inList = true;
        }
        processed.push(`<li>${trimmed.replace(/^[-*]\s+/, "")}</li>`);
      } else {
        if (inList) {
          processed.push("</ul>");
          inList = false;
        }
        processed.push(`<p>${trimmed}</p>`);
      }
    });
    if (inList) processed.push("</ul>");
    return processed.join("");
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);
    setError(null);

    const systemMessage = {
      role: "system",
      content: `You are a helpful personal planning assistant. Use the following context: ${JSON.stringify(
        contextSummary,
        null,
        2
      )}. Respond concisely and help the user with their planning needs.`,
    };

    const payload = {
      model: settings.ollama.model,
      messages: [systemMessage, ...newMessages.map(m => ({ role: m.role, content: m.content }))],
      stream: false,
    };

    try {
      const res = await fetch(`${settings.ollama.url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const assistantContent = data.message?.content ?? data.choices?.[0]?.message?.content ?? "No response";
      setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (e) {
      setError("Couldn't reach the AI Advisor — check that Ollama is running and the URL in Settings is correct.");
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (e as Error).message }]);
    } finally {
      setThinking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Advisor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="p-4 flex flex-col space-y-2">
          <Label>Context Scope</Label>
          <ContextScopeSelect value={scope as ContextScope} onValueChange={setScope} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleQuickPrompt("Plan my day")}>
              Plan my day
            </Button>
            <Button size="sm" onClick={() => handleQuickPrompt("Prioritize my tasks")}>
              Prioritize my tasks
            </Button>
            <Button size="sm" onClick={() => handleQuickPrompt("Review my spending")}>
              Review my spending
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: "calc(100% - 200px)" }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[70%] rounded-lg p-2 ${
                  msg.role === "assistant" ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground"
                }`}
                dangerouslySetInnerHTML={{
                  __html: msg.role === "assistant" ? parseMarkdown(msg.content) : msg.content,
                }}
              />
            </div>
          ))}
          {thinking && (
            <div className="flex justify-center">
              <span className="text-muted-foreground">Thinking...</span>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <span className="text-destructive">{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={thinking}>
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAdvisorPanel;