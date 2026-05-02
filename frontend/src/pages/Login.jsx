import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    const result = await login(username, password)

    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => {
        navigate('/app')
      }, 500)
    } else {
      setError(result.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>

        {error && (
          <div className="bg-red-600 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded disabled:opacity-50 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Don't have an account? <Link to="/register" className="text-red-500">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login