// src/contexts/AuthContext.jsx
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this package
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token')
      
      if (token) {
        try {
          const decodedToken = jwtDecode(token)
          
          const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
          const email = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
          const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid']
          
          setUser({
            id: userId,
            email: email,
            role: role
          })
          
          // Optionally, you can still fetch additional user details
          try {
            const profileResponse = await axios.get('https://localhost:7295/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            
            // Update user with full profile data
            setUser(prevUser => ({
              ...prevUser,
              ...profileResponse.data
            }))
          } catch (profileError) {
            console.error('Failed to fetch full profile:', profileError)
            // Continue with basic user info from token
          }
        } catch (error) {
          console.error('Failed to restore session:', error)
          // Clear invalid tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (userData) => {
    try {
      const response = await axios.post('https://localhost:7295/login', userData)
      
      const { accessToken, refreshToken } = response.data
      
      // Store tokens
      localStorage.setItem('access_token', accessToken.token)
      localStorage.setItem('refresh_token', refreshToken.token)
      
      // Decode token to get user role immediately
      const decodedToken = jwtDecode(accessToken.token)
      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
      
      // Set user in state
      setUser({
        email: userData.email,
        role: role
      })
      
      return { success: true, role: role }
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)