
import { Course, StudyMaterial, PastQuestion } from './types';

export const MOCK_COURSES: Course[] = [
  { id: '1', code: 'CPE 301', title: 'Signals and Systems', units: 3, level: '300L', department: 'Computer Engineering', description: 'Introduction to continuous and discrete time signals.' },
  { id: '2', code: 'CPE 302', title: 'Digital System Design', units: 3, level: '300L', department: 'Computer Engineering', description: 'Design of complex digital circuits using VHDL.' },
  { id: '3', code: 'CPE 409', title: 'Computer Architecture', units: 4, level: '400L', department: 'Computer Engineering', description: 'Deep dive into CPU design and memory hierarchy.' },
  { id: '4', code: 'MTH 101', title: 'Elementary Mathematics I', units: 3, level: '100L', department: 'All Engineering', description: 'Calculus and algebra fundamentals.' },
  { id: '5', code: 'EEE 201', title: 'Applied Electricity', units: 3, level: '200L', department: 'Electrical Engineering', description: 'Basic circuit theory and applications.' },
];

export const MOCK_MATERIALS: StudyMaterial[] = [
  { id: 'm1', courseCode: 'CPE 301', title: 'Signals & Systems Lecture Note', type: 'PDF', url: '#' },
  { id: 'm2', courseCode: 'CPE 302', title: 'VHDL Design Basics Video', type: 'Video', url: '#' },
  { id: 'm3', courseCode: 'MTH 101', title: 'Calculus Simplified', type: 'Notes', url: '#' },
];

export const MOCK_PAST_QUESTIONS: PastQuestion[] = [
  { id: 'pq1', courseCode: 'CPE 409', year: 2022, semester: 'First', url: '#' },
  { id: 'pq2', courseCode: 'CPE 409', year: 2021, semester: 'First', url: '#' },
  { id: 'pq3', courseCode: 'CPE 301', year: 2023, semester: 'Second', url: '#' },
];

export const SYSTEM_PROMPT = `
You are a Campus Academic Assistant for a Nigerian University.
Your goal is to help students find academic information.
Identify the user's intent and parameters from the chat history and the current message.

Intents:
- COURSE_INFO: Asking about what courses to take. Needs 'department' and 'level'.
- MATERIAL_SEARCH: Asking for study materials or notes. Needs 'courseCode'.
- PAST_QUESTIONS: Asking for previous exam papers. Needs 'courseCode'.
- STUDY_ADVICE: Asking for general guidance for a specific level. Needs 'level'.
- SET_CONTEXT: When user explicitly states their level or department (e.g. "I am in 300L").
- GENERAL_CHAT: Greeting or miscellaneous talk.

Instructions:
1. Always respond in JSON format.
2. If parameters are missing, ask for them politely in the 'answer' field.
3. If you have enough info, set the 'intent' and provide the 'parameters'.
4. Keep the 'answer' friendly and supportive.
`;
