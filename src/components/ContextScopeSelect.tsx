"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

export type ContextScope = "Today" | "Tasks" | "Finance" | "Full Planner";

export const ContextScopeSelect = ({ value, onValueChange }: { value: ContextScope; onValueChange: (v: ContextScope) => void }) => {
  const [selected, setSelected] = useState<ContextScope>(value);

  const handleChange = (v: string) => {
    const newVal = v as ContextScope;
    setSelected(newVal);
    onValueChange(newVal);
  };

  return (
    <div className="w-full">
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Today">Today</SelectItem>
          <SelectItem value="Tasks">Tasks</SelectItem>
          <SelectItem value="Finance">Finance</SelectItem>
          <SelectItem value="Full Planner">Full Planner</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};