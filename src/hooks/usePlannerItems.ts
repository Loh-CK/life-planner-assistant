import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export type PlannerItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  item_date: string;
  start_time: string;
  end_time: string;
  category: string;
  priority: string;
  location: string;
  completed: boolean;
  item_type: string;
  created_at: string;
  transaction_type: "income" | "expense";
  payment_method: string;
  amount: number;
};

export const usePlannerItems = (
  itemType?: "task" | "event" | "timeblock" | "expense"
) => {
  const { userId } = useCurrentUser();
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mutationInProgress = useRef(false);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("planner_items")
        .select("*")
        .eq("user_id", userId);
      if (itemType) {
        query = query.eq("item_type", itemType);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setItems(data as PlannerItem[]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [userId, itemType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (data: Partial<PlannerItem>) => {
    if (!userId || mutationInProgress.current) return;
    mutationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data: inserted, error: insertError } = await supabase
        .from("planner_items")
        .insert({
          ...data,
          user_id: userId,
          item_type: itemType ?? data.item_type,
        })
        .select();
      if (insertError) throw insertError;
      setItems(prev => [...prev, inserted![0] as PlannerItem]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to add item");
    } finally {
      setLoading(false);
      mutationInProgress.current = false;
    }
  };

  const updateItem = async (id: string, data: Partial<PlannerItem>) => {
    if (!userId || mutationInProgress.current) return;
    mutationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data: updated, error: updateError } = await supabase
        .from("planner_items")
        .update(data)
        .eq("id", id)
        .eq("user_id", userId)
        .select();
      if (updateError) throw updateError;
      setItems(prev =>
        prev.map(item => (item.id === id ? (updated![0] as PlannerItem) : item))
      );
    } catch (err: any) {
      setError(err?.message ?? "Failed to update item");
    } finally {
      setLoading(false);
      mutationInProgress.current = false;
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId || mutationInProgress.current) return;
    mutationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("planner_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete item");
    } finally {
      setLoading(false);
      mutationInProgress.current = false;
    }
  };

  const toggleCompleted = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, { completed: !item.completed });
  };

  const refetch = () => fetchItems();

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
    refetch,
  };
};
