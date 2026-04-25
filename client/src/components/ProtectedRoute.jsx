import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from './LoadingState.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in to continue');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingState title="Checking your session" description="Preparing your workspace." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
