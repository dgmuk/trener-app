import React from 'react';

const ConfirmModal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
                <div className="text-gray-300 mb-6">{children}</div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Отмена</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Удалить</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
