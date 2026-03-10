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

    // 2. Query historical dataset for similar profiles (tiered relaxation)
    const satMin = (input.satScore ?? 0) - 100;
    const satMax = (input.satScore ?? 9999) + 100;

    const baseSelect = {
      satScore: true,
      recommendedCollege: true,
      courseInterest: true,
      preferredCountry: true,
      budgetRange: true,
    };

    const satFilter = input.satScore ? { satScore: { gte: satMin, lte: satMax } } : {};
    const countryFilter = input.preferredCountry
      ? { preferredCountry: { equals: input.preferredCountry, mode: 'insensitive' as const } }
      : {};
    const majorFilter = input.targetMajor
      ? { courseInterest: { contains: input.targetMajor, mode: 'insensitive' as const } }
      : {};

    // Tier 1: SAT + country + major
    let similar = await prisma.studentContextRecord.findMany({
      where: { AND: [satFilter, countryFilter, majorFilter, { recommendedCollege: { not: null } }] },
      select: baseSelect,
      take: 200,
    });

    // Tier 2: SAT + country (drop major)
    if (similar.length < 10) {
      similar = await prisma.studentContextRecord.findMany({
        where: { AND: [satFilter, countryFilter, { recommendedCollege: { not: null } }] },
        select: baseSelect,
        take: 200,
      });
    }

    // Tier 3: SAT + major (drop country)
    if (similar.length < 10) {
      similar = await prisma.studentContextRecord.findMany({
        where: { AND: [satFilter, majorFilter, { recommendedCollege: { not: null } }] },
        select: baseSelect,
        take: 200,
      });
    }

    // Tier 4: SAT only
    if (similar.length < 10 && input.satScore) {
      similar = await prisma.studentContextRecord.findMany({
        where: { AND: [satFilter, { recommendedCollege: { not: null } }] },
        select: baseSelect,
        take: 200,
      });
    }

    // Tier 5: any records with a recommendation
    if (similar.length < 10) {
      similar = await prisma.studentContextRecord.findMany({
        where: { recommendedCollege: { not: null } },
        select: baseSelect,
        take: 200,
      });
    }

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

    // 7. Store llmInsight on the profile
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { llmInsight },
    });

    // 8. Build mentor links
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

  async getProfileRecommendations(profileId: string): Promise<RecommendationResult | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: { recommendations: { orderBy: { confidenceScore: 'desc' } } },
    });

    if (!profile) return null;

    const universities: UniversityResult[] = profile.recommendations.map((r) => ({
      universityName: r.universityName,
      admitCount: r.similarProfilesCount,
      avgSat: null,
      category: r.category,
      confidenceScore: r.confidenceScore,
    }));

    const mentors = mentorsService.buildMentorLinks(
      universities.slice(0, 5),
      profile.targetMajor ?? undefined
    );

    return {
      profileId: profile.id,
      similarCount: profile.recommendations.reduce((sum, r) => sum + r.similarProfilesCount, 0),
      universities,
      llmInsight: profile.llmInsight ?? 'No AI insight available for this profile.',
      mentors,
    };
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
