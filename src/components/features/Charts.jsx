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

                const attended = Object.keys(attendance).filter(key => {
                    const parts = key.split('-');
                    return parts.length === 4 && parts[0] === String(p.id) && attendance[key] && parseInt(parts[1], 10) === year && parseInt(parts[2], 10) === month;
                }).length;
                return totalSales + (attended * costPerTraining);
            }, 0);

            const incomeForMonth = participants.reduce((total, p) => {
                const paymentsInMonth = (p.payments || []).filter(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
                });
                return total + paymentsInMonth.reduce((sum, payment) => {
                    const block = blocks.find(b => b.id === payment.blockId);
                    return sum + (block ? block.cost : 0);
                }, 0);
            }, 0);

            const currentRentAmount = (typeof rentAmount === 'number' && rentAmount > 0) ? rentAmount : 50000;
            return {
                month: new Date(year, month).toLocaleString('ru-RU', { month: 'short' }),
                income: incomeForMonth - currentRentAmount,
                netProfit: salesForMonth - currentRentAmount,
            };
        });
    };

    const yearlyData = calculateYearlyData();
    const positiveProfitTotal = yearlyData.reduce((sum, data) => (data.netProfit > 0 ? sum + data.netProfit : sum), 0);
    const positiveIncomeTotal = yearlyData.reduce((sum, data) => (data.income > 0 ? sum + data.income : sum), 0);
    const maxDataValue = Math.max(...yearlyData.flatMap(d => [d.income, d.netProfit]), 0);
    const minDataValue = Math.min(...yearlyData.flatMap(d => [d.income, d.netProfit]), 0);

    if (view === 'details') {
        const isNetProfitChart = detailType === 'netProfitByMonth';
        const chartTitle = isNetProfitChart
            ? `Чистая прибыль по месяцам за ${selectedDate.getFullYear()} год`
            : `Доход (оплаты) за вычетом аренды за ${selectedDate.getFullYear()} год`;
        const dataKey = isNetProfitChart ? 'netProfit' : 'income';
        const totalLabel = 'Итого (прибыльные месяцы):';
        const totalValue = isNetProfitChart ? positiveProfitTotal : positiveIncomeTotal;

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <button onClick={() => setView('overview')} className="flex items-center mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 w-full md:w-auto justify-center md:justify-start">
                    <ArrowLeftIcon />
                    <span className="ml-2">Назад к графикам</span>
                </button>
                <h2 className="text-2xl font-semibold text-white mb-4 text-center md:text-left">{chartTitle}</h2>

                <div className="overflow-x-auto">
                    <div className="w-full h-96 p-4 pt-10 border border-gray-700 rounded-lg flex justify-between items-center relative bg-gray-900/50" style={{ minWidth: '600px' }}>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-700/50 dashed"></div>
                        {yearlyData.map((data, index) => {
                            const value = data[dataKey];
                            const isNegative = value < 0;
                            const absoluteMax = Math.max(Math.abs(minDataValue), maxDataValue, rentAmount);
                            const barHeight = absoluteMax === 0 ? 0 : (Math.abs(value) / absoluteMax) * 100;

                            // Dynamic colors based on value
                            const frontGradient = isNegative
                                ? 'bg-gradient-to-b from-rose-500 to-rose-700'
                                : 'bg-gradient-to-b from-emerald-400 to-emerald-600';

                            const topColor = isNegative
                                ? 'bg-rose-400'
                                : 'bg-emerald-300';

                            const sideColor = isNegative
                                ? 'bg-rose-800'
                                : 'bg-emerald-700';

                            const glowColor = isNegative
                                ? 'shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                                : 'shadow-[0_0_15px_rgba(52,211,153,0.5)]';

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center justify-center h-full relative px-1 group perspective-[1000px]">
                                    <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                        {!isNegative && (
                                            <>
                                                <span className="text-xs font-bold text-emerald-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-6">{value.toLocaleString('ru-RU')}</span>
                                                <div className={`w-5/6 relative transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105 ${glowColor}`} style={{ height: `${barHeight / 2}%` }}>
                                                    {/* Front Face */}
                                                    <div className={`absolute inset-0 ${frontGradient} z-10`}></div>
                                                    {/* Top Face */}
                                                    <div className={`absolute top-0 left-0 w-full h-4 ${topColor} transform -skew-x-[45deg] -translate-y-4 origin-bottom-left z-0 brightness-110`}></div>
                                                    {/* Side Face */}
                                                    <div className={`absolute top-0 right-0 w-4 h-full ${sideColor} transform -skew-y-[45deg] translate-x-4 origin-top-left z-0 brightness-90`}></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                        {isNegative && (
                                            <>
                                                <div className={`w-5/6 relative transition-all duration-300 ease-out group-hover:translate-y-2 group-hover:scale-105 ${glowColor}`} style={{ height: `${barHeight / 2}%` }}>
                                                    {/* Front Face */}
                                                    <div className={`absolute inset-0 ${frontGradient} z-10`}></div>
                                                    {/* Top Face (at zero line) - replaces bottom face to match positive bar style */}
                                                    <div className={`absolute top-0 left-0 w-full h-4 ${topColor} transform -skew-x-[45deg] -translate-y-4 origin-bottom-left z-0 brightness-90`}></div>
                                                    {/* Side Face */}
                                                    <div className={`absolute top-0 right-0 w-4 h-full ${sideColor} transform -skew-y-[45deg] translate-x-4 origin-top-left z-0 brightness-90`}></div>
                                                </div>
                                                <span className="text-xs font-bold text-rose-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-6">{value.toLocaleString('ru-RU')}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-2 text-xs font-medium text-gray-500 group-hover:text-white transition-colors">{data.month.toUpperCase()}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Месяц</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">{isNetProfitChart ? 'Чистая прибыль' : 'Доход (за вычетом аренды)'}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {yearlyData.map((data, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{new Date(selectedDate.getFullYear(), index).toLocaleString('ru-RU', { month: 'long' })}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${data[dataKey] >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {data[dataKey].toLocaleString('ru-RU')} ₽
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-900">
                            <tr>
                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-300 uppercase">{totalLabel}</td>
                                <td className="px-6 py-4 text-right text-sm font-extrabold text-green-500">
                                    {totalValue.toLocaleString('ru-RU')} ₽
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Графики</h1>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2 mb-6">
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full md:w-auto">{'<'}</button>
                <h3 className="text-xl font-semibold w-full md:w-48 text-center text-white">{selectedDate.getFullYear()}</h3>
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full md:w-auto">{'>'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleCardClick('incomeByMonth')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-300">Доход (оплаты) по месяцам</h2>
                    <p className="text-gray-400 mt-2">Динамика дохода (за вычетом аренды) за год</p>
                </div>
                <div onClick={() => handleCardClick('netProfitByMonth')} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-300">Чистая прибыль (реализация) по месяцам</h2>
                    <p className="text-gray-400 mt-2">Динамика чистой прибыли за год</p>
                </div>
            </div>
        </div>
    );
};

export default Charts;
