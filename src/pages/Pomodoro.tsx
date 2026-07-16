import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Settings, Save, X } from "lucide-react";

type Mode = "focus" | "short" | "long";

interface Durations {
  focus: number; // minutes
  short: number;
  long: number;
}

interface Session {
  mode: Mode;
  duration: number; // minutes
  timestamp: string;
}

const STORAGE_KEY_DURATIONS = "lifePlannerPomoDurations";
const STORAGE_KEY_CYCLES = "lifePlannerPomoCycles";
const STORAGE_KEY_HISTORY = "lifePlannerPomoSessions";

const defaultDurations: Durations = { focus: 25, short: 5, long: 15 };
const defaultCycles = 4;

const Pomodoro = () => {
  // Load persisted settings
  const [durations, setDurations] = useState<Durations>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_DURATIONS);
    return stored ? JSON.parse(stored) : defaultDurations;
  });
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CYCLES);
    return stored ? parseInt(stored, 10) : defaultCycles;
  });

  // Timer state
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(durations.focus * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [currentCycle, setCurrentCycle] = useState<number>(0); // completed focus cycles in current set

  // Session history
  const [history, setHistory] = useState<Session[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    return stored ? JSON.parse(stored) : [];
  });

  // Settings panel visibility
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempDurations, setTempDurations] = useState<Durations>(durations);
  const [tempCycles, setTempCycles] = useState<number>(cyclesBeforeLong);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timer when mode changes
  useEffect(() => {
    setSecondsLeft(durations[mode] * 60);
  }, [mode, durations]);

  // Timer interval
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSessionComplete = () => {
    // Record session
    const newSession: Session = {
      mode,
      duration: durations[mode],
      timestamp: new Date().toLocaleString(),
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));

    // Determine next mode
    if (mode === "focus") {
      const nextCycle = currentCycle + 1;
      if (nextCycle < cyclesBeforeLong) {
        setMode("short");
        setCurrentCycle(nextCycle);
      } else {
        setMode("long");
        setCurrentCycle(0);
      }
    } else {
      // After break, return to focus
      setMode("focus");
    }
    setRunning(false);
  };

  const startTimer = () => setRunning(true);
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(durations[mode] * 60);
  };

  const toggleSettings = () => setShowSettings(prev => !prev);

  const saveSettings = () => {
    setDurations(tempDurations);
    setCyclesBeforeLong(tempCycles);
    localStorage.setItem(STORAGE_KEY_DURATIONS, JSON.stringify(tempDurations));
    localStorage.setItem(STORAGE_KEY_CYCLES, tempCycles.toString());
    setShowSettings(false);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pomodoro Timer
          <Button variant="ghost" size="icon" onClick={toggleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Timer display */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-primary flex items-center justify-center text-4xl font-bold">
            {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Mode buttons */}
        <div className="flex space-x-2">
          {(["focus", "short", "long"] as Mode[]).map(m => (
            <Button
              key={m}
              variant={mode === m ? "primary" : "outline"}
              onClick={() => {
                setMode(m);
                setRunning(false);
              }}
            >
              {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex space-x-2">
          {!running ? (
            <Button onClick={startTimer}>Start</Button>
          ) : (
            <Button onClick={pauseTimer}>Pause</Button>
          )}
          <Button variant="outline" onClick={resetTimer}>
            Reset
          </Button>
        </div>

        {/* Cycle dots */}
        <div className="flex space-x-1">
          {Array.from({ length: cyclesBeforeLong }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentCycle ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Session history */}
        <div className="w-full">
          <h3 className="text-lg font-medium mb-2">Session History</h3>
          {history.length === 0 ? (
            <p className="text-muted-foreground">No sessions yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((s, idx) => (
                <li key={idx} className="p-2 bg-card rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {s.mode === "focus" ? "Focus" : s.mode === "short" ? "Short Break" : "Long Break"}
                    </span>
                    <span>{s.duration} min</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{s.timestamp}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      {/* Settings panel */}
      {showSettings && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="focus">Focus (min)</Label>
                <Input
                  id="focus"
                  type="number"
                  min={1}
                  value={tempDurations.focus}
                  onChange={e => setTempDurations(prev => ({ ...prev, focus: parseInt(e.target.value, 10) }))}
                />
              </div>
              <div>
                <Label htmlFor="short">Short Break (min)</Label>
                <Input
                  id="short"
                  type="number"
                  min={1}
                  value={tempDurations.short}
                  onChange={e => setTempDurations(prev => ({ ...prev, short: parseInt(e.target.value, 10) }))}
                />
              </div>
              <div>
                <Label htmlFor="long">Long Break (min)</Label>
                <Input
                  id="long"
                  type="number"
                  min={1}
                  value={tempDurations.long}
                  onChange={e => setTempDurations(prev => ({ ...prev, long: parseInt(e.target.value, 10) }))}
                />
              </div>
              <div>
                <Label htmlFor="cycles">Cycles before Long Break</Label>
                <Input
                  id="cycles"
                  type="number"
                  min={1}
                  value={tempCycles}
                  onChange={e => setTempCycles(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
};

export default Pomodoro;