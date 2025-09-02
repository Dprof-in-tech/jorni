'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

interface CareerPathResource {
  title: string;
  url: string;
}

interface CareerPathMilestone {
  milestone_number: number;
  title: string;
  description: string;
  technical_skills_to_acquire: string[];
  soft_skills_to_develop: string[];
  helpful_resources: CareerPathResource[];
}

interface CareerPathData {
  summary: string;
  milestones: CareerPathMilestone[];
}

export default function CareerPath() {
  const [careerPathData, setCareerPathData] = useState<CareerPathData | null>(null);
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
        if (parsedData.career_path) {
          setCareerPathData(parsedData.career_path);
        } else if (parsedData.summary && parsedData.milestones) {
          setCareerPathData(parsedData);
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
          if (parsedData.career_path) {
            setCareerPathData(parsedData.career_path);
          } else if (parsedData.summary && parsedData.milestones) {
            setCareerPathData(parsedData);
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

  if (!careerPathData) {
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
          {/* Summary Section */}
          <div className="mb-8">
            <h1 className="text-[#1C1B1F] text-[32px] font-[500] mb-4">Your Career Path</h1>
            <div className="bg-[#FEF7FF] border border-[#E8DEF8] rounded-lg p-6">
              <p className="text-[#49454F] text-[18px] leading-relaxed">{careerPathData.summary}</p>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-8">
            {careerPathData.milestones.map((milestone) => (
              <div key={milestone.milestone_number} className="border border-[#E8DEF8] rounded-lg overflow-hidden">
                {/* Milestone Header */}
                <div className="bg-[#6750A4] text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-[#6750A4] rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {milestone.milestone_number}
                    </div>
                    <h2 className="text-[24px] font-[500]">{milestone.title}</h2>
                  </div>
                </div>

                {/* Milestone Content */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-[#1C1B1F] text-[18px] font-[500] mb-2">Description</h3>
                    <p className="text-[#49454F] text-[16px] leading-relaxed">{milestone.description}</p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Technical Skills */}
                    <div>
                      <h3 className="text-[#1C1B1F] text-[18px] font-[500] mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#6750A4]" />
                        Technical Skills to Acquire
                      </h3>
                      <ul className="space-y-2">
                        {milestone.technical_skills_to_acquire.map((skill, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#6750A4] rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-[#49454F] text-[15px]">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Soft Skills */}
                    <div>
                      <h3 className="text-[#1C1B1F] text-[18px] font-[500] mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#6750A4]" />
                        Soft Skills to Develop
                      </h3>
                      <ul className="space-y-2">
                        {milestone.soft_skills_to_develop.map((skill, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-[#6750A4] rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-[#49454F] text-[15px]">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-[#1C1B1F] text-[18px] font-[500] mb-3">Helpful Resources</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {milestone.helpful_resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-[#E8DEF8] rounded-lg hover:bg-[#FEF7FF] transition-colors group"
                        >
                          <span className="text-[#6750A4] text-[14px] flex-1 group-hover:text-[#5A3E9A] transition-colors">
                            {resource.title}
                          </span>
                          <ExternalLink size={16} className="text-[#6750A4] group-hover:text-[#5A3E9A] transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
