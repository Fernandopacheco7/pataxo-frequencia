
export interface Belt {
  id: string;
  name: string;
  colorClass: string;
}

export interface Student {
  id: string;
  name: string;
  nickname?: string;
  beltId: string;
  birthDate?: string;
  phone: string;
  email?: string;
  startDate: string; // YYYY-MM-DD
  isActive: boolean;
  classIds: string[];
  photoUrl?: string;
}

export interface Class {
  id: string;
  name: string;
  days: string[];
  time: string;
  professor: string;
}

export interface Lesson {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  time: string;
  notes?: string;
}

export interface Attendance {
  lessonId: string;
  studentId: string;
  present: boolean;
}

export type Page = 'dashboard' | 'students' | 'classes' | 'belts' | 'attendance' | 'reports' | 'lessonHistory';