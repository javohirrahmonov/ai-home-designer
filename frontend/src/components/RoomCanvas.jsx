import axios from 'axios'
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva'
import { useState, useRef, useEffect } from 'react'

function RoomCanvas() {
  const [rooms, setRooms] = useState([])
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [selectedColor, setSelectedColor] = useState('#e74c3c')
  const [selectedSize, setSelectedSize] = useState({ width: 0, height: 0 })
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const stageRef = useRef()
  const WALL_THICKNESS = 10
  const GRID_SIZE = 20

  useEffect(() => {
    const getProject = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          'https://ai-homedesigner.onrender.com/api/project/default/',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setProjectId(res.data.id)
        const roomsRes = await axios.get(
          'https://ai-homedesigner.onrender.com/api/rooms/',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const furnitureRes = await axios.get(
          'https://ai-homedesigner.onrender.com/api/furniture/',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setRooms(roomsRes.data.map(room => ({
          id: room.id, x: room.x, y: room.y,
          width: room.width, height: room.height,
          name: room.name, type: 'room'
        })))
        setFurniture(furnitureRes.data.map(item => ({
          id: item.id, x: item.x, y: item.y,
          width: item.width, height: item.height,
          fill: item.color, name: item.name, type: 'furniture'
        })))
      } catch (err) {
        console.error(err)
      }
    }
    getProject()
  }, [])

  const addRoom = () => {
    setRooms([...rooms, {
      id: Date.now(), x: 50, y: 50,
      width: 200, height: 150, name: 'Room', type: 'room'
    }])
  }

  const addFurniture = (type) => {
    const items = {
      chair:  { width: 40,  height: 40,  fill: '#c8a97e', name: 'Chair' },
      table:  { width: 100, height: 60,  fill: '#8B6914', name: 'Table' },
      bed:    { width: 90,  height: 140, fill: '#7a9cc4', name: 'Bed' },
      sofa:   { width: 130, height: 55,  fill: '#7a7a8c', name: 'Sofa' },
      door:   { width: 40,  height: 10,  fill: '#ffffff', name: 'Door' },
      window: { width: 60,  height: 10,  fill: '#add8e6', name: 'Window' },
    }
    const item = items[type]
    setFurniture([...furniture, {
      id: Date.now(), x: 100, y: 100,
      ...item, type: 'furniture'
    }])
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    const item = furniture.find(f => f.id === id)
    if (item) {
      setSelectedColor(item.fill)
      setSelectedSize({ width: item.width, height: item.height })
      return
    }
    const room = rooms.find(r => r.id === id)
    if (room) {
      setSelectedSize({ width: room.width, height: room.height })
    }
  }

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null)
  }

  const updateRoom = (id, newProps) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...newProps } : r))
  }

  const updateFurniture = (id, newProps) => {
    setFurniture(furniture.map(f => f.id === id ? { ...f, ...newProps } : f))
  }

  const deleteSelected = () => {
    setRooms(rooms.filter(r => r.id !== selectedId))
    setFurniture(furniture.filter(f => f.id !== selectedId))
    setSelectedId(null)
  }

  const askAI = async () => {
    const currentMessage = aiMessage
    setAiLoading(true)
    setAiMessages(prev => [...prev, { role: 'user', text: currentMessage }])
    setAiMessage('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'https://ai-homedesigner.onrender.com/api/ai/suggest/',
        {
          message: currentMessage,
          existing_furniture: furniture.map(f => ({ name: f.name, x: f.x, y: f.y, width: f.width, height: f.height })),
          existing_rooms: rooms.map(r => ({ name: r.name, x: r.x, y: r.y, width: r.width, height: r.height }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAiResponse(res.data)
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: res.data.advice,
        suggestions: res.data.action === 'advice' ? res.data.suggestions : []
      }])
  
      const action = res.data.action
  
      if (action === 'delete' && res.data.deletions && res.data.deletions.length > 0) {
        const toDelete = res.data.deletions.map(n => n.toLowerCase())
        setFurniture(prev => prev.filter(f => !toDelete.includes(f.name.toLowerCase())))
  
      } else if (action === 'add' && res.data.suggestions) {
        setFurniture(prev => [...prev, ...res.data.suggestions.map((s, i) => ({
          id: Date.now() + i,
          x: s.x || 100 + i * 60,
          y: s.y || 100 + i * 60,
          width: s.width, height: s.height,
          fill: s.color, name: s.name, type: 'furniture'
        }))])
  
      } else if (action === 'replace' && res.data.replace_name) {
        const replaceName = res.data.replace_name.toLowerCase()
        setFurniture(prev => {
          const index = prev.findIndex(f => f.name.toLowerCase() === replaceName)
          if (index === -1) return prev
          const updated = [...prev]
          const s = res.data.suggestions[0]
          updated[index] = {
            ...updated[index],
            width: s.width, height: s.height,
            fill: s.color, name: s.name,
            x: s.x || updated[index].x,
            y: s.y || updated[index].y,
          }
          return updated
        })
  
      } else if (action === 'room' && res.data.room_changes) {
        res.data.room_changes.forEach(change => {
          const room = rooms.find(r => r.name.toLowerCase() === change.name.toLowerCase())
          if (room) updateRoom(room.id, {
            width: change.width || room.width,
            height: change.height || room.height
          })
        })
      }
  
    } catch (err) { console.error(err) }
    setAiLoading(false)
  }

  const saveDesign = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'https://ai-homedesigner.onrender.com/api/design/save/',
        { rooms, furniture },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Design saved!')
    } catch (err) {
      alert('Error saving design')
    }
  }

  const drawGrid = () => {
    const lines = []
    const w = window.innerWidth
    const h = window.innerHeight
    for (let i = 0; i < w / GRID_SIZE; i++) {
      lines.push(<Line key={`v${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, h]} stroke="#e0dbd0" strokeWidth={0.5} />)
    }
    for (let i = 0; i < h / GRID_SIZE; i++) {
      lines.push(<Line key={`h${i}`} points={[0, i * GRID_SIZE, w, i * GRID_SIZE]} stroke="#e0dbd0" strokeWidth={0.5} />)
    }
    return lines
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      <div style={{ padding: '8px 12px', background: '#2c3e50', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={addRoom} style={{ padding: '6px 12px', background: '#34495e', color: 'white', border: '1px solid #4a6278', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>+ Room</button>
        <div style={{ width: '1px', height: '24px', background: '#4a6278' }} />
        <button onClick={() => addFurniture('chair')}  style={{ padding: '6px 12px', background: '#c8a97e', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Chair</button>
        <button onClick={() => addFurniture('table')}  style={{ padding: '6px 12px', background: '#8B6914', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Table</button>
        <button onClick={() => addFurniture('bed')}    style={{ padding: '6px 12px', background: '#7a9cc4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Bed</button>
        <button onClick={() => addFurniture('sofa')}   style={{ padding: '6px 12px', background: '#7a7a8c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Sofa</button>
        <button onClick={() => addFurniture('door')}   style={{ padding: '6px 12px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Door</button>
        <button onClick={() => addFurniture('window')} style={{ padding: '6px 12px', background: '#add8e6', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Window</button>
        <div style={{ width: '1px', height: '24px', background: '#4a6278' }} />
        {selectedId && (
          <>
            <button onClick={deleteSelected} style={{ padding: '6px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
            <input type="color" value={selectedColor} onChange={e => {
              setSelectedColor(e.target.value)
              setFurniture(furniture.map(f => f.id === selectedId ? { ...f, fill: e.target.value } : f))
            }} style={{ height: '30px', width: '40px', cursor: 'pointer', border: 'none', borderRadius: '4px' }} />
            <input type="number" value={selectedSize.width} onChange={e => {
              const w = parseInt(e.target.value)
              setSelectedSize({ ...selectedSize, width: w })
              if (furniture.find(f => f.id === selectedId)) {
                setFurniture(furniture.map(f => f.id === selectedId ? { ...f, width: w } : f))
              } else {
                setRooms(rooms.map(r => r.id === selectedId ? { ...r, width: w } : r))
              }
            }} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #4a6278', background: '#34495e', color: 'white', fontSize: '13px' }} placeholder="W" />
            <input type="number" value={selectedSize.height} onChange={e => {
              const h = parseInt(e.target.value)
              setSelectedSize({ ...selectedSize, height: h })
              if (furniture.find(f => f.id === selectedId)) {
                setFurniture(furniture.map(f => f.id === selectedId ? { ...f, height: h } : f))
              } else {
                setRooms(rooms.map(r => r.id === selectedId ? { ...r, height: h } : r))
              }
            }} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #4a6278', background: '#34495e', color: 'white', fontSize: '13px' }} placeholder="H" />
          </>
        )}
        <button onClick={saveDesign} style={{ padding: '6px 16px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginLeft: 'auto' }}>Save Design</button>
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 180}
        ref={stageRef}
        onMouseDown={handleDeselect}
        style={{ background: '#f5f0e8' }}
      >
        <Layer>
          {drawGrid()}
          {rooms.map(room => (
            <Group key={room.id} x={room.x} y={room.y} draggable
              onClick={() => handleSelect(room.id)}
              onDragEnd={e => updateRoom(room.id, { x: e.target.x(), y: e.target.y() })}
            >
              <Rect x={0} y={0} width={room.width} height={room.height}
                fill="#f9f6f0" stroke={selectedId === room.id ? '#3498db' : '#2c3e50'}
                strokeWidth={WALL_THICKNESS} cornerRadius={2}
              />
              <Text x={14} y={14} text={room.name} fontSize={12} fill="#666" fontStyle="italic" />
              <Text x={room.width / 2 - 20} y={room.height + 4} text={`${room.width}px`} fontSize={10} fill="#999" />
            </Group>
          ))}
          {furniture.map(item => (
            <Group key={item.id} x={item.x} y={item.y} draggable
              onClick={() => handleSelect(item.id)}
              onDragEnd={e => updateFurniture(item.id, { x: e.target.x(), y: e.target.y() })}
            >
              <Rect x={0} y={0} width={item.width} height={item.height}
                fill={item.fill} stroke={selectedId === item.id ? '#3498db' : '#555'}
                strokeWidth={selectedId === item.id ? 2 : 1}
                cornerRadius={item.name === 'Chair' ? 4 : 2} opacity={0.9}
              />
              <Text x={item.width / 2 - 20} y={item.height / 2 - 6}
                text={item.name} fontSize={10} fill="#333" width={40} align="center"
              />
            </Group>
          ))}
        </Layer>
      </Stage>

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {aiOpen && (
          <div style={{
            position: 'absolute', bottom: '70px', right: '0',
            width: '380px', background: '#1a252f', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #2c3e50'
          }}>
            <div style={{ padding: '12px 16px', background: '#2c3e50', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>AI Designer</span>
              <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {aiMessages.length === 0 && (
                <p style={{ color: '#a0aec0', fontSize: '13px', textAlign: 'center' }}>Ask me anything about your room design!</p>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '10px', display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ background: msg.role === 'user' ? '#8e44ad' : '#2c3e50', color: 'white', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', maxWidth: '260px', lineHeight: '1.4' }}>
                      {msg.text}
                    </div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {msg.suggestions.map((s, j) => (
                          <button key={j} onClick={() => {
                            setFurniture(prev => [...prev, {
                              id: Date.now() + j, x: s.x || 100, y: s.y || 100,
                              width: s.width, height: s.height,
                              fill: s.color, name: s.name, type: 'furniture'
                            }])
                          }} style={{ padding: '4px 10px', background: s.color || '#8e44ad', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '12px' }}>
                            + {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ color: '#a0aec0', fontSize: '13px', padding: '4px 0' }}>AI is thinking...</div>
              )}
            </div>

            <div style={{ padding: '10px 12px', borderTop: '1px solid #2c3e50', display: 'flex', gap: '8px' }}>
              <input
                placeholder="Ask AI..."
                value={aiMessage}
                onChange={e => setAiMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askAI()}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #2c3e50', background: '#2c3e50', color: 'white', fontSize: '13px' }}
              />
              <button onClick={askAI} disabled={aiLoading}
                style={{ padding: '8px 12px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                Send
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setAiOpen(!aiOpen)} style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #8e44ad, #3498db)',
          border: 'none', cursor: 'pointer', fontSize: '24px',
          boxShadow: '0 4px 16px rgba(142,68,173,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          🤖
        </button>
      </div>
    </div>
  )
}

export default RoomCanvas