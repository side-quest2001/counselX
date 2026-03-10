import { Router } from 'express';
import { datasetController } from './dataset.controller';
import recordsRoutes from '../records/records.routes';

const router = Router();

// GET /api/datasets/stats
router.get('/stats', datasetController.getStats);

// GET /api/datasets
router.get('/', datasetController.findAll);

// GET /api/datasets/:id
router.get('/:id', datasetController.findById);

// DELETE /api/datasets/:id
router.delete('/:id', datasetController.deleteById);

// Nest records routes: GET /api/datasets/:id/records
router.use('/:datasetId/records', recordsRoutes);

export default router;
