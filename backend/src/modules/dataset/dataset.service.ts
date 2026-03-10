import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class DatasetService {
  async findAll() {
    return prisma.dataset.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        source: true,
        uploadedAt: true,
        rowCount: true,
        status: true,
        _count: { select: { records: true } },
      },
    });
  }

  async findById(id: string) {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        source: true,
        uploadedAt: true,
        rowCount: true,
        status: true,
        _count: { select: { records: true } },
      },
    });

    if (!dataset) {
      throw new AppError(404, `Dataset with id "${id}" not found`);
    }

    return dataset;
  }

  async deleteById(id: string) {
    const dataset = await prisma.dataset.findUnique({ where: { id } });

    if (!dataset) {
      throw new AppError(404, `Dataset with id "${id}" not found`);
    }

    await prisma.dataset.delete({ where: { id } });

    return { message: `Dataset "${dataset.name}" deleted successfully` };
  }

  async getStats() {
    const [totalDatasets, statusCounts] = await Promise.all([
      prisma.dataset.count(),
      prisma.dataset.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const totalRecords = await prisma.studentContextRecord.count();

    const latest = await prisma.dataset.findFirst({
      orderBy: { uploadedAt: 'desc' },
      select: { name: true, uploadedAt: true, status: true },
    });

    return {
      totalDatasets,
      totalRecords,
      statusCounts: statusCounts.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count.id }),
        {} as Record<string, number>
      ),
      latestUpload: latest,
    };
  }
}

export const datasetService = new DatasetService();
