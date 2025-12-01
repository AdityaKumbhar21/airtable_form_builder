import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Layers, ArrowRight, Shield, Zap, Database } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessages = {
        invalid_state: 'Invalid authentication state. Please try again.',
        missing_verifier: 'Authentication verification failed. Please try again.',
        missing_code: 'Authentication code missing. Please try again.',
        internal_error: 'An error occurred. Please try again.',
      };
      toast.error(errorMessages[error] || 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    authAPI.login();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Branding */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-stone-900">
                FormBuilder
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
              Build forms that{' '}
              <span className="text-orange-500">
                sync with Airtable
              </span>
            </h1>

            <p className="text-xl text-stone-600 leading-relaxed">
              Create beautiful, responsive forms in minutes and seamlessly push responses 
              directly to your Airtable bases. No code required.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Lightning Fast</h3>
                  <p className="text-sm text-stone-500">Build forms in minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Database className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Airtable Sync</h3>
                  <p className="text-sm text-stone-500">Real-time data sync</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Secure</h3>
                  <p className="text-sm text-stone-500">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-xl border border-stone-200">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription className="text-base">
                  Connect your Airtable account to start building forms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 200 200" fill="currentColor">
                    <path d="M90.04,26.86L38.68,45.61c-2.56,0.94-2.51,4.58,0.08,5.44l51.81,17.31c4.04,1.35,8.4,1.35,12.44,0l51.68-17.27c2.59-0.87,2.64-4.51,0.08-5.44L103.41,26.9C99.33,25.4,94.8,25.11,90.04,26.86z"/>
                    <path d="M106.29,78.43c-0.85,0.29-1.72,0.52-2.61,0.7c-2.51,0.51-5.11,0.51-7.62,0.01c-0.9-0.18-1.78-0.41-2.64-0.71L42.03,60.88c-2.58-0.87-5.28,1.04-5.28,3.76v65.03c0,2.16,1.38,4.07,3.43,4.76l52.67,17.61c4.04,1.35,8.4,1.35,12.44,0l52.54-17.57c2.05-0.69,3.43-2.6,3.43-4.76V64.64c0-2.72-2.7-4.63-5.28-3.76L106.29,78.43z"/>
                  </svg>
                  Continue with Airtable
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-stone-500">
                      Secure OAuth 2.0
                    </span>
                  </div>
                </div>

                <p className="text-center text-sm text-stone-500">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-orange-500 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-orange-500 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
