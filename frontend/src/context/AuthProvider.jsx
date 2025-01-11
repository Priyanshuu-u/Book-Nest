import React, { createContext, useContext, useState } from 'react'
export const AuthContext = createContext()

export default function AuthProvider({children}) {
    const initialAuthUser = localStorage.getItem("Users");
    const [authUser, setAuthUser] = useState(() => {
        try {
            return initialAuthUser ? JSON.parse(initialAuthUser) : null;
        } catch (error) {
            console.error('Error parsing auth user:', error);
            localStorage.removeItem("Users"); // Clear invalid data
            return null;
        }
    });

    return (
        <AuthContext.Provider value={[authUser, setAuthUser]}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);
