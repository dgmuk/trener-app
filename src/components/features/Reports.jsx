import React, { useState } from 'react';
import { ArrowLeftIcon } from '../ui/Icons';

const ReportDetails = ({ type, participants, blocks, attendance, rentAmount, onBack }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const getReportData = () => {
        if (type === 'income') {
            const payments = participants.flatMap(p => (p.payments || []).map(pay => ({ ...pay, participantName: p.name })))
                .filter(p => {
                    const date = new Date(p.paymentDate);
                    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
                })
                .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

            const totalIncome = payments.reduce((sum, p) => {
                const block = blocks.find(b => b.id === p.blockId);
                const cost = p.costSnapshot !== undefined ? p.costSnapshot : (block ? block.cost : 0);
                return sum + cost;
            }, 0);

            return { items: payments, total: totalIncome };
        } else if (type === 'attendance') {
            const attendanceData = participants.map(p => {
                const visits = Object.keys(attendance).filter(key => {
                    const parts = key.split('-');
                    return parts[0] === String(p.id) &&
                        parseInt(parts[1]) === selectedYear &&
                        parseInt(parts[2]) === selectedMonth &&
                        attendance[key];
                }).length;
                return { name: p.name, visits };
            }).filter(p => p.visits > 0).sort((a, b) => b.visits - a.visits);

            const totalVisits = attendanceData.reduce((sum, p) => sum + p.visits, 0);
            return { items: attendanceData, total: totalVisits };
        }
        return { items: [], total: 0 };
    };

    const data = getReportData();

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <button onClick={onBack} className="flex items-center mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                <ArrowLeftIcon />
                Назад к отчетам
            </button>

            <div className="flex space-x-4 mb-6">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="p-2 bg-gray-700 text-white rounded-lg border border-gray-600">
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="p-2 bg-gray-700 text-white rounded-lg border border-gray-600">
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                </select>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
                {type === 'income' ? 'Отчет по доходам' : 'Отчет по посещаемости'}
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            {type === 'income' ? (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Дата</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Участник</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Блок</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Сумма</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Участник</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Посещений</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {data.items.map((item, i) => {
                            if (type === 'income') {
                                const block = blocks.find(b => b.id === item.blockId);
                                const cost = item.costSnapshot !== undefined ? item.costSnapshot : (block ? block.cost : 0);
                                const blockName = item.blockNameSnapshot || (block ? block.name : 'Н/Д');
                                return (
                                    <tr key={i} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm text-gray-300">{new Date(item.paymentDate).toLocaleDateString('ru-RU')}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{item.participantName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{blockName}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-green-500">{cost} ₽</td>
                                    </tr>
                                );
                            } else {
                                return (
                                    <tr key={i} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm font-medium text-white">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-300">{item.visits}</td>
                                    </tr>
                                );
                            }
                        })}
                    </tbody>
                    <tfoot className="bg-gray-900">
                        <tr>
                            <td colSpan={type === 'income' ? 3 : 1} className="px-6 py-4 text-right text-sm font-bold text-gray-300 uppercase">Итого:</td>
                            <td className={`px-6 py-4 text-right text-sm font-extrabold ${type === 'income' ? 'text-green-500' : 'text-white'}`}>
                                {type === 'income' ? `${data.total} ₽` : data.total}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const Reports = ({ participants, blocks, attendance, rentAmount }) => {
    const [view, setView] = useState('list'); // 'list', 'income', 'attendance'

    if (view !== 'list') {
        return <ReportDetails type={view} participants={participants} blocks={blocks} attendance={attendance} rentAmount={rentAmount} onBack={() => setView('list')} />;
    }

    // Calculate totals for preview cards
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const incomeThisMonth = participants.reduce((sum, p) => {
        return sum + (p.payments || []).filter(pay => {
            const d = new Date(pay.paymentDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).reduce((s, pay) => {
            const b = blocks.find(bl => bl.id === pay.blockId);
            const cost = pay.costSnapshot !== undefined ? pay.costSnapshot : (b ? b.cost : 0);
            return s + cost;
        }, 0);
    }, 0);

    const visitsThisMonth = Object.keys(attendance).filter(key => {
        const parts = key.split('-');
        return parseInt(parts[1]) === currentYear && parseInt(parts[2]) === currentMonth && attendance[key];
    }).length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Отчеты</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => setView('income')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-300">Финансовый отчет</h2>
                    <p className="text-gray-400 mt-2">Доход за текущий месяц: <span className="text-green-500 font-bold">{incomeThisMonth} ₽</span></p>
                </div>
                <div onClick={() => setView('attendance')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-300">Отчет по посещаемости</h2>
                    <p className="text-gray-400 mt-2">Посещений за текущий месяц: <span className="text-orange-500 font-bold">{visitsThisMonth}</span></p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
