import React from 'react';
import Icon from './Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-brand-dark-2 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
              <Icon name="trash" className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-white mb-2">{title}</h2>
          <div className="text-gray-400">
            {message}
          </div>
        </div>
        <div className="bg-brand-dark-3 p-4 flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-md text-white bg-brand-dark-2 hover:bg-brand-dark-2/80"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2 rounded-md text-white font-semibold ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
