import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import StudentsScreen from './screens/StudentsScreen';
import ClassesScreen from './screens/ClassesScreen';
import BeltsScreen from './screens/BeltsScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ReportsScreen from './screens/ReportsScreen';
import LessonHistoryScreen from './screens/LessonHistoryScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AppDataProvider } from './hooks/useAppData';
import { Page } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false); // Close menu on navigation
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'students':
        return <StudentsScreen />;
      case 'classes':
        return <ClassesScreen />;
      case 'belts':
        return <BeltsScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'lessonHistory':
        return <LessonHistoryScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-brand-dark">
        <p className="text-white text-lg">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppDataProvider>
      <div className="flex h-screen bg-brand-dark font-sans">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleSetCurrentPage}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            currentPage={currentPage}
            onLogout={handleLogout}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-dark p-4 sm:p-6 lg:p-8">
            {renderPage()}
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
};

export default App;