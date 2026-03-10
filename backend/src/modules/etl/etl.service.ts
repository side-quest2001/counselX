import Papa from 'papaparse';
import fs from 'fs';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { mapRow, RawRow } from './etl.mapper';
import { transformRow } from './etl.transformer';
import { validateRows, ValidatedRow } from './etl.validator';
import { DatasetStatus } from '@prisma/client';

const BATCH_SIZE = 500;

export interface UploadPayload {
  name: string;
  description?: string;
  filePath: string;
  originalName: string;
}

export interface ETLResult {
  datasetId: string;
  datasetName: string;
  rowCount: number;
  errorCount: number;
  errors: Array<{ rowIndex: number; issues: string[] }>;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function deleteFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warn('Failed to delete uploaded file', { filePath, err });
  }
}

export class ETLService {
  async processCSVUpload(payload: UploadPayload): Promise<ETLResult> {
    const { name, description, filePath, originalName } = payload;

    // STEP 1: Create dataset record
    const dataset = await prisma.dataset.create({
      data: {
        name,
        description,
        source: originalName,
        status: DatasetStatus.PENDING,
      },
    });

    logger.info(`ETL started`, { datasetId: dataset.id, name });

    try {
      // STEP 2: Update status to PROCESSING
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { status: DatasetStatus.PROCESSING },
      });

      // STEP 3: Read and parse CSV
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parseResult = Papa.parse<RawRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
        throw new Error(
          `CSV parsing failed: ${parseResult.errors[0].message}`
        );
      }

      logger.info(`CSV parsed`, {
        datasetId: dataset.id,
        totalRows: parseResult.data.length,
        parseErrors: parseResult.errors.length,
      });

      // STEP 4: Map columns
      const mappedRows = parseResult.data.map((row) => mapRow(row));

      // STEP 5: Transform data
      const transformedRows = mappedRows.map((row) => transformRow(row));

      // STEP 6: Validate with Zod
      const { valid, errors } = validateRows(transformedRows);

      logger.info(`Validation complete`, {
        datasetId: dataset.id,
        valid: valid.length,
        invalid: errors.length,
      });

      if (errors.length > 0) {
        logger.warn(`Validation errors found`, {
          datasetId: dataset.id,
          errorCount: errors.length,
          sample: errors.slice(0, 3),
        });
      }

      // STEP 7: Batch insert valid rows
      const chunks = chunkArray(valid, BATCH_SIZE);
      let insertedCount = 0;

      for (const chunk of chunks) {
        const records = chunk.map((row: ValidatedRow) => ({
          datasetId: dataset.id,
          studentProfileScore: row.student_profile_score ?? null,
          satScore: row.sat_score ?? null,
          neetScore: row.neet_score ?? null,
          jeeScore: row.jee_score ?? null,
          courseInterest: row.course_interest ?? null,
          preferredCountry: row.preferred_country ?? null,
          preferredState: row.preferred_state ?? null,
          budgetRange: row.budget_range ?? null,
          sopStrength: row.sop_strength ?? null,
          lorStrength: row.lor_strength ?? null,
          profileRating: row.profile_rating ?? null,
          targetCollegeRank: row.target_college_rank ?? null,
          recommendedCollege: row.recommended_college ?? null,
          recommendedCourse: row.recommended_course ?? null,
        }));

        await prisma.studentContextRecord.createMany({ data: records });
        insertedCount += records.length;

        logger.info(`Batch inserted`, {
          datasetId: dataset.id,
          inserted: insertedCount,
          total: valid.length,
        });
      }

      // STEP 8: Update dataset status to COMPLETED
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: {
          rowCount: insertedCount,
          status: DatasetStatus.COMPLETED,
        },
      });

      logger.info(`ETL completed`, {
        datasetId: dataset.id,
        rowCount: insertedCount,
        errorCount: errors.length,
      });

      return {
        datasetId: dataset.id,
        datasetName: dataset.name,
        rowCount: insertedCount,
        errorCount: errors.length,
        errors: errors.slice(0, 20).map((e) => ({
          rowIndex: e.rowIndex,
          issues: e.issues,
        })),
      };
    } catch (err) {
      // Mark dataset as FAILED
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { status: DatasetStatus.FAILED },
      });

      logger.error(`ETL failed`, { datasetId: dataset.id, err });
      throw err;
    } finally {
      // STEP 9: Always clean up the uploaded file
      await deleteFile(filePath);
    }
  }
}

export const etlService = new ETLService();
