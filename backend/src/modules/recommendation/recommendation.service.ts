import { prisma } from '../../config/database';
import { RecommendationCategory } from '@prisma/client';
import { llmService } from '../llm/llm.service';
import { mentorsService } from '../mentors/mentors.service';

export interface ProfileInput {
  satScore?: number;
  jeeRank?: number;
  neetScore?: number;
  gpa?: number;
  sopStrength?: number;
  lorStrength?: number;
  extracurricularScore?: number;
  preferredCountry?: string;
  budget?: number;
  targetMajor?: string;
}

export interface UniversityResult {
  universityName: string;
  admitCount: number;
  avgSat: number | null;
  category: RecommendationCategory;
  confidenceScore: number;
}

export interface RecommendationResult {
  profileId: string;
  similarCount: number;
  universities: UniversityResult[];
  llmInsight: string;
  mentors: Array<{ university: string; searchUrl: string; label: string }>;
}

// Score a university by relative frequency to assign category
function categorize(
  admits: Array<{ universityName: string; count: number }>,
  total: number
): Array<{ universityName: string; count: number; category: RecommendationCategory; confidence: number }> {
  if (admits.length === 0) return [];

  const maxCount = admits[0].count;

  return admits.map((u) => {
    const ratio = u.count / (total || 1);
    const relativeStrength = u.count / maxCount;

    let category: RecommendationCategory;
    if (relativeStrength >= 0.6) {
      category = RecommendationCategory.SAFE;
    } else if (relativeStrength >= 0.3) {
      category = RecommendationCategory.TARGET;
    } else {
      category = RecommendationCategory.AMBITIOUS;
    }

    return {
      universityName: u.universityName,
      count: u.count,
      category,
      confidence: Math.round(ratio * 100),
    };
  });
}

export class RecommendationService {
  async generateForStudent(studentId: string, input: ProfileInput): Promise<RecommendationResult> {
    // 1. Save student profile
    const profile = await prisma.studentProfile.create({
      data: {
        studentId,
        satScore: input.satScore,
        jeeRank: input.jeeRank,
        neetScore: input.neetScore,
        gpa: input.gpa,
        sopStrength: input.sopStrength,
        lorStrength: input.lorStrength,
        extracurricularScore: input.extracurricularScore,
        preferredCountry: input.preferredCountry,
        budget: input.budget,
        targetMajor: input.targetMajor,
      },
    });

    // 2. Query historical dataset for similar profiles
    const satMin = (input.satScore ?? 0) - 50;
    const satMax = (input.satScore ?? 9999) + 50;

    const similar = await prisma.studentContextRecord.findMany({
      where: {
        AND: [
          input.satScore
            ? { satScore: { gte: satMin, lte: satMax } }
            : {},
          input.preferredCountry
            ? { preferredCountry: { equals: input.preferredCountry, mode: 'insensitive' } }
            : {},
          input.targetMajor
            ? { courseInterest: { contains: input.targetMajor, mode: 'insensitive' } }
            : {},
          { recommendedCollege: { not: null } },
        ],
      },
      select: {
        satScore: true,
        recommendedCollege: true,
        courseInterest: true,
        preferredCountry: true,
        budgetRange: true,
      },
      take: 200,
    });

    const similarCount = similar.length;

    // 3. Aggregate universities by frequency
    const freqMap = new Map<string, number>();
    for (const row of similar) {
      if (!row.recommendedCollege) continue;
      const name = row.recommendedCollege.trim();
      freqMap.set(name, (freqMap.get(name) ?? 0) + 1);
    }

    const sorted = Array.from(freqMap.entries())
      .map(([name, count]) => ({ universityName: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    // 4. Categorize
    const categorized = categorize(sorted, similarCount);

    // 5. Save recommendations
    if (categorized.length > 0) {
      await prisma.recommendation.createMany({
        data: categorized.map((u) => ({
          studentProfileId: profile.id,
          universityName: u.universityName,
          category: u.category,
          confidenceScore: u.confidence,
          similarProfilesCount: u.count,
        })),
      });
    }

    const universities: UniversityResult[] = categorized.map((u) => ({
      universityName: u.universityName,
      admitCount: u.count,
      avgSat: null,
      category: u.category,
      confidenceScore: u.confidence,
    }));

    // 6. Generate LLM insight
    const llmInsight = await llmService.generateInsight({
      profile: input,
      similarCount,
      universities,
    });

    // 7. Build mentor links
    const mentors = mentorsService.buildMentorLinks(
      universities.slice(0, 5),
      input.targetMajor
    );

    return {
      profileId: profile.id,
      similarCount,
      universities,
      llmInsight,
      mentors,
    };
  }

  async getProfileRecommendations(profileId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: { recommendations: { orderBy: { confidenceScore: 'desc' } } },
    });

    return profile;
  }

  async getStudentProfiles(studentId: string) {
    return prisma.studentProfile.findMany({
      where: { studentId },
      include: {
        recommendations: { orderBy: { confidenceScore: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const recommendationService = new RecommendationService();
