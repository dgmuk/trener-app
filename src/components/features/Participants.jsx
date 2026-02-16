import React, { useState } from 'react';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EditIcon, ArchiveIcon, RestoreIcon, DeleteIcon, HistoryIcon, GripVerticalIcon } from '../ui/Icons';
import PaymentHistoryModal from './PaymentHistoryModal';

const Participants = ({ participants, setParticipants, blocks, attendance, setAttendance, addNotification }) => {
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const [participantToEdit, setParticipantToEdit] = useState(null);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const [historyParticipant, setHistoryParticipant] = useState(null);
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const [newParticipantData, setNewParticipantData] = useState({ name: '' });
    const [newPaymentData, setNewPaymentData] = useState({ blockId: '', paymentDate: '' });
    const [editingName, setEditingName] = useState('');

    const handleOpenAddModal = () => {
        setNewParticipantData({ name: '' });
        setShowAddParticipantModal(true);
    };

    const handleOpenPaymentModal = (participant) => {
        setParticipantToEdit(participant);
        setEditingName(participant.name);
        const today = new Date().toISOString().split('T')[0];
        setNewPaymentData({ blockId: '', paymentDate: today, isCustom: false, customAmount: '', customCount: '' });
        setShowAddPaymentModal(true);
    };

    const handleCloseModals = () => {
        setShowAddParticipantModal(false);
        setShowAddPaymentModal(false);
        setParticipantToEdit(null);
    };

    const handleSaveParticipant = (e) => {
        e.preventDefault();
        setParticipants(prev => prev.map(p => {
            if (p.id === participantToEdit.id) {
                let updatedParticipant = { ...p, name: editingName };

                if (newPaymentData.isCustom && newPaymentData.customAmount && newPaymentData.customCount) {
                    const newPayment = {
                        ...newPaymentData,
                        blockId: 'custom',
                        paymentId: Date.now(),
                        costSnapshot: parseFloat(newPaymentData.customAmount),
                        trainingCountSnapshot: parseInt(newPaymentData.customCount),
                        blockNameSnapshot: 'Произвольная оплата'
                    };
                    updatedParticipant.payments = [...(p.payments || []), newPayment];
                } else if (newPaymentData.blockId) {
                    const block = blocks.find(b => b.id === parseInt(newPaymentData.blockId));
                    const newPayment = {
                        ...newPaymentData,
                        blockId: parseInt(newPaymentData.blockId),
                        paymentId: Date.now(),
                        costSnapshot: block ? block.cost : 0,
                        trainingCountSnapshot: block ? block.trainingCount : 0,
                        blockNameSnapshot: block ? block.name : 'Unknown Block'
                    };
                    updatedParticipant.payments = [...(p.payments || []), newPayment];

                    // Handle Online/Time-based blocks
                    if (block && block.type === 'time') {
                        // ROBUST PARSING: Parse YYYY-MM-DD string directly to avoid timezone issues or fallbacks
                        const dateStr = newPaymentData.paymentDate || new Date().toISOString().split('T')[0];
                        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));

                        // Create date at 00:00:00 local time
                        const paymentDate = new Date(year, month - 1, day);

                        // Always calculate from the payment date as requested
                        const newExpiry = new Date(paymentDate);
                        newExpiry.setDate(newExpiry.getDate() + (parseInt(block.duration) || 0));

                        const yyyy = newExpiry.getFullYear();
                        const mm = String(newExpiry.getMonth() + 1).padStart(2, '0');
                        const dd = String(newExpiry.getDate()).padStart(2, '0');
                        updatedParticipant.activeUntil = `${yyyy}-${mm}-${dd}`;
                        updatedParticipant.subscriptionType = 'time';
                    }
                }
                return updatedParticipant;
            }
            return p;
        }));
        addNotification("Изменения сохранены", 'success');
        handleCloseModals();
    };

    const handleAddParticipant = (e) => {
        e.preventDefault();
        setParticipants(prev => [...prev, { ...newParticipantData, id: Date.now(), payments: [], isArchived: false }]);
        addNotification("Участник добавлен", 'success');
        handleCloseModals();
    };

    const toggleArchiveStatus = (id, status) => {
        setParticipants(prev => prev.map(p =>
            p.id === id ? { ...p, isArchived: status } : p
        ));
        addNotification(status ? "Участник отправлен в архив" : "Участник восстановлен", 'info');
    };

    const handleOpenHistory = (participant) => {
        setHistoryParticipant(participant);
        setShowHistoryModal(true);
    };

    const handleUpdateParticipant = (updatedParticipant) => {
        setParticipants(prev => prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p));
        setHistoryParticipant(updatedParticipant); // Update current view in modal
    };

    const confirmDelete = () => {
        if (participantToDelete) {
            setParticipants(prev => prev.filter(p => p.id !== participantToDelete.id));
            setParticipantToDelete(null);
            addNotification("Участник удален навсегда", 'warning');
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        if (searchQuery || activeTab !== 'active') return; // Disable drop if filtered

        const items = Array.from(participants);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setParticipants(items);
    };

    const safeParticipants = Array.isArray(participants) ? participants : [];
    const safeBlocks = Array.isArray(blocks) ? blocks : [];

    const filteredParticipants = safeParticipants
        .filter(p => {
            if (!p) return false;
            if (activeTab === 'active') return !p.isArchived;
            if (activeTab === 'archived') return p.isArchived;
            return true;
        })
        .filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const isDraggable = activeTab === 'active' && !searchQuery;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-white text-center md:text-left">Управление участниками</h1>
                <button onClick={handleOpenAddModal} className="w-full md:w-auto px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Добавить участника</button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end mb-4 border-b border-gray-700 pb-2">
                <div className="flex space-x-4">
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
                <div className="w-full md:w-64 mt-4 md:mt-0">
                    <input
                        type="text"
                        placeholder="Поиск участника..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <table className="min-w-full">
                        <thead className="bg-gray-900">
                            <tr>
                                {isDraggable && <th className="px-2 py-3 w-8"></th>} {/* Drag Handle Column */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ФИО</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата последней оплаты</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Последний блок</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="participants-list" isDropDisabled={!isDraggable}>
                            {(provided) => (
                                <tbody
                                    className="divide-y divide-gray-700"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {filteredParticipants.map((p, index) => {
                                        const lastPayment = (p.payments && Array.isArray(p.payments) && p.payments.length > 0) ? p.payments[p.payments.length - 1] : null;
                                        const lastBlock = lastPayment ? safeBlocks.find(b => b.id === lastPayment.blockId) : null;
                                        const displayBlockName = lastPayment?.blockNameSnapshot || lastBlock?.name || 'N/A';

                                        return (
                                            <Draggable key={p.id} draggableId={String(p.id)} index={index} isDragDisabled={!isDraggable}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`hover:bg-gray-700 ${snapshot.isDragging ? 'bg-gray-700 shadow-xl border border-teal-500' : ''}`}
                                                    >
                                                        {isDraggable && (
                                                            <td className="px-2 py-4 whitespace-nowrap text-center" {...provided.dragHandleProps}>
                                                                <div className="flex justify-center items-center h-full">
                                                                    <GripVerticalIcon />
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{p.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                            {lastPayment ? new Date(lastPayment.paymentDate).toLocaleDateString('ru-RU') : '---'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                            <div>{displayBlockName}</div>
                                                            {p.activeUntil && (
                                                                <div className={`text-xs mt-1 ${new Date(p.activeUntil) >= new Date().setHours(0, 0, 0, 0) ? 'text-green-400' : 'text-red-400'}`}>
                                                                    До: {new Date(p.activeUntil).toLocaleDateString('ru-RU')}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => handleOpenHistory(p)} className="text-blue-400 hover:text-blue-500 mr-4" title="История оплат"><HistoryIcon /></button>
                                                            <button onClick={() => handleOpenPaymentModal(p)} className="text-orange-400 hover:text-orange-500 mr-4"><EditIcon /></button>
                                                            {activeTab === 'active' ? (
                                                                <button onClick={() => toggleArchiveStatus(p.id, true)} className="text-red-400 hover:text-red-500" title="Архивировать">
                                                                    <ArchiveIcon />
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => toggleArchiveStatus(p.id, false)} className="text-green-400 hover:text-green-500 mr-4" title="Восстановить">
                                                                        <RestoreIcon />
                                                                    </button>
                                                                    <button onClick={() => setParticipantToDelete(p)} className="text-red-400 hover:text-red-500" title="Удалить навсегда">
                                                                        <DeleteIcon />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
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

            <Modal show={showAddPaymentModal} onClose={handleCloseModals} title="Редактирование участника">
                <form onSubmit={handleSaveParticipant} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">ФИО</label>
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Добавить оплату (опционально)</h4>
                        <div className="space-y-3">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="isCustom"
                                    checked={newPaymentData.isCustom || false}
                                    onChange={(e) => setNewPaymentData({ ...newPaymentData, isCustom: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 ring-offset-gray-800"
                                />
                                <label htmlFor="isCustom" className="ml-2 text-sm text-gray-300">Произвольная сумма и количество</label>
                            </div>

                            {!newPaymentData.isCustom ? (
                                <select
                                    name="blockId"
                                    value={newPaymentData.blockId}
                                    onChange={(e) => setNewPaymentData({ ...newPaymentData, blockId: e.target.value })}
                                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Выберите блок</option>
                                    {safeBlocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Сумма (₽)</label>
                                        <input
                                            type="number"
                                            value={newPaymentData.customAmount}
                                            onChange={(e) => setNewPaymentData({ ...newPaymentData, customAmount: e.target.value })}
                                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Количество</label>
                                        <input
                                            type="number"
                                            value={newPaymentData.customCount}
                                            onChange={(e) => setNewPaymentData({ ...newPaymentData, customCount: e.target.value })}
                                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            )}

                            {(newPaymentData.blockId || (newPaymentData.isCustom && newPaymentData.customAmount && newPaymentData.customCount)) && (
                                <div>
                                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-300">Дата оплаты</label>
                                    <input
                                        type="date"
                                        id="paymentDate"
                                        name="paymentDate"
                                        value={newPaymentData.paymentDate}
                                        onChange={(e) => setNewPaymentData({ ...newPaymentData, paymentDate: e.target.value })}
                                        className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-700 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Сохранить</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                show={!!participantToDelete}
                onClose={() => setParticipantToDelete(null)}
                onConfirm={confirmDelete}
                title="Удалить участника?"
            >
                <p>Вы уверены, что хотите навсегда удалить участника <strong>{participantToDelete?.name}</strong>?</p>
                <p className="text-sm text-gray-400 mt-2">Это действие нельзя отменить.</p>
            </ConfirmModal>

            <PaymentHistoryModal
                show={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                participant={historyParticipant}
                onUpdateParticipant={handleUpdateParticipant}
            />
        </div>
    );
};

export default Participants;
