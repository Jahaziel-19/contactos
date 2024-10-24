import React, { useState } from 'react';
import Login from './login';
import Register from './register';
import { useAuth } from './AuthContext';

export default function Access() {
    const [state, setState] = useState("login");
    const { login } = useAuth();

    const handleLogin = () => {
        login();
    };
    const stateRegister = () =>{
        setState("register");
    }
    const stateLogin = () =>{
        setState("login")
    }
    return (
        <div className="bg-custom-gray w-screen hide-scrollbar h-full flex">
            <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
                {state === 'login' ? <Login onLogin={handleLogin} setState={stateRegister} /> : <Register setState={stateLogin}/>}
            </div>
        </div>
    );
}
