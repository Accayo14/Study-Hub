import { createContext, useContext } from 'react';

// Kept apart from AuthProvider so that file only exports a component, which is
// what React Fast Refresh needs to hot-reload it.
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
