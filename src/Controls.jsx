import { useTheme } from './ThemeContext'

const CHART_TYPES = ['bar', 'grouped_bar', 'line', 'scatter', 'bubble', 'histogram', 'pie']

function ColSelect({ label, value, columns, onChange, nullable, t }) {
  const style = { backgroundColor: t.inputBg, border: `1px solid ${t.border2}`, color: t.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', width: '100%' }
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: t.textSubtle }}>{label}</label>
      <select style={style} value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
        {nullable && <option value="">— none —</option>}
        {columns.map(c => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
      </select>
    </div>
  )
}

function TextInput({ label, value, onChange, t }) {
  const style = { backgroundColor: t.inputBg, border: `1px solid ${t.border2}`, color: t.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', width: '100%' }
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: t.textSubtle }}>{label}</label>
      <input type="text" style={style} value={value ?? ''} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export default function Controls({ spec, columns, onSpecChange, onReset }) {
  const { t } = useTheme()
  const selectStyle = { backgroundColor: t.inputBg, border: `1px solid ${t.border2}`, color: t.text, borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', width: '100%' }

  function update(key, val) {
    onSpecChange({ ...spec, [key]: val })
  }

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
      <div>
        <label className="block text-xs mb-1" style={{ color: t.textSubtle }}>Chart Type</label>
        <select style={selectStyle} value={spec.chart_type} onChange={e => update('chart_type', e.target.value)}>
          {CHART_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <ColSelect label="X Axis" value={spec.x} columns={columns} onChange={v => update('x', v)} t={t} />
      <ColSelect label="Y Axis" value={spec.y} columns={columns} onChange={v => update('y', v)} t={t} />

      {(spec.chart_type === 'grouped_bar' || spec.chart_type === 'line') && (
        <ColSelect label="Y2 Axis (optional)" value={spec.y2} columns={columns} onChange={v => update('y2', v)} nullable t={t} />
      )}
      {spec.chart_type === 'bubble' && (
        <ColSelect label="Bubble Size" value={spec.size} columns={columns} onChange={v => update('size', v)} nullable t={t} />
      )}
      {(spec.chart_type === 'scatter' || spec.chart_type === 'bubble' || spec.chart_type === 'bar' || spec.chart_type === 'grouped_bar') && (
        <ColSelect label="Color / Group" value={spec.color} columns={columns} onChange={v => update('color', v)} nullable t={t} />
      )}

      <hr style={{ borderColor: t.border }} />

      <TextInput label="Chart Title" value={spec.title} onChange={v => update('title', v)} t={t} />
      <TextInput label="X Label" value={spec.x_label} onChange={v => update('x_label', v)} t={t} />
      <TextInput label="Y Label" value={spec.y_label} onChange={v => update('y_label', v)} t={t} />

      <hr style={{ borderColor: t.border }} />

      <button onClick={onReset} className="w-full text-sm py-2 rounded-lg" style={{ backgroundColor: t.border, color: t.textMuted, border: `1px solid ${t.border2}` }}>
        Upload new file
      </button>
    </div>
  )
}
