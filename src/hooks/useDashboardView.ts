import { useDashboardTasks } from '@/hooks/useDashboardTasks';
import { useEffect, useState } from 'react';

export const useDashboardView = () => {
  const { recentTasks } = useDashboardTasks();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks(recentTasks);
  }, [recentTasks]);

  return { tasks };
};