import { Router } from 'express';
import { studentsController } from './students.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/signup', studentsController.signup);
router.post('/login', studentsController.login);
router.get('/me', authenticateToken, studentsController.getMe);

export default router;
