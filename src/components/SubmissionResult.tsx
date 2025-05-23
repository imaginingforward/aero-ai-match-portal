
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MatchResult } from "@/services/matchingService";
import RFPMatchList from "./RFPMatchList";

interface SubmissionResultProps {
  success: boolean;
  message: string;
  onReset: () => void;
  matches?: MatchResult[];
  companyName?: string;
}

const SubmissionResult = ({ 
  success, 
  message, 
  onReset, 
  matches = [], 
  companyName = ""
}: SubmissionResultProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg animate-fadeIn">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
        success ? "bg-green-500/20" : "bg-red-500/20"
      }`}>
        {success ? (
          <Check className="h-10 w-10 text-green-500" />
        ) : (
          <X className="h-10 w-10 text-red-500" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">
        {success ? "Submission Successful" : "Submission Failed"}
      </h2>
      
      <p className="text-gray-300 text-center mb-8 max-w-md">
        {message}
      </p>
      
      {success && matches && matches.length > 0 && (
        <div className="w-full max-w-6xl mt-8">
          <RFPMatchList matches={matches} companyName={companyName} />
        </div>
      )}
      
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="border-white/20 hover:bg-white/10 text-gray-800 dark:text-white"
        >
          Go Home
        </Button>
        
        {!success && (
          <Button onClick={onReset} className="bg-primary hover:bg-primary/90 text-gray-800 dark:text-white">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmissionResult;
