import { useTasks } from '@/hooks/useTasks';
import { useEffect, useState } from 'react';

export const useDashboardTasks = () => {
  const { tasks } = useTasks();
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    const sorted = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentTasks(sorted.slice(0, 5));
  }, [tasks]);

  return { recentTasks };
};