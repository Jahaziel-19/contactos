import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [modalExport,setModalExport] = useState(false);
    const [token,setToken] = useState(()=>sessionStorage.getItem('token'));


    const login = (userData,token) => {
        setToken(token);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{   login, logout,token, modalExport,setModalExport }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
