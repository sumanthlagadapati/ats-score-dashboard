import OpenAI from 'openai';

// We use dangerouslyAllowBrowser for prototype local dev. 
// In production, this should be routed through a backend!
const getClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

export async function analyzeResumeWithAI(resume, jd) {
  const openai = getClient();
  if (!openai) {
    throw new Error('No VITE_OPENAI_API_KEY found. Add it to a .env file.');
  }

  const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) simulator.
I will provide you with a Job Description (JD) and a Candidate's Resume.

Your task is to analyze how well the resume matches the JD and provide:
1. An overall match score (0-100)
2. A list of critical keywords/skills from the JD that ARE matched in the resume.
3. A list of critical keywords/skills from the JD that are MISSING in the resume.
4. Suggestions for adding the missing keywords.
5. A rewritten version of the resume that better targets the JD, incorporating missing skills where plausible.

Job Description:
"""
${jd}
"""

Resume:
"""
${resume}
"""

Please output your response as valid JSON with the following structure:
{
  "overallScore": 85,
  "matchedKeywords": ["react", "node"],
  "missingKeywords": ["aws", "ci/cd"],
  "keywordSuggestions": ["Add a bullet about deploying Node apps to AWS"],
  "rewrittenResume": "PROFESSIONAL SUMMARY..."
}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' }
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data;
}
