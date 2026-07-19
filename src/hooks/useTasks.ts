import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const useTasks = () => {
  const { session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user?.id);
      if (error) console.error(error);
      else setTasks(data ?? []);
    };
    fetchTasks();
  }, [session]);

  return { tasks, setTasks };
};