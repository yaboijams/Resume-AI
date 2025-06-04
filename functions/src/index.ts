import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import multer from "multer";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Import schemas
import {
  insertResumeSchema,
  insertJobSchema,
  insertApplicationSchema,
  insertAISuggestionSchema,
  COLLECTIONS
} from "../../shared/schema";

// Import OpenAI functions (we'll create this next)
import { analyzeResumeJobMatch, tailorResume, generateCoverLetter, generateAISuggestions } from "./openai";

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

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

// Auth middleware
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Simple text extraction for different file types
function extractTextFromFile(buffer: Buffer, mimetype: string): string {
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }
  // For PDF/DOC files, we'll return the buffer as text for now
  // In production, you'd use proper libraries like pdf-parse or mammoth
  return buffer.toString('utf-8');
}

// Resume endpoints
app.post('/resumes', authenticateUser, upload.single('resume'), async (req, res) => {
  try {
    const userId = req.user!.uid;
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

    const resumeData = {
      userId,
      originalContent: resumeContent,
      fileName,
      field,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.RESUMES).add(resumeData);
    const resume = { id: docRef.id, ...resumeData };

    // Generate AI suggestions for the resume
    const suggestions = await generateAISuggestions(resumeContent, field);
    for (const suggestion of suggestions) {
      await db.collection(COLLECTIONS.AI_SUGGESTIONS).add({
        userId,
        type: 'resume_improvement',
        suggestion,
        applied: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json(resume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

app.get('/resumes', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const snapshot = await db
      .collection(COLLECTIONS.RESUMES)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const resumes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

app.get('/resumes/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const doc = await db.collection(COLLECTIONS.RESUMES).doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = doc.data();
    if (resume?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ id: doc.id, ...resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Job endpoints
app.post('/jobs', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const jobData = insertJobSchema.parse(req.body);
    
    const jobDoc = {
      userId,
      ...jobData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.JOBS).add(jobDoc);
    res.json({ id: docRef.id, ...jobDoc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid job data', 
        errors: fromZodError(error).details 
      });
    }
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

app.get('/jobs', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const snapshot = await db
      .collection(COLLECTIONS.JOBS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Analyze job match
app.post('/analyze-match', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { resumeId, jobDescription } = req.body;
    
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: 'Resume ID and job description are required' });
    }

    const resumeDoc = await db.collection(COLLECTIONS.RESUMES).doc(resumeId).get();
    if (!resumeDoc.exists) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = resumeDoc.data();
    if (resume?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analysis = await analyzeResumeJobMatch(resume.originalContent, jobDescription);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing match:', error);
    res.status(500).json({ message: 'Failed to analyze job match' });
  }
});

// Tailor resume
app.post('/tailor-resume', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { resumeId, jobDescription, field } = req.body;
    
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: 'Resume ID and job description are required' });
    }

    const resumeDoc = await db.collection(COLLECTIONS.RESUMES).doc(resumeId).get();
    if (!resumeDoc.exists) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = resumeDoc.data();
    if (resume?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
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
app.post('/generate-cover-letter', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { resumeId, jobDescription, companyName, tone, hiringManager } = req.body;
    
    if (!resumeId || !jobDescription || !companyName) {
      return res.status(400).json({ message: 'Resume ID, job description, and company name are required' });
    }

    const resumeDoc = await db.collection(COLLECTIONS.RESUMES).doc(resumeId).get();
    if (!resumeDoc.exists) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = resumeDoc.data();
    if (resume?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
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
app.post('/applications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const applicationData = insertApplicationSchema.parse(req.body);
    
    const applicationDoc = {
      userId,
      ...applicationData,
      appliedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.APPLICATIONS).add(applicationDoc);
    res.json({ id: docRef.id, ...applicationDoc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid application data', 
        errors: fromZodError(error).details 
      });
    }
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Failed to create application' });
  }
});

app.get('/applications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const snapshot = await db
      .collection(COLLECTIONS.APPLICATIONS)
      .where('userId', '==', userId)
      .orderBy('appliedAt', 'desc')
      .get();

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

app.patch('/applications/:id/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const docRef = db.collection(COLLECTIONS.APPLICATIONS).doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = doc.data();
    if (application?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await docRef.update({ 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// AI Suggestions endpoints
app.get('/suggestions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const snapshot = await db
      .collection(COLLECTIONS.AI_SUGGESTIONS)
      .where('userId', '==', userId)
      .where('applied', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const suggestions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
});

app.post('/suggestions/:id/apply', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const docRef = db.collection(COLLECTIONS.AI_SUGGESTIONS).doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    const suggestion = doc.data();
    if (suggestion?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await docRef.update({ 
      applied: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error applying suggestion:', error);
    res.status(500).json({ message: 'Failed to apply suggestion' });
  }
});

// Export the Express app as a Firebase Function
export const app = functions.https.onRequest(app);

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: { uid: string };
    }
  }
} 