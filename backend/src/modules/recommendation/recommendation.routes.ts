import { Router } from 'express';
import { recommendationController } from './recommendation.controller';
import { requireStudent } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/recommendations  — submit profile + get recommendations
router.post('/', requireStudent, recommendationController.generate);

// GET /api/recommendations/profiles — list student's past profiles
router.get('/profiles', requireStudent, recommendationController.getProfiles);

// GET /api/recommendations/profiles/:profileId — get specific profile + results
router.get('/profiles/:profileId', requireStudent, recommendationController.getByProfile);

export default router;
