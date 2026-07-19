import { useCalendarView } from '@/hooks/useCalendarView';
import { useEffect, useState } from 'react';

export const useCalendarPage = () => {
  const { selectedDate, setSelectedDate, selectedTasks } = useCalendarView();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks(selectedTasks);
  }, [selectedTasks]);

  return { selectedDate, setSelectedDate, tasks };
};