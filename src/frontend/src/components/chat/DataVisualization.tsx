import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { cn } from '@/lib/utils'

// Supply Chain color palette
const CHART_COLORS = [
  '#0d9488', // teal-600 (brand)
  '#0891b2', // cyan-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#c026d3', // fuchsia-600
  '#e11d48', // rose-600
  '#ea580c', // orange-600
  '#16a34a', // green-600
]

interface Column {
  name: string
  type?: string
}

interface DataVisualizationProps {
  columns: Column[]
  rows: unknown[][]
  className?: string
}

type ChartType = 'bar' | 'horizontalBar' | 'pie' | 'line' | 'metric' | 'none'

export default function DataVisualization({ columns, rows, className }: DataVisualizationProps) {
  // Transform rows into chart-friendly format
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0 || !columns || columns.length === 0) return []

    return rows.map(row => {
      const dataPoint: Record<string, unknown> = {}
      columns.forEach((col, idx) => {
        let value = row[idx]
        // Try to parse numeric values
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          value = parseFloat(value)
        }
        dataPoint[col.name] = value
      })
      return dataPoint
    })
  }, [columns, rows])

  // Determine if data should be visualized
  const shouldVisualize = useMemo(() => {
    if (!columns || columns.length === 0 || !rows || rows.length === 0) return false

    // Check if we have at least one numeric column
    const hasNumericData = rows.some(row =>
      row.some(cell => {
        const num = parseFloat(cell as string)
        return !isNaN(num) && isFinite(num)
      })
    )

    // Good for visualization if we have numeric data and reasonable size
    return hasNumericData && columns.length >= 2 && columns.length <= 5 && rows.length <= 50
  }, [columns, rows])

  // Determine the best chart type based on data
  const chartType = useMemo((): ChartType => {
    if (!shouldVisualize) return 'none'

    const numRows = rows.length
    const numCols = columns.length

    // Single row with single numeric value - show as metric
    if (numRows === 1 && numCols === 1) {
      return 'metric'
    }

    // Two columns - typically category + value
    if (numCols === 2) {
      // If we have many categories, use horizontal bar
      if (numRows > 5) {
        return 'horizontalBar'
      }
      // For pie chart: small number of categories
      if (numRows <= 6) {
        return 'pie'
      }
      return 'bar'
    }

    // Three columns - could be time series or comparison
    if (numCols === 3) {
      // Check if first column looks like a date/time
      const firstVal = rows[0]?.[0]
      if (typeof firstVal === 'string' && (firstVal.match(/\d{4}/) || firstVal.toLowerCase().includes('q'))) {
        return 'line'
      }
      return 'bar'
    }

    return 'bar'
  }, [shouldVisualize, columns, rows])

  // Find numeric and label columns
  const { labelColumn, valueColumns } = useMemo(() => {
    if (!columns || columns.length === 0) {
      return { labelColumn: null, valueColumns: [] }
    }

    // First column is usually the label
    const label = columns[0]
    // Rest are values (filter to only numeric ones based on data)
    const values = columns.slice(1).filter((col, idx) => {
      const colIdx = idx + 1
      return rows.some(row => {
        const val = row[colIdx]
        const num = parseFloat(val as string)
        return !isNaN(num) && isFinite(num)
      })
    })

    return { labelColumn: label, valueColumns: values }
  }, [columns, rows])

  // Format numbers for display
  const formatValue = (value: number): string => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!shouldVisualize || chartType === 'none') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className={cn('mt-4', className)}
    >
      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
        <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">Data Visualization</span>
        </div>

        <div className="p-4">
          {/* Metric Card */}
          {chartType === 'metric' && chartData.length === 1 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              className="text-center py-6"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-brand-teal to-cyan-500 bg-clip-text text-transparent">
                {formatValue(chartData[0][columns[0].name] as number)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {columns[0].name.replace(/_/g, ' ')}
              </div>
            </motion.div>
          )}

          {/* Bar Chart */}
          {chartType === 'bar' && labelColumn && valueColumns.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey={labelColumn.name}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {valueColumns.map((col, idx) => (
                  <Bar
                    key={col.name}
                    dataKey={col.name}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    animationBegin={idx * 100}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Horizontal Bar Chart */}
          {chartType === 'horizontalBar' && labelColumn && valueColumns.length > 0 && (
            <ResponsiveContainer width="100%" height={Math.max(280, rows.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis
                  type="category"
                  dataKey={labelColumn.name}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  width={90}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {valueColumns.map((col, idx) => (
                  <Bar
                    key={col.name}
                    dataKey={col.name}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    radius={[0, 4, 4, 0]}
                    animationBegin={idx * 100}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Pie Chart */}
          {chartType === 'pie' && labelColumn && valueColumns.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={valueColumns[0].name}
                  nameKey={labelColumn.name}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Line Chart */}
          {chartType === 'line' && labelColumn && valueColumns.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey={labelColumn.name}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {valueColumns.map((col, idx) => (
                  <Line
                    key={col.name}
                    type="monotone"
                    dataKey={col.name}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationBegin={idx * 100}
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  )
}
