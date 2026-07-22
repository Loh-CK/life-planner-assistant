"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CalendarDays,
  ListTodo,
  DollarSign,
  BrainCircuit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: CalendarDays, label: "Calendar & day planner", description: "Time-block your day and never miss an event." },
  { icon: ListTodo, label: "Tasks & notes", description: "Keep projects, priorities and ideas in one place." },
  { icon: DollarSign, label: "Budgets & expenses", description: "Track spending against a budget, category by category." },
  { icon: BrainCircuit, label: "AI Advisor", description: "Ask your local Ollama model to help plan and prioritize." },
];

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        showSuccess("Logged in successfully");
        navigate("/dashboard");
      } else {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) throw signupError;
        showSuccess("Account created – check your email for confirmation");
      }
    } catch (err: any) {
      const msg = err?.message ?? "An unexpected error occurred";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branded panel – hidden on mobile */}
      <div className="hidden lg:flex relative flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-orange-400 to-secondary p-10 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        {/* Subtle dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Life Planner</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-3">
            Plan your day,
            <br />
            your way.
          </h1>
          <p className="text-lg text-white/85 max-w-md">
            One place for your calendar, tasks, budget and a personal AI advisor
            that actually knows your schedule.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 mb-2 opacity-90" />
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-white/70 mt-0.5">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Life Planner</span>
          </div>

          <Card className="rounded-2xl border shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Sign in to get back to your plan."
                    : "Start planning your day in minutes."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full py-3" disabled={loading}>
                  {loading
                    ? "Please wait…"
                    : mode === "login"
                      ? "Sign In"
                      : "Sign Up"}
                </Button>
              </form>

              <p className="text-sm text-center mt-5 text-muted-foreground">
                {mode === "login" ? "No account?" : "Already have an account?"}
                <button
                  type="button"
                  className="ml-1 font-medium text-primary hover:underline"
                  onClick={() => setMode(prev => (prev === "login" ? "signup" : "login"))}
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
