import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResumeEditor from "@/components/ResumeEditor";
import { FileEdit, Upload } from "lucide-react";
import type { Resume } from "@shared/schema";

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

export default function Editor() {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedField, setSelectedField] = useState("Technology & Software");

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Resume Editor</h1>
        <p className="text-muted-foreground">
          Tailor your resume with AI to match specific job requirements and improve ATS compatibility.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Resume Selection */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="resume-select" className="text-sm font-medium">
              Select Resume
            </Label>
            <Select onValueChange={handleResumeSelect}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a resume to edit" />
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
                No resumes found. Upload a resume first.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="field-select" className="text-sm font-medium">
              Target Field
            </Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="mt-2">
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <Label className="text-sm font-medium mb-3 block">Quick Actions</Label>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Resume
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileEdit className="w-4 h-4 mr-2" />
                Create From Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Description Input */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <Label htmlFor="job-description" className="text-sm font-medium">
            Job Description
          </Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mt-2 min-h-32"
            placeholder="Paste the job description here to tailor your resume specifically for this role..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            The more detailed the job description, the better our AI can tailor your resume.
          </p>
        </CardContent>
      </Card>

      {/* Resume Editor */}
      <ResumeEditor
        originalContent={selectedResume?.originalContent}
        jobDescription={jobDescription}
        resumeId={selectedResume?.id}
        field={selectedField}
      />

      {/* Tips Section */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">💡 Tailoring Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Include keywords from the job description to improve ATS compatibility</li>
            <li>• Quantify your achievements with specific numbers and metrics</li>
            <li>• Adjust your job titles and descriptions to match the target role</li>
            <li>• Highlight relevant skills and technologies mentioned in the job posting</li>
            <li>• Keep the overall structure and truthfulness of your original content</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
