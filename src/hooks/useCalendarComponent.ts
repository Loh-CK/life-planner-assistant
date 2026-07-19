import { useCalendarPage } from '@/hooks/useCalendarPage';
import { useEffect, useState } from 'react';

export const useCalendarComponent = () => {
  const { selectedDate, setSelectedDate, tasks } = useCalendarPage();
  const [displayTasks, setDisplayTasks] = useState<any[]>([]);

  useEffect(() => {
    setDisplayTasks(tasks);
  }, [tasks]);

  return { selectedDate, setSelectedDate, displayTasks };
};