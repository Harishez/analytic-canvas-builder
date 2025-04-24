
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateChartColors } from '@/lib/data-utils';

export function PieChartView() {
  const { processedData, analysisConfig, comparisonData } = useDashboard();
  
  // Check if we should show comparison groups
  const showingComparisonGroups = analysisConfig.comparisonGroups.length > 0 && comparisonData && Object.keys(comparisonData).length > 0;
  
  // Format data for the chart based on whether we're showing comparison groups
  const chartData = React.useMemo(() => {
    if (showingComparisonGroups) {
      return prepareComparisonData();
    } else {
      return prepareStandardData();
    }
  }, [processedData, comparisonData, analysisConfig]);
  
  // Prepare data for standard pie chart
  function prepareStandardData() {
    if (!processedData.length || !analysisConfig.metrics.length) return [];
    
    // For pie chart, we use the first metric and dimension
    const metric = analysisConfig.metrics[0];
    const dimension = analysisConfig.dimensions.length > 0 
      ? analysisConfig.dimensions[0] 
      : '';
    
    if (!dimension) return [];
    
    // For each unique dimension value, aggregate the metric
    const aggregatedData: Record<string, number> = {};
    
    processedData.forEach(item => {
      const dimValue = String(item[dimension] ?? item.customProperties?.[dimension] ?? 'Unknown');
      const metricValue = Number(item[metric] ?? item.customProperties?.[metric] ?? 0);
      
      if (!aggregatedData[dimValue]) {
        aggregatedData[dimValue] = 0;
      }
      
      aggregatedData[dimValue] += metricValue;
    });
    
    // Convert to array format for chart
    return Object.entries(aggregatedData).map(([name, value]) => ({
      name,
      value
    }));
  }
  
  // Prepare data for comparison groups pie chart
  function prepareComparisonData() {
    if (!analysisConfig.metrics.length) return [];
    
    const metric = analysisConfig.metrics[0];
    const groupNames = Object.keys(comparisonData);
    
    return groupNames.map(groupName => {
      const groupItems = comparisonData[groupName];
      
      // Aggregate data for this group based on selected aggregation type
      let value = 0;
      if (groupItems && groupItems.length > 0) {
        const values = groupItems
          .map(item => Number(item[metric] || item.customProperties?.[metric] || 0))
          .filter(val => !isNaN(val));
          
        if (values.length > 0) {
          switch (analysisConfig.aggregationType) {
            case 'sum':
              value = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'average':
              value = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'min':
              value = Math.min(...values);
              break;
            case 'max':
              value = Math.max(...values);
              break;
            case 'count':
              value = values.length;
              break;
            default:
              // For 'none', we'll just sum the values for pie chart visualization
              value = values.reduce((sum, val) => sum + val, 0);
              break;
          }
        }
      }
      
      return {
        name: groupName,
        value: value
      };
    });
  }
  
  // Generate chart colors
  const colors = generateChartColors(chartData.length);
  
  // Check if there's data to display
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {!analysisConfig.metrics.length 
            ? 'Select at least one metric and dimension for Pie Chart' 
            : 'No data available for visualization'}
        </p>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => Number(value).toLocaleString()} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
