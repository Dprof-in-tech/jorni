'use client';

import Link from "next/link";
import { useAuth } from "../components/auth/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoading, fetchUserProfile, fetchCareerPath } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndCareerPath = async () => {
      if (!isLoading && user) {
        try {
          // Fetch user profile first to get user ID
          await fetchUserProfile();
          
          // Check if user has an existing career path
          const careerPath = await fetchCareerPath();
          if (careerPath) {
            // User has a career path, redirect to career path page
            localStorage.setItem('careerPath', JSON.stringify(careerPath));
            const encodedData = encodeURIComponent(JSON.stringify(careerPath.career_path || careerPath));
            router.push(`/career-path?data=${encodedData}`);
          } else {
            // No career path exists, redirect to onboarding
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking career path:', error);
          // If there's an error, redirect to onboarding
          router.push('/onboarding');
        }
      }
    };

    checkUserAndCareerPath();
  }, [user, isLoading, router, fetchUserProfile, fetchCareerPath]);

  if (isLoading) {
    return (
      <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-[#EADDFF]">
        <div className="w-fit flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750A4]"></div>
          <p className="text-[#4A4459] text-[14px]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-[#EADDFF]">
     <div className="w-fit flex flex-col items-center gap-3">
      <h1 className="text-[#4A4459] text-[14px] font-[500]">Lets get you there</h1>
      <Link href="/signup" className="bg-[#6750A4] w-[205px] h-[40px] rounded-full flex items-center justify-center px-4 py-6 text-[#fff] no-underline">Create account</Link>
      <Link href="/login" className="bg-transparent border border-[#4A4459] w-[205px] h-[40px] rounded-full flex items-center justify-center px-4 py-6 text-[#49454F] no-underline">Login</Link>
     </div>
    </div>
  );
}
