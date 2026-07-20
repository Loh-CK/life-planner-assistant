import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  updated_at: string;
}

export const useBudgets = () => {
  const { userId } = useCurrentUser();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!userId) {
      setBudgets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId);
      if (fetchError) throw fetchError;
      setBudgets(data as Budget[]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const setBudget = async (category: string, monthlyLimit: number) => {
    if (!userId) return;
    try {
      const { error: upsertError } = await supabase
        .from("budgets")
        .upsert(
          {
            user_id: userId,
            category,
            monthly_limit: monthlyLimit,
          },
          { onConflict: "user_id,category" }
        )
        .select();
      if (upsertError) throw upsertError;
      await fetchBudgets();
    } catch (err: any) {
      setError(err?.message ?? "Failed to set budget");
    }
  };

  const deleteBudget = async (category: string) => {
    if (!userId) return;
    try {
      const { error: deleteError } = await supabase
        .from("budgets")
        .delete()
        .eq("user_id", userId)
        .eq("category", category);
      if (deleteError) throw deleteError;
      await fetchBudgets();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete budget");
    }
  };

  const refetch = () => fetchBudgets();

  return { budgets, loading, error, setBudget, deleteBudget, refetch };
};