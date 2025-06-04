import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CoverLetterGenerator from "@/components/CoverLetterGenerator";
import { FileText, Lightbulb } from "lucide-react";
import type { Resume } from "@shared/schema";

export default function CoverLetter() {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['/api/resumes'],
  });

  const handleResumeSelect = (resumeId: string) => {
    const resume = resumes.find(r => r.id.toString() === resumeId);
    setSelectedResume(resume || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cover Letter Generator</h1>
        <p className="text-muted-foreground">
          Create compelling, personalized cover letters that complement your resume and target specific roles.
        </p>
      </div>

      {/* Setup Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Resume Selection */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="resume-select" className="text-sm font-medium">
              Select Resume
            </Label>
            <Select onValueChange={handleResumeSelect}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a resume as the base" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id.toString()}>
                    {resume.fileName || `Resume ${resume.id}`} ({resume.field || 'General'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {resumes.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground mt-2">
                No resumes found. Upload a resume first to generate cover letters.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="job-description" className="text-sm font-medium">
              Job Description
            </Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-2 min-h-24"
              placeholder="Paste the job description to create a targeted cover letter..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Cover Letter Generator */}
      <CoverLetterGenerator
        resumeId={selectedResume?.id}
        jobDescription={jobDescription}
      />

      {/* Tips and Best Practices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Writing Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Cover Letter Tips</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Address the hiring manager by name when possible</li>
              <li>• Open with a compelling hook that shows enthusiasm</li>
              <li>• Highlight 2-3 specific achievements relevant to the role</li>
              <li>• Show knowledge of the company and position</li>
              <li>• End with a strong call-to-action</li>
              <li>• Keep it concise - aim for 3-4 paragraphs maximum</li>
            </ul>
          </CardContent>
        </Card>

        {/* Tone Guidelines */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Tone Guidelines</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <div>
                <strong>Professional:</strong> Formal language, industry terminology, structured approach
              </div>
              <div>
                <strong>Enthusiastic:</strong> Energetic tone, passion for the role, positive language
              </div>
              <div>
                <strong>Conversational:</strong> Approachable style, personal touch, warm but professional
              </div>
              <div>
                <strong>Formal:</strong> Traditional business language, respectful hierarchy, conservative approach
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
