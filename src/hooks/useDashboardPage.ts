import { useDashboardView } from '@/hooks/useDashboardView';
import { useEffect, useState } from 'react';

export const useDashboardPage = () => {
  const { tasks } = useDashboardView();
  const [dashboardTasks, setDashboardTasks] = useState<any[]>([]);

  useEffect(() => {
    setDashboardTasks(tasks);
  }, [tasks]);

  return { dashboardTasks };
};