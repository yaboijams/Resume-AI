import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CoverLetterGenerator } from "@/components/cover-letter/generator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { 
  PenTool, 
  Download, 
  Edit, 
  ArrowLeft,
  FileText,
  Sparkles,
  Clock,
  User
} from "lucide-react";
import { Link } from "wouter";

interface CoverLetterResult {
  content: string;
  tone: string;
  wordCount: number;
}

export default function CoverLetter() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [selectedTone, setSelectedTone] = useState<"professional" | "enthusiastic" | "conversational" | "formal">("professional");
  const [selectedField, setSelectedField] = useState("Technology & Software");
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Redirect to home if not authenticated
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

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ["/api/resumes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Update field when preferences load
  useEffect(() => {
    if (preferences?.field) {
      setSelectedField(preferences.field);
    }
  }, [preferences]);

  // Load latest resume
  useEffect(() => {
    if (resumes.length > 0) {
      setResumeContent(resumes[0].originalContent);
    }
  }, [resumes]);

  // Cover letter generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-cover-letter", {
        resumeContent,
        jobDescription,
        companyName,
        hiringManager,
        tone: selectedTone,
        field: selectedField,
      });
      return await response.json();
    },
    onSuccess: (data: CoverLetterResult) => {
      setCoverLetter(data);
      setEditedContent(data.content);
      setIsEditing(false);
      toast({
        title: "Cover Letter Generated",
        description: `${data.wordCount} words in ${data.tone} tone`,
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
        title: "Error",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!resumeContent.trim()) {
      toast({
        title: "Missing Resume",
        description: "Please go back to home and upload your resume first.",
        variant: "destructive",
      });
      return;
    }
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please paste the job description.",
        variant: "destructive",
      });
      return;
    }
    if (!companyName.trim()) {
      toast({
        title: "Missing Company Name",
        description: "Please enter the company name.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    
    const content = isEditing ? editedContent : coverLetter.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Cover letter downloaded successfully",
    });
  };

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      setCoverLetter(prev => prev ? { ...prev, content: editedContent } : null);
      setIsEditing(false);
      toast({
        title: "Changes Saved",
        description: "Your edits have been saved",
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <PenTool className="w-6 h-6 mr-3 text-primary" />
                AI Cover Letter Generator
              </h1>
              <p className="text-muted-foreground">
                Create personalized cover letters that get results
              </p>
            </div>
          </div>
          {coverLetter && (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Save Changes' : 'Edit'}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <Card className="premium-shadow border-premium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Cover Letter Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tone Selection */}
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="e.g. Google, Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Hiring Manager */}
              <div>
                <Label htmlFor="manager">Hiring Manager</Label>
                <Input
                  id="manager"
                  placeholder="Optional"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                />
              </div>

              {/* Field Selection */}
              <div>
                <Label htmlFor="field">Field</Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology & Software">Technology & Software</SelectItem>
                    <SelectItem value="Healthcare & Medicine">Healthcare & Medicine</SelectItem>
                    <SelectItem value="Marketing & Communications">Marketing & Communications</SelectItem>
                    <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
                    <SelectItem value="Psychology & Counseling">Psychology & Counseling</SelectItem>
                    <SelectItem value="Education & Training">Education & Training</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Description */}
              <div>
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </div>

              {/* Resume Status */}
              {resumeContent ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  ✓ Resume loaded ({resumeContent.length} characters)
                </Badge>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No resume found. Please upload one from the home page.</p>
                </div>
              )}

              {/* Generate Button */}
              <Button 
                className="w-full" 
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !resumeContent}
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Cover Letter */}
          <div className="lg:col-span-2">
            {coverLetter ? (
              <Card className="premium-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Generated Cover Letter
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {coverLetter.tone}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {coverLetter.wordCount} words
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-96 resize-none font-mono text-sm"
                    />
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-6 h-96 overflow-y-auto custom-scrollbar border">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {coverLetter.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <CoverLetterGenerator />
            )}
          </div>
        </div>

        {/* Tips Section */}
        {!coverLetter && (
          <div className="mt-8">
            <Card className="premium-gradient border-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Cover Letter Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Professional Tone</h4>
                    <p className="text-sm text-muted-foreground">
                      Best for corporate environments, traditional industries, and senior positions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Enthusiastic Tone</h4>
                    <p className="text-sm text-muted-foreground">
                      Great for startups, creative roles, and when you want to show passion for the company.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Conversational Tone</h4>
                    <p className="text-sm text-muted-foreground">
                      Perfect for modern companies with casual cultures and collaborative environments.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Formal Tone</h4>
                    <p className="text-sm text-muted-foreground">
                      Ideal for government positions, legal roles, and highly regulated industries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
