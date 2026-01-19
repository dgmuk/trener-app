import React, { useState } from 'react';
import { ArrowLeftIcon } from '../ui/Icons';

const Charts = ({ participants, blocks, attendance, rentAmount, selectedDate, setSelectedDate }) => {
    const [view, setView] = useState('overview');
    const [detailType, setDetailType] = useState('');

    const handleCardClick = (type) => {
        setDetailType(type);
        setView('details');
    };

    const changeDate = (modifier) => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            modifier(newDate);
            return newDate;
        });
    };

    const calculateYearlyData = () => {
        const year = selectedDate.getFullYear();
        return Array.from({ length: 12 }, (_, month) => {
            let monthlyAttendedCount = 0;

            const salesForMonth = participants.reduce((totalSales, p) => {
                const participantPayments = p.payments || [];
                let totalCostPaid = 0;
                let totalSessionsPurchased = 0;
                participantPayments.forEach(payment => {
                    const block = blocks.find(b => b.id === payment.blockId);
                    if (block) {
                        totalCostPaid += block.cost;
                        totalSessionsPurchased += block.trainingCount;
                    }
                });
                const costPerTraining = totalSessionsPurchased > 0 ? totalCostPaid / totalSessionsPurchased : 0;

                const attendedCount = Object.keys(attendance).filter(key => {
                    const parts = key.split('-');
                    return parts.length === 4 && parts[0] === String(p.id) && attendance[key] && parseInt(parts[1], 10) === year && parseInt(parts[2], 10) === month;
                }).length;

                monthlyAttendedCount += attendedCount;

                return totalSales + (attendedCount * costPerTraining);
            }, 0);

            const incomeForMonth = participants.reduce((total, p) => {
                const paymentsInMonth = (p.payments || []).filter(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
                });
                return total + paymentsInMonth.reduce((sum, payment) => {
                    // Use snapshot cost if available, otherwise current block cost
                    const cost = payment.costSnapshot || (blocks.find(b => b.id === payment.blockId)?.cost) || 0;
                    return sum + cost;
                }, 0);
            }, 0);

            const currentRentAmount = (typeof rentAmount === 'number' && rentAmount > 0) ? rentAmount : 50000;
            return {
                month: new Date(year, month).toLocaleString('ru-RU', { month: 'short' }),
                income: incomeForMonth - currentRentAmount,
                netProfit: salesForMonth - currentRentAmount, // Here netProfit is actually "Realization" - rent
                attendedCount: monthlyAttendedCount
            };
        });
    };

    const getBlockPopularity = () => {
        const year = selectedDate.getFullYear();
        const blockStats = {};

        participants.forEach(p => {
            (p.payments || []).forEach(payment => {
                const paymentDate = new Date(payment.paymentDate);
                if (paymentDate.getFullYear() === year) {
                    const blockId = payment.blockId;
                    const blockName = payment.blockNameSnapshot || blocks.find(b => b.id === blockId)?.name || 'Неизвестный блок';
                    const cost = payment.costSnapshot || blocks.find(b => b.id === blockId)?.cost || 0;

                    if (!blockStats[blockName]) {
                        blockStats[blockName] = { count: 0, totalIncome: 0 };
                    }
                    blockStats[blockName].count += 1;
                    blockStats[blockName].totalIncome += cost;
                }
            });
        });

        return Object.entries(blockStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count);
    };

    const yearlyData = calculateYearlyData();
    const blockPopularityData = getBlockPopularity();

    const positiveProfitTotal = yearlyData.reduce((sum, data) => (data.netProfit > 0 ? sum + data.netProfit : sum), 0);
    const positiveIncomeTotal = yearlyData.reduce((sum, data) => (data.income > 0 ? sum + data.income : sum), 0);
    const totalAttended = yearlyData.reduce((sum, data) => sum + data.attendedCount, 0);

    const maxDataValue = Math.max(...yearlyData.flatMap(d => [d.income, d.netProfit, d.attendedCount]), 0);
    const minDataValue = Math.min(...yearlyData.flatMap(d => [d.income, d.netProfit]), 0);

    // --- Detail Views ---
    if (view === 'details') {
        let chartTitle = '';
        let renderChart = null;
        let renderTable = null;

        if (detailType === 'blockPopularity') {
            chartTitle = `Популярность блоков за ${selectedDate.getFullYear()} год`;
            const maxCount = Math.max(...blockPopularityData.map(d => d.count), 0);

            renderChart = (
                <div className="w-full p-6 pt-10 border border-gray-700 rounded-lg bg-gray-900/50 flex flex-col space-y-6">
                    {blockPopularityData.map((block, index) => {
                        const widthPercentage = maxCount > 0 ? (block.count / maxCount) * 100 : 0;
                        return (
                            <div key={index} className="relative group">
                                <div className="flex justify-between text-sm text-gray-300 mb-1 font-medium">
                                    <span>{block.name}</span>
                                    <span className="text-orange-400 font-bold">{block.count} шт.</span>
                                </div>
                                <div className="w-full h-8 bg-gray-700 rounded-full overflow-hidden shadow-inner relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full relative transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,146,60,0.5)] group-hover:shadow-[0_0_15px_rgba(251,146,60,0.8)]"
                                        style={{ width: `${widthPercentage}%` }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    Доход: <span className="text-gray-400">{block.totalIncome.toLocaleString()} ₽</span>
                                </div>
                            </div>
                        );
                    })}
                    {blockPopularityData.length === 0 && <div className="text-center text-gray-500 py-10">Нет данных о продажах за этот год</div>}
                </div>
            );

            renderTable = (
                <table className="min-w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Блок</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Продано (шт)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Сумма</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {blockPopularityData.map((block, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{block.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-400">{block.count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">{block.totalIncome.toLocaleString()} ₽</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        } else {
            // 3D Bar Charts (Income, Profit, Attendance)
            let dataKey = '';
            let totalValue = 0;
            let totalLabel = '';
            let colorScheme = {};

            switch (detailType) {
                case 'netProfitByMonth':
                    chartTitle = `Чистая прибыль по месяцам за ${selectedDate.getFullYear()} год`;
                    dataKey = 'netProfit';
                    totalValue = positiveProfitTotal;
                    totalLabel = 'Итого (прибыльные):';
                    colorScheme = {
                        pos: { from: 'from-emerald-400', to: 'to-emerald-600', top: 'bg-emerald-300', side: 'bg-emerald-700', shadow: 'rgba(52,211,153,0.5)', text: 'text-emerald-400' },
                        neg: { from: 'from-rose-500', to: 'to-rose-700', top: 'bg-rose-400', side: 'bg-rose-800', shadow: 'rgba(244,63,94,0.5)', text: 'text-rose-400' }
                    };
                    break;
                case 'attendanceByMonth':
                    chartTitle = `Посещаемость по месяцам за ${selectedDate.getFullYear()} год`;
                    dataKey = 'attendedCount';
                    totalValue = totalAttended;
                    totalLabel = 'Всего посещений:';
                    colorScheme = {
                        pos: { from: 'from-cyan-400', to: 'to-blue-600', top: 'bg-cyan-300', side: 'bg-blue-700', shadow: 'rgba(34,211,238,0.5)', text: 'text-cyan-400' },
                        neg: { from: 'from-gray-500', to: 'to-gray-700', top: 'bg-gray-400', side: 'bg-gray-800', shadow: 'rgba(156,163,175,0.5)', text: 'text-gray-400' } // Fallback, shouldn't occur for attendance
                    };
                    break;
                default: // incomeByMonth
                    chartTitle = `Доход (оплаты) за вычетом аренды за ${selectedDate.getFullYear()} год`;
                    dataKey = 'income';
                    totalValue = positiveIncomeTotal;
                    totalLabel = 'Итого (прибыльные):';
                    colorScheme = {
                        pos: { from: 'from-teal-400', to: 'to-teal-600', top: 'bg-teal-300', side: 'bg-teal-700', shadow: 'rgba(45,212,191,0.5)', text: 'text-teal-400' },
                        neg: { from: 'from-rose-500', to: 'to-rose-700', top: 'bg-rose-400', side: 'bg-rose-800', shadow: 'rgba(244,63,94,0.5)', text: 'text-rose-400' }
                    };
            }

            renderChart = (
                <div className="w-full h-96 p-4 pt-10 border border-gray-700 rounded-lg flex justify-between items-center relative bg-gray-900/50" style={{ minWidth: '600px' }}>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gray-700/50 dashed"></div>
                    {yearlyData.map((data, index) => {
                        const value = data[dataKey];
                        const isNegative = value < 0;
                        // For attendance, max value might be different scale than money, so recalculate local max if needed or use general max
                        const localMax = detailType === 'attendanceByMonth' ? Math.max(...yearlyData.map(d => d.attendedCount), 10) : Math.max(Math.abs(minDataValue), maxDataValue, rentAmount);
                        const barHeight = localMax === 0 ? 0 : (Math.abs(value) / localMax) * 100;

                        const colors = isNegative ? colorScheme.neg : colorScheme.pos;
                        const frontGradient = `bg-gradient-to-b ${colors.from} ${colors.to}`;
                        const glowColor = `shadow-[0_0_15px_${colors.shadow}]`;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center justify-center h-full relative px-1 group perspective-[1000px]">
                                <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                    {!isNegative && (
                                        <>
                                            <span className={`text-xs font-bold ${colors.text} mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-6`}>{value.toLocaleString('ru-RU')}</span>
                                            <div className={`w-5/6 relative transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105 ${glowColor}`} style={{ height: `${barHeight === 0 ? 1 : barHeight}%` }}>
                                                <div className={`absolute inset-0 ${frontGradient} z-10`}></div>
                                                <div className={`absolute top-0 left-0 w-full h-4 ${colors.top} transform -skew-x-[45deg] -translate-y-4 origin-bottom-left z-0 brightness-110`}></div>
                                                <div className={`absolute top-0 right-0 w-4 h-full ${colors.side} transform -skew-y-[45deg] translate-x-4 origin-top-left z-0 brightness-90`}></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                    {isNegative && (
                                        <>
                                            <div className={`w-5/6 relative transition-all duration-300 ease-out group-hover:translate-y-2 group-hover:scale-105 ${glowColor}`} style={{ height: `${barHeight}%` }}>
                                                <div className={`absolute inset-0 ${frontGradient} z-10`}></div>
                                                <div className={`absolute top-0 left-0 w-full h-4 ${colors.top} transform -skew-x-[45deg] -translate-y-4 origin-bottom-left z-0 brightness-90`}></div>
                                                <div className={`absolute top-0 right-0 w-4 h-full ${colors.side} transform -skew-y-[45deg] translate-x-4 origin-top-left z-0 brightness-90`}></div>
                                            </div>
                                            <span className={`text-xs font-bold ${colors.text} mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-6`}>{value.toLocaleString('ru-RU')}</span>
                                        </>
                                    )}
                                </div>
                                <span className="absolute -bottom-2 text-xs font-medium text-gray-500 group-hover:text-white transition-colors">{data.month.toUpperCase()}</span>
                            </div>
                        )
                    })}
                </div>
            );

            renderTable = (
                <table className="min-w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Месяц</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">{detailType === 'attendanceByMonth' ? 'Посещения (шт)' : 'Сумма'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {yearlyData.map((data, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{new Date(selectedDate.getFullYear(), index).toLocaleString('ru-RU', { month: 'long' })}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${data[dataKey] >= 0 ? colorScheme.pos.text : colorScheme.neg.text}`}>
                                    {data[dataKey].toLocaleString('ru-RU')} {detailType === 'attendanceByMonth' ? '' : '₽'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-900">
                        <tr>
                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-300 uppercase">{totalLabel}</td>
                            <td className={`px-6 py-4 text-right text-sm font-extrabold ${colorScheme.pos.text}`}>
                                {totalValue.toLocaleString('ru-RU')} {detailType === 'attendanceByMonth' ? '' : '₽'}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            );
        }

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <button onClick={() => setView('overview')} className="flex items-center mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full md:w-auto justify-center md:justify-start">
                    <ArrowLeftIcon />
                    <span className="ml-2">Назад к графикам</span>
                </button>
                <h2 className="text-2xl font-semibold text-white mb-4 text-center md:text-left">{chartTitle}</h2>

                <div className="overflow-x-auto">
                    {renderChart}
                </div>

                <div className="mt-6 overflow-x-auto">
                    {renderTable}
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Графики</h1>
            <div className="flex items-center justify-center space-x-4 mb-6">
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">{'<'}</button>
                <h3 className="text-2xl font-bold text-white">{selectedDate.getFullYear()}</h3>
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">{'>'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleCardClick('incomeByMonth')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-teal-500/20 rounded-lg text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-300">Доход (оплаты)</h2>
                    <p className="text-gray-400 mt-2">Динамика дохода за год</p>
                </div>

                <div onClick={() => handleCardClick('netProfitByMonth')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-300">Чистая прибыль</h2>
                    <p className="text-gray-400 mt-2">Реализация тренировок</p>
                </div>

                <div onClick={() => handleCardClick('attendanceByMonth')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-300">Посещаемость</h2>
                    <p className="text-gray-400 mt-2">Количество тренировок</p>
                </div>

                <div onClick={() => handleCardClick('blockPopularity')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-300">Популярность блоков</h2>
                    <p className="text-gray-400 mt-2">Самые покупаемые блоки</p>
                </div>
            </div>
        </div>
    );
};

export default Charts;
