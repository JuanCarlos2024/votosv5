import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import usuarios from 'data/usuarios';
import admin from 'data/admin';

type User = {
  id_usuario: string;
  nombre_usuario: string;
  votos_disponibles?: number;
  rol: 'usuario' | 'administrador';
};

type AuthContextType = {
  user: User | null;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserVotes: (newVotes: number) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  updateUserVotes: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {}, []);

  const login = async (id: string, password: string): Promise<boolean> => {
    try {
      if (id === admin.id_usuario && password === admin.contraseña_usuario) {
        setUser({
          id_usuario: admin.id_usuario,
          nombre_usuario: admin.nombre_usuario,
          rol: 'administrador',
        });
        return true;
      }

      const foundUser = usuarios.find(
        (u) => u.id_usuario === id && u.contraseña === password
      );

      if (foundUser) {
        setUser({
          id_usuario: foundUser.id_usuario,
          nombre_usuario: foundUser.nombre_usuario,
          votos_disponibles: foundUser.votos_disponibles,
          rol: 'usuario',
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserVotes = (newVotes: number) => {
    if (user && user.rol === 'usuario') {
      setUser({ ...user, votos_disponibles: newVotes });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserVotes }}>
      {children}
    </AuthContext.Provider>
  );
};
