import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, RegisterData, LoginData } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify token is still valid
                    const response = await authService.getCurrentUser();
                    setUser(response.user);
                } catch (error) {
                    // Token invalid, clear storage
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginData) => {
        const response = await authService.login(data);
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const register = async (data: RegisterData) => {
        const response = await authService.register(data);
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
