import { z } from 'zod';
import { TransformedRow } from './etl.transformer';

const StudentRecordSchema = z.object({
  student_profile_score: z.number().min(0).max(100).nullable().optional(),
  sat_score: z
    .number()
    .int()
    .min(400, 'SAT score must be at least 400')
    .max(1600, 'SAT score must be at most 1600')
    .nullable()
    .optional(),
  neet_score: z.number().min(0).nullable().optional(),
  jee_score: z.number().min(0).nullable().optional(),
  course_interest: z.string().max(255).nullable().optional(),
  preferred_country: z.string().max(100).nullable().optional(),
  preferred_state: z.string().max(100).nullable().optional(),
  budget_range: z.string().max(100).nullable().optional(),
  sop_strength: z.number().min(0).max(10).nullable().optional(),
  lor_strength: z.number().min(0).max(10).nullable().optional(),
  profile_rating: z
    .number()
    .min(1, 'Profile rating must be at least 1')
    .max(10, 'Profile rating must be at most 10')
    .nullable()
    .optional(),
  target_college_rank: z.number().int().min(1).nullable().optional(),
  recommended_college: z.string().max(500).nullable().optional(),
  recommended_course: z.string().max(255).nullable().optional(),
});

export type ValidatedRow = z.infer<typeof StudentRecordSchema>;

export interface ValidationError {
  rowIndex: number;
  issues: string[];
  rawData?: Partial<TransformedRow>;
}

export interface ValidationResult {
  valid: ValidatedRow[];
  errors: ValidationError[];
}

export function validateRows(rows: TransformedRow[]): ValidationResult {
  const valid: ValidatedRow[] = [];
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const result = StudentRecordSchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        rowIndex: index + 2, // +2 because row 1 is headers, index is 0-based
        issues: result.error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        ),
        rawData: row,
      });
    }
  });

  return { valid, errors };
}
