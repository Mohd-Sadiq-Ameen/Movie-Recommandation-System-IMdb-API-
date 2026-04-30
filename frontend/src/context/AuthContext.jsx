import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setLoading(false)
      return
    }
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`
      const res = await axios.get('http://localhost:5000/api/users/profile')
      setUser(res.data)
    } catch (err) {
      console.error('Profile fetch error', err)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserProfile(token)
  }, [token, fetchUserProfile])

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password })
      const { access_token } = res.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      const profileRes = await axios.get('http://localhost:5000/api/users/profile')
      setUser(profileRes.data)
      await new Promise(resolve => setTimeout(resolve, 100));
      setLoading(false)
      
      return { success: true, message: 'Login successful!' }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      return { success: false, message: errorMsg }
    }
  }

  const register = async (username, password) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password })
      return await login(username, password)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Username might already exist.'
      return { success: false, message: errorMsg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}