import { Request, Response, NextFunction } from 'express';
import { recordsService } from './records.service';

export class RecordsController {
  findByDatasetId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const datasetId = req.params.datasetId || req.params.id;
      const { page, limit, search, sortBy, sortOrder } = req.query;

      const result = await recordsService.findByDatasetId(datasetId, {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string | undefined,
        sortBy: sortBy as string | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      });

      res.json({
        success: true,
        data: result.records,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  updateById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const record = await recordsService.updateById(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: record, message: 'Record updated successfully' });
    } catch (err) {
      next(err);
    }
  };

  deleteById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await recordsService.deleteById(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  };
}

export const recordsController = new RecordsController();
