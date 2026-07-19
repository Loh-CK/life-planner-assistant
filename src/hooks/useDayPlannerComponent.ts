import { useDayPlannerPage } from '@/hooks/useDayPlannerPage';
import { useEffect, useState } from 'react';

export const useDayPlannerComponent = () => {
  const { today, tasks } = useDayPlannerPage();
  const [displayTasks, setDisplayTasks] = useState<any[]>([]);

  useEffect(() => {
    setDisplayTasks(tasks);
  }, [tasks]);

  return { today, displayTasks };
};