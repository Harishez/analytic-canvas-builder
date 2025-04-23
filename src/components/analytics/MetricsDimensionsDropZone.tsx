
import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DropZone } from './DropZone';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function MetricsDimensionsDropZone() {
  const { 
    analysisConfig, 
    removeMetric, 
    removeDimension,
    fields,
    handleFieldDrop
  } = useDashboard();
  
  // Find field objects by name
  const getFieldByName = (name: string) => {
    return fields.find(field => field.name === name);
  };

  // Handlers for field drops
  const handleMetricDrop = (item: any) => {
    handleFieldDrop(item.name, 'metrics');
  };

  const handleDimensionDrop = (item: any) => {
    handleFieldDrop(item.name, 'dimensions');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-dashed border-gray-300 rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Metrics (Values to analyze)</h3>
        <DropZone 
          onDrop={handleMetricDrop}
          type="metrics"
          className="min-h-[100px] mb-4"
          empty={analysisConfig.metrics.length === 0}
        />
        
        {analysisConfig.metrics.length > 0 ? (
          <div className="space-y-2">
            {analysisConfig.metrics.map((metricName) => {
              const field = getFieldByName(metricName);
              const type = field?.type || 'unknown';
              
              // Determine color based on field type
              let colorClass = '';
              switch (type) {
                case 'number':
                  colorClass = 'bg-analytics-blue/10 border-analytics-blue/30 text-analytics-blue';
                  break;
                case 'string':
                  colorClass = 'bg-analytics-green/10 border-analytics-green/30 text-analytics-green';
                  break;
                case 'boolean':
                  colorClass = 'bg-analytics-purple/10 border-analytics-purple/30 text-analytics-purple';
                  break;
                default:
                  colorClass = 'bg-analytics-gray/10 border-analytics-gray/30 text-analytics-gray';
              }
              
              return (
                <div 
                  key={metricName}
                  className={cn(
                    'px-3 py-1.5 rounded-md border flex items-center justify-between',
                    colorClass
                  )}
                >
                  <span className="text-sm font-medium">{metricName}</span>
                  <button 
                    onClick={() => removeMetric(metricName)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Drag metrics here to analyze values
          </p>
        )}
      </div>
      
      <div className="border border-dashed border-gray-300 rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Dimensions (Group by)</h3>
        <DropZone 
          onDrop={handleDimensionDrop}
          type="dimensions"
          className="min-h-[100px] mb-4"
          empty={analysisConfig.dimensions.length === 0}
        />
        
        {analysisConfig.dimensions.length > 0 ? (
          <div className="space-y-2">
            {analysisConfig.dimensions.map((dimensionName) => {
              const field = getFieldByName(dimensionName);
              const type = field?.type || 'unknown';
              
              // Determine color based on field type
              let colorClass = '';
              switch (type) {
                case 'number':
                  colorClass = 'bg-analytics-blue/10 border-analytics-blue/30 text-analytics-blue';
                  break;
                case 'string':
                  colorClass = 'bg-analytics-green/10 border-analytics-green/30 text-analytics-green';
                  break;
                case 'boolean':
                  colorClass = 'bg-analytics-purple/10 border-analytics-purple/30 text-analytics-purple';
                  break;
                default:
                  colorClass = 'bg-analytics-gray/10 border-analytics-gray/30 text-analytics-gray';
              }
              
              return (
                <div 
                  key={dimensionName}
                  className={cn(
                    'px-3 py-1.5 rounded-md border flex items-center justify-between',
                    colorClass
                  )}
                >
                  <span className="text-sm font-medium">{dimensionName}</span>
                  <button 
                    onClick={() => removeDimension(dimensionName)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Drag dimensions here to group results
          </p>
        )}
      </div>
    </div>
  );
}
