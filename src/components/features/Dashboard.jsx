import React from 'react';

const Dashboard = ({ participants, blocks, attendance, selectedDate, rentAmount }) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const trainingsThisMonth = Object.keys(attendance).filter(key => {
        const parts = key.split('-');
        if (parts.length !== 4) return false;

        const participantId = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10);

        // Check if participant exists
        const participantExists = participants.some(p => p.id === participantId);

        return attendance[key] === true && year === selectedYear && month === selectedMonth && participantExists;
    }).length;

    // Используем реальное значение rentAmount или 50000 по умолчанию
    const currentRentAmount = (typeof rentAmount === 'number' && rentAmount > 0) ? rentAmount : 50000;

    const paymentsIncome = participants.reduce((acc, p) => {
        const paymentsInMonth = (p.payments || []).filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getFullYear() === selectedYear && paymentDate.getMonth() === selectedMonth;
        });

        const incomeFromParticipant = paymentsInMonth.reduce((sum, payment) => {
            // Use snapshot cost OR fallback to block cost OR 0
            const block = blocks.find(b => b.id === payment.blockId);
            const cost = payment.costSnapshot !== undefined ? payment.costSnapshot : (block ? block.cost : 0);
            return sum + cost;
        }, 0);

        return acc + incomeFromParticipant;
    }, 0);

    const incomeThisMonth = paymentsIncome - currentRentAmount;

    return (
        <div>
            <div className="flex items-baseline space-x-2 mb-6">
                <h1 className="text-3xl font-bold text-white">Дашборд</h1>
                <span className="text-lg text-gray-400">({selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors">
                    <h2 className="text-xl font-semibold text-gray-300">Активные участники</h2>
                    <p className="text-4xl font-bold text-orange-500 mt-2">{participants.filter(p => !p.isArchived).length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors">
                    <h2 className="text-xl font-semibold text-gray-300">Проведено тренировок</h2>
                    <p className="text-4xl font-bold text-orange-500 mt-2">{trainingsThisMonth}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors">
                    <h2 className="text-xl font-semibold text-gray-300">Доход (Оплаты)</h2>
                    <p className={`text-4xl font-bold mt-2 ${incomeThisMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>{incomeThisMonth.toLocaleString('ru-RU')} ₽</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
