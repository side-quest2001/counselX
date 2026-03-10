import { Router } from 'express';
import { recordsController } from './records.controller';

// Handles PUT /api/records/:id and DELETE /api/records/:id
const router = Router();

router.put('/:id', recordsController.updateById);
router.delete('/:id', recordsController.deleteById);

export default router;
