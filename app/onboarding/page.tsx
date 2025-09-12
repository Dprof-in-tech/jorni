/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ArrowLeft, Check, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export default function Onboarding() {
  const { user, userProfile, logout, fetchUserProfile, updateProfile } = useAuth();
  const router = useRouter();

  const [isGeneratingCareerPath, setIsGeneratingCareerPath] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);



  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const uploadResume = async (file: File) => {
    setIsUploadingResume(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${backendUrl}/api/cv/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `${user?.token_type} ${user?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload resume');
      }

      const result = await response.json();
      console.log('Resume uploaded successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Resume upload error:', error);
      throw error;
    } finally {
      setIsUploadingResume(false);
    }
  };

  const generateCareerPath = async () => {
    setIsGeneratingCareerPath(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // First, update the user profile with onboarding data
      const profileData = {
        current_location: selections[0],
        target_location: selections[1],
        immigration_status: selections[2],
        visa_status: selections[3],
        neurodiversity_considerations: selections[4],
        career_goals: selections[6],
        is_verified: true
      };

      try {
         await updateProfile(profileData);
      } catch (error: any){
        console.error(error);
      }

      // Prepare the career path data
      const careerPathData = {
          current_location: selections[0],
          target_location: selections[1],
          immigration_status: selections[2],
          visa_status: selections[3],
          neurodiversity_considerations: selections[4],
          career_goals: selections[6],
      };

      const response = await fetch(`${backendUrl}/api/career-path/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `${user?.token_type} ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerPathData),
      });

      console.log('career path response', response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate career path');
      }

      const careerPath = await response.json();
      
      // Store the career path data in localStorage
      localStorage.setItem('careerPath', JSON.stringify(careerPath));
      
      // Redirect to career path page with data in URL params
      // const encodedData = JSON.stringify(careerPath.career_path || careerPath);
      
      router.push(`/career-path`);
  
      
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
      title: "Current Location",
      subtitle: "Where are you currently based?",
      placeholder: "Where are you currently based?",
      type: "text",
    },
    {
      title: "Target Location",
      subtitle: "Where is your target location for a job?",
      placeholder: "Where is your target location for a job?",
      type: "text",
    },
    {
      title: "Immigration status",
      subtitle: "What is your current immigration status?",
      type: "grid",
      options: ["Temporary resident", "Permanent resident", "Undocumented", "EEA/Irish citizen", "other"],
    },
    {
      title: "Visa status",
      subtitle: "What is your current Visa status?",
      type: "grid",
      options: ["Student visa", "Stamp 1G", "Work permit", "H1-B Visa", "other"],
    },
    {
      title: "Neurodiversity Considerations", 
      subtitle: "When thinking about your career journey, which of the following best describes the kind of support or environment that helps you thrive?",
      placeholder: "Please select your answer",
      type: "dropdown",
      options: ["Clear structure and step-by-step guidance", "Flexibility to work in my own way and pace", "Visual aids, examples, or demonstrations to learn effectively", "Collaborative support and frequent check-ins", "I’m still exploring what works best for me"]
    },
    // {
    //   title: "Current role",
    //   subtitle: "What is your current role?",
    //   type: "dropdown",
    //   placeholder: "Select your current role",
    //   options: ["Engineer", "Manager", "Director", "Other"]
    // },
    {
      title: "Resume",
      subtitle: "Upload your resume (required!)",
      type: "file"
    },
    {
      title: "Motivation",
      subtitle: "Tell us about your career goals",
      placeholder: "Tell us about your career goals...",
      type: "text"
    }
  ];

  const currentStepData = steps[currentStep];

  const handleSelection = (value: string) => {
    setSelections(prev => ({
      ...prev,
      [currentStep]: value
    }));
    
    // Don't auto-advance for text inputs and file uploads - only for binary, grid, and dropdown
    if (currentStep < steps.length - 1 && currentStepData.type !== "text" && currentStepData.type !== "file") {
      nextStep();
    }
  };

  const handleFileSelection = async (file: File) => {
    setUploadedFile(file);
    try {
      await uploadResume(file);
      setSelections(prev => ({
        ...prev,
        [currentStep]: file.name
      }));
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert('Failed to upload resume. Please try again.');
      setUploadedFile(null);
    }
  };

  const isStepComplete = () => {
    const selection = selections[currentStep];
    
    // For file upload step, require a file to be uploaded
    if (currentStepData.type === "file") {
      return uploadedFile !== null;
    }
    
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
            className="absolute right-[5%] top-[5%] flex items-center gap-2 text-[#6750A4] hover:text-[#5A3E9A] transition-colors cursor-pointer"
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
                    } flex items-center justify-center gap-2 cursor-pointer`}
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
                    } flex items-center justify-center gap-1 cursor-pointer`}
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
                  className="w-full h-[56px] px-4 border border-[#79747E] text-[#1C1B1F] bg-white cursor-pointer"
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
                  placeholder={currentStepData.placeholder}
                  className="w-full h-[120px] p-4 border border-[#79747E] rounded-[4px] text-[#1C1B1F] placeholder:text-[#49454F] resize-none"
                />
              </div>
            )}

            {currentStepData.type === "file" && (
              <div className="w-full">
                <div className="border-2 border-dashed border-[#79747E] rounded-[4px] p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelection(file);
                      }
                    }}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label 
                    htmlFor="resume-upload" 
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {isUploadingResume ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750A4]"></div>
                        <p className="text-[#49454F] text-[14px]">Uploading...</p>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <Check size={32} className="text-green-600" />
                        <p className="text-[#1C1B1F] text-[16px] font-[500]">{uploadedFile.name}</p>
                        <p className="text-[#49454F] text-[14px]">Resume uploaded successfully</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#E8DEF8] rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#6750A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-[#1C1B1F] text-[16px] font-[500]">Upload your resume</p>
                        <p className="text-[#49454F] text-[14px]">PDF, DOC, or DOCX files accepted</p>
                      </>
                    )}
                  </label>
                </div>
                {uploadedFile && !isUploadingResume && (
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setSelections(prev => ({
                        ...prev,
                        [currentStep]: ""
                      }));
                    }}
                    className="mt-3 text-[#6750A4] text-[14px] hover:text-[#5A3E9A] transition-colors cursor-pointer"
                  >
                    Remove file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {currentStep === steps.length - 1 ? (
              <button 
                onClick={generateCareerPath}
                disabled={!isStepComplete()}
                className={`w-full h-[48px] rounded-full text-white font-[500] ${
                  isStepComplete() 
                    ? "bg-[#6750A4] hover:bg-[#5A3E9A] cursor-pointer" 
                    : "bg-gray-300 cursor-not-allowed"
                } ${isGeneratingCareerPath && "bg-gray-300 cursor-not-allowed"}`}
              >
               {isGeneratingCareerPath ? "Finishing..." : 'Finish'}
              </button>
            ) : (
              <button 
                onClick={nextStep}
                disabled={!isStepComplete()}
                className={`w-full h-[48px] rounded-full text-white font-[500] ${
                  isStepComplete() 
                    ? "bg-[#6750A4] hover:bg-[#5A3E9A] cursor-pointer" 
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {currentStepData.type === "file" ? "Continue" : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}