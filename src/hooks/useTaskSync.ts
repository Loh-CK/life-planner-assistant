import { useCalendarComponent } from '@/hooks/useCalendarComponent';
import { useDayPlannerComponent } from '@/hooks/useDayPlannerComponent';
import { useDashboardComponent } from '@/hooks/useDashboardComponent';
import { useEffect, useState } from 'react';

export const useTaskSync = () => {
  const { displayTasks: calendarTasks } = useCalendarComponent();
  const { displayTasks: dayPlannerTasks } = useDayPlannerComponent();
  const { displayTasks: dashboardTasks } = useDashboardComponent();

  // Simple sync: just expose all three arrays
  return { calendarTasks, dayPlannerTasks, dashboardTasks };
};