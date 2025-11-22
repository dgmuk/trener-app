import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD_t9Kaj9eOjISp33Wqj_k9YqZETb21vBw",
    authDomain: "trainer-crm-be9ea.firebaseapp.com",
    projectId: "trainer-crm-be9ea",
    storageBucket: "trainer-crm-be9ea.firebasestorage.app",
    messagingSenderId: "499615107271",
    appId: "1:499615107271:web:370531703a115d4daa96e2",
    measurementId: "G-1Y9Q2S7GRZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
