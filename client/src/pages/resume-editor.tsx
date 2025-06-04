import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { ATSScore } from "@/components/ats-score";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Wand2, 
  Save, 
  Download, 
  RotateCcw,
  Lightbulb,
  FileText,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ResumeEditor() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionId, setJobDescriptionId] = useState<number | null>(null);
  const [industry, setIndustry] = useState("general");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [tailoredData, setTailoredData] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: activeResume } = useQuery({
    queryKey: ["/api/resumes/active"],
    retry: false,
  });

  const analyzeJobMutation = useMutation({
    mutationFn: async (data: { content: string; company?: string; position?: string; industry: string }) => {
      // First create job description
      const jobDescResponse = await apiRequest("POST", "/api/job-descriptions", data);
      const jobDesc = await jobDescResponse.json();
      setJobDescriptionId(jobDesc.id);
      
      // Then analyze ATS match
      const analysisResponse = await apiRequest("POST", "/api/ats-analysis", {
        resumeId: activeResume?.id,
        jobDescriptionId: jobDesc.id,
        industry: data.industry
      });
      return await analysisResponse.json();
    },
    onSuccess: (data) => {
      setAnalysisData(data);
      toast({
        title: "Analysis complete",
        description: `ATS match score: ${data.matchScore}%`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tailorResumeMutation = useMutation({
    mutationFn: async () => {
      if (!jobDescriptionId) throw new Error("No job description selected");
      
      const response = await apiRequest("POST", "/api/tailor-resume", {
        jobDescriptionId,
        industry
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setTailoredData(data);
      toast({
        title: "Resume tailored successfully",
        description: "Your resume has been optimized for this job.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Tailoring failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste a job description to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!activeResume) {
      toast({
        title: "Resume required",
        description: "Please upload a resume first.",
        variant: "destructive",
      });
      return;
    }

    analyzeJobMutation.mutate({
      content: jobDescription,
      industry
    });
  };

  const handleTailorResume = () => {
    if (!analysisData || !jobDescriptionId) {
      toast({
        title: "Analysis required",
        description: "Please analyze a job description first.",
        variant: "destructive",
      });
      return;
    }

    tailorResumeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="loading-shimmer h-8 w-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeResume) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Resume Found</h2>
              <p className="text-muted-foreground mb-6">
                Please upload a resume before using the editor.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Wand2 className="h-8 w-8 mr-3 text-purple-500" />
            AI Resume Editor
          </h1>
          <p className="text-muted-foreground">
            Analyze job matches and optimize your resume with AI-powered insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description Input */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="job-description">Paste Job Description</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="mt-2 min-h-[150px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzeJobMutation.isPending || !jobDescription.trim()}
                  className="w-full btn-primary"
                >
                  {analyzeJobMutation.isPending ? (
                    "Analyzing..."
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Job Match
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resume Comparison */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Resume Comparison</CardTitle>
                  <div className="flex space-x-2">
                    {tailoredData && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button 
                      onClick={handleTailorResume}
                      disabled={tailorResumeMutation.isPending || !analysisData}
                      variant="default"
                      size="sm"
                    >
                      {tailorResumeMutation.isPending ? (
                        "Tailoring..."
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Tailor Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Original Resume */}
                  <div>
                    <h3 className="font-semibold mb-4 pb-2 border-b">
                      Original Resume
                    </h3>
                    <div className="bg-muted rounded-lg p-4 h-96 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm">
                        {activeResume.originalContent}
                      </div>
                    </div>
                  </div>

                  {/* Tailored Resume */}
                  <div>
                    <h3 className="font-semibold mb-4 pb-2 border-b flex items-center">
                      AI-Tailored Version
                      {tailoredData && (
                        <Badge variant="default" className="ml-2">
                          Optimized
                        </Badge>
                      )}
                    </h3>
                    <div className="bg-background border rounded-lg p-4 h-96 overflow-y-auto">
                      {tailoredData ? (
                        <div className="whitespace-pre-wrap text-sm">
                          {tailoredData.tailoredContent}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Analyze a job description and click "Tailor Resume" to see the optimized version</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Improvements Summary */}
                {tailoredData?.improvements && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-purple-500" />
                      AI Improvements Applied
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      {tailoredData.improvements.addedKeywords?.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Added Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {tailoredData.improvements.addedKeywords.slice(0, 3).map((keyword: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {tailoredData.improvements.enhancedSections?.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Enhanced Sections:</p>
                          <ul className="text-muted-foreground">
                            {tailoredData.improvements.enhancedSections.slice(0, 2).map((section: string, index: number) => (
                              <li key={index} className="text-xs">• {section}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ATS Score */}
            <ATSScore 
              score={analysisData ? parseFloat(analysisData.matchScore) : undefined}
              missingKeywords={analysisData?.missingKeywords}
              suggestions={analysisData?.suggestions}
              isLoading={analyzeJobMutation.isPending}
            />

            {/* Resume Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Word Count</span>
                    <span className="font-semibold">
                      {activeResume.originalContent.split(/\s+/).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Character Count</span>
                    <span className="font-semibold">
                      {activeResume.originalContent.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="font-semibold text-xs">
                      {new Date(activeResume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-purple-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Use keywords from the job description naturally in your resume
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Quantify achievements with specific numbers and percentages
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Tailor your experience to match the job requirements
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    Keep formatting clean and ATS-friendly
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
