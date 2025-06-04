import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalContent: text("original_content").notNull(),
  fileName: text("file_name"),
  field: text("field"), // Technology, Healthcare, Marketing, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  status: text("status").notNull().default("applied"), // applied, interview, rejected, offer
  matchScore: integer("match_score"), // ATS match percentage
  tailoredResumeContent: text("tailored_resume_content"),
  coverLetter: text("cover_letter"),
  notes: text("notes"),
  appliedAt: timestamp("applied_at").defaultNow(),
  followUpDate: timestamp("follow_up_date"),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // resume_improvement, skill_addition, etc.
  suggestion: text("suggestion").notNull(),
  applied: boolean("applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  originalContent: true,
  fileName: true,
  field: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  description: true,
  url: true,
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  resumeId: true,
  status: true,
  matchScore: true,
  tailoredResumeContent: true,
  coverLetter: true,
  notes: true,
  followUpDate: true,
});

export const insertAISuggestionSchema = createInsertSchema(aiSuggestions).pick({
  type: true,
  suggestion: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AISuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAISuggestion = z.infer<typeof insertAISuggestionSchema>;
