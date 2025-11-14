
import React, { useState, useMemo, useRef } from 'react';
import { useAppData } from '../hooks/useAppData';
import { getTodayDateString } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../components/Icon';

declare const html2canvas: any;

interface ReportData {
  studentName: string;
  totalLessons: number;
  presentLessons: number;
  absentLessons: number;
  presencePercentage: number;
}

const ReportsScreen: React.FC = () => {
    const { students, classes, lessons, attendance } = useAppData();
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(getTodayDateString());
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    
    const reportRef = useRef<HTMLDivElement>(null);


    const reportData = useMemo<ReportData[]>(() => {
        const relevantLessons = lessons.filter(lesson => 
            lesson.date >= startDate && 
            lesson.date <= endDate &&
            (selectedClassId === 'all' || lesson.classId === selectedClassId)
        );
        const relevantLessonIds = new Set(relevantLessons.map(l => l.id));

        const relevantStudents = selectedClassId === 'all'
            ? students.filter(s => s.isActive)
            : students.filter(s => s.isActive && s.classIds.includes(selectedClassId));
        
        return relevantStudents.map(student => {
            const studentLessons = relevantLessons.filter(l => student.classIds.includes(l.classId));
            const totalLessons = studentLessons.length;
            if (totalLessons === 0) {
                return { studentName: student.name, totalLessons: 0, presentLessons: 0, absentLessons: 0, presencePercentage: 0 };
            }

            const presentCount = attendance.filter(a => 
                a.studentId === student.id && 
                relevantLessonIds.has(a.lessonId) &&
                a.present
            ).length;
            
            const percentage = Math.round((presentCount / totalLessons) * 100);

            return {
                studentName: student.name,
                totalLessons,
                presentLessons: presentCount,
                absentLessons: totalLessons - presentCount,
                presencePercentage: percentage,
            };
        }).sort((a,b) => b.presencePercentage - a.presencePercentage);

    }, [startDate, endDate, selectedClassId, students, lessons, attendance, classes]);
    
    const overallStats = useMemo(() => {
        const totalLessonsInPeriod = lessons.filter(l => l.date >= startDate && l.date <= endDate && (selectedClassId === 'all' || l.classId === selectedClassId)).length;
        const totalPresence = reportData.reduce((sum, data) => sum + data.presentLessons, 0);
        const totalPossibleAttendances = reportData.reduce((sum, data) => sum + data.totalLessons, 0);
        const averagePresence = totalPossibleAttendances > 0 ? Math.round((totalPresence / totalPossibleAttendances) * 100) : 0;
        
        return { totalLessonsInPeriod, totalPresence, averagePresence };
    }, [reportData, lessons, startDate, endDate, selectedClassId]);

    const handleExportJPG = async () => {
        if (!reportRef.current || typeof html2canvas === 'undefined') {
            alert("Erro ao exportar. A biblioteca de exportação não foi carregada.");
            return;
        }
        setIsExporting(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#1A202C', // Match the app's dark background
                useCORS: true,
                scale: 2 // Increase resolution
            });
            const link = document.createElement('a');
            const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            link.download = `relatorio_presenca_${today}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        } catch (error) {
            console.error("Erro ao gerar a imagem:", error);
            alert("Ocorreu um erro ao tentar exportar a imagem.");
        } finally {
            setIsExporting(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-brand-dark-3 p-2 border border-brand-dark rounded">
              <p className="label text-white">{`${label}`}</p>
              <p className="intro text-blue-400">{`Presença: ${payload[0].value}%`}</p>
            </div>
          );
        }
        return null;
    };

    return (
        <div ref={reportRef} className="p-1">
            <div className="bg-brand-dark-2 p-4 rounded-lg shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-300">Data Inicial</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                 <div className="flex-grow w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-300">Data Final</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div className="flex-grow w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-300">Turma</label>
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full mt-1 bg-brand-dark-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue">
                        <option value="all">Todas as Turmas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                    <button
                        onClick={handleExportJPG}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        aria-label="Exportar relatório como imagem JPG"
                    >
                        <Icon name="download" className="w-5 h-5 mr-2" />
                        <span>{isExporting ? 'Exportando...' : 'Exportar JPG'}</span>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-brand-dark-2 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{overallStats.totalLessonsInPeriod}</p><p className="text-gray-400">Aulas no Período</p></div>
                <div className="bg-brand-dark-2 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{overallStats.totalPresence}</p><p className="text-gray-400">Total de Presenças</p></div>
                <div className="bg-brand-dark-2 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{overallStats.averagePresence}%</p><p className="text-gray-400">Média de Presença</p></div>
            </div>

            <div className="bg-brand-dark-2 p-6 rounded-lg shadow-lg mb-6 h-96">
                <h3 className="font-semibold text-lg mb-4">Presença por Aluno (%)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="studentName" tick={{ fill: '#A0AEC0' }} fontSize={12} interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: '#A0AEC0' }} unit="%" />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} />
                        <Bar dataKey="presencePercentage">
                            {reportData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.presencePercentage > 75 ? '#38A169' : entry.presencePercentage > 50 ? '#0A74DA' : '#E53E3E'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto bg-brand-dark-2 rounded-lg shadow-lg">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-dark-3">
                        <tr>
                            <th className="px-6 py-3">Aluno</th>
                            <th className="px-6 py-3 text-center">Aulas no Período</th>
                            <th className="px-6 py-3 text-center">Presenças</th>
                            <th className="px-6 py-3 text-center">Faltas</th>
                            <th className="px-6 py-3 text-center">% Presença</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(data => (
                            <tr key={data.studentName} className="border-b border-brand-dark-3 hover:bg-brand-dark-3">
                                <td className="px-6 py-4 font-medium text-white">{data.studentName}</td>
                                <td className="px-6 py-4 text-center">{data.totalLessons}</td>
                                <td className="px-6 py-4 text-center text-green-400">{data.presentLessons}</td>
                                <td className="px-6 py-4 text-center text-red-400">{data.absentLessons}</td>
                                <td className="px-6 py-4 text-center font-bold">{data.presencePercentage}%</td>
                            </tr>
                        ))}
                         {reportData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center p-8">
                                    <Icon name="chart" className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                                    <p className="text-gray-400">Nenhum dado de frequência encontrado para os filtros selecionados.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsScreen;