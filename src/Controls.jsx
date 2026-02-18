const CHART_TYPES = ['bar', 'grouped_bar', 'line', 'scatter', 'bubble', 'histogram', 'pie']

const inputStyle = {
  backgroundColor: '#161b22',
  border: '1px solid #30363d',
  color: '#e6edf3',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
}

function TextInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#6e7681' }}>{label}</label>
      <input
        type="text"
        style={inputStyle}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

const selectStyle = {
  backgroundColor: '#161b22',
  border: '1px solid #30363d',
  color: '#e6edf3',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
}

function ColSelect({ label, value, columns, onChange, nullable }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#6e7681' }}>{label}</label>
      <select style={selectStyle} value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
        {nullable && <option value="">— none —</option>}
        {columns.map(c => (
          <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
        ))}
      </select>
    </div>
  )
}

export default function Controls({ spec, columns, onSpecChange, onReset }) {
  function update(key, val) {
    onSpecChange({ ...spec, [key]: val })
  }

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
      {/* Chart type */}
      <div>
        <label className="block text-xs mb-1" style={{ color: '#6e7681' }}>Chart Type</label>
        <select style={selectStyle} value={spec.chart_type} onChange={e => update('chart_type', e.target.value)}>
          {CHART_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Column selectors */}
      <ColSelect label="X Axis" value={spec.x} columns={columns} onChange={v => update('x', v)} />
      <ColSelect label="Y Axis" value={spec.y} columns={columns} onChange={v => update('y', v)} />

      {(spec.chart_type === 'grouped_bar' || spec.chart_type === 'line') && (
        <ColSelect label="Y2 Axis (optional)" value={spec.y2} columns={columns} onChange={v => update('y2', v)} nullable />
      )}
      {spec.chart_type === 'bubble' && (
        <ColSelect label="Bubble Size" value={spec.size} columns={columns} onChange={v => update('size', v)} nullable />
      )}
      {(spec.chart_type === 'scatter' || spec.chart_type === 'bubble' || spec.chart_type === 'bar' || spec.chart_type === 'grouped_bar') && (
        <ColSelect label="Color / Group" value={spec.color} columns={columns} onChange={v => update('color', v)} nullable />
      )}

      <hr style={{ borderColor: '#21262d' }} />

      {/* Label editors */}
      <TextInput label="Chart Title" value={spec.title} onChange={v => update('title', v)} />
      <TextInput label="X Label" value={spec.x_label} onChange={v => update('x_label', v)} />
      <TextInput label="Y Label" value={spec.y_label} onChange={v => update('y_label', v)} />

      <hr style={{ borderColor: '#21262d' }} />

      <button
        onClick={onReset}
        className="w-full text-sm py-2 rounded-lg transition-colors"
        style={{ backgroundColor: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
        onMouseOver={e => e.currentTarget.style.color = '#e6edf3'}
        onMouseOut={e => e.currentTarget.style.color = '#8b949e'}
      >
        Upload new file
      </button>
    </div>
  )
}
