import { 
  users, resumes, jobs, applications, aiSuggestions,
  type User, type InsertUser,
  type Resume, type InsertResume,
  type Job, type InsertJob,
  type Application, type InsertApplication,
  type AISuggestion, type InsertAISuggestion
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Resume operations
  createResume(userId: number, resume: InsertResume): Promise<Resume>;
  getResumes(userId: number): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  updateResume(id: number, content: string): Promise<Resume | undefined>;

  // Job operations
  createJob(userId: number, job: InsertJob): Promise<Job>;
  getJobs(userId: number): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;

  // Application operations
  createApplication(userId: number, application: InsertApplication): Promise<Application>;
  getApplications(userId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  updateApplicationCoverLetter(id: number, coverLetter: string): Promise<Application | undefined>;

  // AI Suggestions operations
  createAISuggestion(userId: number, suggestion: InsertAISuggestion): Promise<AISuggestion>;
  getAISuggestions(userId: number): Promise<AISuggestion[]>;
  markSuggestionApplied(id: number): Promise<AISuggestion | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Resume operations
  async createResume(userId: number, resume: InsertResume): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values({ ...resume, userId })
      .returning();
    return newResume;
  }

  async getResumes(userId: number): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async updateResume(id: number, content: string): Promise<Resume | undefined> {
    const [updated] = await db
      .update(resumes)
      .set({ originalContent: content })
      .where(eq(resumes.id, id))
      .returning();
    return updated || undefined;
  }

  // Job operations
  async createJob(userId: number, job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values({ ...job, userId })
      .returning();
    return newJob;
  }

  async getJobs(userId: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  // Application operations
  async createApplication(userId: number, application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values({ ...application, userId })
      .returning();
    return newApplication;
  }

  async getApplications(userId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application || undefined;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updated || undefined;
  }

  async updateApplicationCoverLetter(id: number, coverLetter: string): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ coverLetter })
      .where(eq(applications.id, id))
      .returning();
    return updated || undefined;
  }

  // AI Suggestions operations
  async createAISuggestion(userId: number, suggestion: InsertAISuggestion): Promise<AISuggestion> {
    const [newSuggestion] = await db
      .insert(aiSuggestions)
      .values({ ...suggestion, userId })
      .returning();
    return newSuggestion;
  }

  async getAISuggestions(userId: number): Promise<AISuggestion[]> {
    return await db
      .select()
      .from(aiSuggestions)
      .where(and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.applied, false)))
      .orderBy(desc(aiSuggestions.createdAt));
  }

  async markSuggestionApplied(id: number): Promise<AISuggestion | undefined> {
    const [updated] = await db
      .update(aiSuggestions)
      .set({ applied: true })
      .where(eq(aiSuggestions.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
