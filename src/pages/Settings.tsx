"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { Plus, Trash2, Upload, Download } from "lucide-react";
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

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [contextScope, setContextScope] = useState<ContextScope>("Today");

  // Load settings from localStorage
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

  // Persist settings
  useEffect(() => {
    localStorage.setItem("lifePlannerSettings", JSON.stringify(settings));
  }, [settings]);

  const handleChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const testConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch(`${settings.ollama.url}/api/tags`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setTestStatus("success");
      showSuccess("Connection successful!");
    } catch (e) {
      setTestStatus("error");
      showError(`Connection failed: ${(e as Error).message}`);
    }
  };

  const exportBackup = () => {
    const data = localStorage.getItem("lifePlannerSettings") ?? "{}";
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
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        localStorage.setItem("lifePlannerSettings", JSON.stringify(json));
        setSettings(json);
        showSuccess("Backup imported successfully!");
      } catch {
        showError("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      setSettings(DEFAULT_SETTINGS);
      showSuccess("All data cleared.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

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
              <Label htmlFor="ollama-model">Model Name</Label>
              <Input
                id="ollama-model"
                value={settings.ollama.model}
                onChange={e => handleChange("ollama", "model", e.target.value)}
              />
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
          <Button onClick={testConnection} disabled={testStatus === "testing"}>
            {testStatus === "testing" ? "Testing..." : "Test Connection"}
          </Button>
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