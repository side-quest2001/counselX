import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export interface RecordQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const ALLOWED_SORT_FIELDS = [
  'satScore',
  'neetScore',
  'jeeScore',
  'studentProfileScore',
  'profileRating',
  'targetCollegeRank',
  'createdAt',
];

const EDITABLE_FIELDS = [
  'studentProfileScore',
  'satScore',
  'neetScore',
  'jeeScore',
  'courseInterest',
  'preferredCountry',
  'preferredState',
  'budgetRange',
  'sopStrength',
  'lorStrength',
  'profileRating',
  'targetCollegeRank',
  'recommendedCollege',
  'recommendedCourse',
];

export class RecordsService {
  async findByDatasetId(datasetId: string, params: RecordQueryParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 50));
    const skip = (page - 1) * limit;
    const sortBy =
      params.sortBy && ALLOWED_SORT_FIELDS.includes(params.sortBy)
        ? params.sortBy
        : 'createdAt';
    const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

    const where: Record<string, unknown> = { datasetId };

    if (params.search) {
      const search = params.search.trim();
      where.OR = [
        { courseInterest: { contains: search, mode: 'insensitive' } },
        { preferredCountry: { contains: search, mode: 'insensitive' } },
        { preferredState: { contains: search, mode: 'insensitive' } },
        { recommendedCollege: { contains: search, mode: 'insensitive' } },
        { recommendedCourse: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await prisma.$transaction([
      prisma.studentContextRecord.count({ where }),
      prisma.studentContextRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateById(id: string, data: Record<string, unknown>) {
    const record = await prisma.studentContextRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new AppError(404, `Record with id "${id}" not found`);
    }

    // Whitelist editable fields
    const filteredData: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in data) {
        filteredData[field] = data[field] ?? null;
      }
    }

    return prisma.studentContextRecord.update({
      where: { id },
      data: filteredData,
    });
  }

  async deleteById(id: string) {
    const record = await prisma.studentContextRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new AppError(404, `Record with id "${id}" not found`);
    }

    await prisma.studentContextRecord.delete({ where: { id } });

    return { message: 'Record deleted successfully' };
  }
}

export const recordsService = new RecordsService();
