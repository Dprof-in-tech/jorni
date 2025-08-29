/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signup(formData.email, formData.fullName, formData.password);
      // Redirect to OTP verification page
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Signup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="font-sans flex items-center justify-center min-h-screen w-full px-2 py-4 bg-white">
      <div className="w-full h-full px-3 py-6 flex flex-col md:max-w-4xl mx-auto">
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-[#1C1B1F] text-[22px] font-[400] mb-2">Create a new account</h1>
            <p className="text-[#49454F] text-[14px]">Your journey begins here</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder=""
                className={`w-full h-[56px] px-4 border rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] ${
                  errors.email ? 'border-red-500' : 'border-[#79747E]'
                }`}
              />
              <p className="absolute -top-2.5 bg-[#FEF7FF] px-2 text-[12px] text-[#49454F] left-4">Email address</p>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder=""
                className={`w-full h-[56px] px-4 border rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] ${
                  errors.fullName ? 'border-red-500' : 'border-[#79747E]'
                }`}
              />
              <p className="absolute -top-2.5 bg-[#FEF7FF] px-2 text-[12px] text-[#49454F] left-4">Full name</p>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
            <div className="relative">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder=""
                className={`w-full h-[56px] px-4 border rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] ${
                  errors.password ? 'border-red-500' : 'border-[#79747E]'
                }`}
              />
              <p className="absolute -top-2.5 bg-[#FEF7FF] px-2 text-[12px] text-[#49454F] left-4">Password</p>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div className="relative">
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder=""
                className={`w-full h-[56px] px-4 border rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] ${
                  errors.confirmPassword ? 'border-red-500' : 'border-[#79747E]'
                }`}
              />
              <p className="absolute -top-2.5 bg-[#FEF7FF] px-2 text-[12px] text-[#49454F] left-4">Confirm password</p>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
                {errors.submit}
              </div>
            )}

            <div className="mt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`bg-[#6750A4] w-full h-[48px] rounded-full text-white font-[500] mb-4 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating account...' : 'Continue'}
              </button>
              
              <div className="text-center">
                <span className="text-[#49454F] text-[14px]">Already registered? </span>
                <a href="/login" className="text-[#6750A4] text-[14px] font-[500]">Login here</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}