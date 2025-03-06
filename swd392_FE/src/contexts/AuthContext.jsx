// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react'
import { loginAPI } from '../apis/authAPI'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = async (userData) => {
    try {
      const response = await loginAPI(userData)
      
      // Store both tokens from the response we see in your API
      localStorage.setItem('access_token', response.data.accessToken.token)
      localStorage.setItem('refresh_token', response.data.refreshToken.token)
      
      setUser(userData)
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)