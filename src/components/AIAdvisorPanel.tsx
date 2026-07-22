"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ContextScopeSelect, ContextScope } from "@/components/ContextScopeSelect";
import { usePlannerItems } from "@/hooks/usePlannerItems";
import { parseAdvisorMarkdown } from "@/lib/parseAdvisorMarkdown";
import { splitAdvisorContent } from "@/lib/advisorChart";
import { AdvisorChart } from "@/components/AdvisorChart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userScopedKey } from "@/lib/userStorage";
import { localDateString } from "@/lib/date";

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
  const { userId } = useCurrentUser();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [scope, setScope] = useState<string>("Today");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { items: events, addItem: addEvent } = usePlannerItems("event");
  const { items: tasks, addItem: addTask } = usePlannerItems("task");
  const { items: expenses, addItem: addExpense } = usePlannerItems("expense");

  const today = localDateString();

  // Function-calling tools so the model can actually create records instead of
  // just describing what it would do.
  const tools = useMemo(
    () => [
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Add a new task/to-do item to the user's task list.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short task title" },
              due_date: {
                type: "string",
                description: "Due date as YYYY-MM-DD, resolved from today's date.",
              },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              category: { type: "string", description: "Optional project/category label" },
            },
            required: ["title"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_event",
          description: "Add a new calendar event.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string", description: "Event date as YYYY-MM-DD, resolved from today's date." },
              start_time: { type: "string", description: "HH:mm 24-hour" },
              end_time: { type: "string", description: "HH:mm 24-hour" },
              category: { type: "string" },
              location: { type: "string" },
            },
            required: ["title", "date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_expense",
          description: "Log a new expense or income transaction.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string", description: "Transaction date as YYYY-MM-DD, resolved from today's date." },
              amount: { type: "number" },
              transaction_type: { type: "string", enum: ["income", "expense"] },
              category: { type: "string" },
              payment_method: { type: "string" },
            },
            required: ["title", "amount"],
          },
        },
      },
    ],
    []
  );

  const runTool = useCallback(
    async (name: string, args: Record<string, any>): Promise<string> => {
      switch (name) {
        case "create_task": {
          if (!args.title) return `⚠️ Couldn't create the task: missing a title.`;
          const result = await addTask({
            title: args.title,
            description: "",
            item_date: args.due_date || null,
            start_time: null,
            end_time: null,
            category: args.category ?? "",
            priority: args.priority ?? "low",
            location: null,
            completed: false,
          });
          return result.success
            ? `✅ Task "${args.title}" added${args.due_date ? `, due ${args.due_date}` : ""}.`
            : `⚠️ Couldn't create task "${args.title}": ${result.error}`;
        }
        case "create_event": {
          if (!args.title || !args.date) return `⚠️ Couldn't create the event: missing a title or date.`;
          const result = await addEvent({
            title: args.title,
            item_date: args.date,
            start_time: args.start_time || null,
            end_time: args.end_time || null,
            category: args.category ?? "",
            location: args.location ?? "",
            completed: false,
          });
          return result.success
            ? `✅ Event "${args.title}" added on ${args.date}${args.start_time ? ` at ${args.start_time}` : ""}.`
            : `⚠️ Couldn't create event "${args.title}": ${result.error}`;
        }
        case "create_expense": {
          if (!args.title || args.amount == null) return `⚠️ Couldn't log the expense: missing a title or amount.`;
          const result = await addExpense({
            title: args.title,
            item_date: args.date || today,
            transaction_type: args.transaction_type ?? "expense",
            category: args.category ?? "",
            amount: Number(args.amount),
            payment_method: args.payment_method ?? "",
          });
          return result.success
            ? `✅ Logged ${args.transaction_type ?? "expense"} "${args.title}" for $${args.amount}.`
            : `⚠️ Couldn't log "${args.title}": ${result.error}`;
        }
        default:
          return `⚠️ Unknown action requested: ${name}`;
      }
    },
    [addTask, addEvent, addExpense, today]
  );

  // Load this user's settings once their id is known
  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(userScopedKey("lifePlannerSettings", userId));
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [userId]);

  // Build a context summary for a given scope from live planner data
  const buildContextSummary = useCallback(
    (targetScope: string) => {
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
      content: `You are a helpful personal planning assistant. Today's date is ${today} (YYYY-MM-DD) — resolve relative dates like "tomorrow" or "next Monday" against this before calling a tool. Use the following context: ${JSON.stringify(
        summaryForRequest,
        null,
        2
      )}. Respond concisely and help the user with their planning needs.

If the user asks you to create, add, or log a task, event, or expense, call the matching tool instead of just describing it — the tool is what actually saves it.

If the user asks you to draw, plot, chart, or visualize data (e.g. "draw a pie chart of my tasks"), you can render a real chart by replying with a fenced code block starting with \`\`\`chart containing ONLY valid JSON in this exact shape, then a short one-sentence caption after it:
\`\`\`chart
{"type":"pie","title":"Tasks by status","data":[{"name":"Completed","value":1},{"name":"Pending","value":2}]}
\`\`\`
"type" must be "pie" or "bar". Use this format instead of describing a chart in words whenever a visual is requested.`,
    };

    const payload = {
      model: settings.ollama.model,
      messages: [systemMessage, ...newMessages.map(m => ({ role: m.role, content: m.content }))],
      stream: false,
      tools,
    };

    try {
      const res = await fetch(`${settings.ollama.url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const toolCalls = data.message?.tool_calls ?? [];

      if (toolCalls.length > 0) {
        // Execute for real rather than trusting the model's own claim that it did —
        // that's what previously let it say "Task added" without saving anything.
        const resultLines: string[] = [];
        for (const call of toolCalls) {
          const fnName = call.function?.name;
          let args = call.function?.arguments ?? {};
          if (typeof args === "string") {
            try {
              args = JSON.parse(args);
            } catch {
              args = {};
            }
          }
          resultLines.push(await runTool(fnName, args));
        }
        setMessages(prev => [...prev, { role: "assistant", content: resultLines.join("\n") }]);
      } else {
        const assistantContent = data.message?.content ?? data.choices?.[0]?.message?.content ?? "No response";
        setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
      }
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
                <div className="advisor-markdown max-w-[85%] rounded-lg p-2 break-words overflow-x-auto bg-card text-card-foreground">
                  {splitAdvisorContent(msg.content).map((segment, segIdx) =>
                    segment.kind === "chart" ? (
                      <AdvisorChart key={segIdx} spec={segment.chart} />
                    ) : (
                      <div
                        key={segIdx}
                        dangerouslySetInnerHTML={{ __html: parseAdvisorMarkdown(segment.text) }}
                      />
                    )
                  )}
                </div>
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
