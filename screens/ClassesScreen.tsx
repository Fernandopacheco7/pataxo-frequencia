import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Class, Student } from '../types';
import Icon from '../components/Icon';
import ConfirmationModal from '../components/ConfirmationModal';

const ViewStudentsModal: React.FC<{ students: Student[], className: string, onClose: () => void }> = ({ students, className, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Alunos da Turma</h2>
                    <p className="text-brand-blue font-semibold mb-6">{className}</p>
                    <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {students.length > 0 ? students.map(s => (
                            <li key={s.id} className="bg-brand-dark-3 p-3 rounded-md text-gray-200">{s.name}</li>
                        )) : <p className="text-gray-400">Nenhum aluno matriculado nesta turma.</p>}
                    </ul>
                </div>
                <div className="bg-brand-dark-3 p-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const ClassFormModal: React.FC<{
  classData: Partial<Class> | null;
  onClose: () => void;
  onSave: (classData: Omit<Class, 'id'> | Class) => void;
}> = ({ classData, onClose, onSave }) => {
  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    professor: classData?.professor || '',
    time: classData?.time || '19:00-20:00',
    days: classData?.days || [],
  });

  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classData?.id) {
      onSave({ ...formData, id: classData.id });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">{classData?.id ? 'Editar Turma' : 'Adicionar Turma'}</h2>
            <div className="space-y-4">
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome da Turma" className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              <input type="text" value={formData.professor} onChange={e => setFormData({...formData, professor: e.target.value})} placeholder="Professor" className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} placeholder="Horário (ex: 19:00-20:00)" className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Dias da Semana</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center">
                      <input type="checkbox" id={`day-${day}`} checked={formData.days.includes(day)} onChange={() => handleDayChange(day)} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                      <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-300">{day}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-brand-dark-3 p-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white hover:bg-brand-dark-2">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ClassesScreen: React.FC = () => {
    const { classes, getStudentsByClassId, addClass, updateClass, deleteClass } = useAppData();
    const [viewingStudents, setViewingStudents] = useState<{classObj: Class, students: Student[]} | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);

    const handleViewStudents = (classObj: Class) => {
        const studentsInClass = getStudentsByClassId(classObj.id);
        setViewingStudents({ classObj, students: studentsInClass });
    };
    
    const handleSaveClass = async (classData: Omit<Class, 'id'> | Class) => {
        try {
            if ('id' in classData) {
                await updateClass(classData);
            } else {
                await addClass(classData);
            }
        } catch (error) {
            console.error("Failed to save class:", error);
            alert("Erro ao salvar turma.");
        } finally {
            setIsModalOpen(false);
            setEditingClass(null);
        }
    };

    const handleEdit = (classObj: Class) => {
        setEditingClass(classObj);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
      if (classToDelete) {
        try {
            await deleteClass(classToDelete.id);
        } catch (error) {
            console.error("Failed to delete class:", error);
            alert("Erro ao excluir turma.");
        } finally {
            setClassToDelete(null);
        }
      }
    };

    return (
        <>
            <div className="flex justify-end mb-6">
                <button onClick={handleAddNew} className="flex items-center justify-center px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Adicionar Turma
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(c => (
                    <div key={c.id} className="bg-brand-dark-2 rounded-lg shadow-lg p-6 flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-white">{c.name}</h2>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-white"><Icon name="edit" className="w-5 h-5"/></button>
                                    <button onClick={() => setClassToDelete(c)} className="text-gray-400 hover:text-white"><Icon name="trash" className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <p className="text-brand-blue font-semibold mb-4">{c.professor}</p>
                            <div className="text-gray-300 space-y-2">
                                <p><span className="font-semibold">Horário:</span> {c.time}</p>
                                <p><span className="font-semibold">Dias:</span> {c.days.join(', ')}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                             <button 
                                onClick={() => handleViewStudents(c)}
                                className="w-full text-center px-4 py-2 rounded-md bg-brand-dark-3 text-white hover:bg-brand-dark-3/80 transition duration-200"
                            >
                                Ver Alunos
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {viewingStudents && (
                <ViewStudentsModal 
                    students={viewingStudents.students}
                    className={viewingStudents.classObj.name}
                    onClose={() => setViewingStudents(null)}
                />
            )}
            {isModalOpen && <ClassFormModal classData={editingClass} onClose={() => setIsModalOpen(false)} onSave={handleSaveClass} />}

            <ConfirmationModal
                isOpen={!!classToDelete}
                onClose={() => setClassToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Turma"
                message={
                    <>
                        <p>Tem certeza que deseja excluir a turma <strong>{classToDelete?.name}</strong>?</p>
                        <p className="mt-2 text-sm">A matrícula dos alunos nesta turma será removida, mas os alunos não serão excluídos.</p>
                    </>
                }
                confirmText="Excluir"
            />
        </>
    );
};

export default ClassesScreen;