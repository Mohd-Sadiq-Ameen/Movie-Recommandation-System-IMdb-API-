import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Show loading indicator while checking auth
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // If authenticated, render children
  return children
}

export default PrivateRoute