'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, CheckCircle, Users, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

interface UserProfile {
  current_role: string;
  target_role: string;
  location_context: string;
  visa_considerations: string;
  experience_level: string;
}

interface HelpfulResource {
  title: string;
  url: string;
}

interface CareerStage {
  title: string;
  confidence_score: number;
  description: string;
  helpful_resources?: HelpfulResource[];
  // Allow additional properties for stage-specific data
  [key: string]: unknown;
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

  // Helper functions for safe property access
  const getArrayProperty = (obj: unknown, property: string): string[] => {
    if (typeof obj === 'object' && obj !== null && property in obj) {
      const value = (obj as Record<string, unknown>)[property];
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
    }
    return [];
  };

  const getObjectProperty = (obj: unknown, property: string): Record<string, unknown> => {
    if (typeof obj === 'object' && obj !== null && property in obj) {
      const value = (obj as Record<string, unknown>)[property];
      return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
    }
    return {};
  };

  const getStringProperty = (obj: unknown, property: string): string => {
    if (typeof obj === 'object' && obj !== null && property in obj) {
      const value = (obj as Record<string, unknown>)[property];
      return typeof value === 'string' ? value : '';
    }
    return '';
  };

  const getNumberProperty = (obj: unknown, property: string): number => {
    if (typeof obj === 'object' && obj !== null && property in obj) {
      const value = (obj as Record<string, unknown>)[property];
      return typeof value === 'number' ? value : 0;
    }
    return 0;
  };

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

  // Stage-specific detail renderers
  const renderStage1Details = (stage: CareerStage) => {
    const skillsAudit = getObjectProperty(stage, 'skills_audit');
    const marketPosition = getStringProperty(stage, 'market_position');
    const baselineGaps = getArrayProperty(stage, 'baseline_gaps');
    
    return (
      <>
        {/* Skills Audit */}
        {Object.keys(skillsAudit).length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                Technical Strengths
              </h3>
              <ul className="space-y-2 text-sm">
                {getArrayProperty(skillsAudit, 'technical_strengths').map((skill, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-green-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Soft Skills
              </h3>
              <ul className="space-y-2 text-sm">
                {getArrayProperty(skillsAudit, 'soft_skills_inventory').map((skill, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-blue-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                Transferable Assets
              </h3>
              <ul className="space-y-2 text-sm">
                {getArrayProperty(skillsAudit, 'transferable_assets').map((asset, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-purple-700">{asset}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Market Position & Gaps */}
        <div className="grid md:grid-cols-2 gap-6">
          {marketPosition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-gray-800">Market Position</h3>
              <p className="text-sm text-gray-600">{marketPosition}</p>
            </div>
          )}
          
          {baselineGaps.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-red-800">Key Gaps to Address</h3>
              <ul className="space-y-1 text-sm">
                {baselineGaps.map((gap, index) => (
                  <li key={index} className="text-red-700">• {gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStage2Details = (stage: CareerStage) => {
    const targetAnalysis = getObjectProperty(stage, 'target_analysis');
    const gapAnalysis = getObjectProperty(stage, 'gap_analysis');
    
    return (
      <>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(targetAnalysis).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#1C1B1F] flex items-center gap-2">
                <Target size={20} className="text-[#6750A4]" />
                Target Analysis
              </h3>
              <div className="space-y-3 text-sm">
                {Object.entries(targetAnalysis).map(([key, value], index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded">
                    <span className="font-medium text-blue-800 capitalize">
                      {key.replace(/_/g, ' ')}: 
                    </span>
                    <span className="text-blue-700">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {Object.keys(gapAnalysis).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#1C1B1F]">Gap Analysis</h3>
              {Object.entries(gapAnalysis).map(([key, gaps], index) => (
                <div key={index} className="bg-orange-50 p-3 rounded">
                  <h4 className="font-medium text-orange-800 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {getArrayProperty({ [key]: gaps }, key).map((gap, gapIndex) => (
                      <li key={gapIndex} className="text-orange-700">• {gap}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStage3Details = (stage: CareerStage) => {
    const transferableSkills = getObjectProperty(stage, 'transferable_skills');
    const pivotOpportunities = getObjectProperty(stage, 'pivot_opportunities');
    
    return (
      <>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(transferableSkills).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#1C1B1F]">Transferable Skills</h3>
              {Object.entries(transferableSkills).map(([key, items], index) => (
                <div key={index} className="bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-green-800 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {getArrayProperty({ [key]: items }, key).map((item, itemIndex) => (
                      <li key={itemIndex} className="text-green-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(pivotOpportunities).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#1C1B1F]">Pivot Opportunities</h3>
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-medium text-blue-800 mb-2">Adjacent Roles</h4>
                <ul className="space-y-1 text-sm">
                  {getArrayProperty(pivotOpportunities, 'adjacent_roles').map((role, roleIndex) => (
                    <li key={roleIndex} className="text-blue-700">• {role}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStage4Details = (stage: CareerStage) => {
    const sprints = ['sprint_1', 'sprint_2', 'sprint_3'];
    
    return (
      <div className="space-y-6">
        {sprints.map((sprintKey, index) => {
          const sprint = getObjectProperty(stage, sprintKey);
          if (Object.keys(sprint).length === 0) return null;
          
          const title = getStringProperty(sprint, 'title');
          const focus = getStringProperty(sprint, 'focus');
          const actions = getArrayProperty(sprint, 'actions');
          const deliverables = getArrayProperty(sprint, 'deliverables');
          
          return (
            <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 text-lg">{title}</h3>
                  <p className="text-purple-700 text-sm">{focus}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Actions</h4>
                  <ul className="space-y-1 text-sm">
                    {actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-purple-700 flex items-start gap-2">
                        <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Deliverables</h4>
                  <ul className="space-y-1 text-sm">
                    {deliverables.map((deliverable, delIndex) => (
                      <li key={delIndex} className="text-purple-700 flex items-start gap-2">
                        <Target size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStage5Details = (stage: CareerStage) => {
    const marketReadiness = getObjectProperty(stage, 'market_readiness_index');
    const confidenceTransformation = getObjectProperty(stage, 'confidence_transformation');
    const hireabilityScore = getStringProperty(stage, 'hireability_score');
    const nextLevelPlanning = getStringProperty(stage, 'next_level_planning');
    
    return (
      <>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.keys(marketReadiness).length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3">Market Readiness Index</h3>
              <div className="space-y-2">
                {Object.entries(marketReadiness).map(([key, score], index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-green-700 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${String(score)}%` }}
                        ></div>
                      </div>
                      <span className="text-green-800 font-medium text-sm">{String(score)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {hireabilityScore && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Hireability Score</span>
                    <span className="text-green-800 font-bold text-lg">{hireabilityScore}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {Object.keys(confidenceTransformation).length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-3">Confidence Transformation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Starting Score</span>
                  <span className="text-blue-800 font-bold">{getNumberProperty(confidenceTransformation, 'starting_score')}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Projected Score</span>
                  <span className="text-blue-800 font-bold">{getNumberProperty(confidenceTransformation, 'final_projected_score')}%</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm">Key Improvements</h4>
                  <ul className="space-y-1 text-xs">
                    {getArrayProperty(confidenceTransformation, 'key_improvements').map((improvement, index) => (
                      <li key={index} className="text-blue-700">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {nextLevelPlanning && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-800 mb-2">Next Level Planning</h3>
            <p className="text-purple-700 text-sm">{nextLevelPlanning}</p>
          </div>
        )}
      </>
    );
  };

  const stages = [
    { key: 'stage_1_mirror', data: careerRoadmapData.stage_1_mirror, subtitle: 'Current Assessment' },
    { key: 'stage_2_horizon', data: careerRoadmapData.stage_2_horizon, subtitle: 'Goal Mapping' },
    { key: 'stage_3_bridge', data: careerRoadmapData.stage_3_bridge, subtitle: 'Pathway Strategy' },
    { key: 'stage_4_forge', data: careerRoadmapData.stage_4_forge, subtitle: '90-Day Action Plan' },
    { key: 'stage_5_peak', data: careerRoadmapData.stage_5_peak, subtitle: 'Future Vision' }
  ];

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
            {stages.map((stage, index) => (
              <div key={stage.key} className="border border-[#E8DEF8] rounded-lg overflow-hidden">
                <div className={`${index === 4 ? 'bg-gradient-to-r from-[#6750A4] to-[#5A3E9A]' : 'bg-[#6750A4]'} text-white px-6 py-4`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-[#6750A4] rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                      {stage.data.confidence_score}%
                    </div>
                    <div>
                      <h2 className="text-[24px] font-[500]">{stage.data.title}</h2>
                      <p className="text-purple-100 text-sm">{stage.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-[#49454F] text-[16px] leading-relaxed">{stage.data.description}</p>

                  {/* Stage-specific detailed content */}
                  {index === 0 && renderStage1Details(stage.data)}
                  {index === 1 && renderStage2Details(stage.data)}
                  {index === 2 && renderStage3Details(stage.data)}
                  {index === 3 && renderStage4Details(stage.data)}
                  {index === 4 && renderStage5Details(stage.data)}

                  {/* Resources */}
                  {stage.data.helpful_resources && stage.data.helpful_resources.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 text-[#1C1B1F]">Helpful Resources</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {stage.data.helpful_resources.map((resource, resourceIndex) => (
                          <a
                            key={resourceIndex}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 border border-[#E8DEF8] rounded-lg hover:bg-[#FEF7FF] transition-colors group"
                          >
                            <span className="text-[#6750A4] text-sm flex-1 group-hover:text-[#5A3E9A] transition-colors line-clamp-2">
                              {resource.title}
                            </span>
                            <ExternalLink size={16} className="text-[#6750A4] group-hover:text-[#5A3E9A] transition-colors flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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