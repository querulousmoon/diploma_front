import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { metricsHistoryApi } from '@/api/metrics-history'
import Card from '@/components/ui/Card'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import './MetricsChart.css'

interface MetricsChartProps {
  serverId: number
}

interface ChartDataPoint {
  timestamp: string
  cpu?: number
  memory?: number
  disk?: number
  load1m?: number
  load5m?: number
  load15m?: number
  networkIn?: number
  networkOut?: number
  diskRead?: number
  diskWrite?: number
}

const MetricsChart = ({ serverId }: MetricsChartProps) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [metricType, setMetricType] = useState<'cpu' | 'memory' | 'disk' | 'network' | 'load' | 'disk_io'>('cpu')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aggregationLevel, setAggregationLevel] = useState<'minute' | 'hour' | 'day'>('minute')

  const fetchChartData = async () => {
    if (!serverId) return

    setLoading(true)
    setError(null)

    try {
      // For network metrics, we need to fetch both in and out separately

      // For network metrics, we need to fetch both in and out separately
      if (metricType === 'network') {
        const [inData, outData] = await Promise.all([
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'network_in',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          ),
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'network_out',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          )
        ]);
        
        // Transform and merge the data
        const timestamps = new Set([...inData.metrics.map(m => m.timestamp), ...outData.metrics.map(m => m.timestamp)]);
        const timestampArray = Array.from(timestamps).sort();
        
        const transformedData: ChartDataPoint[] = timestampArray.map(ts => {
          const inMetric = inData.metrics.find(m => m.timestamp === ts);
          const outMetric = outData.metrics.find(m => m.timestamp === ts);
          
          return {
            timestamp: ts,
            networkIn: inMetric?.value_avg ? inMetric.value_avg / (1024 * 1024) : undefined, // Convert to MB
            networkOut: outMetric?.value_avg ? outMetric.value_avg / (1024 * 1024) : undefined, // Convert to MB
          };
        });
        
        setChartData(transformedData);
      } else if (metricType === 'load') {
        // For load average metrics, we fetch all three at once
        const [load1mData, load5mData, load15mData] = await Promise.all([
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'load_average_1m',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          ),
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'load_average_5m',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          ),
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'load_average_15m',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          )
        ]);
        
        // Transform and merge the data
        const timestamps = new Set([
          ...load1mData.metrics.map(m => m.timestamp), 
          ...load5mData.metrics.map(m => m.timestamp),
          ...load15mData.metrics.map(m => m.timestamp)
        ]);
        const timestampArray = Array.from(timestamps).sort();
        
        const transformedData: ChartDataPoint[] = timestampArray.map(ts => {
          const load1m = load1mData.metrics.find(m => m.timestamp === ts);
          const load5m = load5mData.metrics.find(m => m.timestamp === ts);
          const load15m = load15mData.metrics.find(m => m.timestamp === ts);
          
          return {
            timestamp: ts,
            load1m: load1m?.value_avg ?? undefined,
            load5m: load5m?.value_avg ?? undefined,
            load15m: load15m?.value_avg ?? undefined,
          };
        });
        
        setChartData(transformedData);
      } else if (metricType === 'disk_io') {
        // For disk I/O metrics
        const [readData, writeData] = await Promise.all([
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'disk_read',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          ),
          metricsHistoryApi.getHistoricalMetrics(
            serverId,
            'disk_write',
            timeRange,
            aggregationLevel as 'minute' | 'hour' | 'day'
          )
        ]);
        
        // Transform and merge the data
        const timestamps = new Set([...readData.metrics.map(m => m.timestamp), ...writeData.metrics.map(m => m.timestamp)]);
        const timestampArray = Array.from(timestamps).sort();
        
        const transformedData: ChartDataPoint[] = timestampArray.map(ts => {
          const readMetric = readData.metrics.find(m => m.timestamp === ts);
          const writeMetric = writeData.metrics.find(m => m.timestamp === ts);
          
          return {
            timestamp: ts,
            diskRead: readMetric?.value_avg ? readMetric.value_avg / (1024 * 1024) : undefined, // Convert to MB
            diskWrite: writeMetric?.value_avg ? writeMetric.value_avg / (1024 * 1024) : undefined, // Convert to MB
          };
        });
        
        setChartData(transformedData);
      } else {
        let metricTypeParam = '';
        if (metricType === 'cpu') {
          metricTypeParam = 'cpu_percent';
        } else if (metricType === 'memory') {
          metricTypeParam = 'memory_percent';
        } else if (metricType === 'disk') {
          metricTypeParam = 'disk_percent';
        }

        const data = await metricsHistoryApi.getHistoricalMetrics(
          serverId,
          metricTypeParam,
          timeRange,
          aggregationLevel as 'minute' | 'hour' | 'day'
        );
        
        // Transform the data to the format expected by the chart
        const transformedData = data.metrics.map(metric => {
          const dataPoint: ChartDataPoint = {
            timestamp: metric.timestamp,
          };
          
          if (metricType === 'cpu' || metricType === 'memory' || metricType === 'disk') {
            dataPoint[metricType] = metric.value_avg ?? undefined;
          }
          
          return dataPoint;
        });
        
        setChartData(transformedData);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (serverId) {
      fetchChartData()
    }
  }, [serverId, timeRange, metricType, aggregationLevel])

  const getUnit = () => {
    if (['cpu', 'memory', 'disk'].includes(metricType)) return '%'
    if (['network', 'disk_io'].includes(metricType)) return 'MB/s'
    if (metricType === 'load') return ''  // Load averages are dimensionless
    return ''
  }

  const getFormattedData = () => {
    return chartData.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  }

  if (loading) {
    return (
      <Card className="metrics-chart-container">
        <LoadingState message="Loading metrics chart..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="metrics-chart-container">
        <ErrorState message={error} onRetry={fetchChartData} />
      </Card>
    )
  }

  return (
    <Card className="metrics-chart-container">
      <div className="metrics-chart-header">
        <h2 className="metrics-chart-title">Historical Metrics</h2>
        <div className="metrics-chart-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="metrics-chart-select"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
           <select 
            value={metricType} 
            onChange={(e) => setMetricType(e.target.value as any)}
            className="metrics-chart-select"
          >
            <option value="cpu">CPU Usage</option>
            <option value="memory">Memory Usage</option>
            <option value="disk">Disk Usage</option>
            <option value="network">Network Traffic</option>
            <option value="load">Load Average</option>
            <option value="disk_io">Disk I/O</option>
          </select>
          <select 
            value={aggregationLevel} 
            onChange={(e) => setAggregationLevel(e.target.value as any)}
            className="metrics-chart-select"
          >
            <option value="minute">Minute</option>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>

      <div className="metrics-chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={getFormattedData()}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis unit={getUnit()} />
            <Tooltip 
              formatter={(value, name) => [
                Number(value).toFixed(2) + (getUnit() || ''), 
                name === 'cpu' ? 'CPU Usage' : 
                name === 'memory' ? 'Memory Usage' : 
                name === 'disk' ? 'Disk Usage' : 
                name === 'networkIn' ? 'Network In' : 
                name === 'networkOut' ? 'Network Out' : 
                name === 'load1m' ? 'Load Avg (1m)' : 
                name === 'load5m' ? 'Load Avg (5m)' : 
                name === 'load15m' ? 'Load Avg (15m)' : 
                name === 'diskRead' ? 'Disk Read' : 
                name === 'diskWrite' ? 'Disk Write' : name
              ]}
            />
            <Legend />
            {metricType === 'cpu' && <Line type="monotone" dataKey="cpu" stroke="#3b82f6" activeDot={{ r: 8 }} />}
            {metricType === 'memory' && <Line type="monotone" dataKey="memory" stroke="#10b981" activeDot={{ r: 8 }} />}
            {metricType === 'disk' && <Line type="monotone" dataKey="disk" stroke="#f59e0b" activeDot={{ r: 8 }} />}
            {metricType === 'network' && (
              <>
                <Line type="monotone" dataKey="networkIn" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="networkOut" stroke="#ef4444" activeDot={{ r: 8 }} />
              </>
            )}
            {metricType === 'load' && (
              <>
                <Line type="monotone" dataKey="load1m" stroke="#22c55e" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="load5m" stroke="#eab308" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="load15m" stroke="#f97316" activeDot={{ r: 8 }} />
              </>
            )}
            {metricType === 'disk_io' && (
              <>
                <Line type="monotone" dataKey="diskRead" stroke="#c026d3" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="diskWrite" stroke="#db2777" activeDot={{ r: 8 }} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default MetricsChart