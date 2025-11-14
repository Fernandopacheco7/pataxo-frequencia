import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Student, Lesson } from '../types';
import { getTodayDateString, formatDate, getInitials } from '../lib/utils';
import Icon from '../components/Icon';

const AttendanceScreen: React.FC = () => {
    // FIX: Destructured 'students' from useAppData to make it available for the useMemo dependency array below.
    const { students, classes, lessons, getStudentsByClassId, getAttendanceForLesson, saveAttendance, addLesson } = useAppData();
    
    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
    const [attendanceStatus, setAttendanceStatus] = useState<Record<string, boolean>>({});
    const [notification, setNotification] = useState<string>('');
    
    const relevantLessons = useMemo(() => 
        lessons.filter(l => l.classId === selectedClassId).sort((a,b) => b.date.localeCompare(a.date)), 
    [lessons, selectedClassId]);

    const selectedLesson = useMemo(() => 
        relevantLessons.find(l => l.date === selectedDate),
    [relevantLessons, selectedDate]);
    
    const studentsInClass = useMemo(() => 
        selectedClassId ? getStudentsByClassId(selectedClassId).sort((a, b) => a.name.localeCompare(b.name)) : [], 
    [selectedClassId, getStudentsByClassId, students]); // depends on students as well

    useEffect(() => {
        if (selectedClassId && classes.length > 0 && !classes.find(c => c.id === selectedClassId)) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    useEffect(() => {
        if (selectedLesson) {
            const existingAttendance = getAttendanceForLesson(selectedLesson.id);
            const status: Record<string, boolean> = {};
            studentsInClass.forEach(student => {
                const record = existingAttendance.find(a => a.studentId === student.id);
                status[student.id] = record ? record.present : false; // Default to absent if no record
            });
            setAttendanceStatus(status);
        } else {
            const status: Record<string, boolean> = {};
            studentsInClass.forEach(student => {
                 status[student.id] = false;
            });
            setAttendanceStatus(status);
        }
    }, [selectedLesson, studentsInClass, getAttendanceForLesson]);

    const handleToggle = (studentId: string) => {
        setAttendanceStatus(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const handleSave = async () => {
        if (!selectedLesson) {
            setNotification('Nenhuma aula encontrada para esta data. Crie uma aula antes de salvar.');
            setTimeout(() => setNotification(''), 3000);
            return;
        }
        try {
            const newAttendance = Object.keys(attendanceStatus).map((studentId) => ({ studentId, present: attendanceStatus[studentId] }));
            await saveAttendance(selectedLesson.id, newAttendance);
            setNotification('Presença salva com sucesso!');
        } catch(error) {
            console.error("Failed to save attendance:", error);
            setNotification('Erro ao salvar presença.');
        } finally {
             setTimeout(() => setNotification(''), 3000);
        }
    };
    
    const handleMarkAll = (present: boolean) => {
        const newStatus: Record<string, boolean> = {};
        studentsInClass.forEach(student => {
            newStatus[student.id] = present;
        });
        setAttendanceStatus(newStatus);
    };

    const handleCreateLesson = async () => {
        if (selectedClassId && selectedDate) {
            try {
                await addLesson(selectedClassId, selectedDate);
                setNotification('Aula criada com sucesso! Já pode registrar a presença.');
            } catch(error) {
                 console.error("Failed to create lesson:", error);
                 setNotification('Erro ao criar aula.');
            } finally {
                setTimeout(() => setNotification(''), 3000);
            }
        }
    };

    return (
        <div>
            {notification && (
                <div className="bg-green-500 text-white p-3 rounded-md mb-4 text-center transition-opacity duration-300">
                    {notification}
                </div>
            )}
            <div className="bg-brand-dark-2 p-4 rounded-lg shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="class-select" className="text-sm font-medium text-gray-300">Turma</label>
                    <select
                        id="class-select"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="date-select" className="text-sm font-medium text-gray-300">Data da Aula</label>
                    <input
                        type="date"
                        id="date-select"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
            </div>

            {selectedLesson ? (
                <div className="bg-brand-dark-2 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Lista de Chamada - {formatDate(selectedDate)}</h2>
                        <div className="flex gap-2">
                            <button onClick={() => handleMarkAll(true)} className="text-xs px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white">Marcar Todos</button>
                            <button onClick={() => handleMarkAll(false)} className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Desmarcar Todos</button>
                        </div>
                    </div>
                    <ul className="space-y-3">
                        {studentsInClass.map(student => (
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
                                <button onClick={() => handleToggle(student.id)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${attendanceStatus[student.id] ? 'bg-green-500 text-white' : 'bg-brand-dark text-gray-300'}`}>
                                    {attendanceStatus[student.id] ? 'Presente' : 'Ausente'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 text-right">
                        <button onClick={handleSave} className="px-6 py-2 rounded-md bg-brand-blue text-white font-bold hover:bg-blue-600">
                            Salvar Presença
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-brand-dark-2 p-8 rounded-lg shadow-lg">
                    <Icon name="calendar" className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhuma aula encontrada</h3>
                    <p className="text-gray-400 mb-6">Não há uma aula registrada para a turma e data selecionadas.</p>
                    <button
                        onClick={handleCreateLesson}
                        className="flex items-center justify-center mx-auto px-6 py-3 rounded-md bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Criar Aula para esta data
                    </button>
                </div>
            )}
        </div>
    );
};

export default AttendanceScreen;