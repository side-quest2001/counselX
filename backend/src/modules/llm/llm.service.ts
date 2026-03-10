import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ProfileInput } from '../recommendation/recommendation.service';
import { RecommendationCategory } from '@prisma/client';

interface UniversityEntry {
  universityName: string;
  category: RecommendationCategory;
  confidenceScore: number;
  admitCount: number;
}

interface LLMInput {
  profile: ProfileInput;
  similarCount: number;
  universities: UniversityEntry[];
}

function buildPrompt(input: LLMInput): string {
  const { profile, similarCount, universities } = input;

  const safe = universities.filter((u) => u.category === 'SAFE');
  const target = universities.filter((u) => u.category === 'TARGET');
  const ambitious = universities.filter((u) => u.category === 'AMBITIOUS');

  const formatList = (arr: UniversityEntry[]) =>
    arr.map((u) => `  - ${u.universityName} (${u.admitCount} similar admits)`).join('\n') || '  None identified';

  return `You are an expert university admissions counselor. Based on real historical admission data, provide structured guidance for this student.

## Student Profile
- SAT Score: ${profile.satScore ?? 'Not provided'}
- JEE Rank: ${profile.jeeRank ?? 'Not provided'}
- NEET Score: ${profile.neetScore ?? 'Not provided'}
- GPA: ${profile.gpa ?? 'Not provided'}
- Target Major: ${profile.targetMajor ?? 'Not specified'}
- Preferred Country: ${profile.preferredCountry ?? 'Not specified'}
- Budget: ${profile.budget ? `$${profile.budget.toLocaleString()}` : 'Not specified'}
- Extracurricular Score: ${profile.extracurricularScore ?? 'Not provided'}/10
- SOP Strength: ${profile.sopStrength ?? 'Not provided'}/10
- LOR Strength: ${profile.lorStrength ?? 'Not provided'}/10

## Historical Data Insight
${similarCount} students with similar profiles were found in our dataset.

### University Recommendations (by historical admit frequency)
Safe schools:
${formatList(safe)}

Target schools:
${formatList(target)}

Ambitious schools:
${formatList(ambitious)}

## Your Task
Provide concise, actionable guidance in the following structure. Be specific and data-driven:

1. **Admission Probability Insight** — What do the ${similarCount} similar profiles tell us? Which universities appear most achievable?

2. **University Strategy** — Explain the Safe / Target / Ambitious breakdown and why this student should apply to this mix.

3. **Profile Improvement Suggestions** — Give 3–4 specific, actionable improvements this student can make before applying (e.g., strengthen SOP, add internships, improve GPA).

4. **Application Strategy** — How many universities should they apply to? Any timing or sequence advice?

5. **Scholarship Insights** — Based on this profile, what scholarship opportunities or ranges might be realistic?

Keep your response structured with the numbered headers. Be direct and practical.`;
}

export class LLMService {
  async generateInsight(input: LLMInput): Promise<string> {
    if (!env.GROK_API_KEY || env.GROK_API_KEY === 'your_grok_api_key') {
      logger.warn('GROK_API_KEY not configured, returning placeholder insight');
      return this.fallbackInsight(input);
    }

    try {
      const response = await fetch(env.GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert admissions counselor who provides structured, data-driven university application guidance. Always respond with the numbered sections as requested.',
            },
            {
              role: 'user',
              content: buildPrompt(input),
            },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        logger.error('Grok API error', { status: response.status, err });
        return this.fallbackInsight(input);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      return data.choices?.[0]?.message?.content ?? this.fallbackInsight(input);
    } catch (err) {
      logger.error('LLM call failed', { err });
      return this.fallbackInsight(input);
    }
  }

  private fallbackInsight(input: LLMInput): string {
    const { similarCount, universities, profile } = input;
    const safe = universities.filter((u) => u.category === 'SAFE');
    const target = universities.filter((u) => u.category === 'TARGET');
    const ambitious = universities.filter((u) => u.category === 'AMBITIOUS');

    return `**1. Admission Probability Insight**
Based on ${similarCount} similar historical profiles${profile.targetMajor ? ` pursuing ${profile.targetMajor}` : ''}, we identified ${universities.length} universities with prior admission records. ${safe[0] ? `${safe[0].universityName} shows the strongest historical admit rate with ${safe[0].admitCount} similar admits.` : 'Build a balanced list across all categories.'}

**2. University Strategy**
Your list is balanced across ${safe.length} safe, ${target.length} target, and ${ambitious.length} ambitious schools. Safe schools offer high admission probability, targets are realistic with a strong application, and ambitious schools are reach goals worth attempting.

**3. Profile Improvement Suggestions**
- Strengthen your Statement of Purpose with specific research interests and career goals
- Build extracurricular depth in areas aligned with your target major
- Seek strong recommendation letters from professors or supervisors who know your work well
- Consider relevant internships or projects to add practical experience

**4. Application Strategy**
Apply to 10–14 universities: 3–4 safe, 5–6 target, and 2–3 ambitious schools. Submit applications in the first round of deadlines to maximize scholarship opportunities.

**5. Scholarship Insights**
Students with similar profiles have received merit scholarships ranging from $5,000–$20,000 annually at target schools. Research university-specific merit awards and apply for external scholarships early.`;
  }
}

export const llmService = new LLMService();
