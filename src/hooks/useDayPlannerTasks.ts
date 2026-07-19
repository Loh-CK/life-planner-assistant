import { useCalendarTasks } from '@/hooks/useCalendarTasks';
import { useEffect, useState } from 'react';

export const useDayPlannerTasks = () => {
  const { tasksByDate } = useCalendarTasks();
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayTasks(tasksByDate[today] ?? []);
  }, [tasksByDate]);

  return { todayTasks };
};