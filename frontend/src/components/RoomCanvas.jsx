import axios from 'axios'
import { Stage, Layer, Rect } from 'react-konva'
import { useState, useRef, useEffect } from 'react'

function RoomCanvas() {
  const [rooms, setRooms] = useState([])
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [tool, setTool] = useState('select')
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [selectedColor, setSelectedColor] = useState('#e74c3c')
  const [selectedSize, setSelectedSize] = useState({ width: 0, height: 0 })
  const transformerRef = useRef()
  const stageRef = useRef()

  useEffect(() => {
    const getProject = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          'http://127.0.0.1:8000/api/project/default/',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setProjectId(res.data.id)
  
        const roomsRes = await axios.get(
          'http://127.0.0.1:8000/api/rooms/',
          { headers: { Authorization: `Bearer ${token}` } }
        )
  
        const furnitureRes = await axios.get(
          'http://127.0.0.1:8000/api/furniture/',
          { headers: { Authorization: `Bearer ${token}` } }
        )
  
        const loadedRooms = roomsRes.data.map(room => ({
          id: room.id,
          x: room.x,
          y: room.y,
          width: room.width,
          height: room.height,
          fill: '#e8f4f8',
          stroke: '#2c3e50',
          type: 'room',
          name: room.name
        }))
  
        const loadedFurniture = furnitureRes.data.map(item => ({
          id: item.id,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fill: item.color,
          name: item.name,
          type: 'furniture'
        }))
  
        setRooms(loadedRooms)
        setFurniture(loadedFurniture)
      } catch (err) {
        console.error(err)
      }
    }
    getProject()
  }, [])

  const addRoom = () => {
    const newRoom = {
      id: Date.now(), x: 50, y: 50, width: 200, height: 150,
      fill: '#e8f4f8', stroke: '#2c3e50', type: 'room', name: 'Room'
    }
    setRooms([...rooms, newRoom])
  }

  const addFurniture = (type) => {
    const items = {
      chair: { width: 40, height: 40, fill: '#e74c3c', name: 'Chair' },
      table: { width: 80, height: 60, fill: '#e67e22', name: 'Table' },
      bed: { width: 80, height: 120, fill: '#9b59b6', name: 'Bed' },
      sofa: { width: 120, height: 50, fill: '#27ae60', name: 'Sofa' },
    }
    const item = items[type]
    setFurniture([...furniture, { id: Date.now(), x: 100, y: 100, ...item, type: 'furniture' }])
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    const item = furniture.find(f => f.id === id)
    if (item) {
      setSelectedColor(item.fill)
      setSelectedSize({ width: item.width, height: item.height })
    }
  }

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null)
  }

  const updateItem = (id, newProps, isRoom) => {
    if (isRoom) setRooms(rooms.map(r => r.id === id ? { ...r, ...newProps } : r))
    else setFurniture(furniture.map(f => f.id === id ? { ...f, ...newProps } : f))
  }

  const deleteSelected = () => {
    setRooms(rooms.filter(r => r.id !== selectedId))
    setFurniture(furniture.filter(f => f.id !== selectedId))
    setSelectedId(null)
  }

  const askAI = async () => {
    setAiLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://127.0.0.1:8000/api/ai/suggest/',
        { message: aiMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAiResponse(res.data)
    } catch (err) {
      console.error(err)
    }
    setAiLoading(false)
  }

  const saveDesign = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://127.0.0.1:8000/api/design/save/',
        { rooms, furniture },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Design saved!')
    } catch (err) {
      console.error(err)
      alert('Error saving design')
    }
  }

  return (
    <div>
      <div style={{ padding: '10px', background: '#f5f5f5', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={addRoom} style={{ padding: '8px 12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Room</button>
        <button onClick={() => addFurniture('chair')} style={{ padding: '8px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Chair</button>
        <button onClick={() => addFurniture('table')} style={{ padding: '8px 12px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Table</button>
        <button onClick={() => addFurniture('bed')} style={{ padding: '8px 12px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Bed</button>
        <button onClick={() => addFurniture('sofa')} style={{ padding: '8px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Sofa</button>
        {selectedId && (
          <>
            <button onClick={deleteSelected} style={{ padding: '8px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete Selected</button>
            <input type="color" value={selectedColor} onChange={e => {
              setSelectedColor(e.target.value)
              setFurniture(furniture.map(f => f.id === selectedId ? { ...f, fill: e.target.value } : f))
            }} style={{ height: '36px', width: '48px', cursor: 'pointer', border: 'none', borderRadius: '4px' }} title="Change color" />
            <input type="number" value={selectedSize.width} onChange={e => {
              const w = parseInt(e.target.value)
              setSelectedSize({ ...selectedSize, width: w })
              setFurniture(furniture.map(f => f.id === selectedId ? { ...f, width: w } : f))
            }} style={{ width: '70px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="Width" />
            <input type="number" value={selectedSize.height} onChange={e => {
              const h = parseInt(e.target.value)
              setSelectedSize({ ...selectedSize, height: h })
              setFurniture(furniture.map(f => f.id === selectedId ? { ...f, height: h } : f))
            }} style={{ width: '70px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="Height" />
          </>
        )}
        <button onClick={saveDesign} style={{ padding: '8px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>Save Design</button>
      </div>

      <Stage
        width={window.innerWidth - 40}
        height={window.innerHeight - 220}
        ref={stageRef}
        onMouseDown={handleDeselect}
        style={{ background: 'white', border: '1px solid #ddd' }}
      >
        <Layer>
          {rooms.map(room => (
            <Rect key={room.id} x={room.x} y={room.y} width={room.width} height={room.height}
              fill={room.fill} stroke={selectedId === room.id ? '#3498db' : room.stroke}
              strokeWidth={selectedId === room.id ? 3 : 1} draggable
              onClick={() => handleSelect(room.id)}
              onDragEnd={e => updateItem(room.id, { x: e.target.x(), y: e.target.y() }, true)}
            />
          ))}
          {furniture.map(item => (
            <Rect key={item.id} x={item.x} y={item.y} width={item.width} height={item.height}
              fill={item.fill} stroke={selectedId === item.id ? '#3498db' : '#333'}
              strokeWidth={selectedId === item.id ? 3 : 1} draggable cornerRadius={4}
              onClick={() => handleSelect(item.id)}
              onDragEnd={e => updateItem(item.id, { x: e.target.x(), y: e.target.y() }, false)}
            />
          ))}
        </Layer>
      </Stage>

      <div style={{ padding: '10px', background: '#ecf0f1', borderTop: '1px solid #ddd', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            placeholder="Describe what you need... e.g. I need a comfortable chair near the window"
            value={aiMessage}
            onChange={e => setAiMessage(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button onClick={askAI} disabled={aiLoading}
            style={{ padding: '8px 16px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
        {aiResponse && (
          <div style={{ flex: 1, background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>AI Advice:</p>
            <p style={{ margin: '0 0 8px' }}>{aiResponse.advice}</p>
            <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>Suggestions:</p>
            {aiResponse.suggestions && aiResponse.suggestions.map((s, i) => (
              <button key={i}
                onClick={() => setFurniture([...furniture, { id: Date.now(), x: 100, y: 100, width: s.width, height: s.height, fill: s.color, name: s.name }])}
                style={{ margin: '4px', padding: '6px 10px', background: s.color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                + {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomCanvas