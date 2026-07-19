import { SessionContextProvider } from '@/components/SessionContextProvider';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import { useEffect, useState } from 'react';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

const App = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for initial session check
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <SessionContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={session ? <Index /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SessionContextProvider>
  );
};

export default App;