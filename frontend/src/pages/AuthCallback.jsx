import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const auth = searchParams.get('auth');
      
      if (auth === 'success') {
        await checkAuth();
        navigate('/dashboard', { replace: true });
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
