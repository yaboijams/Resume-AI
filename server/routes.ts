import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertResumeSchema, 
  insertJobSchema, 
  insertApplicationSchema,
  insertAISuggestionSchema 
} from "@shared/schema";
import { analyzeResumeJobMatch, tailorResume, generateCoverLetter, generateAISuggestions } from "./openai";
import multer from "multer";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Simple text extraction for different file types
function extractTextFromFile(buffer: Buffer, mimetype: string): string {
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }
  // For PDF/DOC files, we'll return the buffer as text for now
  // In production, you'd use proper libraries like pdf-parse or mammoth
  return buffer.toString('utf-8');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Resume endpoints
  app.post('/api/resumes', upload.single('resume'), async (req, res) => {
    try {
      const userId = 1; // Mock user ID for now
      let resumeContent = '';
      let fileName = '';

      if (req.file) {
        resumeContent = extractTextFromFile(req.file.buffer, req.file.mimetype);
        fileName = req.file.originalname;
      } else if (req.body.content) {
        resumeContent = req.body.content;
      } else {
        return res.status(400).json({ message: 'Resume file or content is required' });
      }

      const field = req.body.field || 'General';

      const resume = await storage.createResume(userId, {
        originalContent: resumeContent,
        fileName,
        field
      });

      // Generate AI suggestions for the resume
      const suggestions = await generateAISuggestions(resumeContent, field);
      for (const suggestion of suggestions) {
        await storage.createAISuggestion(userId, {
          type: 'resume_improvement',
          suggestion
        });
      }

      res.json(resume);
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ message: 'Failed to upload resume' });
    }
  });

  app.get('/api/resumes', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const resumes = await storage.getResumes(userId);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch resumes' });
    }
  });

  app.get('/api/resumes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch resume' });
    }
  });

  // Job endpoints
  app.post('/api/jobs', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(userId, jobData);
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid job data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create job' });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const jobs = await storage.getJobs(userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  });

  // Analyze job match
  app.post('/api/analyze-match', async (req, res) => {
    try {
      const { resumeId, jobDescription } = req.body;
      
      if (!resumeId || !jobDescription) {
        return res.status(400).json({ message: 'Resume ID and job description are required' });
      }

      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      const analysis = await analyzeResumeJobMatch(resume.originalContent, jobDescription);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing match:', error);
      res.status(500).json({ message: 'Failed to analyze job match' });
    }
  });

  // Tailor resume
  app.post('/api/tailor-resume', async (req, res) => {
    try {
      const { resumeId, jobDescription, field } = req.body;
      
      if (!resumeId || !jobDescription) {
        return res.status(400).json({ message: 'Resume ID and job description are required' });
      }

      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      const tailoredContent = await tailorResume(
        resume.originalContent, 
        jobDescription, 
        field || resume.field || 'General'
      );
      
      res.json({ tailoredContent });
    } catch (error) {
      console.error('Error tailoring resume:', error);
      res.status(500).json({ message: 'Failed to tailor resume' });
    }
  });

  // Generate cover letter
  app.post('/api/generate-cover-letter', async (req, res) => {
    try {
      const { resumeId, jobDescription, companyName, tone, hiringManager } = req.body;
      
      if (!resumeId || !jobDescription || !companyName) {
        return res.status(400).json({ message: 'Resume ID, job description, and company name are required' });
      }

      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      const coverLetter = await generateCoverLetter({
        resumeContent: resume.originalContent,
        jobDescription,
        companyName,
        tone: tone || 'professional',
        hiringManager
      });
      
      res.json({ coverLetter });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      res.status(500).json({ message: 'Failed to generate cover letter' });
    }
  });

  // Application endpoints
  app.post('/api/applications', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(userId, applicationData);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid application data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create application' });
    }
  });

  app.get('/api/applications', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  app.patch('/api/applications/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const application = await storage.updateApplicationStatus(id, status);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update application status' });
    }
  });

  // AI Suggestions endpoints
  app.get('/api/suggestions', async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const suggestions = await storage.getAISuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch suggestions' });
    }
  });

  app.post('/api/suggestions/:id/apply', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const suggestion = await storage.markSuggestionApplied(id);
      if (!suggestion) {
        return res.status(404).json({ message: 'Suggestion not found' });
      }
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ message: 'Failed to apply suggestion' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
