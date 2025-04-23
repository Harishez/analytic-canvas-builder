
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateChartColors } from '@/lib/data-utils';

export function AreaChartView() {
  const { processedData, analysisConfig } = useDashboard();
  
  // Format data for the chart (same as other chart components)
  const chartData = React.useMemo(() => {
    if (!processedData.length) return [];
    
    if (analysisConfig.aggregationType === 'none' || !analysisConfig.dimensions.length) {
      return processedData.slice(0, 50).map(item => {
        const dataPoint: any = {};
        
        // Add dimensions as labels
        analysisConfig.dimensions.forEach(dim => {
          const value = item[dim] ?? item.customProperties?.[dim];
          dataPoint[dim] = value;
        });
        
        // Add metrics as values
        analysisConfig.metrics.forEach(metric => {
          const value = item[metric] ?? item.customProperties?.[metric];
          dataPoint[metric] = value;
        });
        
        return dataPoint;
      });
    }
    
    return processedData;
  }, [processedData, analysisConfig]);
  
  // Generate chart colors
  const colors = generateChartColors(analysisConfig.metrics.length);
  
  // Check if there's data to display
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }
  
  // Determine dimension to use for x-axis
  const xAxisField = analysisConfig.dimensions.length > 0 ? analysisConfig.dimensions[0] : '';
  
  // Fields to chart as areas
  const fieldsToChart = analysisConfig.metrics.length > 0 
    ? analysisConfig.metrics 
    : Object.keys(chartData[0]).filter(k => typeof chartData[0][k] === 'number');
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisField} 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {fieldsToChart.map((field, index) => (
          <Area
            key={field}
            type="monotone"
            dataKey={field}
            name={field}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
