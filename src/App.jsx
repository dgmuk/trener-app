import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Components
import AuthPage from './components/features/AuthPage';
import Dashboard from './components/features/Dashboard';
import AttendanceCalendar from './components/features/AttendanceCalendar';
import Participants from './components/features/Participants';
import Blocks from './components/features/Blocks';
import Reports from './components/features/Reports';
import Charts from './components/features/Charts';

// Icons
import {
    HomeIcon,
    CalendarIcon,
    UsersIcon,
    BlocksIcon,
    ReportsIcon,
    ChartIcon,
    MenuIcon
} from './components/ui/Icons';

// --- Основной компонент приложения ---
const AppContent = ({ user, initialData }) => {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [blocks, setBlocks] = useState(initialData.blocks || []);
    const [participants, setParticipants] = useState(initialData.participants || []);
    const [attendance, setAttendance] = useState(initialData.attendance || {});
    const [rentAmount, setRentAmount] = useState(() => {
        const initialRent = initialData?.rentAmount;
        return (typeof initialRent === 'number' && initialRent > 0) ? initialRent : 50000;
    });

    // Принудительно устанавливаем значение по умолчанию если rentAmount некорректный
    useEffect(() => {
        if (typeof rentAmount !== 'number' || rentAmount <= 0) {
            setRentAmount(50000);
        }
    }, [rentAmount]);

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
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${activePage === page ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-medium">{children}</span>
        </button>
    );

    return (
        <div className="relative min-h-screen md:flex bg-gray-900 font-sans text-gray-300">
            <div className="md:hidden flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <div className="text-2xl font-bold text-white flex items-center space-x-2">
                    <span>✅</span>
                    <span>VisitFlow</span>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                    <MenuIcon />
                </button>
            </div>

            <aside className={`w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="text-2xl font-bold text-white mb-8 items-center space-x-2 hidden md:flex">
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
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-900">
                        <img className="h-10 w-10 rounded-full" src={`https://placehold.co/100x100/374151/D1D5DB?text=${user.email[0].toUpperCase()}`} alt="User" />
                        <div>
                            <p className="font-semibold text-white text-sm truncate">{user.email}</p>
                            <button onClick={handleSignOut} className="text-sm text-orange-400 hover:underline">Выйти</button>
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
        return <div className="flex justify-center items-center h-screen font-bold text-xl bg-gray-900 text-white">Загрузка...</div>;
    }

    if (!user) {
        return <AuthPage />;
    }

    return <AppContent user={user} initialData={initialData} />;
}
