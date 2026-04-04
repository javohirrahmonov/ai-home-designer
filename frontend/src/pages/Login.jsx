import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('https://ai-homedesigner.onrender.com/api/token/', {
        username,
        password
      })
      localStorage.setItem('token', res.data.access)
      setToken(res.data.access)
      navigate('/dashboard')
    } catch (err) {
      setError('Wrong username or password')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <input placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
        <div>
          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Login</button>
      </form>
      <p>No account? <Link to="/register">Register here</Link></p>
    </div>
  )
}

export default Login