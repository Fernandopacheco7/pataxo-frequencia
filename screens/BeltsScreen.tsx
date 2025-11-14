import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Belt } from '../types';
import Icon from '../components/Icon';
import ConfirmationModal from '../components/ConfirmationModal';

const BeltFormModal: React.FC<{
  belt: Partial<Belt> | null;
  onClose: () => void;
  onSave: (beltData: Omit<Belt, 'id'> | Belt) => void;
}> = ({ belt, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: belt?.name || '',
    colorClass: belt?.colorClass || 'bg-gray-500 text-white',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (belt?.id) {
      onSave({ ...formData, id: belt.id });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">{belt?.id ? 'Editar Faixa' : 'Adicionar Faixa'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da Faixa"
                className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
              <div>
                <input
                    type="text"
                    name="colorClass"
                    value={formData.colorClass}
                    onChange={(e) => setFormData({ ...formData, colorClass: e.target.value })}
                    placeholder="Classes de Cor (Tailwind)"
                    className="w-full bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    required
                />
                <p className="text-xs text-gray-400 mt-1">Ex: bg-blue-600 text-white</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Pré-visualização:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${formData.colorClass}`}>
                    {formData.name || 'Faixa'}
                </span>
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

const BeltsScreen: React.FC = () => {
  const { belts, addBelt, updateBelt, deleteBelt } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBelt, setEditingBelt] = useState<Belt | null>(null);
  const [beltToDelete, setBeltToDelete] = useState<Belt | null>(null);

  const handleSave = async (beltData: Omit<Belt, 'id'> | Belt) => {
    try {
        if ('id' in beltData) {
            await updateBelt(beltData);
        } else {
            await addBelt(beltData);
        }
    } catch(error) {
        console.error("Failed to save belt:", error);
        alert("Erro ao salvar faixa.");
    } finally {
        setIsModalOpen(false);
        setEditingBelt(null);
    }
  };

  const handleEdit = (belt: Belt) => {
    setEditingBelt(belt);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBelt(null);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (beltToDelete) {
        try {
            await deleteBelt(beltToDelete.id);
        } catch(error) {
            console.error("Failed to delete belt:", error);
            alert("Erro ao excluir faixa.");
        } finally {
            setBeltToDelete(null);
        }
    }
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={handleAddNew} className="flex items-center justify-center px-4 py-2 rounded-md bg-brand-blue text-white hover:bg-blue-600">
          <Icon name="plus" className="w-5 h-5 mr-2" />
          Adicionar Faixa
        </button>
      </div>
      <div className="overflow-x-auto bg-brand-dark-2 rounded-lg shadow-lg">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-brand-dark-3">
            <tr>
              <th scope="col" className="px-6 py-3">Nome da Faixa</th>
              <th scope="col" className="px-6 py-3">Pré-visualização</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {belts.map(belt => (
              <tr key={belt.id} className="border-b border-brand-dark-3 hover:bg-brand-dark-3">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{belt.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${belt.colorClass}`}>{belt.name}</span>
                </td>
                <td className="px-6 py-4 flex items-center space-x-4">
                  <button onClick={() => handleEdit(belt)} className="text-blue-400 hover:text-blue-300">
                    <Icon name="edit" className="w-5 h-5" />
                  </button>
                  <button onClick={() => setBeltToDelete(belt)} className="text-red-400 hover:text-red-300">
                    <Icon name="trash" className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <BeltFormModal belt={editingBelt} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
      <ConfirmationModal
        isOpen={!!beltToDelete}
        onClose={() => setBeltToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Faixa"
        message={
            <>
                <p>Tem certeza que deseja excluir a faixa <strong>{beltToDelete?.name}</strong>?</p>
                <p className="mt-2 text-sm">Alunos com esta faixa não serão afetados, mas você pode precisar reatribuir suas faixas manualmente.</p>
            </>
        }
        confirmText="Excluir"
      />
    </>
  );
};

export default BeltsScreen;