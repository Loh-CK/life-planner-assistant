import { useDayPlannerView } from '@/hooks/useDayPlannerView';
import { useEffect, useState } from 'react';

export const useDayPlannerPage = () => {
  const { today, todayTasks } = useDayPlannerView();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks(todayTasks);
  }, [todayTasks]);

  return { today, tasks };
};