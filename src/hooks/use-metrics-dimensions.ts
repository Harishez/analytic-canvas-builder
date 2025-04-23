
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AnalysisConfig } from '@/types/analytics';

export function useMetricsDimensions(config: AnalysisConfig, setConfig: (config: AnalysisConfig) => void) {
  const { toast } = useToast();

  const addMetric = (field: string) => {
    if (!config.metrics.includes(field)) {
      setConfig({
        ...config,
        metrics: [...config.metrics, field]
      });
      toast({
        description: `Added ${field} as a metric`,
      });
    }
  };

  const removeMetric = (field: string) => {
    setConfig({
      ...config,
      metrics: config.metrics.filter(m => m !== field)
    });
  };

  const addDimension = (field: string) => {
    if (!config.dimensions.includes(field)) {
      setConfig({
        ...config,
        dimensions: [...config.dimensions, field]
      });
      toast({
        description: `Added ${field} as a dimension`,
      });
    }
  };

  const removeDimension = (field: string) => {
    setConfig({
      ...config,
      dimensions: config.dimensions.filter(d => d !== field)
    });
  };

  return {
    addMetric,
    removeMetric,
    addDimension,
    removeDimension
  };
}
