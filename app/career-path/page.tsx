'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

interface UserProfile {
  current_role: string;
  target_role: string;
  location_context: string;
  visa_considerations: string;
  experience_level: string;
}

interface CareerStage {
  title: string;
  confidence_score: number;
  description: string;
  [key: string]: unknown; // Allow additional properties for different stage types
}

interface CareerRoadmapData {
  stage_1_mirror: CareerStage;
  stage_2_horizon: CareerStage;
  stage_3_bridge: CareerStage;
  stage_4_forge: CareerStage;
  stage_5_peak: CareerStage;
  user_profile: UserProfile;
}


function CareerPathContent() {
  const [careerRoadmapData, setCareerRoadmapData] = useState<CareerRoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get career path data from URL params or localStorage
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(dataParam);
        const parsedData = JSON.parse(decodedData);
        
        // Handle different data structures
        if (parsedData.career_roadmap) {
          setCareerRoadmapData(parsedData.career_roadmap);
        } else if (parsedData.career_path) {
          // Legacy structure - convert to new format if needed
          setCareerRoadmapData(null);
          console.log('Legacy career_path structure detected, needs conversion');
        } else {
          console.error('Invalid data structure:', parsedData);
        }
      } catch (error) {
        console.error('Error parsing career path data:', error);
        console.error('Raw data param:', dataParam);
      }
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('careerPath');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          
          // Handle different data structures
          if (parsedData.career_roadmap) {
            setCareerRoadmapData(parsedData.career_roadmap);
          } else if (parsedData.career_path) {
            // Legacy structure
            setCareerRoadmapData(null);
            console.log('Legacy career_path structure in localStorage');
          } else {
            console.error('Invalid stored data structure:', parsedData);
          }
        } catch (error) {
          console.error('Error parsing stored career path data:', error);
        }
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBackToOnboarding = () => {
    router.push('/onboarding');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-white">
          <div className="w-fit flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750A4]"></div>
            <p className="text-[#49454F] text-[14px]">Loading your career path...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!careerRoadmapData) {
    return (
      <ProtectedRoute>
        <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-white">
          <div className="w-fit flex flex-col items-center gap-4 text-center">
            <h1 className="text-[#1C1B1F] text-[24px] font-[500]">Career Path Not Found</h1>
            <p className="text-[#49454F] text-[16px]">No career path data available.</p>
            <button
              onClick={handleBackToOnboarding}
              className="bg-[#6750A4] px-6 py-3 rounded-full text-white font-[500] hover:bg-[#5A3E9A] transition-colors"
            >
              Go Back to Onboarding
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen w-full bg-white">
        {/* Header */}
        <div className="bg-[#FEF7FF] border-b border-[#E8DEF8] px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToOnboarding}
                className="flex items-center gap-2 text-[#6750A4] hover:text-[#5A3E9A] transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Onboarding</span>
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-[#6750A4] hover:text-[#5A3E9A] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* User Profile Section */}
          <div className="mb-8">
            <h1 className="text-[#1C1B1F] text-[32px] font-[500] mb-4">Your Career Roadmap</h1>
            <div className="bg-[#FEF7FF] border border-[#E8DEF8] rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Current Role:</span> {careerRoadmapData.user_profile.current_role}</div>
                <div><span className="font-medium">Experience:</span> {careerRoadmapData.user_profile.experience_level}</div>
                <div><span className="font-medium">Target:</span> {careerRoadmapData.user_profile.target_role}</div>
                <div><span className="font-medium">Location:</span> {careerRoadmapData.user_profile.location_context}</div>
              </div>
            </div>
          </div>

          {/* Career Stages */}
          <div className="space-y-8">
            {/* Stage 1: Mirror */}
            <div className="border border-[#E8DEF8] rounded-lg overflow-hidden">
              <div className="bg-[#6750A4] text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-[#6750A4] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {careerRoadmapData.stage_1_mirror.confidence_score}%
                  </div>
                  <h2 className="text-[24px] font-[500]">{careerRoadmapData.stage_1_mirror.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#49454F] text-[16px] leading-relaxed mb-4">{careerRoadmapData.stage_1_mirror.description}</p>
                {typeof careerRoadmapData.stage_1_mirror.market_position === 'string' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Market Position:</h3>
                    <p className="text-sm text-gray-600">{careerRoadmapData.stage_1_mirror.market_position}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2: Horizon */}
            <div className="border border-[#E8DEF8] rounded-lg overflow-hidden">
              <div className="bg-[#6750A4] text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-[#6750A4] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {careerRoadmapData.stage_2_horizon.confidence_score}%
                  </div>
                  <h2 className="text-[24px] font-[500]">{careerRoadmapData.stage_2_horizon.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#49454F] text-[16px] leading-relaxed">{careerRoadmapData.stage_2_horizon.description}</p>
              </div>
            </div>

            {/* Stage 3: Bridge */}
            <div className="border border-[#E8DEF8] rounded-lg overflow-hidden">
              <div className="bg-[#6750A4] text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-[#6750A4] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {careerRoadmapData.stage_3_bridge.confidence_score}%
                  </div>
                  <h2 className="text-[24px] font-[500]">{careerRoadmapData.stage_3_bridge.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#49454F] text-[16px] leading-relaxed">{careerRoadmapData.stage_3_bridge.description}</p>
              </div>
            </div>

            {/* Stage 4: Forge */}
            <div className="border border-[#E8DEF8] rounded-lg overflow-hidden">
              <div className="bg-[#6750A4] text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-[#6750A4] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {careerRoadmapData.stage_4_forge.confidence_score}%
                  </div>
                  <h2 className="text-[24px] font-[500]">{careerRoadmapData.stage_4_forge.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#49454F] text-[16px] leading-relaxed">{careerRoadmapData.stage_4_forge.description}</p>
              </div>
            </div>

            {/* Stage 5: Peak */}
            <div className="border border-[#E8DEF8] rounded-lg overflow-hidden">
              <div className="bg-[#6750A4] text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-[#6750A4] rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {careerRoadmapData.stage_5_peak.confidence_score}%
                  </div>
                  <h2 className="text-[24px] font-[500]">{careerRoadmapData.stage_5_peak.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#49454F] text-[16px] leading-relaxed">{careerRoadmapData.stage_5_peak.description}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={handleBackToOnboarding}
              className="bg-transparent border border-[#6750A4] text-[#6750A4] px-8 py-3 rounded-full font-[500] hover:bg-[#6750A4] hover:text-white transition-colors"
            >
              Modify Onboarding
            </button>
            <button
              onClick={() => window.print()}
              className="bg-[#6750A4] text-white px-8 py-3 rounded-full font-[500] hover:bg-[#5A3E9A] transition-colors"
            >
              Print Career Path
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function CareerPath() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="font-sans flex items-center justify-center min-h-screen w-full p-8 bg-white">
          <div className="w-fit flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750A4]"></div>
            <p className="text-[#49454F] text-[14px]">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    }>
      <CareerPathContent />
    </Suspense>
  );
}
