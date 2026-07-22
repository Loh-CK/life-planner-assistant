"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ContextScopeSelect, ContextScope } from "@/components/ContextScopeSelect";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { parseAdvisorMarkdown } from "@/lib/parseAdvisorMarkdown";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { items: events } = usePlannerItems("event");
  const { items: tasks } = usePlannerItems("task");
  const { items: expenses } = usePlannerItems("expense");

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

  // Build a context summary for a given scope from live planner data
  const buildContextSummary = useCallback(
    (targetScope: string) => {
      const today = new Date().toISOString().split("T")[0];

      const pickEvent = (e: typeof events[number]) => ({
        title: e.title,
        date: e.item_date,
        start_time: e.start_time,
        end_time: e.end_time,
        category: e.category,
      });
      const pickTask = (t: typeof tasks[number]) => ({
        title: t.title,
        due_date: t.item_date,
        priority: t.priority,
        category: t.category,
        completed: t.completed,
      });
      const pickExpense = (x: typeof expenses[number]) => ({
        title: x.title,
        date: x.item_date,
        type: x.transaction_type,
        category: x.category,
        amount: x.amount,
      });

      const summary: Record<string, unknown> = {};

      switch (targetScope) {
        case "Today":
          summary.events = events.filter(e => e.item_date === today).map(pickEvent);
          summary.tasks = tasks.filter(t => t.item_date === today || !t.completed).map(pickTask);
          summary.expenses = expenses.filter(x => x.item_date === today).map(pickExpense);
          break;
        case "Tasks":
          summary.tasks = tasks.map(pickTask);
          break;
        case "Finance":
          summary.expenses = expenses.map(pickExpense);
          break;
        case "Full Planner":
          summary.events = events.map(pickEvent);
          summary.tasks = tasks.map(pickTask);
          summary.expenses = expenses.map(pickExpense);
          break;
      }

      return summary;
    },
    [events, tasks, expenses]
  );

  // Context summary for whatever scope is currently selected in the dropdown
  const contextSummary = useMemo(() => buildContextSummary(scope), [scope, buildContextSummary]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string, targetScope: string = scope) => {
    if (!content.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);
    setError(null);

    // Use the scope this message was sent for, not the (possibly stale) memoized one —
    // setScope() from a quick prompt hasn't re-rendered yet when this runs.
    const summaryForRequest =
      targetScope === scope ? contextSummary : buildContextSummary(targetScope);

    const systemMessage = {
      role: "system",
      content: `You are a helpful personal planning assistant. Use the following context: ${JSON.stringify(
        summaryForRequest,
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

  const handleQuickPrompt = (prompt: string, targetScope: ContextScope) => {
    if (targetScope !== scope) setScope(targetScope);
    sendMessage(prompt, targetScope);
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
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="p-4 flex flex-col space-y-2 shrink-0">
          <Label>Context Scope</Label>
          <ContextScopeSelect value={scope as ContextScope} onValueChange={setScope} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleQuickPrompt("Plan my day", "Today")}>
              Plan my day
            </Button>
            <Button size="sm" onClick={() => handleQuickPrompt("Prioritize my tasks", "Tasks")}>
              Prioritize my tasks
            </Button>
            <Button size="sm" onClick={() => handleQuickPrompt("Review my spending", "Finance")}>
              Review my spending
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
              {msg.role === "assistant" ? (
                <div
                  className="advisor-markdown max-w-[85%] rounded-lg p-2 break-words overflow-x-auto bg-card text-card-foreground"
                  dangerouslySetInnerHTML={{ __html: parseAdvisorMarkdown(msg.content) }}
                />
              ) : (
                <div className="max-w-[85%] rounded-lg p-2 break-words whitespace-pre-wrap bg-primary text-primary-foreground">
                  {msg.content}
                </div>
              )}
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
        <form onSubmit={handleSubmit} className="p-4 border-t shrink-0">
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
