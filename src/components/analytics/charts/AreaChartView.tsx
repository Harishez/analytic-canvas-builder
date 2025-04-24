
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
  const { processedData, analysisConfig, comparisonData } = useDashboard();
  
  // Check if we should show comparison groups
  const showingComparisonGroups = analysisConfig.comparisonGroups.length > 0 && comparisonData && Object.keys(comparisonData).length > 0;
  
  // Format data for the chart
  const chartData = React.useMemo(() => {
    if (showingComparisonGroups) {
      return prepareComparisonData();
    } else {
      return prepareStandardData();
    }
  }, [processedData, comparisonData, analysisConfig]);
  
  // Prepare data for standard area chart
  function prepareStandardData() {
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
  }
  
  // Prepare data for comparison groups area chart
  function prepareComparisonData() {
    const metrics = analysisConfig.metrics;
    if (!metrics.length) return [];
    
    const groupNames = Object.keys(comparisonData);
    
    // For comparison data with area chart, we'll create one data point per metric
    return metrics.map(metric => {
      const dataPoint: Record<string, any> = {
        metric: metric
      };
      
      groupNames.forEach(groupName => {
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
                // For 'none', just sum the values
                value = values.reduce((sum, val) => sum + val, 0);
                break;
            }
          }
        }
        
        dataPoint[groupName] = value;
      });
      
      return dataPoint;
    });
  }
  
  // Generate chart colors
  const colors = generateChartColors(showingComparisonGroups ? Object.keys(comparisonData).length : analysisConfig.metrics.length);
  
  // Check if there's data to display
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }
  
  // Determine what to render based on whether we're showing comparison groups
  if (showingComparisonGroups) {
    // For comparison groups, we use group names as the fields to chart
    const groupNames = Object.keys(comparisonData);
    
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
            dataKey="metric" 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {groupNames.map((groupName, index) => (
            <Area
              key={groupName}
              type="monotone"
              dataKey={groupName}
              name={groupName}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  } else {
    // Standard rendering for non-comparison data
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
}
