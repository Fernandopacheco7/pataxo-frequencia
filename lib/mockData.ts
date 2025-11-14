
import { Student, Class, Lesson, Attendance, Belt } from '../types';

export const initialBelts: Belt[] = [
  { id: 'b1', name: 'Branca', colorClass: 'bg-white text-black' },
  { id: 'b2', name: 'Azul', colorClass: 'bg-blue-600 text-white' },
  { id: 'b3', name: 'Roxa', colorClass: 'bg-purple-600 text-white' },
  { id: 'b4', name: 'Marrom', colorClass: 'bg-amber-800 text-white' },
  { id: 'b5', name: 'Preta', colorClass: 'bg-black text-white border border-red-500' },
  { id: 'b6', name: 'Vermelha', colorClass: 'bg-red-700 text-white' },
];

export const initialStudents: Student[] = [
  { id: 's1', name: 'João Silva', nickname: 'Jão', beltId: 'b3', startDate: '2020-01-15', isActive: true, classIds: ['c1', 'c2'], phone: '11987654321', photoUrl: 'https://placehold.co/100x100/4A5568/FFFFFF?text=JS' },
  { id: 's2', name: 'Maria Oliveira', beltId: 'b2', startDate: '2021-03-20', isActive: true, classIds: ['c1'], phone: '11987654322', email: 'maria@email.com', photoUrl: 'https://placehold.co/100x100/4A5568/FFFFFF?text=MO' },
  { id: 's3', name: 'Carlos Pereira', beltId: 'b1', startDate: '2023-08-01', isActive: true, classIds: ['c1'], phone: '11987654323', photoUrl: 'https://placehold.co/100x100/4A5568/FFFFFF?text=CP' },
  { id: 's4', name: 'Ana Souza', beltId: 'b5', startDate: '2015-05-10', isActive: true, classIds: ['c2', 'c3'], phone: '11987654324', photoUrl: 'https://placehold.co/100x100/4A5568/FFFFFF?text=AS' },
  { id: 's5', name: 'Lucas Costa', beltId: 'b4', startDate: '2018-11-22', isActive: true, classIds: ['c2'], phone: '11987654325' },
  { id: 's6', name: 'Pedro Junior', nickname: 'Pedrinho', beltId: 'b1', startDate: '2023-09-10', isActive: true, classIds: ['c3'], phone: '11987654326', birthDate: '2013-04-15', photoUrl: 'https://placehold.co/100x100/4A5568/FFFFFF?text=PJ' },
  { id: 's7', name: 'Sofia Lima', beltId: 'b1', startDate: '2023-09-12', isActive: true, classIds: ['c3'], phone: '11987654327', birthDate: '2014-07-20' },
  { id: 's8', name: 'Ricardo Almeida', beltId: 'b2', startDate: '2022-02-18', isActive: false, classIds: ['c1'], phone: '11987654328' },
];

export const initialClasses: Class[] = [
  { id: 'c1', name: 'Iniciante', days: ['Segunda', 'Quarta', 'Sexta'], time: '19:00-20:00', professor: 'Mestre Helio' },
  { id: 'c2', name: 'Avançado', days: ['Terça', 'Quinta'], time: '20:30-22:00', professor: 'Mestre Rickson' },
  { id: 'c3', name: 'Kids', days: ['Terça', 'Quinta'], time: '17:00-18:00', professor: 'Professor Carlos' },
];

// Generate some lessons for the last month
const generateLessons = (): Lesson[] => {
    const lessons: Lesson[] = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...

        const dateString = date.toISOString().split('T')[0];

        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Mon, Wed, Fri
            lessons.push({ id: `l${lessons.length + 1}`, classId: 'c1', date: dateString, time: '19:00-20:00' });
        }
        if (dayOfWeek === 2 || dayOfWeek === 4) { // Tue, Thu
            lessons.push({ id: `l${lessons.length + 1}`, classId: 'c2', date: dateString, time: '20:30-22:00' });
            lessons.push({ id: `l${lessons.length + 1}`, classId: 'c3', date: dateString, time: '17:00-18:00' });
        }
    }
    return lessons;
};

export const initialLessons: Lesson[] = generateLessons();

// Generate some random attendance data
const generateAttendance = (): Attendance[] => {
    const attendance: Attendance[] = [];
    const activeStudents = initialStudents.filter(s => s.isActive);

    initialLessons.forEach(lesson => {
        const classStudents = activeStudents.filter(s => s.classIds.includes(lesson.classId));
        classStudents.forEach(student => {
            attendance.push({
                lessonId: lesson.id,
                studentId: student.id,
                present: Math.random() > 0.2 // 80% chance of being present
            });
        });
    });

    return attendance;
};

export const initialAttendance: Attendance[] = generateAttendance();
