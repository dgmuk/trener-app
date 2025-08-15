import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from 'firebase/firestore';

// --- КОНФИГУРАЦИЯ FIREBASE ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Иконки ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 1.803M15 21a9 9 0 00-9-5.197" /></svg>;
const BlocksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const RubleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600 absolute top-0.5 right-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 absolute top-0.5 right-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5m-5 7h5.5a3.5 3.5 0 000-7H9.5" /></svg>;

// --- Компонент аутентификации ---
const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const initialData = {
                    blocks: [
                        { id: 0, name: 'Без оплаты', cost: 0, trainingCount: 0 },
                        { id: 1, name: 'Блок 10 тренировок', cost: 25000, trainingCount: 10 },
                        { id: 2, name: 'Блок 8 тренировок', cost: 20000, trainingCount: 8 },
                        { id: 3, name: 'Блок 5 тренировок', cost: 14000, trainingCount: 5 },
                        { id: 4, name: 'Разовая', cost: 3000, trainingCount: 1 },
                    ],
                    participants: [],
                    attendance: {},
                    rentAmount: 50000,
                };
                await setDoc(doc(db, "users", user.uid), initialData);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    {isLogin ? 'Вход в VisitFlow' : 'Регистрация в VisitFlow'}
                </h2>
                <form onSubmit={handleAuth} className="space-y-6">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white"
                        required
                    />
                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                </form>
                <p className="text-sm text-center text-gray-600">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-bold text-blue-600 hover:underline">
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// --- Переиспользуемые компоненты ---
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const ConfirmModal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
                <div className="text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Отмена
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Компоненты страниц ---
const Dashboard = ({ participants, blocks, attendance, selectedDate }) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const trainingsThisMonth = Object.keys(attendance).filter(key => {
        const parts = key.split('-');
        if (parts.length !== 4) return false;
        const year = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10);
        return attendance[key] === true && year === selectedYear && month === selectedMonth;
    }).length;
    
    const incomeThisMonth = participants.reduce((acc, p) => {
        const paymentDate = new Date(p.paymentDate);
        if (paymentDate.getFullYear() === selectedYear && paymentDate.getMonth() === selectedMonth) {
            const block = blocks.find(b => b.id === p.blockId);
            return acc + (block ? block.cost : 0);
        }
        return acc;
    }, 0);

    return (
        <div>
            <div className="flex items-baseline space-x-2 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Дашборд</h1>
                <span className="text-lg text-gray-500">({selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Активные участники</h2>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{participants.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Проведено тренировок</h2>
                    <p className="text-4xl font-bold text-yellow-600 mt-2">{trainingsThisMonth}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">Доход (Оплаты)</h2>
                    <p className="text-4xl font-bold text-green-600 mt-2">
                        {incomeThisMonth.toLocaleString('ru-RU')} ₽
                    </p>
                </div>
            </div>
        </div>
    );
};

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

        const processedData = participants.map(p => {
            const block = blocks.find(b => b.id === p.blockId) || {};
            const totalSessions = block.trainingCount || 0;
            const allVisits = attendanceMap[p.id] || [];
            const totalAttendance = allVisits.length;
            const remainingSessions = totalSessions - totalAttendance;
            const attendedThisMonth = allVisits.filter(att => 
                att.year === selectedDate.getFullYear() && att.month === selectedDate.getMonth()
            ).length;
            return { ...p, blockName: block.name || "Блок не назначен", attendedThisMonth, remainingSessions };
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Календарь посещений</h1>
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-2 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-bold">{'«'}</button>
                    <button onClick={() => changeDate(d => d.setMonth(d.getMonth() - 1))} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'<'}</button>
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold w-36 sm:w-48 text-center capitalize">{selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button onClick={() => changeDate(d => d.setMonth(d.getMonth() + 1))} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'>'}</button>
                    <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-2 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-bold">{'»'}</button>
                </div>
            </div>

            <div className="space-y-4">
                {participantsData.map(p => {
                    const isExpanded = expandedParticipant === p.id;
                    return (
                        <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div 
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                onClick={() => setExpandedParticipant(isExpanded ? null : p.id)}
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                                    <p className="text-sm text-gray-500">{p.blockName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-blue-600">Посещений в этом месяце: {p.attendedThisMonth}</p>
                                    <p className="text-sm font-bold text-orange-500">Осталось тренировок: {p.remainingSessions}</p>
                                </div>
                                <div className={`ml-4 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-2">
                                        {weekdays.map(wd => <div key={wd}>{wd}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: startOffset }).map((_, index) => <div key={`empty-${index}`} />)}
                                        {daysArray.map(day => {
                                            const key = `${p.id}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`;
                                            const isChecked = !!attendance[key];
                                            const paymentDateObj = p.paymentDate ? new Date(p.paymentDate) : null;
                                            const isPaymentDay = paymentDateObj &&
                                                                 paymentDateObj.getFullYear() === selectedDate.getFullYear() &&
                                                                 paymentDateObj.getMonth() === selectedDate.getMonth() &&
                                                                 paymentDateObj.getDate() === day;
                                            return (
                                                <div 
                                                    key={day} 
                                                    className={`relative flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
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

const Participants = ({ participants, setParticipants, blocks, attendance, setAttendance }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', blockId: '', paymentDate: '' });

    const handleOpenModal = (participant = null) => {
        setEditingParticipant(participant);
        const today = new Date().toISOString().split('T')[0];
        setFormData(participant ? { ...participant } : { name: '', blockId: blocks[0]?.id || '', paymentDate: today });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingParticipant(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        if (name === 'blockId' && parseInt(value, 10) === 0) {
            newFormData.paymentDate = '';
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            blockId: parseInt(formData.blockId)
        };
        if (editingParticipant) {
            setParticipants(participants.map(p => p.id === editingParticipant.id ? { ...p, ...finalData } : p));
        } else {
            setParticipants([...participants, { ...finalData, id: Date.now() }]);
        }
        handleCloseModal();
    };
    
    const handleDelete = (id) => {
        setParticipantToDelete(id);
    };

    const confirmDelete = () => {
        if (!participantToDelete) return;
        setParticipants(prev => prev.filter(p => p.id !== participantToDelete));
        setAttendance(prevAttendance => {
            const newAttendance = { ...prevAttendance };
            Object.keys(newAttendance).forEach(key => {
                if (key.startsWith(`${participantToDelete}-`)) {
                    delete newAttendance[key];
                }
            });
            return newAttendance;
        });
        setParticipantToDelete(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Управление участниками</h1>
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => handleOpenModal()} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Добавить участника</button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата оплаты</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Блок</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {participants.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('ru-RU') : '---'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blocks.find(b => b.id === p.blockId)?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal show={showModal} onClose={handleCloseModal} title={editingParticipant ? "Редактировать участника" : "Добавить участника"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ФИО" className="w-full p-2 border rounded-lg" required />
                    <select name="blockId" value={formData.blockId || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white" required>
                        <option value="" disabled>Выберите блок</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                     <div>
                         <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Дата оплаты</label>
                         <input
                             type="date"
                             id="paymentDate"
                             name="paymentDate"
                             value={formData.paymentDate}
                             onChange={handleChange}
                             className="w-full p-2 border rounded-lg"
                             disabled={parseInt(formData.blockId, 10) === 0}
                             required={parseInt(formData.blockId, 10) !== 0}
                         />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingParticipant ? "Сохранить" : "Добавить"}</button>
                    </div>
                </form>
            </Modal>
            <ConfirmModal
                show={participantToDelete !== null}
                onClose={() => setParticipantToDelete(null)}
                onConfirm={confirmDelete}
                title="Подтвердите удаление"
            >
                Вы уверены, что хотите удалить этого участника?
            </ConfirmModal>
        </div>
    );
};

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
            trainingCount: parseInt(formData.trainingCount, 10)
        };

        if (editingBlock) {
            setBlocks(blocks.map(b => b.id === editingBlock.id ? { ...b, ...finalData } : b));
        } else {
            setBlocks([...blocks, { ...finalData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (id === 0) return;
        setBlockToDelete(id);
    };

    const confirmDelete = () => {
        if (!blockToDelete) return;
        setParticipants(prevParticipants =>
            prevParticipants.map(p => (p.blockId === blockToDelete ? { ...p, blockId: null } : p))
        );
        setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockToDelete));
        setBlockToDelete(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Управление блоками</h1>
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => handleOpenModal()} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Создать блок</button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название блока</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во тренировок</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blocks.map(b => (
                            <tr key={b.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.cost.toLocaleString('ru-RU')} ₽</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.trainingCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {b.id !== 0 && (
                                        <>
                                            <button onClick={() => handleOpenModal(b)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                                            <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Расходы</h2>
                <label className="block text-sm font-medium text-gray-700">Сумма аренды в месяц</label>
                <input 
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full p-2 border rounded-lg"
                    placeholder="Введите сумму аренды"
                />
            </div>
            <Modal show={showModal} onClose={handleCloseModal} title={editingBlock ? "Редактировать блок" : "Создать блок"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Название блока" className="w-full p-2 border rounded-lg" required />
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Стоимость" className="w-full p-2 border rounded-lg" required />
                    <input type="number" name="trainingCount" value={formData.trainingCount} onChange={handleChange} placeholder="Количество тренировок" className="w-full p-2 border rounded-lg" required />
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingBlock ? "Сохранить" : "Добавить"}</button>
                    </div>
                </form>
            </Modal>
            <ConfirmModal
                show={blockToDelete !== null}
                onClose={() => setBlockToDelete(null)}
                onConfirm={confirmDelete}
                title="Подтвердите удаление"
            >
                Вы уверены, что хотите удалить этот блок? Все участники, приписанные к этому блоку, будут откреплены.
            </ConfirmModal>
        </div>
    );
};

const ReportDetails = ({ onBack, detailType, reportData, totalSales, netProfit, rentAmount, totalTrainings, avgTrainingCost, reportDate, changeDate }) => {
    const titles = {
        participantSales: "Отчет: Реализация по участникам",
        totalSales: "Отчет: Общая прибыль",
        netProfit: "Отчет: Чистая прибыль",
        avgCost: "Отчет: Средняя стоимость тренировки",
    };

    const renderContent = () => {
        switch (detailType) {
            case 'participantSales':
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО Участника</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Блок</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость 1 тренировки</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Посещено (месяц)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Реализация (месяц)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.blockName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.costPerTraining.toFixed(2)} ₽</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center font-bold">{p.attendedThisMonth}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{p.salesThisMonth.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'totalSales':
                return (
                    <div className="p-8 text-center border rounded-lg">
                        <h3 className="text-lg font-medium text-gray-500">Общая прибыль за месяц</h3>
                        <p className="mt-2 text-5xl font-bold text-blue-600">{totalSales.toLocaleString('ru-RU')} ₽</p>
                    </div>
                );
            case 'netProfit':
                return (
                    <div className="p-8 border rounded-lg">
                        <dl className="divide-y divide-gray-200">
                            <div className="flex justify-between py-3">
                                <dt className="text-lg text-gray-600">Общая прибыль</dt>
                                <dd className="text-lg font-medium text-blue-600">{totalSales.toLocaleString('ru-RU')} ₽</dd>
                            </div>
                            <div className="flex justify-between py-3">
                                <dt className="text-lg text-gray-600">Сумма аренды</dt>
                                <dd className="text-lg font-medium text-red-500">- {rentAmount.toLocaleString('ru-RU')} ₽</dd>
                            </div>
                            <div className="flex justify-between py-4">
                                <dt className="text-xl font-bold text-gray-800">Чистая прибыль</dt>
                                <dd className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit.toLocaleString('ru-RU')} ₽</dd>
                            </div>
                        </dl>
                    </div>
                );
            case 'avgCost':
                return (
                    <div className="p-8 border rounded-lg">
                        <dl className="divide-y divide-gray-200">
                            <div className="flex justify-between py-3">
                                <dt className="text-lg text-gray-600">Общая прибыль</dt>
                                <dd className="text-lg font-medium text-gray-800">{totalSales.toLocaleString('ru-RU')} ₽</dd>
                            </div>
                            <div className="flex justify-between py-3">
                                <dt className="text-lg text-gray-600">Количество тренировок</dt>
                                <dd className="text-lg font-medium text-gray-800">{totalTrainings}</dd>
                            </div>
                            <div className="flex justify-between py-4">
                                <dt className="text-xl font-bold text-gray-800">Средняя стоимость тренировки</dt>
                                <dd className="text-xl font-bold text-purple-600">{avgTrainingCost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</dd>
                            </div>
                        </dl>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={onBack} className="flex items-center mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                <ArrowLeftIcon />
                Назад к отчетам
            </button>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{titles[detailType]}</h2>
            <div className="flex items-center space-x-2 mb-6">
                <button onClick={() => changeDate(d => d.setMonth(d.getMonth() - 1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'<'}</button>
                <h3 className="text-xl font-semibold w-48 text-center">{reportDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeDate(d => d.setMonth(d.getMonth() + 1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'>'}</button>
            </div>
            {renderContent()}
        </div>
    );
};


const Reports = ({ participants, blocks, attendance, rentAmount, selectedDate, setSelectedDate }) => {
    const [view, setView] = useState('overview');
    const [detailType, setDetailType] = useState(null);

    const reportYear = selectedDate.getFullYear();
    const reportMonth = selectedDate.getMonth();
    
    const changeDate = (modifier) => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            modifier(newDate);
            return newDate;
        });
    };

    const handleCardClick = (type) => {
        setDetailType(type);
        setView('details');
    };

    const reportData = participants.map(p => {
        const block = blocks.find(b => b.id === p.blockId);
        if (!block) return { salesThisMonth: 0, id: p.id }; 

        const costPerTraining = (block.cost && block.trainingCount) ? (block.cost / block.trainingCount) : 0;
        
        const attendedThisMonth = Object.keys(attendance).filter(key => {
            const parts = key.split('-');
            return parts.length === 4 &&
                parseInt(parts[0], 10) === p.id &&
                attendance[key] === true &&
                parseInt(parts[1], 10) === reportYear &&
                parseInt(parts[2], 10) === reportMonth;
        }).length;

        const salesThisMonth = costPerTraining * attendedThisMonth;

        return {
            ...p,
            blockName: block.name,
            costPerTraining,
            attendedThisMonth,
            salesThisMonth
        };
    }).filter(p => p.id); 

    const totalSales = reportData.reduce((sum, p) => sum + p.salesThisMonth, 0);
    const netProfit = totalSales - rentAmount;
    const totalTrainings = reportData.reduce((sum, p) => sum + p.attendedThisMonth, 0);
    const avgTrainingCost = totalTrainings > 0 ? totalSales / totalTrainings : 0;


    if (view === 'details') {
        return <ReportDetails 
                    onBack={() => setView('overview')}
                    detailType={detailType}
                    reportData={reportData}
                    totalSales={totalSales}
                    netProfit={netProfit}
                    rentAmount={rentAmount}
                    totalTrainings={totalTrainings}
                    avgTrainingCost={avgTrainingCost}
                    reportDate={selectedDate}
                    changeDate={changeDate}
                />
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Отчеты</h1>
            <div className="flex items-center space-x-2 mb-6">
                <h3 className="text-xl font-semibold w-full text-center">{selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => handleCardClick('totalSales')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-700">Общая прибыль</h2>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{totalSales.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div onClick={() => handleCardClick('netProfit')} className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer`}>
                    <h2 className="text-xl font-semibold text-gray-700">Чистая прибыль</h2>
                    <p className={`text-4xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div onClick={() => handleCardClick('avgCost')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-700">Средняя стоимость тренировки</h2>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{avgTrainingCost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
                </div>
                <div onClick={() => handleCardClick('participantSales')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-700">Реализация по участникам</h2>
                    <p className="text-gray-500 mt-2">Нажмите, чтобы посмотреть детали</p>
                </div>
            </div>
        </div>
    );
};
        
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
                const block = blocks.find(b => b.id === p.blockId);
                if (!block || !block.cost || !block.trainingCount) return totalSales;
                const costPerTraining = block.cost / block.trainingCount;
                const attended = Object.keys(attendance).filter(key => {
                    const parts = key.split('-');
                    return parts.length === 4 && parseInt(parts[0], 10) === p.id && attendance[key] && parseInt(parts[1], 10) === year && parseInt(parts[2], 10) === month;
                }).length;
                return totalSales + (attended * costPerTraining);
            }, 0);
            
            const incomeForMonth = participants.reduce((total, p) => {
                const paymentDate = new Date(p.paymentDate);
                if (paymentDate.getFullYear() === year && paymentDate.getMonth() === month) {
                    const block = blocks.find(b => b.id === p.blockId);
                    return total + (block ? block.cost : 0);
                }
                return total;
            }, 0);

            return {
                month: new Date(year, month).toLocaleString('ru-RU', { month: 'short' }),
                income: incomeForMonth - rentAmount,
                netProfit: salesForMonth - rentAmount,
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
            <div className="bg-white p-6 rounded-lg shadow-md">
                <button onClick={() => setView('overview')} className="flex items-center mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    <ArrowLeftIcon />
                    Назад к графикам
                </button>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">{chartTitle}</h2>
                
                <div className="overflow-x-auto">
                    <div className="w-full h-96 p-4 pt-10 border rounded-lg flex justify-between items-center relative" style={{ minWidth: '600px' }}>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>
                        {yearlyData.map((data, index) => {
                            const value = data[dataKey];
                            const isNegative = value < 0;
                            const absoluteMax = Math.max(Math.abs(minDataValue), maxDataValue, rentAmount);
                            const barHeight = absoluteMax === 0 ? 0 : (Math.abs(value) / absoluteMax) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center justify-center h-full relative px-1 group">
                                    <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                        {!isNegative && (
                                        <>
                                            <span className="text-xs font-semibold text-gray-600 mb-1">{value.toLocaleString('ru-RU')}</span>
                                            <div className="w-5/6 relative transition-transform duration-200 ease-in-out group-hover:-translate-y-1" style={{ height: `${barHeight / 2}%` }}>
                                                <div className="absolute inset-0 bg-green-400 border border-green-500"></div>
                                                <div className="absolute top-0 left-0 w-full h-3 bg-green-500 opacity-70 transform -skew-x-[45deg] -translate-y-1.5"></div>
                                                <div className="absolute top-0 right-0 w-3 h-full bg-green-600 opacity-70 transform -skew-y-[45deg] translate-x-1.5"></div>
                                            </div>
                                        </>
                                        )}
                                    </div>
                                    <div className={`w-full h-1/2 flex flex-col ${isNegative ? 'justify-start' : 'justify-end'} items-center`}>
                                        {isNegative && (
                                        <>
                                            <div className="w-5/6 relative transition-transform duration-200 ease-in-out group-hover:translate-y-1" style={{ height: `${barHeight / 2}%` }}>
                                                <div className="absolute inset-0 bg-red-400 border border-red-500"></div>
                                                <div className="absolute bottom-0 left-0 w-full h-3 bg-red-500 opacity-70 transform -skew-x-[45deg] translate-y-1.5"></div>
                                                <div className="absolute top-0 right-0 w-3 h-full bg-red-600 opacity-70 transform -skew-y-[45deg] translate-x-1.5"></div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 mt-1">{value.toLocaleString('ru-RU')}</span>
                                        </>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-1 text-xs">{data.month.toUpperCase()}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Месяц</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isNetProfitChart ? 'Чистая прибыль' : 'Доход (за вычетом аренды)'}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {yearlyData.map((data, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(selectedDate.getFullYear(), index).toLocaleString('ru-RU', { month: 'long' })}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${data[dataKey] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {data[dataKey].toLocaleString('ru-RU')} ₽
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">{totalLabel}</td>
                                <td className="px-6 py-4 text-right text-sm font-extrabold text-green-700">
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Графики</h1>
            <div className="flex items-center space-x-2 mb-6">
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() - 1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'<'}</button>
                <h3 className="text-xl font-semibold w-48 text-center">{selectedDate.getFullYear()}</h3>
                <button onClick={() => changeDate(d => d.setFullYear(d.getFullYear() + 1))} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{'>'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleCardClick('incomeByMonth')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-700">Доход (оплаты) по месяцам</h2>
                    <p className="text-gray-500 mt-2">Динамика дохода (за вычетом аренды) за год</p>
                </div>
                <div onClick={() => handleCardClick('netProfitByMonth')} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-700">Чистая прибыль (реализация) по месяцам</h2>
                    <p className="text-gray-500 mt-2">Динамика чистой прибыли за год</p>
                </div>
            </div>
        </div>
    );
};

// --- Основной компонент приложения ---
const AppContent = ({ user, initialData }) => {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [blocks, setBlocks] = useState(initialData.blocks || []);
    const [participants, setParticipants] = useState(initialData.participants || []);
    const [attendance, setAttendance] = useState(initialData.attendance || {});
    const [rentAmount, setRentAmount] = useState(initialData.rentAmount || 0);
    
    useEffect(() => {
        const saveData = async () => {
            if (user) {
                const dataToSave = {
                    blocks,
                    participants,
                    attendance,
                    rentAmount,
                };
                await setDoc(doc(db, "users", user.uid), dataToSave);
            }
        };
        const handler = setTimeout(() => {
            saveData();
        }, 1000); 

        return () => {
            clearTimeout(handler);
        };
    }, [blocks, participants, attendance, rentAmount, user]);
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Ошибка выхода:", error);
        }
    };

    const renderPage = () => {
        const props = { participants, setParticipants, blocks, setBlocks, attendance, setAttendance, rentAmount, setRentAmount, selectedDate, setSelectedDate };
        switch (activePage) {
            case 'dashboard': return <Dashboard {...props} />;
            case 'calendar': return <AttendanceCalendar {...props} />;
            case 'participants': return <Participants {...props} />;
            case 'blocks': return <Blocks {...props} />;
            case 'reports': return <Reports {...props} />;
            case 'charts': return <Charts {...props} />;
            default: return <Dashboard {...props} />;
        }
    };

    const NavLink = ({ page, icon, children }) => (
        <button
            onClick={() => {
                setActivePage(page);
                setIsMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                activePage === page ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="font-medium">{children}</span>
        </button>
    );

    return (
        <div className="relative min-h-screen md:flex bg-gray-100 font-sans">
            <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-lg">
                <div className="text-2xl font-bold text-blue-700 flex items-center space-x-2">
                    <span>✅</span>
                    <span>VisitFlow</span>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-800">
                    <MenuIcon />
                </button>
            </div>

            <aside className={`w-64 bg-white p-4 flex flex-col shadow-lg fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="text-2xl font-bold text-blue-700 mb-8 items-center space-x-2 hidden md:flex">
                    <span>✅</span>
                    <span>VisitFlow</span>
                </div>
                <nav className="flex-grow">
                    <div className="flex flex-col space-y-2">
                        <NavLink page="dashboard" icon={<HomeIcon />}>Дашборд</NavLink>
                        <NavLink page="calendar" icon={<CalendarIcon />}>Календарь</NavLink>
                        <NavLink page="participants" icon={<UsersIcon />}>Участники</NavLink>
                        <NavLink page="blocks" icon={<BlocksIcon />}>Блоки</NavLink>
                        <NavLink page="reports" icon={<ReportsIcon />}>Отчеты</NavLink>
                        <NavLink page="charts" icon={<ChartIcon />}>Графики</NavLink>
                    </div>
                </nav>
                <div className="mt-auto">
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100">
                        <img className="h-10 w-10 rounded-full" src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${user.email[0].toUpperCase()}`} alt="User" />
                        <div>
                            <p className="font-semibold text-gray-800 text-sm truncate">{user.email}</p>
                            <button onClick={handleSignOut} className="text-sm text-blue-600 hover:underline">Выйти</button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};


export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInitialData(docSnap.data());
                } else {
                    console.log("No such document for user!");
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setInitialData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || (user && !initialData)) {
        return <div className="flex justify-center items-center h-screen font-bold text-xl">Загрузка...</div>;
    }

    if (!user) {
        return <AuthPage />;
    }

    return <AppContent user={user} initialData={initialData} />;
}
