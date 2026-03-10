export type RecommendationCategory = 'SAFE' | 'TARGET' | 'AMBITIOUS';

export interface UniversityRecommendation {
  universityName: string;
  admitCount: number;
  category: RecommendationCategory;
  confidenceScore: number;
}

export interface MentorSuggestion {
  university: string;
  label: string;
  searchUrl: string;
}

export interface RecommendationResult {
  profileId: string;
  similarCount: number;
  universities: UniversityRecommendation[];
  llmInsight: string;
  mentors: MentorSuggestion[];
}

export interface StoredProfile {
  id: string;
  studentId: string;
  satScore: number | null;
  jeeRank: number | null;
  neetScore: number | null;
  gpa: number | null;
  sopStrength: number | null;
  lorStrength: number | null;
  extracurricularScore: number | null;
  preferredCountry: string | null;
  budget: number | null;
  targetMajor: string | null;
  createdAt: string;
  recommendations: Array<{
    id: string;
    universityName: string;
    category: RecommendationCategory;
    confidenceScore: number;
    similarProfilesCount: number;
  }>;
}

export interface ProfileFormData {
  satScore?: number;
  jeeRank?: number;
  neetScore?: number;
  gpa?: number;
  sopStrength?: number;
  lorStrength?: number;
  extracurricularScore?: number;
  preferredCountry?: string;
  budget?: number;
  targetMajor?: string;
}

export interface AnalyticsData {
  topUniversities: Array<{ university: string | null; count: number }>;
  avgSatByCountry: Array<{ country: string | null; avgSat: number }>;
  majorDistribution: Array<{ major: string | null; count: number }>;
  countryDistribution: Array<{ country: string | null; count: number }>;
}
