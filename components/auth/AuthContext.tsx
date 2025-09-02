/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  access_token: string;
  token_type: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  industry?: string;
  education_level?: string;
  years_experience?: number;
  current_role?: string;
  career_goals?: string;
  is_verified: boolean | any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  refreshOTP: (email: string) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchCareerPath: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const saveUserToStorage = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const removeUserFromStorage = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const userData = await response.json();
      saveUserToStorage(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, fullName: string, password: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, 'username' : fullName, password }),
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const result = await response.json();
      // Don't set user here as they need to verify OTP first
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    removeUserFromStorage();
  };

  const requestOTP = async (email: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, 'code': otp }),
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OTP verification failed');
      }

      const userData = await response.json();
      saveUserToStorage(userData.user);
      return userData;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  const refreshOTP = async (email: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/auth/refresh-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Refresh OTP error:', error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!user?.access_token) {
        throw new Error('No access token available');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/profile/me`, {
        method: 'GET',
        headers: {
        'Authorization': `${user?.token_type} ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user profile');
      }

      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (error) {
      console.error('Fetch user profile error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user?.access_token) {
        throw new Error('No access token available');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `${user?.token_type} ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
       
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const fetchCareerPath = async () => {
    try {
      if (!user?.access_token || !userProfile?.id) {
        throw new Error('No access token or user ID available');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${backendUrl}/api/career-path/for-user/${userProfile.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `${user?.token_type} ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
       
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch career path');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch career path error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    login,
    signup,
    logout,
    requestOTP,
    verifyOTP,
    refreshOTP,
    fetchUserProfile,
    updateProfile,
    fetchCareerPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
