
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateChartColors } from '@/lib/data-utils';

export function LineChartView() {
  const { processedData, analysisConfig, comparisonData } = useDashboard();
  
  // Check if we should show comparison groups
  const showingComparisonGroups = analysisConfig.comparisonGroups.length > 0 && comparisonData && Object.keys(comparisonData).length > 0;
  
  // Format data for the chart
  const chartData = React.useMemo(() => {
    if (!showingComparisonGroups) {
      // For regular data without comparisons
      return processedData.map(item => {
        const dataPoint: any = {};
        
        // Add dimensions as the x-axis value
        if (analysisConfig.dimensions.length > 0) {
          const dimensionKey = analysisConfig.dimensions[0];
          dataPoint.xValue = item[dimensionKey] ?? item.customProperties?.[dimensionKey];
        }
        
        // Add metrics as the y-axis values
        analysisConfig.metrics.forEach(metric => {
          dataPoint[metric] = item[metric] ?? item.customProperties?.[metric];
        });
        
        return dataPoint;
      });
    }

    // For comparison groups
    const metrics = analysisConfig.metrics;
    const groupNames = Object.keys(comparisonData);

    // Create one data point per unique x-axis value (e.g., timestamp, category)
    const allXValues = new Set<string>();
    groupNames.forEach(groupName => {
      comparisonData[groupName].forEach(item => {
        metrics.forEach(metric => {
          const xValue = item[analysisConfig.dimensions[0]] ?? 
                        item.customProperties?.[analysisConfig.dimensions[0]] ??
                        'Unknown';
          allXValues.add(String(xValue));
        });
      });
    });

    return Array.from(allXValues).map(xValue => {
      const dataPoint: Record<string, any> = {
        xValue: xValue
      };

      groupNames.forEach(groupName => {
        const groupItems = comparisonData[groupName].filter(item => {
          const itemXValue = String(item[analysisConfig.dimensions[0]] ?? 
                                  item.customProperties?.[analysisConfig.dimensions[0]]);
          return itemXValue === xValue;
        });

        metrics.forEach(metric => {
          // Aggregate the values for this group and metric
          if (groupItems.length > 0) {
            const values = groupItems.map(item => 
              Number(item[metric] ?? item.customProperties?.[metric] ?? 0)
            ).filter(val => !isNaN(val));

            if (values.length > 0) {
              switch (analysisConfig.aggregationType) {
                case 'sum':
                  dataPoint[groupName] = values.reduce((sum, val) => sum + val, 0);
                  break;
                case 'average':
                  dataPoint[groupName] = values.reduce((sum, val) => sum + val, 0) / values.length;
                  break;
                case 'min':
                  dataPoint[groupName] = Math.min(...values);
                  break;
                case 'max':
                  dataPoint[groupName] = Math.max(...values);
                  break;
                case 'count':
                  dataPoint[groupName] = values.length;
                  break;
                default:
                  dataPoint[groupName] = values[0];
                  break;
              }
            }
          }
        });
      });

      return dataPoint;
    }).sort((a, b) => String(a.xValue).localeCompare(String(b.xValue)));
  }, [processedData, comparisonData, analysisConfig]);

  // Generate colors for the lines
  const colors = generateChartColors(
    showingComparisonGroups 
      ? Object.keys(comparisonData).length 
      : analysisConfig.metrics.length
  );

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  if (showingComparisonGroups) {
    const groupNames = Object.keys(comparisonData);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="xValue"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {groupNames.map((groupName, index) => (
            <Line
              key={groupName}
              type="monotone"
              dataKey={groupName}
              name={groupName}
              stroke={colors[index % colors.length]}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // For non-comparison data
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="xValue"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {analysisConfig.metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            name={metric}
            stroke={colors[index % colors.length]}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
