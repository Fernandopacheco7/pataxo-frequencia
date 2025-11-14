import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Student, Class, Belt } from '../types';
import Icon from '../components/Icon';
import { formatDate, getInitials } from '../lib/utils';
import ConfirmationModal from '../components/ConfirmationModal';

const StudentFormModal: React.FC<{
  student: Partial<Student> | null;
  onClose: () => void;
  onSave: (student: any) => void;
  classes: Class[];
  belts: Belt[];
}> = ({ student, onClose, onSave, classes, belts }) => {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        nickname: student?.nickname || '',
        beltId: student?.beltId || belts[0]?.id || '',
        phone: student?.phone || '',
        email: student?.email || '',
        startDate: student?.startDate || new Date().toISOString().split('T')[0],
        birthDate: student?.birthDate || '',
        isActive: student?.isActive === undefined ? true : student.isActive,
        classIds: student?.classIds || [],
        photoUrl: student?.photoUrl || ''
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(student?.photoUrl || null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setFormData(prev => ({...prev, photoUrl: result}));
            }
            reader.readAsDataURL(file);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newClassIds = checked 
                ? [...prev.classIds, value]
                : prev.classIds.filter(id => id !== value);
            return { ...prev, classIds: newClassIds };
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: student?.id, ...formData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">{student?.id ? 'Editar Aluno' : 'Adicionar Aluno'}</h2>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-4" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-brand-dark-3 flex items-center justify-center mb-4">
                                        <span className="text-3xl text-gray-400">{getInitials(formData.name)}</span>
                                    </div>
                                )}
                                <label htmlFor="photo-upload" className="cursor-pointer bg-brand-blue text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">
                                    Escolher Foto
                                </label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </div>

                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo" className="bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                                <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Apelido" className="bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                                <select name="beltId" value={formData.beltId} onChange={handleChange} className="bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue">
                                    {belts.map(belt => <option key={belt.id} value={belt.id}>{belt.name}</option>)}
                                </select>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone" className="bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="md:col-span-2 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                                <div>
                                    <label className="text-sm text-gray-400">Data de Início</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Data de Nascimento</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                                </div>
                                 <div className="flex items-center mt-2 md:col-span-2">
                                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Ativo</label>
                                </div>
                                <div className="mt-4 md:col-span-2">
                                    <h3 className="text-lg font-semibold text-white mb-2">Turmas</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {classes.map(c => (
                                            <div key={c.id} className="flex items-center">
                                                <input type="checkbox" id={`class-${c.id}`} value={c.id} checked={formData.classIds.includes(c.id)} onChange={handleClassChange} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                                                <label htmlFor={`class-${c.id}`} className="ml-2 block text-sm text-gray-300">{c.name}</label>
                                            </div>
                                        ))}
                                    </div>
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

const StudentsScreen: React.FC = () => {
  const { students, classes, belts, addStudent, updateStudent, deleteStudent } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBeltId, setFilterBeltId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const beltMap = useMemo(() => new Map(belts.map(b => [b.id, b])), [belts]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => 
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nickname?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterBeltId === 'all' || student.beltId === filterBeltId)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchTerm, filterBeltId]);

  const handleSaveStudent = async (studentData: Student) => {
    try {
      if (studentData.id) {
          await updateStudent(studentData);
      } else {
          await addStudent(studentData);
      }
    } catch (error) {
        console.error("Failed to save student:", error);
        alert("Erro ao salvar aluno.");
    } finally {
      setIsModalOpen(false);
      setEditingStudent(null);
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  }
  
  const handleAddNew = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete.id);
      } catch (error) {
        console.error("Failed to delete student:", error);
        alert("Erro ao excluir aluno.");
      } finally {
        setStudentToDelete(null);
      }
    }
  };

  const Avatar: React.FC<{ student: Student }> = ({ student }) => {
    return (
        <div className="flex-shrink-0">
            {student.photoUrl ? (
                <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt={student.name} />
            ) : (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark-3">
                    <span className="font-medium leading-none text-white">{getInitials(student.name)}</span>
                </span>
            )}
        </div>
    );
  };

  return (
    <>
      <div className="bg-brand-dark-2 p-4 rounded-lg shadow-lg mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou apelido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-dark-3 p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <select
          value={filterBeltId}
          onChange={(e) => setFilterBeltId(e.target.value)}
          className="bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="all">Todas as Faixas</option>
          {belts.map(belt => <option key={belt.id} value={belt.id}>{belt.name}</option>)}
        </select>
        <button onClick={handleAddNew} className="flex items-center justify-center px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Adicionar Aluno
        </button>
      </div>
      
      <div className="overflow-x-auto bg-brand-dark-2 rounded-lg shadow-lg">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-brand-dark-3">
            <tr>
              <th scope="col" className="px-6 py-3 w-12">Foto</th>
              <th scope="col" className="px-6 py-3">Nome</th>
              <th scope="col" className="px-6 py-3">Faixa</th>
              <th scope="col" className="px-6 py-3 hidden md:table-cell">Telefone</th>
              <th scope="col" className="px-6 py-3 hidden lg:table-cell">Início</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const belt = beltMap.get(student.beltId);
              return (
                <tr key={student.id} className="border-b border-brand-dark-3 hover:bg-brand-dark-3">
                   <td className="px-6 py-2">
                      <Avatar student={student} />
                  </td>
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {student.name}
                      {student.nickname && <span className="text-gray-400 ml-2">({student.nickname})</span>}
                  </td>
                  <td className="px-6 py-4">
                      {belt && <span className={`px-2 py-1 text-xs font-semibold rounded-full ${belt.colorClass}`}>{belt.name}</span>}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">{student.phone}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{formatDate(student.startDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {student.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleEdit(student)} className="text-blue-400 hover:text-blue-300">
                            <Icon name="edit" className="w-5 h-5" />
                        </button>
                        <button onClick={() => setStudentToDelete(student)} className="text-red-400 hover:text-red-300">
                            <Icon name="trash" className="w-5 h-5" />
                        </button>
                      </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && <StudentFormModal student={editingStudent} onClose={() => setIsModalOpen(false)} onSave={handleSaveStudent} classes={classes} belts={belts} />}

      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Aluno"
        message={
            <>
                <p>Tem certeza que deseja excluir o aluno <strong>{studentToDelete?.name}</strong>?</p>
                <p className="mt-2 text-sm">Todos os seus registros de presença serão perdidos permanentemente.</p>
            </>
        }
        confirmText="Excluir"
      />
    </>
  );
};

export default StudentsScreen;