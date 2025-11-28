import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('apex-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store user data (in real app, this would be handled by backend)
    const users = JSON.parse(localStorage.getItem('apex-users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date().toISOString()
    };
    
    users.push({ ...newUser, password: userData.password });
    localStorage.setItem('apex-users', JSON.stringify(users));
    
    return { success: true, message: 'Account created successfully' };
  };

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('apex-users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    
    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email
    };
    
    setUser(sessionUser);
    localStorage.setItem('apex-user', JSON.stringify(sessionUser));
    
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apex-user');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

