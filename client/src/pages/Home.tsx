import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/FileUpload";
import ATSScore from "@/components/ATSScore";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Briefcase, 
  Search, 
  FileEdit, 
  FileText, 
  BarChart3, 
  Sparkles,
  TrendingUp,
  Users,
  Award,
  ArrowRight
} from "lucide-react";

const FIELD_OPTIONS = [
  "Technology & Software",
  "Healthcare & Medicine", 
  "Marketing & Communications",
  "Finance & Banking",
  "Psychology & Counseling",
  "Education & Training",
  "Engineering",
  "Sales",
  "Human Resources",
  "Design & Creative",
  "Other"
];

export default function Home() {
  const [selectedField, setSelectedField] = useState("Technology & Software");
  const [jobDescription, setJobDescription] = useState("");
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!currentResume || !jobDescription) {
        throw new Error("Resume and job description are required");
      }
      const response = await apiRequest('POST', '/api/analyze-match', {
        resumeId: currentResume.id,
        jobDescription
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: `Your resume has a ${data.matchScore}% match with this job!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze job match",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  const handleResumeUpload = (resume: any) => {
    setCurrentResume(resume);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Job Application Assistant
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          Land Your Dream Job with{" "}
          <span className="text-gradient">
            AI Precision
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Transform your job search with our premium AI assistant. Get ATS-optimized resumes, 
          personalized cover letters, and intelligent application tracking.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Resumes Optimized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">89%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">4.9★</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Resume Upload Section */}
        <div className="lg:col-span-2">
          <Card className="premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Upload Your Resume</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Field Selection */}
              <div className="space-y-2">
                <Label htmlFor="field">Select Your Field</Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <FileUpload 
                onUploadSuccess={handleResumeUpload}
                selectedField={selectedField}
              />

              {/* Job Description Input */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Paste Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-32"
                  placeholder="Paste the job description here to get started with ATS analysis..."
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!currentResume || !jobDescription || analyzeMutation.isPending}
                  className="w-full gradient-primary text-white border-0"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Match...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Job Match
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* ATS Score */}
          <ATSScore
            score={analysisResult?.matchScore}
            missingKeywords={analysisResult?.missingKeywords}
            strongMatches={analysisResult?.strongMatches}
            suggestions={analysisResult?.suggestions}
            isLoading={analyzeMutation.isPending}
          />

          {/* Quick Actions */}
          <Card className="premium-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/editor">
                <Button variant="ghost" className="w-full justify-start">
                  <FileEdit className="w-4 h-4 mr-3 text-primary" />
                  Tailor Resume
                </Button>
              </Link>
              <Link href="/cover-letter">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-3 text-primary" />
                  Generate Cover Letter
                </Button>
              </Link>
              <Link href="/tracker">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-3 text-primary" />
                  Track Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="premium-shadow group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">ATS Optimization</h3>
            <p className="text-muted-foreground text-sm">
              Get instant compatibility scores and optimize your resume for Applicant Tracking Systems.
            </p>
          </CardContent>
        </Card>

        <Card className="premium-shadow group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">AI Tailoring</h3>
            <p className="text-muted-foreground text-sm">
              Let GPT-4 automatically customize your resume and cover letter for each job application.
            </p>
          </CardContent>
        </Card>

        <Card className="premium-shadow group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Monitor all your applications in one place with intelligent insights and follow-up reminders.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="premium-shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of successful job seekers who've landed their dream roles with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary text-white border-0">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
