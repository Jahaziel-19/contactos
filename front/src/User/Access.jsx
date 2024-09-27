import React, { useState } from 'react';
import Login from './login';
import Register from './register';
import { useAuth } from './AuthContext';

export default function Access() {
    const [state, setState] = useState("login");
    const { login } = useAuth();

    const handleLogin = () => {
        // Lógica de autenticación API aquí
        // Si el login es exitoso:
        login();
    };

    return (
        <div className="bg-custom-gray w-screen hide-scrollbar h-full flex">
            <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
                {state === 'login' ? <Login onLogin={handleLogin} /> : <Register />}
                <a onClick={() => { setState(state === 'login' ? "register" : "login") }} className="text-lg text-indigo-400 cursor-pointer hover:underline">
                    {state === 'login' ? 'Register' : 'Login'}
                </a>
            </div>
        </div>
    );
}
