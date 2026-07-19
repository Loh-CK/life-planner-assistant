import { useSession } from '@/components/SessionContextProvider';
import { useEffect, useState } from 'react';

export const useCurrentUser = () => {
  const { session } = useSession();
  const [user, setUser] = useState<{ userId: string | null; email: string | null }>({ userId: null, email: null });

  useEffect(() => {
    if (session?.user) {
      setUser({ userId: session.user.id, email: session.user.email ?? null });
    } else {
      setUser({ userId: null, email: null });
    }
  }, [session]);

  return user;
};