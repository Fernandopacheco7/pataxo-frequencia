
import React from 'react';
import Icon from '../../components/Icon';

interface LandingPageProps {
    onNavigateToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
    
    const features = [
        {
            icon: 'users' as const,
            title: 'Cadastro Completo de Alunos',
            description: 'Mantenha um registro detalhado de todos os seus alunos, incluindo faixas, turmas e informações de contato.'
        },
        {
            icon: 'calendar' as const,
            title: 'Chamada Rápida e Eficiente',
            description: 'Realize a chamada de cada aula com poucos cliques, mantendo o histórico de presença sempre atualizado.'
        },
        {
            icon: 'chart' as const,
            title: 'Relatórios de Frequência',
            description: 'Visualize gráficos e tabelas com a frequência dos alunos, identifique padrões e tome decisões baseadas em dados.'
        },
        {
            icon: 'group' as const,
            title: 'Gerenciamento de Turmas',
            description: 'Crie e organize suas turmas, definindo horários, dias da semana e professores responsáveis.'
        }
    ];

    return (
        <div className="bg-brand-dark text-brand-light min-h-screen font-sans">
            {/* Header */}
            <header className="py-6 px-4 sm:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Pataxó Frequência</h1>
                <button 
                    onClick={onNavigateToLogin}
                    className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Login
                </button>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 sm:px-8">
                <section className="text-center py-20 sm:py-32">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                        Gerencie sua academia de jiu-jitsu com facilidade.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                        Controle de alunos, chamada automática, relatórios de frequência e muito mais. Otimize seu tempo e foque no que realmente importa: o tatame.
                    </p>
                    <button
                        onClick={onNavigateToLogin}
                        className="bg-brand-blue text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-600 transition duration-300"
                    >
                        Acessar o sistema
                    </button>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 sm:py-24">
                    <div className="text-center mb-12">
                         <h3 className="text-3xl sm:text-4xl font-bold">Funcionalidades Principais</h3>
                         <p className="text-gray-400 mt-2">Tudo o que você precisa para uma gestão eficiente.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map(feature => (
                             <div key={feature.title} className="bg-brand-dark-2 p-8 rounded-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="inline-block p-4 bg-brand-dark-3 rounded-full mb-4">
                                    <Icon name={feature.icon} className="w-8 h-8 text-brand-blue" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="text-center py-8 border-t border-brand-dark-2">
                <p className="text-gray-500">&copy; {new Date().getFullYear()} Pataxó Frequência. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
