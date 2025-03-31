import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../../services/SSO/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await getMe();
        if (!allowedRoles || allowedRoles.includes(data.role)) {
          setUser(data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [allowedRoles]);

  if (loading) return <div>載入中...</div>;
  if (!user) return <Navigate to="/loginpage" replace />;
  return children;
};

export default ProtectedRoute;