import { useCalendarTasks } from '@/hooks/useCalendarTasks';
import { useEffect, useState } from 'react';

export const useDayPlannerView = () => {
  const { tasksByDate } = useCalendarTasks();
  const [today, setToday] = useState<string | null>(null);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    const d = new Date().toISOString().split('T')[0];
    setToday(d);
    setTodayTasks(tasksByDate[d] ?? []);
  }, [tasksByDate]);

  return { today, todayTasks };
};