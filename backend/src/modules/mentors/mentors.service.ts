import { env } from '../../config/env';

interface UniversityEntry {
  universityName: string;
}

export interface MentorSuggestion {
  university: string;
  label: string;
  searchUrl: string;
}

export class MentorsService {
  buildMentorLinks(
    universities: UniversityEntry[],
    major?: string
  ): MentorSuggestion[] {
    return universities.map((u) => {
      const query = major
        ? `${u.universityName} ${major}`
        : u.universityName;

      const encoded = encodeURIComponent(query);
      const base = env.TOPMATE_SEARCH_BASE.endsWith('=')
        ? env.TOPMATE_SEARCH_BASE
        : `${env.TOPMATE_SEARCH_BASE}=`;

      return {
        university: u.universityName,
        label: major
          ? `${u.universityName} ${major} mentors`
          : `${u.universityName} alumni`,
        searchUrl: `${base}${encoded}`,
      };
    });
  }
}

export const mentorsService = new MentorsService();
