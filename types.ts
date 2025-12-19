
export type Level = '100L' | '200L' | '300L' | '400L' | '500L';

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  level: Level;
  department: string;
  description: string;
}

export interface StudyMaterial {
  id: string;
  courseCode: string;
  title: string;
  type: 'PDF' | 'Video' | 'Notes';
  url: string;
}

export interface PastQuestion {
  id: string;
  courseCode: string;
  year: number;
  semester: 'First' | 'Second';
  url: string;
}

export interface SessionContext {
  department?: string;
  level?: Level;
  lastCourseCode?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // To hold results like list of courses
  intent?: Intent;
}

export enum Intent {
  COURSE_INFO = 'COURSE_INFO',
  MATERIAL_SEARCH = 'MATERIAL_SEARCH',
  PAST_QUESTIONS = 'PAST_QUESTIONS',
  STUDY_ADVICE = 'STUDY_ADVICE',
  GENERAL_CHAT = 'GENERAL_CHAT',
  SET_CONTEXT = 'SET_CONTEXT'
}

export interface AIResponse {
  answer: string;
  intent: Intent;
  parameters: {
    department?: string;
    level?: string;
    courseCode?: string;
  };
}
