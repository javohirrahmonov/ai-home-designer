import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('https://ai-homedesigner.onrender.com/api/register/', {
        username,
        password,
        email
      })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Try different username.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <input placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
        <div>
          <input placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
        <div>
          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Register</button>
      </form>
      <p>Already have account? <Link to="/login">Login here</Link></p>
    </div>
  )
}

export default Register