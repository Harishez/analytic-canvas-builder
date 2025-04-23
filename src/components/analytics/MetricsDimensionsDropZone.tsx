
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropZone } from './DropZone';
import { useDashboard } from '@/contexts/DashboardContext';
import { DropZoneType } from '@/types/analytics';

interface MetricsDimensionsDropZoneProps {
  className?: string;
}

export function MetricsDimensionsDropZone({ className }: MetricsDimensionsDropZoneProps) {
  const { 
    analysisConfig, 
    handleFieldDrop, 
    removeMetric, 
    removeDimension 
  } = useDashboard();
  
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DropZone
          type="metrics"
          title="Metrics"
          onDrop={(item) => handleFieldDrop(item.name, 'metrics')}
          empty={analysisConfig.metrics.length === 0}
        >
          <div className="flex flex-wrap gap-2">
            {analysisConfig.metrics.map((metric) => (
              <Badge key={metric} variant="secondary" className="group">
                <span>{metric}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 opacity-60 group-hover:opacity-100"
                  onClick={() => removeMetric(metric)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </DropZone>
        
        <DropZone
          type="dimensions"
          title="Dimensions"
          onDrop={(item) => handleFieldDrop(item.name, 'dimensions')}
          empty={analysisConfig.dimensions.length === 0}
        >
          <div className="flex flex-wrap gap-2">
            {analysisConfig.dimensions.map((dimension) => (
              <Badge key={dimension} variant="outline" className="group">
                <span>{dimension}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 opacity-60 group-hover:opacity-100"
                  onClick={() => removeDimension(dimension)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </DropZone>
      </div>
    </div>
  );
}
