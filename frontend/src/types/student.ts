export interface Student {
  id: string;
  email: string;
  name: string;
  country: string | null;
  createdAt: string;
}

export interface StudentSignupPayload {
  email: string;
  name: string;
  password: string;
  country?: string;
}

export interface StudentLoginPayload {
  email: string;
  password: string;
}

export interface StudentAuthResponse {
  success: boolean;
  token: string;
  student: Student;
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
