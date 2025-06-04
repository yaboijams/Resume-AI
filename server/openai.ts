import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface JobMatchAnalysis {
  matchScore: number;
  missingKeywords: string[];
  strongMatches: string[];
  suggestions: string[];
}

export interface CoverLetterOptions {
  resumeContent: string;
  jobDescription: string;
  companyName: string;
  tone: 'professional' | 'enthusiastic' | 'conversational' | 'formal';
  hiringManager?: string;
}

export async function analyzeResumeJobMatch(
  resumeContent: string, 
  jobDescription: string
): Promise<JobMatchAnalysis> {
  try {
    const prompt = `
Analyze the compatibility between this resume and job description for ATS (Applicant Tracking System) scoring.

Resume:
${resumeContent}

Job Description:
${jobDescription}

Provide a detailed analysis in JSON format with:
1. matchScore: A percentage (0-100) indicating how well the resume matches the job
2. missingKeywords: Array of important keywords/skills from job description missing in resume
3. strongMatches: Array of keywords/skills that match well between resume and job
4. suggestions: Array of specific actionable suggestions to improve the match

Respond with valid JSON only.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
      missingKeywords: result.missingKeywords || [],
      strongMatches: result.strongMatches || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Error analyzing resume-job match:', error);
    throw new Error('Failed to analyze resume-job match');
  }
}

export async function tailorResume(
  resumeContent: string,
  jobDescription: string,
  field: string
): Promise<string> {
  try {
    const prompt = `
You are an expert resume coach specializing in ${field}. Tailor this resume to match the job description while maintaining authenticity and professional formatting.

Original Resume:
${resumeContent}

Job Description:
${jobDescription}

Instructions:
1. Optimize keywords to match the job description
2. Emphasize relevant experience and skills
3. Adjust job titles and descriptions to better align with the target role
4. Add relevant skills that are mentioned in the job description but missing from resume
5. Maintain the original structure and formatting
6. Keep all information truthful and based on the original content
7. Focus on ${field}-specific terminology and requirements

Return the tailored resume content maintaining professional formatting.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || resumeContent;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw new Error('Failed to tailor resume');
  }
}

export async function generateCoverLetter(options: CoverLetterOptions): Promise<string> {
  try {
    const { resumeContent, jobDescription, companyName, tone, hiringManager } = options;
    
    const addressee = hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Manager,';
    
    const toneInstructions = {
      professional: 'Use a professional, formal tone that demonstrates competence and reliability.',
      enthusiastic: 'Use an enthusiastic, energetic tone that shows passion and excitement for the role.',
      conversational: 'Use a conversational, approachable tone that feels personable while remaining professional.',
      formal: 'Use a formal, traditional business tone that emphasizes respect and hierarchy.'
    };

    const prompt = `
Write a compelling cover letter based on this resume and job description.

Resume:
${resumeContent}

Job Description:
${jobDescription}

Company: ${companyName}
Tone: ${toneInstructions[tone]}

Instructions:
1. Start with "${addressee}"
2. Create 3-4 paragraphs that highlight relevant experience
3. Show enthusiasm for the specific role and company
4. Include specific examples from the resume that match job requirements
5. End with a professional closing
6. Keep it concise (under 400 words)
7. Make it ATS-friendly with relevant keywords
8. Avoid generic phrases and make it specific to this job

Return only the cover letter content.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
}

export async function generateAISuggestions(
  resumeContent: string,
  field: string
): Promise<string[]> {
  try {
    const prompt = `
Analyze this ${field} resume and provide 3-5 specific, actionable improvement suggestions.

Resume:
${resumeContent}

Provide suggestions in JSON format as an array of strings. Focus on:
1. Missing skills relevant to ${field}
2. Ways to quantify achievements better
3. Keyword optimization for ATS
4. Structure and formatting improvements
5. Industry-specific recommendations

Respond with valid JSON array only.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || [];
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [];
  }
}
