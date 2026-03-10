/**
 * ETL Column Mapper
 * Normalizes flexible CSV column names to canonical field names
 */

type CanonicalField =
  | 'sat_score'
  | 'neet_score'
  | 'jee_score'
  | 'student_profile_score'
  | 'course_interest'
  | 'preferred_country'
  | 'preferred_state'
  | 'budget_range'
  | 'sop_strength'
  | 'lor_strength'
  | 'profile_rating'
  | 'target_college_rank'
  | 'recommended_college'
  | 'recommended_course';

const COLUMN_ALIASES: Record<CanonicalField, string[]> = {
  sat_score: ['sat_score', 'sat', 'SAT', 'satScore', 'SATScore'],
  neet_score: ['neet_score', 'neet', 'NEET', 'neetScore', 'NEETScore'],
  jee_score: ['jee_score', 'jee', 'JEE', 'jeeScore', 'JEEScore', 'jee_rank', 'jeeRank'],
  student_profile_score: [
    'student_profile_score',
    'profile_score',
    'profileScore',
    'studentScore',
    'student_score',
  ],
  course_interest: ['course_interest', 'courseInterest', 'course', 'Course'],
  preferred_country: [
    'preferred_country',
    'preferredCountry',
    'country',
    'Country',
  ],
  preferred_state: ['preferred_state', 'preferredState', 'state', 'State'],
  budget_range: ['budget_range', 'budgetRange', 'budget', 'Budget'],
  sop_strength: ['sop_strength', 'sopStrength', 'sop', 'SOP'],
  lor_strength: ['lor_strength', 'lorStrength', 'lor', 'LOR'],
  profile_rating: ['profile_rating', 'profileRating', 'rating', 'Rating'],
  target_college_rank: [
    'target_college_rank',
    'targetCollegeRank',
    'targetRank',
    'collegeRank',
    'college_rank',
    'target_rank',
  ],
  recommended_college: ['recommended_college', 'recommendedCollege', 'college'],
  recommended_course: ['recommended_course', 'recommendedCourse'],
};

// Build reverse lookup: lowercase alias → canonical name (built once at module load)
const reverseLookup = new Map<string, CanonicalField>();
for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
  for (const alias of aliases) {
    reverseLookup.set(alias.toLowerCase(), canonical as CanonicalField);
  }
}

export type RawRow = Record<string, string>;
export type MappedRow = Partial<Record<CanonicalField, string>>;

/**
 * Maps a raw CSV row to canonical field names.
 * Unknown columns are dropped.
 */
export function mapRow(rawRow: RawRow): MappedRow {
  const mapped: MappedRow = {};

  for (const [key, value] of Object.entries(rawRow)) {
    const canonical = reverseLookup.get(key.trim().toLowerCase());
    if (canonical) {
      mapped[canonical] = value;
    }
  }

  return mapped;
}

/**
 * Returns all canonical field names for display/debugging
 */
export function getCanonicalFields(): CanonicalField[] {
  return Object.keys(COLUMN_ALIASES) as CanonicalField[];
}
