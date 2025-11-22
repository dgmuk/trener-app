import React from 'react';

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
