import React from 'react';
import { MatchResult, formatDate, formatCurrency, getConfidenceLevelColor } from '@/services/matchingService';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, DollarSignIcon, InfoIcon } from 'lucide-react';

interface RFPMatchCardProps {
  match: MatchResult;
  index: number;
}

const RFPMatchCard: React.FC<RFPMatchCardProps> = ({ match, index }) => {
  const { opportunity, score, confidenceLevel, matchDetails } = match;
  const scorePercentage = Math.round(score * 100);
  const confidenceColor = getConfidenceLevelColor(confidenceLevel);
  
  // Render match score details
  const renderMatchDetail = (name: string, score: number) => {
    const percentage = Math.round(score * 100);
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{name}</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    );
  };

  return (
    <Card className="w-full transition-all hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{opportunity.title}</CardTitle>
            <CardDescription>{opportunity.agency}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <Badge 
              variant="outline" 
              className={`${confidenceColor} border-current`}
            >
              {scorePercentage}% match
            </Badge>
            <span className={`text-xs mt-1 ${confidenceColor}`}>
              {confidenceLevel} confidence
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Due {formatDate(opportunity.responseDeadline)}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatCurrency(opportunity.awardAmount)}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-1">Technology Focus</h4>
          <div className="flex flex-wrap gap-1">
            {opportunity.techFocus.map((tech, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Description</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
            {opportunity.description}
          </p>
        </div>
        
        {/* AI Recommendation */}
        {matchDetails.aiRecommendation && (
          <div>
            <div className="flex items-center gap-1">
              <InfoIcon className="h-3.5 w-3.5 text-blue-500" />
              <h4 className="font-medium text-sm text-blue-500">AI Recommendation</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
              "{matchDetails.aiRecommendation}"
            </p>
          </div>
        )}
        
        {matchDetails.matchedKeywords && matchDetails.matchedKeywords.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-1">Matched Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {matchDetails.matchedKeywords.slice(0, 5).map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
              ))}
              {matchDetails.matchedKeywords.length > 5 && (
                <Badge variant="outline" className="text-xs">+{matchDetails.matchedKeywords.length - 5} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex-col items-start gap-3">
        <div className="grid grid-cols-2 gap-2 w-full">
          {renderMatchDetail('Tech Focus', matchDetails.techFocusMatch)}
          {renderMatchDetail('Stage', matchDetails.stageMatch)}
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {renderMatchDetail('Budget', matchDetails.budgetMatch)}
          {renderMatchDetail('Timeline', matchDetails.timelineMatch)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RFPMatchCard;
