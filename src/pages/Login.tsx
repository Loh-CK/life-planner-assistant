"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import { Mail, Lock, Calendar, CheckCircle } from "lucide-react";

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-8">
        <div className="text-center">
          <Calendar className="w-32 h-32 mx-auto mb-4 opacity-20" />
          <h1 className="text-4xl font-bold mb-2">Life Planner Assistant</h1>
          <p className="text-lg">Plan your day, your way.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg p-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Password field */}
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign In"
                    : "Sign Up"}
              </Button>
            </form>

            <p className="text-sm text-center mt-4">
              {mode === "login" ? "No account?" : "Already have an account?"}
              <button
                type="button"
                className="ml-1 text-primary underline"
                onClick={() => setMode(prev => (prev === "login" ? "signup" : "login"))}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;