
import React from 'react';
import Icon from './Icon';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  onLogout: () => void;
  onMenuClick: () => void;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  students: 'Gerenciamento de Alunos',
  classes: 'Gerenciamento de Turmas',
  belts: 'Gerenciamento de Faixas',
  attendance: 'Registro de Presença',
  lessonHistory: 'Histórico de Aulas',
  reports: 'Relatórios de Frequência',
};

const Header: React.FC<HeaderProps> = ({ currentPage, onLogout, onMenuClick }) => {
  return (
    <header className="bg-brand-dark-2 shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="text-gray-300 hover:text-white md:hidden mr-4"
          aria-label="Open menu"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-white capitalize">{pageTitles[currentPage]}</h1>
      </div>
      <button 
        onClick={onLogout}
        className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
      >
        <Icon name="logout" className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
};

export default Header;