
import React, { useState } from 'react';
import LandingPage from './marketing/LandingPage';
import LoginScreen from './LoginScreen';

const PublicScreen: React.FC = () => {
    const [view, setView] = useState<'landing' | 'login'>('landing');

    if (view === 'login') {
        return <LoginScreen onNavigateToLanding={() => setView('landing')} />;
    }

    return <LandingPage onNavigateToLogin={() => setView('login')} />;
};

export default PublicScreen;
