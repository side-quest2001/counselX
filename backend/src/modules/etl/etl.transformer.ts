import { MappedRow } from './etl.mapper';

export interface TransformedRow {
  student_profile_score: number | null;
  sat_score: number | null;
  neet_score: number | null;
  jee_score: number | null;
  course_interest: string | null;
  preferred_country: string | null;
  preferred_state: string | null;
  budget_range: string | null;
  sop_strength: number | null;
  lor_strength: number | null;
  profile_rating: number | null;
  target_college_rank: number | null;
  recommended_college: string | null;
  recommended_course: string | null;
}

const COUNTRY_NORMALIZATION: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'united states of america': 'United States',
  'united states': 'United States',
  india: 'India',
  ind: 'India',
  in: 'India',
  uk: 'United Kingdom',
  'u.k.': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'great britain': 'United Kingdom',
  canada: 'Canada',
  can: 'Canada',
  ca: 'Canada',
  australia: 'Australia',
  aus: 'Australia',
  au: 'Australia',
  germany: 'Germany',
  ger: 'Germany',
  de: 'Germany',
  france: 'France',
  fra: 'France',
  fr: 'France',
  singapore: 'Singapore',
  sgp: 'Singapore',
  sg: 'Singapore',
  uae: 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  newzealand: 'New Zealand',
  'new zealand': 'New Zealand',
  nz: 'New Zealand',
};

function toNullable(value: string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toFloat(value: string | undefined): number | null {
  const str = toNullable(value);
  if (str === null) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function toInt(value: string | undefined): number | null {
  const str = toNullable(value);
  if (str === null) return null;
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function normalizeCountry(value: string | undefined): string | null {
  const str = toNullable(value);
  if (str === null) return null;
  const normalized = COUNTRY_NORMALIZATION[str.toLowerCase()];
  return normalized ?? str;
}

export function transformRow(mappedRow: MappedRow): TransformedRow {
  return {
    student_profile_score: toFloat(mappedRow.student_profile_score),
    sat_score: toInt(mappedRow.sat_score),
    neet_score: toFloat(mappedRow.neet_score),
    jee_score: toFloat(mappedRow.jee_score),
    course_interest: toNullable(mappedRow.course_interest),
    preferred_country: normalizeCountry(mappedRow.preferred_country),
    preferred_state: toNullable(mappedRow.preferred_state),
    budget_range: toNullable(mappedRow.budget_range),
    sop_strength: toFloat(mappedRow.sop_strength),
    lor_strength: toFloat(mappedRow.lor_strength),
    profile_rating: toFloat(mappedRow.profile_rating),
    target_college_rank: toInt(mappedRow.target_college_rank),
    recommended_college: toNullable(mappedRow.recommended_college),
    recommended_course: toNullable(mappedRow.recommended_course),
  };
}
