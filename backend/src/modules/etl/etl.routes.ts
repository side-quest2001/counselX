import { Router } from 'express';
import { etlController } from './etl.controller';
import { csvUpload } from '../../utils/fileUploader';

const router = Router();

// POST /api/etl/upload-csv
router.post('/upload-csv', csvUpload, etlController.uploadCSV);

export default router;
