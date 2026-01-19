import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDownIcon, DollarIcon, GripVerticalIcon } from '../ui/Icons';

const AttendanceCalendar = ({ participants, setParticipants, blocks, attendance, setAttendance, selectedDate, setSelectedDate }) => {
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
                    const count = payment.trainingCountSnapshot !== undefined ? payment.trainingCountSnapshot : (block ? block.trainingCount : 0);
                    return sum + count;
                }, 0);
                const allVisits = attendanceMap[p.id] || [];
                const totalAttendance = allVisits.length;
                const remainingSessions = totalSessions - totalAttendance;
                const attendedThisMonth = allVisits.filter(att => att.year === selectedDate.getFullYear() && att.month === selectedDate.getMonth()).length;
                const lastPayment = participantPayments.length > 0 ? participantPayments[participantPayments.length - 1] : null;
                const lastBlock = lastPayment ? blocks.find(b => b.id === lastPayment.blockId) : null;
                const blockName = lastPayment?.blockNameSnapshot || lastBlock?.name || "Блок не назначен";

                const isTimeBased = p.subscriptionType === 'time' || (lastBlock && lastBlock.type === 'time');
                const isExpired = isTimeBased && p.activeUntil && new Date(p.activeUntil) < new Date().setHours(0, 0, 0, 0);

                return { ...p, blockName, attendedThisMonth, remainingSessions, isTimeBased, isExpired };
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

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(participantsData);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Reconstruct logic: New Active Order + Existing Archived
        const newActiveOrderIds = items.map(p => p.id);
        const activeParticipants = newActiveOrderIds.map(id => participants.find(p => p.id === id)).filter(Boolean);
        const archivedParticipants = participants.filter(p => p.isArchived);

        setParticipants([...activeParticipants, ...archivedParticipants]);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Календарь посещений</h1>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
                {/* Mobile Title */}
                <h2 className="md:hidden text-xl font-bold text-center capitalize text-white mb-4 w-full order-1">
                    {selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </h2>

                <div className="flex w-full md:w-auto justify-between md:justify-start items-center order-2 md:order-1 md:space-x-2">
                    <div className="flex space-x-2">
                        <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-bold transition-colors">«</button>
                        <button onClick={() => changeDate(d => d.setMonth(d.getMonth() - 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">{'<'}</button>
                    </div>

                    {/* Desktop Title */}
                    <h2 className="hidden md:block text-2xl font-bold text-center capitalize text-white w-48">
                        {selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h2>

                    <div className="flex space-x-2">
                        <button onClick={() => changeDate(d => d.setMonth(d.getMonth() + 1))} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">{'>'}</button>
                        <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-orange-600 font-bold transition-colors">»</button>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="calendar-list">
                    {(provided) => (
                        <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                            {participantsData.map((p, index) => {
                                const isExpanded = expandedParticipant === p.id;
                                const participantPayments = p.payments || [];
                                return (
                                    <Draggable key={p.id} draggableId={String(p.id)} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition-colors ${snapshot.isDragging ? 'border-teal-500 shadow-2xl' : 'hover:border-teal-500'}`}
                                            >
                                                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedParticipant(isExpanded ? null : p.id)}>
                                                    <div className="flex items-center space-x-4">
                                                        <div {...provided.dragHandleProps} onClick={(e) => e.stopPropagation()} className="cursor-grab p-1 text-gray-500 hover:text-white">
                                                            <GripVerticalIcon />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{p.name}</h3>
                                                            <p className="text-sm text-gray-300">{p.blockName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-grow pr-4">
                                                        <p className="text-sm font-semibold text-gray-300">Посещений в этом месяце: {p.attendedThisMonth}</p>
                                                        {p.isTimeBased ? (
                                                            <p className={`text-sm font-bold ${p.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                                                                {p.isExpired ? 'Истек: ' : 'Активен до: '}
                                                                {(() => {
                                                                    if (!p.activeUntil) return '---';
                                                                    try {
                                                                        const [year, month, day] = p.activeUntil.split('-');
                                                                        if (year && month && day) return `${day}.${month}.${year}`;
                                                                        return new Date(p.activeUntil).toLocaleDateString('ru-RU');
                                                                    } catch (e) {
                                                                        return p.activeUntil || '---';
                                                                    }
                                                                })()}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm font-bold text-orange-400">Осталось тренировок: {p.remainingSessions}</p>
                                                        )}
                                                    </div>
                                                    <div className={`ml-4 transition-transform duration-300 text-white ${isExpanded ? 'transform rotate-180' : ''}`}>
                                                        <ChevronDownIcon />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="p-4 border-t border-gray-700 bg-gray-900 cursor-default" onClick={(e) => e.stopPropagation()}>
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
                                                                        onClick={(e) => { e.stopPropagation(); toggleAttendance(p.id, day); }}
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
                                        )}
                                    </Draggable>
                                )
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default AttendanceCalendar;
