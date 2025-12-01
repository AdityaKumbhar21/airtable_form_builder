import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Spinner } from '@/components/ui';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        authAPI.setToken(token);
        const user = await checkAuth();
        if (user) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login?error=auth_failed', { replace: true });
        }
      } else {
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, checkAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-stone-500">Completing authentication...</p>
      </div>
    </div>
  );
}
