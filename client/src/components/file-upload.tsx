import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx,.txt",
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ""
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll need a proper parser in production
        // For now, we'll use the file buffer as text (this is a simplification)
        content = await file.text();
      } else {
        // For DOC/DOCX files, you'd typically use libraries like mammoth.js
        content = await file.text();
      }

      setSelectedFile(file);
      onFileSelect(file, content);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => {
      setIsDragActive(false);
      toast({
        title: "Invalid file",
        description: "Please upload a PDF, DOC, DOCX, or TXT file under 10MB.",
        variant: "destructive",
      });
    }
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <h4 className="text-lg font-semibold premium-heading mb-2">
            Drop your resume here or click to browse
          </h4>
          <p className="premium-text text-sm">
            Supports PDF, DOC, DOCX, or plain text (max 10MB)
          </p>
        </div>
      ) : (
        <div className="border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium premium-heading">{selectedFile.name}</h4>
                <p className="text-sm premium-text">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
