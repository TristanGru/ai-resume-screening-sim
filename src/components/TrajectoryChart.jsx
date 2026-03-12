import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

/* Screener identity colors — must match ScreenerCard.jsx and global.css tokens */
const SCREENER_COLORS = {
  s1: '#3730a3',
  s2: '#166534',
  s3: '#b45309',
  s4: '#1d4ed8',
  s5: '#991b1b',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ccc9c1',
        borderRadius: 5,
        padding: '10px 14px',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 2px 8px rgba(28,26,23,0.10)',
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6, color: '#1c1a17' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.stroke, margin: '2px 0' }}>
          {entry.dataKey}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function TrajectoryChart({ moveHistory }) {
  if (!moveHistory || moveHistory.length === 0) return null

  const chartData = moveHistory.map((move) => {
    const entry = { move: move.moveIndex === 0 ? 'Baseline' : `Move ${move.moveIndex}` }
    for (const result of move.results) {
      entry[result.name] = result.score
    }
    entry['Robust Score'] = move.robustScore
    return entry
  })

  const screenerNames = moveHistory[0].results.map((r) => r.name)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#e0ddd6" vertical={false} />
        <XAxis
          dataKey="move"
          tick={{ fontSize: 11, fill: '#8c8880', fontFamily: 'Inter, sans-serif' }}
          axisLine={{ stroke: '#ccc9c1' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#8c8880', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 60, 75, 100]}
        />
        {/* Passing threshold reference line */}
        <ReferenceLine
          y={60}
          stroke="#9e9b93"
          strokeDasharray="3 3"
          label={{ value: 'pass', position: 'right', fontSize: 10, fill: '#8c8880' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif', paddingTop: 12 }}
        />
        {screenerNames.map((name, i) => {
          const id = moveHistory[0].results[i].screenerID
          return (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={SCREENER_COLORS[id] || '#5c5852'}
              strokeWidth={1.75}
              dot={{ r: 3, strokeWidth: 0, fill: SCREENER_COLORS[id] || '#5c5852' }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          )
        })}
        <Line
          type="monotone"
          dataKey="Robust Score"
          stroke="#1c1a17"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: '#1c1a17', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
