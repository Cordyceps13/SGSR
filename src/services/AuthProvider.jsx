import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/DB_API';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(() => {
        const savedSession = localStorage.getItem('session');
        return savedSession ? JSON.parse(savedSession) : null;
    });

    useEffect(() => {
        const getSession = async () => {
            const savedSession = localStorage.getItem('session');
            if (savedSession) {
                const sessionData = JSON.parse(savedSession);
                if (sessionData && sessionData.user && sessionData.user.email) {
                    const { data: user, error } = await supabase
                        .from('utilizadores')
                        .select('*')
                        .eq('email', sessionData.user.email)
                        .single();

                    if (error) {
                        console.error('Erro ao obter sessão:', error.message);
                    } else {
                        setSession({ user });
                    }
                }
            }
        };

        getSession();
    }, []);

    const loginUser = (sessionData) => {
        setSession(sessionData);
        localStorage.setItem('session', JSON.stringify(sessionData));
        return sessionData
    };

    const logoutUser = async () => {
        alert('Sessão terminada')
        setSession(null);
        localStorage.removeItem('session');
    };

    return (
        <AuthContext.Provider value={{ session, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};