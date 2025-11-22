import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

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
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-center text-white">
                    {isLogin ? 'Вход в VisitFlow' : 'Регистрация в VisitFlow'}
                </h2>
                <form onSubmit={handleAuth} className="space-y-6">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 text-gray-300 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full px-4 py-2 text-gray-300 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600" required />
                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                </form>
                <p className="text-sm text-center text-gray-300">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-bold text-orange-400 hover:underline">
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
