import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Copy, Sparkles } from "lucide-react";

interface CoverLetterGeneratorProps {
  resumeId?: number;
  jobDescription?: string;
}

export default function CoverLetterGenerator({ resumeId, jobDescription }: CoverLetterGeneratorProps) {
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!resumeId || !jobDescription || !companyName) {
        throw new Error("Resume, job description, and company name are required");
      }
      const response = await apiRequest('POST', '/api/generate-cover-letter', {
        resumeId,
        jobDescription,
        companyName,
        tone,
        hiringManager: hiringManager || undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLetter(data.coverLetter);
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate cover letter",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast({
        title: "Copied",
        description: "Cover letter copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${companyName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="premium-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>AI Cover Letter Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Options Panel */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
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

            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Microsoft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Hiring Manager</Label>
              <Input
                id="manager"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !resumeId || !jobDescription || !companyName}
              className="w-full gradient-primary text-white border-0"
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>

          {/* Generated Cover Letter */}
          <div className="lg:col-span-2">
            {generatedLetter ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-foreground">Generated Cover Letter</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="min-h-96 bg-background border-2 border-primary/20"
                  placeholder="Your cover letter will appear here..."
                />
              </div>
            ) : (
              <div className="bg-muted border-2 border-dashed border-accent rounded-lg p-8 text-center h-96 flex flex-col justify-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <h5 className="text-lg font-semibold text-foreground mb-2">Ready to Generate</h5>
                <p className="text-muted-foreground mb-4">
                  Fill in the company details and click "Generate Cover Letter" to create a personalized cover letter.
                </p>
                {(!resumeId || !jobDescription) && (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Please upload a resume and add a job description first.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sample Preview */}
        {!generatedLetter && companyName && (
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h5 className="font-semibold text-primary mb-2">Preview Structure</h5>
            <div className="text-sm text-foreground space-y-2">
              <p className="opacity-75">
                {hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Manager,'}
              </p>
              <p className="opacity-75">
                I am writing to express my strong interest in the [Position] role at {companyName}...
              </p>
              <p className="opacity-75">[Tailored content based on your resume and the job description]</p>
              <p className="opacity-75">Thank you for your consideration...</p>
              <p className="opacity-75">Sincerely,<br/>[Your Name]</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
