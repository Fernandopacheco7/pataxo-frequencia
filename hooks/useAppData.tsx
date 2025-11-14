import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Class, Lesson, Attendance, Belt } from '../types';

// --- STATE ---

interface AppState {
  students: Student[];
  classes: Class[];
  lessons: Lesson[];
  attendance: Attendance[];
  belts: Belt[];
  loading: boolean;
}

// --- CONTEXT ---

interface AppDataContextType extends AppState {
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  getStudentsByClassId: (classId: string) => Student[];
  getAttendanceForLesson: (lessonId: string) => Attendance[];
  saveAttendance: (lessonId: string, newAttendance: { studentId: string, present: boolean }[]) => Promise<void>;
  addClass: (classData: Omit<Class, 'id'>) => Promise<void>;
  updateClass: (updatedClass: Class) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  addBelt: (beltData: Omit<Belt, 'id'>) => Promise<void>;
  updateBelt: (updatedBelt: Belt) => Promise<void>;
  deleteBelt: (beltId: string) => Promise<void>;
  addLesson: (classId: string, date: string) => Promise<Lesson | undefined>;
  deleteLesson: (lessonId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Define collection references
const studentsCollection = collection(db, 'students');
const classesCollection = collection(db, 'classes');
const lessonsCollection = collection(db, 'lessons');
const attendanceCollection = collection(db, 'attendance');
const beltsCollection = collection(db, 'belts');

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    students: [],
    classes: [],
    lessons: [],
    attendance: [],
    belts: [],
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsSnap, classesSnap, lessonsSnap, attendanceSnap, beltsSnap] = await Promise.all([
          getDocs(studentsCollection),
          getDocs(classesCollection),
          getDocs(lessonsCollection),
          getDocs(attendanceCollection),
          getDocs(beltsCollection),
        ]);
        
        const students = studentsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Student[];
        const classes = classesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Class[];
        const lessons = lessonsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Lesson[];
        // For attendance, we don't really need the Firestore document ID in the app state
        const attendance = attendanceSnap.docs.map(doc => doc.data()) as Attendance[];
        const belts = beltsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Belt[];

        setState({ students, classes, lessons, attendance, belts, loading: false });
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        alert("Não foi possível carregar os dados. Verifique sua configuração do Firebase e a conexão com a internet.");
        setState(s => ({...s, loading: false}));
      }
    };
    fetchData();
  }, []);

  // --- CRUD Functions ---

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const docRef = await addDoc(studentsCollection, studentData);
    const newStudent = { ...studentData, id: docRef.id };
    setState(s => ({ ...s, students: [...s.students, newStudent] }));
  };
  
  const updateStudent = async (updatedStudent: Student) => {
    const { id, ...studentData } = updatedStudent;
    await updateDoc(doc(db, 'students', id), studentData);
    setState(s => ({ ...s, students: s.students.map(stud => stud.id === id ? updatedStudent : stud) }));
  };
  
  const deleteStudent = async (studentId: string) => {
    await deleteDoc(doc(db, 'students', studentId));
    
    // Also delete their attendance records
    const q = query(attendanceCollection, where('studentId', '==', studentId));
    const attendanceSnap = await getDocs(q);
    const batch = writeBatch(db);
    attendanceSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    setState(s => ({ 
        ...s, 
        students: s.students.filter(stud => stud.id !== studentId),
        attendance: s.attendance.filter(a => a.studentId !== studentId),
    }));
  };

  const addClass = async (classData: Omit<Class, 'id'>) => {
    const docRef = await addDoc(classesCollection, classData);
    const newClass = { ...classData, id: docRef.id };
    setState(s => ({ ...s, classes: [...s.classes, newClass] }));
  };

  const updateClass = async (updatedClass: Class) => {
    const { id, ...classData } = updatedClass;
    await updateDoc(doc(db, 'classes', id), classData);
    setState(s => ({ ...s, classes: s.classes.map(c => c.id === id ? updatedClass : c) }));
  };

  const deleteClass = async (classId: string) => {
    await deleteDoc(doc(db, 'classes', classId));
    
    // Remove classId from students who are in this class
    const studentsToUpdate = state.students.filter(s => s.classIds.includes(classId));
    const batch = writeBatch(db);
    studentsToUpdate.forEach(student => {
        const newClassIds = student.classIds.filter(id => id !== classId);
        const studentRef = doc(db, 'students', student.id);
        batch.update(studentRef, { classIds: newClassIds });
    });
    await batch.commit();

    setState(s => ({ 
        ...s, 
        classes: s.classes.filter(c => c.id !== classId),
        students: s.students.map(stud => stud.classIds.includes(classId) ? {...stud, classIds: stud.classIds.filter(id => id !== classId)} : stud)
    }));
  };
  
  const addBelt = async (beltData: Omit<Belt, 'id'>) => {
    const docRef = await addDoc(beltsCollection, beltData);
    const newBelt = { ...beltData, id: docRef.id };
    setState(s => ({...s, belts: [...s.belts, newBelt]}));
  };

  const updateBelt = async (updatedBelt: Belt) => {
    const { id, ...beltData } = updatedBelt;
    await updateDoc(doc(db, 'belts', id), beltData);
    setState(s => ({...s, belts: s.belts.map(b => b.id === id ? updatedBelt : b)}));
  };
  
  const deleteBelt = async (beltId: string) => {
    await deleteDoc(doc(db, 'belts', beltId));
    setState(s => ({...s, belts: s.belts.filter(b => b.id !== beltId)}));
  };

  const addLesson = async (classId: string, date: string): Promise<Lesson | undefined> => {
    const classInfo = state.classes.find(c => c.id === classId);
    if (!classInfo) {
      console.error("Class not found");
      return undefined;
    }
    const newLessonData: Omit<Lesson, 'id'> = {
      classId,
      date,
      time: classInfo.time,
    };
    const docRef = await addDoc(lessonsCollection, newLessonData);
    const newLesson = { ...newLessonData, id: docRef.id };
    setState(s => ({...s, lessons: [...s.lessons, newLesson]}));
    return newLesson;
  };

  const deleteLesson = async (lessonId: string) => {
    await deleteDoc(doc(db, 'lessons', lessonId));
    
    const q = query(attendanceCollection, where('lessonId', '==', lessonId));
    const attendanceSnap = await getDocs(q);
    const batch = writeBatch(db);
    attendanceSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    setState(s => ({
        ...s,
        lessons: s.lessons.filter(l => l.id !== lessonId),
        attendance: s.attendance.filter(a => a.lessonId !== lessonId),
    }));
  };

  const saveAttendance = async (lessonId: string, newAttendance: { studentId: string, present: boolean }[]) => {
    const batch = writeBatch(db);

    const q = query(attendanceCollection, where('lessonId', '==', lessonId));
    const oldAttendanceSnap = await getDocs(q);
    oldAttendanceSnap.forEach(doc => batch.delete(doc.ref));

    newAttendance.forEach(att => {
        const newAttRef = doc(collection(db, 'attendance'));
        batch.set(newAttRef, { ...att, lessonId });
    });

    await batch.commit();
    
    const otherLessonsAttendance = state.attendance.filter(a => a.lessonId !== lessonId);
    const updatedLessonAttendance: Attendance[] = newAttendance.map(a => ({ ...a, lessonId }));
    setState(s => ({ ...s, attendance: [...otherLessonsAttendance, ...updatedLessonAttendance] }));
  };
  
  const getStudentsByClassId = (classId: string): Student[] => {
    return state.students.filter(student => student.classIds.includes(classId) && student.isActive);
  };

  const getAttendanceForLesson = (lessonId: string): Attendance[] => {
    return state.attendance.filter(a => a.lessonId === lessonId);
  };

  const value = {
    ...state,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClassId,
    getAttendanceForLesson,
    saveAttendance,
    addClass,
    updateClass,
    deleteClass,
    addBelt,
    updateBelt,
    deleteBelt,
    addLesson,
    deleteLesson,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};