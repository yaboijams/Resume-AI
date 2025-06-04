import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadSuccess?: (resume: any) => void;
  selectedField?: string;
}

export default function FileUpload({ onUploadSuccess, selectedField }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const handleUpload = () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('resume', uploadedFile);
    if (selectedField) {
      formData.append('field', selectedField);
    }

    uploadMutation.mutate(formData);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="premium-shadow border-border">
      <CardContent className="p-8">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-accent hover:border-primary hover:bg-primary/5"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Drop your resume here or click to browse
            </h4>
            <p className="text-muted-foreground">
              Supports PDF, DOC, DOCX, or plain text (max 5MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X size={16} />
              </Button>
            </div>
            <Button 
              onClick={handleUpload} 
              className="w-full gradient-primary text-white border-0"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
