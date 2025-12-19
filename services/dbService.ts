
import { MOCK_COURSES, MOCK_MATERIALS, MOCK_PAST_QUESTIONS } from '../constants';
import { Course, StudyMaterial, PastQuestion, Level } from '../types';

/**
 * Simulates a delay for database fetching.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  async getCourses(department?: string, level?: Level): Promise<Course[]> {
    await delay(600);
    return MOCK_COURSES.filter(c => 
      (!department || c.department.toLowerCase().includes(department.toLowerCase())) &&
      (!level || c.level === level)
    );
  },

  async getMaterials(courseCode: string): Promise<StudyMaterial[]> {
    await delay(500);
    return MOCK_MATERIALS.filter(m => m.courseCode.toUpperCase() === courseCode.toUpperCase());
  },

  async getPastQuestions(courseCode: string): Promise<PastQuestion[]> {
    await delay(500);
    return MOCK_PAST_QUESTIONS.filter(pq => pq.courseCode.toUpperCase() === courseCode.toUpperCase());
  },

  async getStudyAdvice(level: Level): Promise<string> {
    await delay(400);
    const adviceMap: Record<Level, string> = {
      '100L': 'Welcome to University life! Focus on building a strong foundation in Mathematics and General Studies. Join a study group early.',
      '200L': 'This is the foundation year for your core engineering courses. Don\'t lag behind in Laboratory work.',
      '300L': 'The workload increases here. Focus on mastering professional software and hardware tools related to your major.',
      '400L': 'Industrial Training (IT) year! Start looking for placement early. Balance your academics with practical experience.',
      '500L': 'Final lap! Your Project is paramount. Manage your time strictly between seminars and core specialized courses.'
    };
    return adviceMap[level] || "Stay focused on your studies and ask for help when needed.";
  }
};
