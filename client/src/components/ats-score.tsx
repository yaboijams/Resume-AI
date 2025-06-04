import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ATSScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  missingKeywords?: string[];
  matchedKeywords?: string[];
  suggestions?: string[];
}

export function ATSScore({ 
  score, 
  size = 'md', 
  showDetails = false,
  missingKeywords = [],
  matchedKeywords = [],
  suggestions = []
}: ATSScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#EA580C'; // orange
    return '#EF4444'; // red
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'lg': return 'w-32 h-32';
      default: return 'w-24 h-24';
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`${getSizeClasses(size)} mx-auto mb-4`}>
          <CircularProgressbar
            value={score}
            text={`${score}%`}
            styles={buildStyles({
              textColor: 'hsl(var(--premium-heading))',
              pathColor: getScoreColor(score),
              trailColor: 'hsl(var(--premium-accent) / 0.3)',
              textSize: size === 'sm' ? '24px' : size === 'lg' ? '14px' : '20px',
            })}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium premium-text">
            ATS Match Score
          </p>
          <p className="text-xs premium-text opacity-75">
            {getScoreLabel(score)}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 mt-6">
          {matchedKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold premium-heading mb-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Matched Keywords ({matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {matchedKeywords.slice(0, 10).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {matchedKeywords.length > 10 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{matchedKeywords.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {missingKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold premium-heading mb-2 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Missing Keywords ({missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {missingKeywords.slice(0, 10).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {missingKeywords.length > 10 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{missingKeywords.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold premium-heading mb-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                AI Suggestions
              </h4>
              <ul className="space-y-1">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="text-xs premium-text flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
