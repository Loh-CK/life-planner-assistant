import { useDashboardTasks } from '@/hooks/useDashboardTasks';
import { useEffect, useState } from 'react';

export const useCalendarView = () => {
  const { tasksByDate } = useCalendarTasks();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (selectedDate) setSelectedTasks(tasksByDate[selectedDate] ?? []);
  }, [selectedDate, tasksByDate]);

  return { selectedDate, setSelectedDate, selectedTasks };
};