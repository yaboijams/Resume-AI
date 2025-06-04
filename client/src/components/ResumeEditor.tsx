import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileEdit, Download, Save, Sparkles, Copy } from "lucide-react";

interface ResumeEditorProps {
  originalContent?: string;
  tailoredContent?: string;
  jobDescription?: string;
  resumeId?: number;
  field?: string;
}

export default function ResumeEditor({ 
  originalContent = "", 
  tailoredContent = "",
  jobDescription = "",
  resumeId,
  field 
}: ResumeEditorProps) {
  const [editedContent, setEditedContent] = useState(tailoredContent || originalContent);
  const [activeTab, setActiveTab] = useState("original");
  const { toast } = useToast();

  const tailorMutation = useMutation({
    mutationFn: async () => {
      if (!resumeId || !jobDescription) {
        throw new Error("Resume ID and job description are required");
      }
      const response = await apiRequest('POST', '/api/tailor-resume', {
        resumeId,
        jobDescription,
        field
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEditedContent(data.tailoredContent);
      setActiveTab("tailored");
      toast({
        title: "Success",
        description: "Resume tailored successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to tailor resume",
        variant: "destructive",
      });
    },
  });

  const handleTailorResume = () => {
    tailorMutation.mutate();
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Resume content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!originalContent) {
    return (
      <Card className="premium-shadow">
        <CardContent className="p-8 text-center">
          <FileEdit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Resume Uploaded</h3>
          <p className="text-muted-foreground">Upload a resume to start editing and tailoring.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>AI-Tailored Resume</span>
          </CardTitle>
          <div className="flex space-x-2">
            {jobDescription && (
              <Button 
                onClick={handleTailorResume} 
                disabled={tailorMutation.isPending}
                size="sm"
                className="gradient-primary text-white border-0"
              >
                {tailorMutation.isPending ? "Tailoring..." : "Tailor Resume"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">Original Resume</TabsTrigger>
            <TabsTrigger value="tailored">
              AI-Tailored Version
              {tailoredContent && (
                <Badge className="ml-2 bg-primary text-white">
                  Optimized
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-foreground">Original Resume</h4>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyToClipboard(originalContent)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(originalContent, 'original_resume.txt')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                {originalContent}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="tailored" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-foreground">
                AI-Tailored Version
                {tailoredContent && (
                  <Badge className="ml-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Improved
                  </Badge>
                )}
              </h4>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyToClipboard(editedContent)}
                  disabled={!editedContent}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(editedContent, 'tailored_resume.txt')}
                  disabled={!editedContent}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            {editedContent ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-96 font-mono text-sm bg-background border-2 border-primary/20"
                placeholder="Tailored resume will appear here..."
              />
            ) : (
              <div className="bg-muted border-2 border-dashed border-accent rounded-lg p-8 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h5 className="text-lg font-semibold text-foreground mb-2">Ready to Tailor</h5>
                <p className="text-muted-foreground mb-4">
                  Add a job description and click "Tailor Resume" to see AI-optimized content.
                </p>
              </div>
            )}

            {tailoredContent && editedContent !== originalContent && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h5 className="font-semibold text-primary mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Improvements Applied
                </h5>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• Keywords optimized for ATS compatibility</li>
                  <li>• Skills and experience highlighted for this role</li>
                  <li>• Professional language enhanced</li>
                  <li>• Formatting improved for readability</li>
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
