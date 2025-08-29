/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ArrowLeft, Check, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export default function Onboarding() {
  const { user, userProfile, logout, fetchUserProfile } = useAuth();
  const router = useRouter();

  const [isGeneratingCareerPath, setIsGeneratingCareerPath] = useState(false);



  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const generateCareerPath = async () => {
    setIsGeneratingCareerPath(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Prepare the career path data
      const careerPathData = {
          industry: selections[1], // Industry selection
          years_experience: selections[3], // Years in industry
          current_role: selections[4], // Current role
        career_goal: selections[5], // Career goals/motivation
        career_goals_text: selections[5], // Career goals/motivation
          education_level: selections[2], // Education level
          location: selections[0], // Location (Ireland or not)
        userEmail: userProfile?.email || '',
        fullName: userProfile?.username || '',
      };

      const response = await fetch(`${backendUrl}/api/career-path/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `${user?.token_type} ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerPathData),
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate career path');
      }

      const careerPath = await response.json();
      
      // Store the career path data in localStorage
      localStorage.setItem('careerPath', JSON.stringify(careerPath));
      
      // Redirect to career path page with data in URL params
      const encodedData = encodeURIComponent(JSON.stringify(careerPath.career_path || careerPath));
      router.push(`/career-path?data=${encodedData}`);
  
      
      } catch (error: any) {
    console.error('Career path generation error:', error);
    // You could show an error message to the user here
    alert('Failed to generate career path. Please try again.');
  } finally {
    setIsGeneratingCareerPath(false)
  }
};

  // Fetch user profile when component mounts
  useEffect(() => {
    if (!user) {
      // If no user is logged in, redirect to home
      router.push('/');
    } else if (user && !userProfile) {
      // Fetch user profile if we have a user but no profile
      fetchUserProfile();
    }
  }, [user, userProfile, router, fetchUserProfile]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});

  const steps = [
    {
      title: "Location",
      subtitle: "Are you currently based in Ireland?",
      type: "binary",
      options: ["Yes", "No"]
    },
    {
      title: "Industry", 
      subtitle: "Which industry are you currently in?",
      type: "grid",
      options: ["Sales", "Tech", "Retail", "Legal", "Other"]
    },
    {
      title: "Education",
      subtitle: "What is your highest level of education?",
      type: "dropdown",
      placeholder: "Select your education level",
      options: ["High School", "Bachelor's", "Master's", "PhD"]
    },
    {
      title: "Years",
      subtitle: "How many years have you been in this industry?",
      type: "dropdown",
      options: ["1-2 years", "3-5 years", "5+ years"],
      placeholder: "1-2 years"
    },
    {
      title: "Current role",
      subtitle: "What is your current role?",
      type: "dropdown",
      placeholder: "Select your current role",
      options: ["Engineer", "Manager", "Director", "Other"]
    },
    {
      title: "Motivation",
      subtitle: "Tell us about your career goals",
      type: "text"
    }
  ];

  const currentStepData = steps[currentStep];

  const handleSelection = (value: string) => {
    setSelections(prev => ({
      ...prev,
      [currentStep]: value
    }));
    
    // If this is the last step, don't auto-advance
    if (currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const isStepComplete = () => {
    const selection = selections[currentStep];
    if (!selection) return false;
    
    // For text fields, check if there's meaningful content
    if (currentStepData.type === "text") {
      return selection.trim().length > 0;
    }
    
    return true;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ProtectedRoute>
      <div className="font-sans flex items-center justify-center min-h-screen w-full px-2 py-3 bg-white relative">
      <div className="w-full md:max-w-xl mx-auto px-2 py-4 flex flex-col">

          <ArrowLeft
            onClick={currentStep === 0 ? undefined : prevStep}
            className={`text-[#000] absolute left-[5%] top-[5%] ${currentStep === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            aria-disabled={currentStep === 0}
          />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="absolute right-[5%] top-[5%] flex items-center gap-2 text-[#6750A4] hover:text-[#5A3E9A] transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">Logout</span>
          </button>


        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2">
            <h2 className="text-[#1C1B1F] text-[20px] font-[400] mb-2">{currentStepData.title}</h2>
            <p className="text-[#49454F] text-[14px]">{currentStepData.subtitle}</p>
          </div>

          <div className="flex-1 gap-4">
            {currentStepData.type === "binary" && (
              <div className="flex gap-0">
                {currentStepData.options?.map((option, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSelection(option)}
                    className={`w-full h-[48px] border border-[#79747E] ${index === 0 ? "rounded-l-full" : "rounded-r-full"} text-[#1C1B1F] hover:bg-[#F3F3F3] ${
                      selections[currentStep] === option ? "bg-[#E8DEF8] text-black" : ""
                    } flex items-center justify-center gap-2`}
                  >
                    {selections[currentStep] === option && <Check size={16} className="text-black" />}
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentStepData.type === "grid" && (
              <div className="grid grid-cols-3 gap-2">
                {currentStepData.options?.map((option, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSelection(option)}
                    className={`h-[48px] border border-[#79747E] rounded-[4px] text-[#1C1B1F] hover:bg-[#F3F3F3] text-[14px] ${
                      selections[currentStep] === option ? "bg-[#E8DEF8] text-black" : ""
                    } flex items-center justify-center gap-1`}
                  >
                    {selections[currentStep] === option && <Check size={14} className="text-black" />}
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentStepData.type === "dropdown" && (
              <div className="w-full">
                <select 
                  value={selections[currentStep] || ""}
                  onChange={(e) => handleSelection(e.target.value)}
                  className="w-full h-[56px] px-4 border border-[#79747E] text-[#1C1B1F] bg-white"
                >
                  <option value="">{currentStepData.placeholder}</option>
                  {currentStepData.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentStepData.type === "text" && (
              <div>
                <textarea 
                  value={selections[currentStep] || ""}
                  onChange={(e) => handleSelection(e.target.value)}
                  placeholder="Tell us about your career goals..."
                  className="w-full h-[120px] p-4 border border-[#79747E] rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] resize-none"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {currentStep === steps.length - 1 && (
              <button 
                onClick={generateCareerPath}
                disabled={!isStepComplete()}
                className={`w-full h-[48px] rounded-full text-white font-[500] ${
                  isStepComplete() 
                    ? "bg-[#6750A4] hover:bg-[#5A3E9A]" 
                    : "bg-gray-300 cursor-not-allowed"
                } ${isGeneratingCareerPath && "bg-gray-300 cursor-not-allowed"}`}
              >
               {isGeneratingCareerPath ? "Finishing..." : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}