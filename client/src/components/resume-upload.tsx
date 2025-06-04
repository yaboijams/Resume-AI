import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

const industries = [
  "Technology & Software",
  "Healthcare & Medicine", 
  "Marketing & Communications",
  "Finance & Banking",
  "Psychology & Counseling",
  "Education & Training",
  "Engineering",
  "Sales",
  "Other"
];

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: { originalContent: string; fileName?: string }) => {
      return await apiRequest("POST", "/api/resumes", data);
    },
    onSuccess: () => {
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been uploaded and is ready for analysis.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      onUploadComplete?.();
      setResumeText("");
      setFileName("");
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleUpload = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume content required",
        description: "Please paste your resume content or upload a file.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      originalContent: resumeText,
      fileName: fileName || undefined,
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Select Your Field</Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose your industry..." />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-semibold">Upload Resume</Label>
            <div
              {...getRootProps()}
              className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? "Drop your resume here" : "Drop your resume here or click to browse"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Supports PDF, DOC, DOCX, or plain text
                </p>
                {fileName && (
                  <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
                    <FileText className="h-4 w-4 mr-2" />
                    {fileName}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="resume-text" className="text-base font-semibold">
              Or Paste Resume Content
            </Label>
            <Textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              className="mt-2 min-h-[200px] resize-none"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploadMutation.isPending || !resumeText.trim()}
            className="w-full btn-primary"
            size="lg"
          >
            {uploadMutation.isPending ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
