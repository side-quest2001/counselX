import { prisma } from '../../config/database';

export async function getDatasetAnalytics() {
  const [
    topUniversities,
    avgSatByCountry,
    majorDistribution,
    countryDistribution,
  ] = await Promise.all([
    // Top universities by admit count
    prisma.studentContextRecord.groupBy({
      by: ['recommendedCollege'],
      _count: { id: true },
      where: { recommendedCollege: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Average SAT by country
    prisma.studentContextRecord.groupBy({
      by: ['preferredCountry'],
      _avg: { satScore: true },
      where: { preferredCountry: { not: null }, satScore: { not: null } },
      orderBy: { _avg: { satScore: 'desc' } },
      take: 10,
    }),

    // Major distribution
    prisma.studentContextRecord.groupBy({
      by: ['courseInterest'],
      _count: { id: true },
      where: { courseInterest: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Country distribution
    prisma.studentContextRecord.groupBy({
      by: ['preferredCountry'],
      _count: { id: true },
      where: { preferredCountry: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    topUniversities: topUniversities.map((r) => ({
      university: r.recommendedCollege,
      count: r._count.id,
    })),
    avgSatByCountry: avgSatByCountry.map((r) => ({
      country: r.preferredCountry,
      avgSat: Math.round(r._avg.satScore ?? 0),
    })),
    majorDistribution: majorDistribution.map((r) => ({
      major: r.courseInterest,
      count: r._count.id,
    })),
    countryDistribution: countryDistribution.map((r) => ({
      country: r.preferredCountry,
      count: r._count.id,
    })),
  };
}
