import { Link } from 'react-router-dom'

function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
      
      <div style={{ fontSize: '60px', marginBottom: '10px' }}>🏠</div>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px', background: 'linear-gradient(90deg, #e96c6c, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        AI Home Designer
      </h1>
      <p style={{ fontSize: '20px', color: '#a0aec0', maxWidth: '500px', marginBottom: '40px', lineHeight: '1.6' }}>
        Design your dream home with the power of AI. Drag, drop, and let AI suggest the perfect furniture for your space.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
        <Link to="/register">
          <button style={{ padding: '14px 32px', fontSize: '16px', background: 'linear-gradient(90deg, #e96c6c, #a78bfa)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Get Started Free
          </button>
        </Link>
        <Link to="/login">
          <button style={{ padding: '14px 32px', fontSize: '16px', background: 'transparent', border: '2px solid #a78bfa', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '🛋️', title: 'Drag & Drop', desc: 'Place furniture anywhere on your canvas' },
          { icon: '🤖', title: 'AI Suggestions', desc: 'Describe your vision, AI does the rest' },
          { icon: '🎨', title: 'Customize', desc: 'Change colors, sizes and styles freely' },
        ].map((feature, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', maxWidth: '200px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{feature.icon}</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{feature.title}</h3>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '14px' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home