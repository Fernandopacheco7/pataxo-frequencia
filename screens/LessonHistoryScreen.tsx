import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Lesson } from '../types';
import { getTodayDateString, formatDate, getInitials } from '../lib/utils';
import Icon from '../components/Icon';
import ConfirmationModal from '../components/ConfirmationModal';

// Modal component to show and edit lesson details
const LessonDetailsModal: React.FC<{
    lesson: Lesson;
    onClose: () => void;
}> = ({ lesson, onClose }) => {
    const { classes, getStudentsByClassId, getAttendanceForLesson, saveAttendance, students } = useAppData();
    
    const lessonClass = useMemo(() => classes.find(c => c.id === lesson.classId), [classes, lesson.classId]);
    const studentsForClass = useMemo(() => 
        lessonClass ? getStudentsByClassId(lessonClass.id).sort((a, b) => a.name.localeCompare(b.name)) : [],
    [lessonClass, getStudentsByClassId, students]);

    const [attendanceStatus, setAttendanceStatus] = useState<Record<string, boolean>>({});
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const existingAttendance = getAttendanceForLesson(lesson.id);
        const initialStatus: Record<string, boolean> = {};
        studentsForClass.forEach(student => {
            const record = existingAttendance.find(a => a.studentId === student.id);
            initialStatus[student.id] = record ? record.present : false;
        });
        setAttendanceStatus(initialStatus);
    }, [lesson.id, studentsForClass, getAttendanceForLesson]);

    const handleToggle = (studentId: string) => {
        setAttendanceStatus(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const handleSave = async () => {
        try {
            const newAttendance = Object.keys(attendanceStatus).map(studentId => ({
                studentId,
                present: attendanceStatus[studentId],
            }));
            await saveAttendance(lesson.id, newAttendance);
            setNotification('Presença atualizada com sucesso!');
            setTimeout(() => {
                setNotification('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Failed to update attendance:", error);
            setNotification('Erro ao atualizar presença.');
             setTimeout(() => {
                setNotification('');
            }, 3000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-brand-dark-3">
                    <h2 className="text-2xl font-bold text-white mb-1">Editar Presença da Aula</h2>
                    <p className="text-gray-400">{lessonClass?.name} - {formatDate(lesson.date)} às {lesson.time}</p>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {notification && (
                        <div className="bg-green-500 text-white p-2 rounded-md mb-4 text-center text-sm">
                            {notification}
                        </div>
                    )}
                    <ul className="space-y-3">
                        {studentsForClass.map(student => (
                            <li key={student.id} className="flex items-center justify-between bg-brand-dark-3 p-3 rounded-md">
                                <div className="flex items-center">
                                     {student.photoUrl ? (
                                        <img className="h-10 w-10 rounded-full object-cover mr-4" src={student.photoUrl} alt={student.name} />
                                    ) : (
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark mr-4">
                                            <span className="font-medium leading-none text-white">{getInitials(student.name)}</span>
                                        </span>
                                    )}
                                    <span className="text-gray-200">{student.name}</span>
                                </div>
                                <button
                                    onClick={() => handleToggle(student.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                        attendanceStatus[student.id] ? 'bg-green-500 text-white' : 'bg-brand-dark text-gray-300'
                                    }`}
                                >
                                    {attendanceStatus[student.id] ? 'Presente' : 'Ausente'}
                                </button>
                            </li>
                        ))}
                         {studentsForClass.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Nenhum aluno matriculado nesta turma.</p>
                        )}
                    </ul>
                </div>
                <div className="bg-brand-dark-3 p-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white hover:bg-brand-dark-2">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};


const LessonHistoryScreen: React.FC = () => {
    const { lessons, classes, getAttendanceForLesson, deleteLesson } = useAppData();
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [startDate, setStartDate] = useState(threeMonthsAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(getTodayDateString());
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c])), [classes]);

    const filteredLessons = useMemo(() => {
        return lessons
            .filter(lesson => 
                lesson.date >= startDate && 
                lesson.date <= endDate &&
                (selectedClassId === 'all' || lesson.classId === selectedClassId)
            )
            .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    }, [startDate, endDate, selectedClassId, lessons]);

    const handleConfirmDelete = async () => {
      if (lessonToDelete) {
        try {
            await deleteLesson(lessonToDelete.id);
        } catch (error) {
            console.error("Failed to delete lesson:", error);
            alert("Erro ao excluir aula.");
        } finally {
            setLessonToDelete(null);
        }
      }
    };

    return (
        <>
            <div className="bg-brand-dark-2 p-4 rounded-lg shadow-lg mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                    <label className="text-sm font-medium text-gray-300">Data Inicial</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                 <div className="flex-grow">
                    <label className="text-sm font-medium text-gray-300">Data Final</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div className="flex-grow">
                    <label className="text-sm font-medium text-gray-300">Turma</label>
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue">
                        <option value="all">Todas as Turmas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto bg-brand-dark-2 rounded-lg shadow-lg">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-dark-3">
                        <tr>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Turma</th>
                            <th scope="col" className="px-6 py-3 hidden md:table-cell">Professor</th>
                            <th scope="col" className="px-6 py-3 hidden sm:table-cell">Horário</th>
                            <th scope="col" className="px-6 py-3 text-center">Presença</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLessons.map(lesson => {
                            const lessonClass = classMap.get(lesson.classId);
                            const attendance = getAttendanceForLesson(lesson.id);
                            const presentCount = attendance.filter(a => a.present).length;
                            const totalCount = attendance.length;
                            
                            return (
                                <tr key={lesson.id} className="border-b border-brand-dark-3 hover:bg-brand-dark-3">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{formatDate(lesson.date)}</td>
                                    <td className="px-6 py-4">{lessonClass?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 hidden md:table-cell">{lessonClass?.professor || 'N/A'}</td>
                                    <td className="px-6 py-4 hidden sm:table-cell">{lesson.time}</td>
                                    <td className="px-6 py-4 text-center">
                                        {totalCount > 0 ? `${presentCount} / ${totalCount}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-4">
                                            <button onClick={() => setViewingLesson(lesson)} className="text-blue-400 hover:text-blue-300" title="Editar Presença">
                                                <Icon name="edit" className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => setLessonToDelete(lesson)} className="text-red-400 hover:text-red-300" title="Excluir Aula">
                                                <Icon name="trash" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredLessons.length === 0 && (
                    <div className="text-center p-8">
                        <Icon name="calendar" className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                        <p className="text-gray-400">Nenhuma aula encontrada para os filtros selecionados.</p>
                    </div>
                )}
            </div>

            {viewingLesson && <LessonDetailsModal lesson={viewingLesson} onClose={() => setViewingLesson(null)} />}
            
            <ConfirmationModal
                isOpen={!!lessonToDelete}
                onClose={() => setLessonToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão da Aula"
                message="Tem certeza que deseja excluir esta aula? Todos os registros de presença associados serão perdidos permanentemente."
                confirmText="Excluir"
            />
        </>
    );
};

export default LessonHistoryScreen;