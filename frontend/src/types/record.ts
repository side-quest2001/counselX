export interface StudentContextRecord {
  id: string;
  datasetId: string;
  studentProfileScore: number | null;
  satScore: number | null;
  neetScore: number | null;
  jeeScore: number | null;
  courseInterest: string | null;
  preferredCountry: string | null;
  preferredState: string | null;
  budgetRange: string | null;
  sopStrength: number | null;
  lorStrength: number | null;
  profileRating: number | null;
  targetCollegeRank: number | null;
  recommendedCollege: string | null;
  recommendedCourse: string | null;
  createdAt: string;
}

export interface RecordsResponse {
  data: StudentContextRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecordQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof StudentContextRecord;
  sortOrder?: 'asc' | 'desc';
}
