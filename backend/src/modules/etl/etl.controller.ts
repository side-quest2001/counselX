import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { etlService } from './etl.service';
import { AppError } from '../../middleware/error.middleware';

const UploadBodySchema = z.object({
  name: z.string().min(1, 'Dataset name is required').max(255),
  description: z.string().max(1000).optional(),
});

export class ETLController {
  uploadCSV = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(400, 'CSV file is required');
      }

      const body = UploadBodySchema.parse(req.body);

      const result = await etlService.processCSVUpload({
        name: body.name,
        description: body.description,
        filePath: req.file.path,
        originalName: req.file.originalname,
      });

      res.status(201).json({
        success: true,
        message: `Dataset "${result.datasetName}" ingested successfully. ${result.rowCount} records inserted, ${result.errorCount} rows rejected.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const etlController = new ETLController();
