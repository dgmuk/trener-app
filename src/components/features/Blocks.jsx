import React, { useState } from 'react';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import { EditIcon, DeleteIcon } from '../ui/Icons';

const Blocks = ({ blocks, setBlocks, participants, setParticipants, rentAmount, setRentAmount }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [blockToDelete, setBlockToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', cost: '', trainingCount: '' });

    const handleOpenModal = (block = null) => {
        setEditingBlock(block);
        setFormData(block ? { ...block } : { name: '', cost: '', trainingCount: '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBlock(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            cost: parseFloat(formData.cost),
            trainingCount: formData.type === 'time' ? 0 : parseInt(formData.trainingCount, 10),
            duration: formData.type === 'time' ? parseInt(formData.duration, 10) : 0,
            type: formData.type || 'count'
        };

        if (editingBlock) {
            setBlocks(prev => prev.map(b => b.id === editingBlock.id ? { ...finalData, id: editingBlock.id } : b));
        } else {
            setBlocks(prev => [...prev, { ...finalData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (block) => {
        setBlockToDelete(block);
    };

    const confirmDelete = () => {
        setBlocks(prev => prev.filter(b => b.id !== blockToDelete.id));
        setBlockToDelete(null);
    };

    const handleRentChange = (e) => {
        const value = parseFloat(e.target.value);
        setRentAmount(isNaN(value) ? 0 : value);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-white text-center md:text-left">Управление блоками</h1>
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Добавить блок</button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Настройки финансов</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Стоимость аренды (в месяц)</label>
                    <input
                        type="number"
                        value={rentAmount}
                        onChange={handleRentChange}
                        className="w-full md:w-1/3 p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blocks.map(block => (
                    <div key={block.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-teal-500 transition-colors relative group">
                        <h3 className="text-xl font-bold text-white mb-2">{block.name}</h3>
                        <p className="text-gray-300">Стоимость: <span className="font-semibold text-orange-400">{block.cost} ₽</span></p>
                        {block.type === 'time' ? (
                            <p className="text-gray-300">Длительность: <span className="font-semibold text-blue-400">{block.duration} дн.</span></p>
                        ) : (
                            <p className="text-gray-300">Количество тренировок: <span className="font-semibold text-teal-400">{block.trainingCount}</span></p>
                        )}
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(block)} className="text-gray-400 hover:text-white"><EditIcon /></button>
                            <button onClick={() => handleDelete(block)} className="text-red-400 hover:text-red-500"><DeleteIcon /></button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onClose={handleCloseModal} title={editingBlock ? "Редактировать блок" : "Добавить блок"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Название блока" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required />
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Стоимость" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required />

                    <div className="flex space-x-4 mb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="count"
                                checked={!formData.type || formData.type === 'count'}
                                onChange={handleChange}
                                className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-300">Тренировки</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="time"
                                checked={formData.type === 'time'}
                                onChange={handleChange}
                                className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-300">Длительность</span>
                        </label>
                    </div>

                    {formData.type === 'time' ? (
                        <input type="number" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="Длительность (дней)" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required />
                    ) : (
                        <input type="number" name="trainingCount" value={formData.trainingCount || ''} onChange={handleChange} placeholder="Количество тренировок" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 focus:ring-orange-500 focus:border-orange-500" required />
                    )}

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-700 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Сохранить</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal show={blockToDelete !== null} onClose={() => setBlockToDelete(null)} onConfirm={confirmDelete} title="Удалить блок?">
                Вы уверены, что хотите удалить блок "{blockToDelete?.name}"?
            </ConfirmModal>
        </div>
    );
};

export default Blocks;
