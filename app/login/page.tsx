/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, fetchCareerPath, fetchUserProfile } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const userData = await login(formData.email, formData.password);
      console.log('userData', userData);
      // Redirect to dashboard or home page after successful login
      // Fetch user profile first to get user ID
      const userProfile = await fetchUserProfile(userData);
      console.log('userProfile', userProfile);
 
       // Check if user has an existing career path
       const careerPath = await fetchCareerPath(userData, userProfile);
       if (careerPath) {
         // User has a career path, redirect to career path page
         localStorage.setItem('careerPath', JSON.stringify(careerPath));
         const encodedData = encodeURIComponent(JSON.stringify(careerPath.career_path || careerPath));
         router.push(`/career-path?data=${encodedData}`);
       } else {
         // No career path exists, redirect to onboarding
         router.push('/onboarding');
       }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Login failed' });
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
      <div className="w-full p-6 flex flex-col md:max-w-2xl mx-auto">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-start mb-8">
            <h1 className="text-[#1C1B1F] text-[28px] font-[400] mb-2">Welcome back.</h1>
            <p className="text-[#49454F] text-[14px]">Login to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
          </form>

          {errors.submit && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className={`bg-[#6750A4] w-full h-[48px] rounded-full text-white font-[500] mb-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center">
            <span className="text-[#49454F] text-[14px]">No account yet? </span>
            <a href="/signup" className="text-[#6750A4] text-[14px] font-[500]">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
}