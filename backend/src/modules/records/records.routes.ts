import { Router } from 'express';
import { recordsController } from './records.controller';

// This router is mounted at both:
//   /api/datasets/:datasetId/records  (via dataset.routes.ts)
//   /api/records  (for PUT/DELETE via app.ts)

const router = Router({ mergeParams: true });

// GET /api/datasets/:datasetId/records
router.get('/', recordsController.findByDatasetId);

export default router;
