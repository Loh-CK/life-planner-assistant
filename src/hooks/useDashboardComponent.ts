import { useDashboardPage } from '@/hooks/useDashboardPage';
import { useEffect, useState } from 'react';

export const useDashboardComponent = () => {
  const { dashboardTasks } = useDashboardPage();
  const [displayTasks, setDisplayTasks] = useState<any[]>([]);

  useEffect(() => {
    setDisplayTasks(dashboardTasks);
  }, [dashboardTasks]);

  return { displayTasks };
};