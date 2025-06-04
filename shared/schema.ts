import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Base types for Firestore documents
export interface FirestoreDoc {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// User schema
export const insertUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(),
});

// Resume schema
export const insertResumeSchema = z.object({
  originalContent: z.string(),
  fileName: z.string().optional(),
  field: z.string().optional(),
});

export const resumeSchema = insertResumeSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(),
});

// Job schema
export const insertJobSchema = z.object({
  title: z.string(),
  company: z.string(),
  description: z.string(),
  url: z.string().optional(),
});

export const jobSchema = insertJobSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(),
});

// Application schema
export const insertApplicationSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
  status: z.enum(['applied', 'interview', 'rejected', 'offer']).default('applied'),
  matchScore: z.number().optional(),
  tailoredResumeContent: z.string().optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.any().optional(), // Firestore Timestamp
});

export const applicationSchema = insertApplicationSchema.extend({
  id: z.string(),
  userId: z.string(),
  appliedAt: z.any(), // Firestore Timestamp
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(),
});

// AI Suggestion schema
export const insertAISuggestionSchema = z.object({
  type: z.string(),
  suggestion: z.string(),
});

export const aiSuggestionSchema = insertAISuggestionSchema.extend({
  id: z.string(),
  userId: z.string(),
  applied: z.boolean().default(false),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Job = z.infer<typeof jobSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AISuggestion = z.infer<typeof aiSuggestionSchema>;
export type InsertAISuggestion = z.infer<typeof insertAISuggestionSchema>;

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  RESUMES: 'resumes',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  AI_SUGGESTIONS: 'aiSuggestions',
} as const;
