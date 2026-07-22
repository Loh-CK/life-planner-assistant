"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { Trash2, Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userScopedKey } from "@/lib/userStorage";

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

const loadStoredSettings = (userId: string | null): SettingsData => {
  try {
    const stored = localStorage.getItem(userScopedKey("lifePlannerSettings", userId));
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const Settings = () => {
  const { userId } = useCurrentUser();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load this user's settings once their id is known
  useEffect(() => {
    if (!userId) return;
    setSettings(loadStoredSettings(userId));
  }, [userId]);

  const persistSettings = (next: SettingsData) => {
    if (!userId) return;
    localStorage.setItem(userScopedKey("lifePlannerSettings", userId), JSON.stringify(next));
  };

  const handleChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => {
      const next = { ...prev, [section]: { ...prev[section], [key]: value } };
      persistSettings(next);
      return next;
    });
  };

  // Check Ollama is reachable and pull the list of locally installed models
  const testConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch(`${settings.ollama.url}/api/tags`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: { models?: { name?: string; model?: string }[] } = await res.json();
      const models: string[] = (data.models ?? [])
        .map(m => m.name ?? m.model)
        .filter((name): name is string => Boolean(name));
      setAvailableModels(models);
      setTestStatus("success");
      showSuccess(
        models.length
          ? `Connected — found ${models.length} model${models.length === 1 ? "" : "s"}.`
          : "Connected to Ollama, but no models are installed locally."
      );
    } catch (e) {
      setTestStatus("error");
      showError(`Connection failed: ${(e as Error).message}`);
    }
  };

  // Try to load the model list once on page load, so the dropdown is populated without a manual click
  useEffect(() => {
    testConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modelOptions = Array.from(
    new Set([...(settings.ollama.model ? [settings.ollama.model] : []), ...availableModels])
  );

  const exportBackup = () => {
    if (!userId) return;
    const data = localStorage.getItem(userScopedKey("lifePlannerSettings", userId)) ?? "{}";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lifePlannerBackup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        persistSettings(json);
        setSettings(json);
        showSuccess("Backup imported successfully!");
      } catch {
        showError("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (!userId) return;
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem(userScopedKey("lifePlannerSettings", userId));
      localStorage.removeItem(userScopedKey("lifePlannerNotes", userId));
      localStorage.removeItem(userScopedKey("lifePlannerData", userId));
      localStorage.removeItem(userScopedKey("lifePlannerPomoDurations", userId));
      localStorage.removeItem(userScopedKey("lifePlannerPomoCycles", userId));
      localStorage.removeItem(userScopedKey("lifePlannerPomoSessions", userId));
      setSettings(DEFAULT_SETTINGS);
      showSuccess("All data cleared.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader title="Settings" description="Configure your AI advisor, preferences, and data." />

      {/* Ollama AI Advisor */}
      <Card>
        <CardHeader>
          <CardTitle>Ollama AI Advisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ollama-url">Server URL</Label>
              <Input
                id="ollama-url"
                value={settings.ollama.url}
                onChange={e => handleChange("ollama", "url", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ollama-model">Model</Label>
              <Select
                value={settings.ollama.model}
                onValueChange={val => handleChange("ollama", "model", val)}
              >
                <SelectTrigger id="ollama-model">
                  <SelectValue
                    placeholder={testStatus === "testing" ? "Loading models…" : "Select a model"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.length > 0 ? (
                    modelOptions.map(m => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No models found — click "Test Connection".
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ollama-temp">Temperature</Label>
              <Input
                id="ollama-temp"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.ollama.temperature}
                onChange={e => handleChange("ollama", "temperature", parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="ollama-context">Context Window</Label>
              <Input
                id="ollama-context"
                type="number"
                min="1"
                value={settings.ollama.contextWindow}
                onChange={e => handleChange("ollama", "contextWindow", parseInt(e.target.value, 10))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={testConnection} disabled={testStatus === "testing"}>
              {testStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>
            {testStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Ollama is reachable
                {availableModels.length > 0 && ` — ${availableModels.length} model${availableModels.length === 1 ? "" : "s"} found`}
              </span>
            )}
            {testStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                Couldn't reach Ollama at this URL
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={settings.preferences.displayName}
                onChange={e => handleChange("preferences", "displayName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.preferences.currency}
                onValueChange={val => handleChange("preferences", "currency", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {["MYR", "USD", "SGD", "EUR", "GBP"].map(cur => (
                    <SelectItem key={cur} value={cur}>
                      {cur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="week-start">Week Start Day</Label>
              <Select
                value={settings.preferences.weekStart}
                onValueChange={val => handleChange("preferences", "weekStart", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {["Monday", "Sunday"].map(day => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={exportBackup} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export Backup
            </Button>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Import Backup
              </Button>
            </label>
            <Button variant="destructive" onClick={clearAllData}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;