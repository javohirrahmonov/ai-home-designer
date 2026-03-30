import { useNavigate } from 'react-router-dom'

function Dashboard({ token, setToken }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AI Home Designer</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <p>Welcome! Your design canvas will appear here soon.</p>
    </div>
  )
}

export default Dashboard
