
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import Icon from '../components/Icon';
import { formatDate, getTodayDateString } from '../lib/utils';

const DashboardScreen: React.FC = () => {
    const { students, classes, lessons, attendance, loading } = useAppData();

    if (loading) {
        return <div className="text-center p-8 text-gray-400">Carregando dados...</div>;
    }

    const activeStudents = students.filter(s => s.isActive).length;
    const totalClasses = classes.length;

    const today = getTodayDateString();
    const upcomingLessons = lessons
        .filter(l => l.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    
    const nextLesson = upcomingLessons[0];
    const nextLessonClass = nextLesson ? classes.find(c => c.id === nextLesson.classId) : null;

    const calculateMonthlyPresence = () => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

        const recentLessons = lessons.filter(l => l.date >= oneMonthAgoStr && l.date <= today);
        const recentLessonIds = new Set(recentLessons.map(l => l.id));
        
        const relevantAttendance = attendance.filter(a => recentLessonIds.has(a.lessonId));
        if (relevantAttendance.length === 0) return 0;

        const presentCount = relevantAttendance.filter(a => a.present).length;
        return Math.round((presentCount / relevantAttendance.length) * 100);
    };

    const monthlyPresence = calculateMonthlyPresence();

    const StatCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name']; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
        <div className="bg-brand-dark-2 p-6 rounded-lg shadow-lg flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                <Icon name={icon} className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon="users" title="Alunos Ativos" value={activeStudents} color="bg-blue-500" />
                <StatCard icon="group" title="Total de Turmas" value={totalClasses} color="bg-green-500" />
                <StatCard icon="chart" title="Presença (Mês)" value={`${monthlyPresence}%`} color="bg-purple-500" />
                <StatCard icon="calendar" title="Próximas Aulas" value={upcomingLessons.length} color="bg-yellow-500" />
            </div>

            <div className="bg-brand-dark-2 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Próxima Aula</h2>
                {nextLesson && nextLessonClass ? (
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-dark-3 p-4 rounded-md">
                        <div>
                            <p className="text-lg font-bold text-brand-blue">{nextLessonClass.name}</p>
                            <p className="text-gray-300">Professor: {nextLessonClass.professor}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                           <p className="font-semibold text-white">{formatDate(nextLesson.date)}</p>
                           <p className="text-gray-400">{nextLesson.time}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Nenhuma aula futura agendada.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardScreen;