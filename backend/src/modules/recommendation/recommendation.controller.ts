import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { recommendationService } from './recommendation.service';
import { AppError } from '../../middleware/error.middleware';

const ProfileSchema = z.object({
  satScore: z.coerce.number().int().min(400).max(1600).optional(),
  jeeRank: z.coerce.number().int().min(1).optional(),
  neetScore: z.coerce.number().min(0).optional(),
  gpa: z.coerce.number().min(0).max(10).optional(),
  sopStrength: z.coerce.number().min(0).max(10).optional(),
  lorStrength: z.coerce.number().min(0).max(10).optional(),
  extracurricularScore: z.coerce.number().min(0).max(10).optional(),
  preferredCountry: z.string().max(100).optional(),
  budget: z.coerce.number().min(0).optional(),
  targetMajor: z.string().max(255).optional(),
});

export class RecommendationController {
  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.id;
      if (!studentId) throw new AppError(401, 'Student ID not found in token');

      const input = ProfileSchema.parse(req.body);
      const result = await recommendationService.generateForStudent(studentId, input);

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getProfiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.id;
      if (!studentId) throw new AppError(401, 'Student ID not found in token');

      const profiles = await recommendationService.getStudentProfiles(studentId);
      res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  };

  getByProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await recommendationService.getProfileRecommendations(req.params.profileId);
      if (!profile) throw new AppError(404, 'Profile not found');
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}

export const recommendationController = new RecommendationController();
