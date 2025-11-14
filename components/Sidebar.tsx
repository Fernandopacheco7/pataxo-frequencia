
import React from 'react';
import Icon from './Icon';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const navItems: { page: Page; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { page: 'students', label: 'Alunos', icon: 'users' },
    { page: 'classes', label: 'Turmas', icon: 'group' },
    { page: 'belts', label: 'Faixas', icon: 'shield' },
    { page: 'attendance', label: 'Chamada', icon: 'calendar' },
    { page: 'lessonHistory', label: 'Histórico de Aulas', icon: 'clock' },
    { page: 'reports', label: 'Relatórios', icon: 'chart' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-dark-2 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <span className="text-white text-2xl font-bold">Pataxó Frequência</span>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white" aria-label="Close menu">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.page} className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(item.page);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    currentPage === item.page
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-300 hover:bg-brand-dark-3 hover:text-white'
                  }`}
                >
                  <Icon name={item.icon} className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;