import { Stage, Layer, Rect, Text, Transformer } from 'react-konva'
import { useState, useRef, useEffect } from 'react'

const GRID_SIZE = 20

function RoomCanvas() {
  const [rooms, setRooms] = useState([])
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [tool, setTool] = useState('select')
  const transformerRef = useRef()
  const stageRef = useRef()

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      fill: '#e8f4f8',
      stroke: '#2c3e50',
      type: 'room',
      name: 'Room'
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
    const newItem = {
      id: Date.now(),
      x: 100,
      y: 100,
      ...item,
      type: 'furniture'
    }
    setFurniture([...furniture, newItem])
  }

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }

  const updateItem = (id, newProps, isRoom) => {
    if (isRoom) {
      setRooms(rooms.map(r => r.id === id ? { ...r, ...newProps } : r))
    } else {
      setFurniture(furniture.map(f => f.id === id ? { ...f, ...newProps } : f))
    }
  }

  const deleteSelected = () => {
    setRooms(rooms.filter(r => r.id !== selectedId))
    setFurniture(furniture.filter(f => f.id !== selectedId))
    setSelectedId(null)
  }

  return (
    <div>
      <div style={{ padding: '10px', background: '#f5f5f5', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={addRoom} style={{ padding: '8px 12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Room
        </button>
        <button onClick={() => addFurniture('chair')} style={{ padding: '8px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Chair
        </button>
        <button onClick={() => addFurniture('table')} style={{ padding: '8px 12px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Table
        </button>
        <button onClick={() => addFurniture('bed')} style={{ padding: '8px 12px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Bed
        </button>
        <button onClick={() => addFurniture('sofa')} style={{ padding: '8px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Sofa
        </button>
        {selectedId && (
          <button onClick={deleteSelected} style={{ padding: '8px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Delete Selected
          </button>
        )}
      </div>

      <Stage
        width={window.innerWidth - 40}
        height={window.innerHeight - 120}
        ref={stageRef}
        onMouseDown={handleDeselect}
        style={{ background: 'white', border: '1px solid #ddd' }}
      >
        <Layer>
          {rooms.map(room => (
            <Rect
              key={room.id}
              id={room.id.toString()}
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.fill}
              stroke={selectedId === room.id ? '#3498db' : room.stroke}
              strokeWidth={selectedId === room.id ? 3 : 1}
              draggable
              onClick={() => handleSelect(room.id)}
              onDragEnd={e => updateItem(room.id, { x: e.target.x(), y: e.target.y() }, true)}
            />
          ))}
          {furniture.map(item => (
            <Rect
              key={item.id}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              fill={item.fill}
              stroke={selectedId === item.id ? '#3498db' : '#333'}
              strokeWidth={selectedId === item.id ? 3 : 1}
              draggable
              onClick={() => handleSelect(item.id)}
              onDragEnd={e => updateItem(item.id, { x: e.target.x(), y: e.target.y() }, false)}
              cornerRadius={4}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}

export default RoomCanvas