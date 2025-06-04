import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface ATSScoreProps {
  score?: number;
  missingKeywords?: string[];
  strongMatches?: string[];
  suggestions?: string[];
  isLoading?: boolean;
}

export default function ATSScore({ 
  score = 0, 
  missingKeywords = [], 
  strongMatches = [],
  suggestions = [],
  isLoading = false 
}: ATSScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-orange-500 to-amber-500";
    return "from-red-500 to-pink-500";
  };

  if (isLoading) {
    return (
      <Card className="premium-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>ATS Match Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your resume...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>ATS Match Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${score}, 100`}
                className={`${getScoreColor(score)} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {score === 0 ? "Upload resume to see your match score" : "Match with job requirements"}
          </p>
        </div>

        {/* Progress Bar */}
        {score > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Compatibility</span>
              <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        )}

        {/* Strong Matches */}
        {strongMatches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">Strong Matches</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {strongMatches.slice(0, 5).map((match, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {match}
                </Badge>
              ))}
              {strongMatches.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{strongMatches.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-foreground">Missing Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missingKeywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700 dark:text-orange-300">
                  {keyword}
                </Badge>
              ))}
              {missingKeywords.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{missingKeywords.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Top Suggestion */}
        {suggestions.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-medium text-primary mb-1">💡 Top Suggestion</p>
            <p className="text-sm text-foreground">{suggestions[0]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
