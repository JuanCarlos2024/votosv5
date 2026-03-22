import React, { createContext, useState } from 'react';
import uuid from 'react-native-uuid';
import usuarios from 'data/usuarios';

type Voto = {
  id_usuario?: string;
  nombre_usuario?: string;
  opcion: string;
  cantidad_votos: number;
  timestamp: string;
};

type Question = {
  id_pregunta: string;
  texto_pregunta: string;
  estado: 'activa' | 'cerrada' | 'unanimidad';
  fecha_creacion?: string;
  fecha_cierre?: string;
  votos: Voto[];
};

type UserData = {
  id_usuario: string;
  nombre_usuario: string;
  contraseña: string;
  votos_disponibles: number;
};

type DataContextType = {
  questions: Question[];
  loadQuestions: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id_pregunta' | 'votos'>) => Promise<void>;
  updateQuestion: (updated: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  approveByUnanimity: (id: string) => Promise<void>;
  voteOnQuestion: (id_pregunta: string, voteData: Voto) => Promise<void>;
  getQuestionById: (id: string) => Promise<Question | undefined>;
  getLastClosedQuestion: () => Question | undefined;
  users: UserData[];
  addUser: (userData: UserData) => Promise<void>;
  updateUser: (userData: UserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

export const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState(usuarios);

  const loadQuestions = async () => {
    setQuestions(prev => [...prev]);
  };

  const addQuestion = async (question) => {
    const newQuestion = {
      ...question,
      id_pregunta: uuid.v4(),
      votos: [],
    };
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const updateQuestion = async (updated) => {
    // Only allow editing if there are no votes
    const question = questions.find(q => q.id_pregunta === updated.id_pregunta);
    if (question && question.votos?.length > 0) {
      throw new Error('No se puede editar una pregunta que ya tiene votos');
    }
    
    setQuestions(prev =>
      prev.map(q => (q.id_pregunta === updated.id_pregunta ? { ...q, ...updated } : q))
    );
  };

  const deleteQuestion = async (id) => {
    // Only allow deletion if there are no votes
    const question = questions.find(q => q.id_pregunta === id);
    if (question && question.votos?.length > 0) {
      throw new Error('No se puede eliminar una pregunta que ya tiene votos');
    }
    
    setQuestions(prev => prev.filter(q => q.id_pregunta !== id));
  };

  const approveByUnanimity = async (id) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id_pregunta === id) {
          return {
            ...q,
            estado: 'unanimidad',
            fecha_cierre: new Date().toISOString(),
            votos: [
              {
                opcion: 'apruebo',
                cantidad_votos: users.reduce((sum, user) => sum + user.votos_disponibles, 0),
                timestamp: new Date().toISOString(),
                nombre_usuario: 'Aprobación Unánime'
              }
            ]
          };
        }
        return q;
      })
    );
  };

  const voteOnQuestion = async (id_pregunta, voteData) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id_pregunta !== id_pregunta) return q;
        const updatedVotes = [...(q.votos || []), voteData];
        return { ...q, votos: updatedVotes };
      })
    );
  };

  const getQuestionById = async (id) => {
    return questions.find(q => q.id_pregunta === id);
  };

  const getLastClosedQuestion = () => {
    return questions
      .filter(q => q.estado === 'cerrada' || q.estado === 'unanimidad')
      .sort((a, b) => new Date(b.fecha_cierre ?? 0).getTime() - new Date(a.fecha_cierre ?? 0).getTime())[0];
  };

  // User management functions
  const addUser = async (userData) => {
    if (users.some(u => u.id_usuario === userData.id_usuario)) {
      throw new Error('Ya existe un usuario con ese ID');
    }

    const newUser = {
      ...userData,
      id_usuario: userData.id_usuario,
      contraseña: userData.contraseña,
      votos_disponibles: parseInt(userData.votos_disponibles),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (userData) => {
    setUsers(prev =>
      prev.map(u => (u.id_usuario === userData.id_usuario ? {
        ...u,
        ...userData,
        votos_disponibles: parseInt(userData.votos_disponibles)
      } : u))
    );
  };

  const deleteUser = async (id) => {
    // Check if user has voted in any active questions
    const hasActiveVotes = questions.some(q => 
      q.estado === 'activa' && 
      q.votos?.some(v => v.id_usuario === id)
    );

    if (hasActiveVotes) {
      throw new Error('No se puede eliminar un usuario que tiene votos en preguntas activas');
    }

    setUsers(prev => prev.filter(u => u.id_usuario !== id));
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        loadQuestions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        approveByUnanimity,
        voteOnQuestion,
        getQuestionById,
        users,
        addUser,
        updateUser,
        deleteUser,
        getLastClosedQuestion,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};