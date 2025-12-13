import { CaseJuror } from "@/types/court-room";
import { Question } from "@/types/questions";

export const dummyJurors: CaseJuror[] = [
  {
    id: '1',
    jurorNumber: 'J-001',
    name: 'John Anderson',
    age: 45,
    gender: 'Male',
    race: 'Caucasian',
    occupation: 'Software Engineer',
    status: 'active',
    panelPosition: 1,
    createdAt: '2025-10-01T10:00:00Z', // Added
    updatedAt: '2025-10-01T10:00:00Z'  // Added
  },
  {
    id: '2',
    jurorNumber: 'J-002',
    name: 'Sarah Williams',
    age: 38,
    gender: 'Female',
    race: 'African American',
    occupation: 'Teacher',
    status: 'active',
    panelPosition: 2,
    createdAt: '2025-10-01T10:05:00Z', // Added
    updatedAt: '2025-10-02T11:20:00Z'  // Added
  },
  {
    id: '3',
    jurorNumber: 'J-003',
    name: 'Michael Chen',
    age: 52,
    gender: 'Male',
    race: 'Asian',
    occupation: 'Accountant',
    status: 'active',
    panelPosition: null,
    createdAt: '2025-10-02T14:30:00Z', // Added
    updatedAt: '2025-10-02T14:30:00Z'  // Added
  },
  {
    id: '4',
    jurorNumber: 'J-004',
    name: 'Emily Rodriguez',
    age: 29,
    gender: 'Female',
    race: 'Hispanic',
    occupation: 'Nurse',
    status: 'active',
    panelPosition: 3,
    createdAt: '2025-10-03T09:15:00Z', // Added
    updatedAt: '2025-10-03T09:15:00Z'  // Added
  },
  {
    id: '5',
    jurorNumber: 'J-005',
    name: 'David Thompson',
    age: 61,
    gender: 'Male',
    race: 'Caucasian',
    occupation: 'Retired Police Officer',
    status: 'active',
    panelPosition: null,
    createdAt: '2025-10-03T16:45:00Z', // Added
    updatedAt: '2025-10-04T08:00:00Z'  // Added
  }
];

export const dummyQuestions: Question[] = [
  {
    id: 'q1',
    question: 'Have you or any member of your immediate family ever been involved in a lawsuit?',
    tags: ['Bias', 'Experience', 'Lawsuit'],
    percentage: 85,
    questionType: 'YES_NO'
  },
  {
    id: 'q2',
    question: 'Do you have any personal beliefs or experiences that would make it difficult for you to be impartial in this case?',
    tags: ['Impartiality', 'Beliefs', 'Bias'],
    percentage: 95,
    questionType: 'TEXT' // Requires explanation if YES/concern
  },
  {
    id: 'q3',
    question: 'Have you or anyone close to you ever worked in law enforcement or the legal profession?',
    tags: ['Profession', 'Authority', 'Experience'],
    percentage: 70,
    questionType: 'YES_NO'
  },
  {
    id: 'q4',
    question: 'Based on what you know about this case so far, do you have any preconceived notions about the defendant\'s guilt or innocence?',
    tags: ['Prejudice', 'Guilt', 'Innocence'],
    percentage: 90,
    questionType: 'YES_NO'
  },
  {
    id: 'q5',
    question: 'Are you willing and able to follow the judge\'s instructions on the law, even if you personally disagree with them?',
    tags: ['Obedience', 'Law', 'Impartiality'],
    percentage: 98,
    questionType: 'YES_NO'
  }
];