
import React, { useContext, useState, useEffect, createContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  function signup(email, password) {
    // Simulate user registration
    const newUser = { email, password };
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return Promise.resolve();
  }

  function login(email, password) {
    // Simulate login authentication
    // In a real app, this would validate against your backend
    const user = { email };
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    return Promise.resolve();
  }

  function logout() {
    localStorage.removeItem('user');
    setCurrentUser(null);
    return Promise.resolve();
  }

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}