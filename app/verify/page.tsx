/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOTP, refreshOTP } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(email, otp);
      // Redirect to onboarding after successful verification
      router.push('/onboarding');
    } catch (error: any) {
      setErrors({ submit: error.message || 'OTP verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await refreshOTP(email);
      setErrors({});
    } catch (error: any) {
      setErrors({ resend: error.message || 'Failed to resend code' });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  return (
    <div className="font-sans flex items-center justify-center min-h-screen w-full py-4 px-2 bg-white">
      <div className="w-full md:max-w-2xl mx-auto px-3 py-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-[#1C1B1F] text-[22px] font-[400] mb-2">Verify your email</h1>
            <p className="text-[#49454F] text-[14px]">We&apos;ve sent a code to {email || 'your email'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input 
                type="text" 
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                className={`w-full h-[56px] px-4 border rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] text-center text-lg tracking-widest ${
                  errors.otp ? 'border-red-500' : 'border-[#79747E]'
                }`}
                maxLength={6}
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
                {errors.submit}
              </div>
            )}

            {errors.resend && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
                {errors.resend}
              </div>
            )}
            
            <div className="space-y-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`bg-[#6750A4] w-full h-[48px] rounded-full text-white font-[500] ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-[#6750A4] text-[14px] font-[500] hover:underline"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={
      <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-white">
        <div className="w-fit flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750A4]"></div>
          <p className="text-[#49454F] text-[14px]">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}