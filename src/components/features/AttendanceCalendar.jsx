import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, DollarIcon } from '../ui/Icons';

const AttendanceCalendar = ({ participants, blocks, attendance, setAttendance, selectedDate, setSelectedDate }) => {
    const [expandedParticipant, setExpandedParticipant] = useState(null);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const toggleAttendance = (participantId, day) => {
        const key = `${participantId}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`;
        setAttendance(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const [participantsData, setParticipantsData] = useState([]);
    useEffect(() => {
        const attendanceMap = {};
        Object.keys(attendance).forEach(key => {
            if (!attendance[key]) return;
            const parts = key.split('-');
            if (parts.length !== 4) return;
            const participantId = parts[0];
            if (!attendanceMap[participantId]) {
                attendanceMap[participantId] = [];
            }
            attendanceMap[participantId].push({
                year: parseInt(parts[1], 10),
                month: parseInt(parts[2], 10),
                day: parseInt(parts[3], 10),
            });
        });

        const processedData = participants
            .filter(p => !p.isArchived)
            .map(p => {
                const participantPayments = p.payments || [];
                const totalSessions = participantPayments.reduce((sum, payment) => {
                    const block = blocks.find(b => b.id === payment.blockId);
                    return sum + (block ? block.trainingCount : 0);
                }, 0);
                const allVisits = attendanceMap[p.id] || [];
                const totalAttendance = allVisits.length;
                const remainingSessions = totalSessions - totalAttendance;
                const attendedThisMonth = allVisits.filter(att => att.year === selectedDate.getFullYear() && att.month === selectedDate.getMonth()).length;
                const lastPayment = participantPayments.length > 0 ? participantPayments[participantPayments.length - 1] : null;
                const lastBlock = lastPayment ? blocks.find(b => b.id === lastPayment.blockId) : null;
                return { ...p, blockName: lastBlock ? lastBlock.name : "Блок не назначен", attendedThisMonth, remainingSessions };
            });
        setParticipantsData(processedData);
    }, [selectedDate, participants, blocks, attendance]);

    const changeDate = (modifier) => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            modifier(newDate);
            return newDate;
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Календарь посещений</h1>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-1 sm:space-x-2 order-2 md:order-1">
                    <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-2 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-bold">{'«'}</button>
                    <button onClick={() => changeDate(d => d.setMonth(d.getMonth() - 1))} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">{'<'}</button>
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold w-full md:w-48 text-center capitalize text-white order-1 md:order-2 mb-2 md:mb-0">{selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex items-center space-x-1 sm:space-x-2 order-3 md:order-3">
                    <button onClick={() => changeDate(d => d.setMonth(d.getMonth() + 1))} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">{'>'}</button>
                    <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-2 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-bold">{'»'}</button>
                </div>
            </div>

            <div className="space-y-4">
                {participantsData.map(p => {
                    const isExpanded = expandedParticipant === p.id;
                    const participantPayments = p.payments || [];
                    return (
                        <div key={p.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-teal-500 transition-colors">
                            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedParticipant(isExpanded ? null : p.id)}>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                                    <p className="text-sm text-gray-300">{p.blockName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-300">Посещений в этом месяце: {p.attendedThisMonth}</p>
                                    <p className="text-sm font-bold text-orange-400">Осталось тренировок: {p.remainingSessions}</p>
                                </div>
                                <div className={`ml-4 transition-transform duration-300 text-white ${isExpanded ? 'transform rotate-180' : ''}`}>
                                    <ChevronDownIcon />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 border-t border-gray-700 bg-gray-900">
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                                        {weekdays.map(wd => <div key={wd}>{wd}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: startOffset }).map((_, index) => <div key={`empty-${index}`} />)}
                                        {daysArray.map(day => {
                                            const key = `${p.id}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`;
                                            const isChecked = !!attendance[key];
                                            const isPaymentDay = participantPayments.some(payment => {
                                                const paymentDateObj = new Date(payment.paymentDate);
                                                return paymentDateObj.getFullYear() === selectedDate.getFullYear() &&
                                                    paymentDateObj.getMonth() === selectedDate.getMonth() &&
                                                    paymentDateObj.getDate() === day;
                                            });
                                            return (
                                                <div
                                                    key={day}
                                                    className={`relative flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                                    onClick={() => toggleAttendance(p.id, day)}
                                                >
                                                    {isPaymentDay && <DollarIcon />}
                                                    <span className="font-bold text-sm">{day}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default AttendanceCalendar;
