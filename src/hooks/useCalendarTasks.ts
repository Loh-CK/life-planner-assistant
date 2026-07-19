import { useTasks } from '@/hooks/useTasks';
import { useEffect, useState } from 'react';

export const useCalendarTasks = () => {
  const { tasks } = useTasks();
  const [tasksByDate, setTasksByDate] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const map: Record<string, any[]> = {};
    tasks.forEach(t => {
      const date = t.task_date ?? 'no-date';
      if (!map[date]) map[date] = [];
      map[date].push(t);
    });
    setTasksByDate(map);
  }, [tasks]);

  return { tasksByDate };
};