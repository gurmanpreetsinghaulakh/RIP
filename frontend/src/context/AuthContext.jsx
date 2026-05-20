import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if there's a stored user session
        let storedUser = localStorage.getItem('homigo_user');

        // Migrate old key if it exists
        if (!storedUser) {
            const legacy = localStorage.getItem('stazy_user');
            if (legacy) {
                storedUser = legacy;
                localStorage.setItem('homigo_user', legacy);
                localStorage.removeItem('stazy_user');
            }
        }

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Enrich on init as well
                if (parsedUser && parsedUser.email) {
                    const storedProfile = localStorage.getItem(`homigo_user_profile_${parsedUser.email}`);
                    if (storedProfile) {
                        try {
                            const parsedProfile = JSON.parse(storedProfile);
                            if (!parsedUser.avatarUrl && parsedProfile.avatarUrl) {
                                parsedUser.avatarUrl = parsedProfile.avatarUrl;
                            }
                        } catch {}
                    }
                }
                setUser(parsedUser);
            } catch {
                localStorage.removeItem('homigo_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Enrich from local profile storage if available (especially for avatarUrl)
        if (userData && userData.email) {
            const storedProfile = localStorage.getItem(`homigo_user_profile_${userData.email}`);
            if (storedProfile) {
                try {
                    const parsed = JSON.parse(storedProfile);
                    if (!userData.avatarUrl && parsed.avatarUrl) {
                        userData.avatarUrl = parsed.avatarUrl;
                    }
                } catch {}
            }
        }
        setUser(userData);
        localStorage.setItem('homigo_user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('/api/logout', { method: 'GET' });
        } catch (err) {
            console.error('Logout error:', err);
        }
        setUser(null);
        localStorage.removeItem('homigo_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
