import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import debugEnvironmentVariables from "@/debug-env";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { FormData } from "@/types/form";
import StartupDetailsForm from "@/components/StartupDetailsForm";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";
import FormHeader from "@/components/FormHeader";
import FormProgressIndicator from "@/components/FormProgressIndicator";
import { Button } from "@/components/ui/button";
import RFPMatchList from "@/components/RFPMatchList";
import { getMatchingOpportunities, MatchResult } from "@/services/matchingService";
import { getBackendApiKey } from "@/utils/envConfig";
import { Loader2, ArrowLeft } from "lucide-react";

const AIMatchingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      company: {
        name: "",
        description: "",
        techCategory: [],
        fundingInstrumentTypes: [], // Added for backend compatibility
        eligibleAgencyCodes: [],     // Added for backend compatibility
        city: "",                   // New field for location
        state: "",                  // New field for location
        stage: "",
        teamSize: "",
        foundedYear: "",
        website: "",
        patents: "",
        email: "",
      },
      project: {
        title: "",
        description: "",
        techSpecs: "",
        keywords: [],                 // New field for keywords
        budget: {
          min: 0,
          max: 0,
          currency: "USD"
        },
        timeline: {
          deadline: "",               // Changed from startDate to deadline
          duration: ""
        },
      },
    },
  });

  const formData = watch();

  useEffect(() => {
    // Check environment variables on component load
    debugEnvironmentVariables();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setMatchingError(null);
    
    try {
      // Debug environment variables before making the API call
      console.log("Environment check before API call:");
      debugEnvironmentVariables();
      console.log("Form data being submitted:", data);
      
      // Call matching service
      const result = await getMatchingOpportunities(data);
      setMatches(result.matches);
      setShowResults(true);
      
      toast({
        title: "AI Matching Complete",
        description: `Found ${result.matches.length} matching opportunities.`,
      });
    } catch (error: any) {
      console.error("Error in AI matching:", error);
      
      // More detailed error logging
      const errorDetail = error.response ? 
        `Status: ${error.response.status} - ${JSON.stringify(error.response.data)}` : 
        error.message || "Unknown error";
      
      console.error("Error details:", errorDetail);
      
      setMatchingError(`${error.message || "An error occurred during matching."}\n\nPlease check the console for more details.`);
      
      toast({
        title: "Matching Failed",
        description: "There was an error performing the AI match. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyDataChange = (data: Partial<typeof formData.company>) => {
    Object.entries(data).forEach(([key, value]) => {
      // Use type assertion to fix TypeScript error
      setValue(`company.${key}` as any, value);
    });
  };

  const handleProjectDataChange = (data: Partial<typeof formData.project>) => {
    Object.entries(data).forEach(([key, value]) => {
      // Use type assertion to fix TypeScript error
      setValue(`project.${key}` as any, value);
    });
  };
  
  const handleReset = () => {
    setShowResults(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-primary-dark text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            size="sm"
            className="text-white hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="IMFO Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            ImFo RFP Match
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Discover optimal government contract opportunities for your space technology enterprise
          </p>
        </div>
        
        {!showResults ? (
          <>
            <FormProgressIndicator currentStep={step} totalSteps={2} />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="animate-fadeIn bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6">Company Details</h2>
                  <StartupDetailsForm 
                    data={formData.company}
                    onChange={handleCompanyDataChange}
                  />
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fadeIn bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6">Project Details</h2>
                  <ProjectDetailsForm
                    data={formData.project}
                    onChange={handleProjectDataChange}
                  />
                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 text-black"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                          Finding Matches...
                        </>
                      ) : (
                        "Find Matches with AI"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="animate-fadeIn">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
              <div className="mb-6">
                <Button onClick={handleReset} variant="outline" className="text-black">
                  ← Start New Match
                </Button>
              </div>
              
              {matchingError ? (
                <div className="p-4 bg-red-500/20 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Error</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{matchingError}</p>
                  <div className="mt-4">
                    <details>
                      <summary className="cursor-pointer text-sm">Debug Information</summary>
                      <div className="text-left mt-2 p-2 bg-black/20 text-xs rounded">
                        <p>API URL: https://aero-matching-backend-5d1bd860f515.herokuapp.com/api/matching</p>
                        <p>Environment: {'production'}</p>
                        <p>API Key Set: {getBackendApiKey() ? 'Yes' : 'No'}</p>
                      </div>
                    </details>
                  </div>
                </div>
              ) : (
                <RFPMatchList 
                  matches={matches} 
                  companyName={formData.company.name} 
                />
              )}
            </div>
          </div>
        )}
        
        {/* Backend API Information */}
        <div className="mt-8 text-center text-sm text-gray-400">
        </div>
      </div>
    </div>
  );
};

export default AIMatchingPage;
