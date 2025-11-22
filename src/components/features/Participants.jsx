import React, { useState } from 'react';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import { EditIcon, ArchiveIcon, RestoreIcon } from '../ui/Icons';

const Participants = ({ participants, setParticipants, blocks, attendance, setAttendance }) => {
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [participantToEdit, setParticipantToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'

    const [newParticipantData, setNewParticipantData] = useState({ name: '' });
    const [newPaymentData, setNewPaymentData] = useState({ blockId: '', paymentDate: '' });

    const handleOpenAddModal = () => {
        setNewParticipantData({ name: '' });
        setShowAddParticipantModal(true);
    };

    const handleOpenPaymentModal = (participant) => {
        setParticipantToEdit(participant);
        const today = new Date().toISOString().split('T')[0];
        setNewPaymentData({ blockId: blocks[0]?.id || '', paymentDate: today });
        setShowAddPaymentModal(true);
    };

    const handleCloseModals = () => {
        setShowAddParticipantModal(false);
        setShowAddPaymentModal(false);
        setParticipantToEdit(null);
    };

    const handleAddParticipant = (e) => {
        e.preventDefault();
        setParticipants(prev => [...prev, { ...newParticipantData, id: Date.now(), payments: [], isArchived: false }]);
        handleCloseModals();
    };

    const handleAddPayment = (e) => {
        e.preventDefault();
        setParticipants(prev => prev.map(p => {
            if (p.id === participantToEdit.id) {
                const newPayment = {
                    ...newPaymentData,
                    blockId: parseInt(newPaymentData.blockId),
                    paymentId: Date.now()
                };
                const existingPayments = p.payments || [];
                return { ...p, payments: [...existingPayments, newPayment] };
            }
            return p;
        }));
        handleCloseModals();
    };

    const toggleArchiveStatus = (id, status) => {
        setParticipants(prev => prev.map(p =>
            p.id === id ? { ...p, isArchived: status } : p
        ));
    };

    const filteredParticipants = participants.filter(p => {
        if (activeTab === 'active') return !p.isArchived;
        if (activeTab === 'archived') return p.isArchived;
        return true;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-white text-center md:text-left">Управление участниками</h1>
                <button onClick={handleOpenAddModal} className="w-full md:w-auto px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Добавить участника</button>
            </div>

            <div className="flex space-x-4 mb-4 border-b border-gray-700">
                <button
                    className={`py-2 px-4 font-medium focus:outline-none ${activeTab === 'active' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Активные
                </button>
                <button
                    className={`py-2 px-4 font-medium focus:outline-none ${activeTab === 'archived' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveTab('archived')}
                >
                    Архив
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
                <table className="min-w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ФИО</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата последней оплаты</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Последний блок</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredParticipants.map(p => {
                            const lastPayment = p.payments && p.payments.length > 0 ? p.payments[p.payments.length - 1] : null;
                            const lastBlock = lastPayment ? blocks.find(b => b.id === lastPayment.blockId) : null;
                            return (
                                <tr key={p.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {lastPayment ? new Date(lastPayment.paymentDate).toLocaleDateString('ru-RU') : '---'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lastBlock ? lastBlock.name : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenPaymentModal(p)} className="text-orange-400 hover:text-orange-500 mr-4"><EditIcon /></button>
                                        {activeTab === 'active' ? (
                                            <button onClick={() => toggleArchiveStatus(p.id, true)} className="text-red-400 hover:text-red-500" title="Архивировать">
                                                <ArchiveIcon />
                                            </button>
                                        ) : (
                                            <button onClick={() => toggleArchiveStatus(p.id, false)} className="text-green-400 hover:text-green-500" title="Восстановить">
                                                <RestoreIcon />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <Modal show={showAddParticipantModal} onClose={handleCloseModals} title="Добавить участника">
                <form onSubmit={handleAddParticipant} className="space-y-4">
                    <input type="text" name="name" value={newParticipantData.name} onChange={(e) => setNewParticipantData({ name: e.target.value })} placeholder="ФИО" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required />
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-700 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Добавить</button>
                    </div>
                </form>
            </Modal>

            <Modal show={showAddPaymentModal} onClose={handleCloseModals} title={`Добавить оплату для: ${participantToEdit?.name}`}>
                <form onSubmit={handleAddPayment} className="space-y-4">
                    <select name="blockId" value={newPaymentData.blockId} onChange={(e) => setNewPaymentData({ ...newPaymentData, blockId: e.target.value })} className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required>
                        <option value="" disabled>Выберите блок</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-300">Дата оплаты</label>
                        <input
                            type="date"
                            id="paymentDate"
                            name="paymentDate"
                            value={newPaymentData.paymentDate}
                            onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentDate: e.target.value })}
                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-700 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Добавить оплату</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Participants;
