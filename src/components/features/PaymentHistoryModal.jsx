import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { DeleteIcon, EditIcon } from '../ui/Icons';

const PaymentHistoryModal = ({ show, onClose, participant, onUpdateParticipant }) => {
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editData, setEditData] = useState({});

    if (!participant) return null;

    const payments = participant.payments || [];
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const handleDelete = (paymentId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту оплату? Это изменит статистику.')) {
            const updatedPayments = payments.filter(p => p.paymentId !== paymentId);
            onUpdateParticipant({ ...participant, payments: updatedPayments });
        }
    };

    const startEdit = (payment) => {
        setEditingPaymentId(payment.paymentId);
        setEditData({
            paymentDate: payment.paymentDate,
            costSnapshot: payment.costSnapshot !== undefined ? payment.costSnapshot : 0, // Should be pre-filled from legacy fallback if undefined logic existed here, but assumes refactor handled it or 0 is safe default for edit.
            trainingCountSnapshot: payment.trainingCountSnapshot !== undefined ? payment.trainingCountSnapshot : 0,
            blockNameSnapshot: payment.blockNameSnapshot || 'Н/Д'
        });
    };

    const cancelEdit = () => {
        setEditingPaymentId(null);
        setEditData({});
    };

    const saveEdit = (paymentId) => {
        const updatedPayments = payments.map(p => {
            if (p.paymentId === paymentId) {
                return {
                    ...p,
                    paymentDate: editData.paymentDate,
                    costSnapshot: parseFloat(editData.costSnapshot),
                    trainingCountSnapshot: parseInt(editData.trainingCountSnapshot),
                    blockNameSnapshot: editData.blockNameSnapshot
                };
            }
            return p;
        });
        onUpdateParticipant({ ...participant, payments: updatedPayments });
        setEditingPaymentId(null);
    };

    return (
        <Modal show={show} onClose={onClose} title={`История оплат: ${participant.name}`}>
            <div className="overflow-x-auto">
                {sortedPayments.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">История оплат пуста</p>
                ) : (
                    <table className="min-w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-700 text-gray-100 uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Дата</th>
                                <th className="px-4 py-2">Блок</th>
                                <th className="px-4 py-2">Сумма</th>
                                <th className="px-4 py-2">Тренировки</th>
                                <th className="px-4 py-2 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sortedPayments.map(payment => {
                                const isEditing = editingPaymentId === payment.paymentId;

                                return (
                                    <tr key={payment.paymentId} className="hover:bg-gray-700">
                                        {isEditing ? (
                                            <>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={editData.paymentDate}
                                                        onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })}
                                                        className="w-full bg-gray-600 rounded p-1 text-white border border-gray-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={editData.blockNameSnapshot}
                                                        onChange={(e) => setEditData({ ...editData, blockNameSnapshot: e.target.value })}
                                                        className="w-full bg-gray-600 rounded p-1 text-white border border-gray-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={editData.costSnapshot}
                                                        onChange={(e) => setEditData({ ...editData, costSnapshot: e.target.value })}
                                                        className="w-20 bg-gray-600 rounded p-1 text-white border border-gray-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={editData.trainingCountSnapshot}
                                                        onChange={(e) => setEditData({ ...editData, trainingCountSnapshot: e.target.value })}
                                                        className="w-16 bg-gray-600 rounded p-1 text-white border border-gray-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right space-x-2">
                                                    <button onClick={() => saveEdit(payment.paymentId)} className="text-green-400 hover:text-green-300">Сохр.</button>
                                                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300">Отм.</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-2 whitespace-nowrap">{new Date(payment.paymentDate).toLocaleDateString('ru-RU')}</td>
                                                <td className="px-4 py-2">{payment.blockNameSnapshot || 'Н/Д'}</td>
                                                <td className="px-4 py-2">{payment.costSnapshot !== undefined ? payment.costSnapshot : '---'} ₽</td>
                                                <td className="px-4 py-2">{payment.trainingCountSnapshot !== undefined ? payment.trainingCountSnapshot : '---'}</td>
                                                <td className="px-4 py-2 text-right whitespace-nowrap">
                                                    <button onClick={() => startEdit(payment)} className="text-blue-400 hover:text-blue-500 mr-3" title="Редактировать">
                                                        <EditIcon />
                                                    </button>
                                                    <button onClick={() => handleDelete(payment.paymentId)} className="text-red-400 hover:text-red-500" title="Удалить">
                                                        <DeleteIcon />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Закрыть</button>
            </div>
        </Modal>
    );
};

export default PaymentHistoryModal;
