import { Request, Response, NextFunction } from 'express';
import { datasetService } from './dataset.service';

export class DatasetController {
  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const datasets = await datasetService.findAll();
      res.json({ success: true, data: datasets });
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataset = await datasetService.findById(req.params.id);
      res.json({ success: true, data: dataset });
    } catch (err) {
      next(err);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await datasetService.deleteById(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await datasetService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  };
}

export const datasetController = new DatasetController();
