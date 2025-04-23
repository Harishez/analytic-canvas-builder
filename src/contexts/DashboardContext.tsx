import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardContextType } from './types';
import { useMetricsDimensions } from '@/hooks/use-metrics-dimensions';
import { useConditions } from '@/hooks/use-conditions';
import { useComparisonGroups } from '@/hooks/use-comparison-groups';
import { parseCustomProperties, filterData, groupDataForComparison, aggregateData } from '@/lib/data-utils';
import { AnalysisConfig, ProcessedDataItem, RawDataItem, VisualizationType, AggregationType, FieldItem } from '@/types/analytics';
import { v4 as uuidv4 } from 'uuid';

// Default analysis configuration
const defaultAnalysisConfig: AnalysisConfig = {
  metrics: [], 
  dimensions: [], 
  conditions: [], 
  comparisonGroups: [],
  visualization: 'bar',
  aggregationType: 'sum'
};

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export function DashboardProvider({ children, initialData = [] }: { children: ReactNode, initialData?: any[] }) {
  const [rawData, setRawData] = useState<RawDataItem[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(defaultAnalysisConfig);
  const { toast } = useToast();

  // Initialize custom hooks
  const metricsDimensions = useMetricsDimensions(analysisConfig, setAnalysisConfig);
  const conditions = useConditions(analysisConfig, setAnalysisConfig);
  const comparisonGroups = useComparisonGroups(analysisConfig, setAnalysisConfig);
  
  // Initialize with raw data
  const updateRawData = (data: any) => {
    try {
      const dataArray = data.data?.result || data.result || data;
      const parsedData = parseCustomProperties(dataArray);
      setRawData(parsedData);
      
      console.log("Raw data updated:", parsedData);
      
      toast({
        title: "Data loaded successfully",
        description: `Loaded ${parsedData.length} records`,
      });
    } catch (error) {
      console.error("Error processing raw data:", error);
      setRawData([]);
      
      toast({
        title: "Error loading data",
        description: "Failed to process the provided data",
        variant: "destructive",
      });
    }
  };
  
  // Detect fields from raw data
  const fields = useMemo(() => {
    if (rawData.length === 0) {
      console.log("No raw data to extract fields from");
      return [];
    }
    
    const result: FieldItem[] = [];
    const sample = rawData[0];
    
    console.log("Sample data for field extraction:", sample);
    
    // Add regular fields (excluding customproperties which is raw string)
    Object.keys(sample).forEach(key => {
      if (key !== 'customproperties' && key !== 'customProperties') {
        const value = sample[key];
        result.push({
          id: uuidv4(),
          name: key,
          type: typeof value === 'number' ? 'number' 
               : typeof value === 'boolean' ? 'boolean'
               : typeof value === 'string' ? 'string'
               : 'unknown'
        });
      }
    });
    
    // Add custom property fields
    if (sample.customProperties) {
      console.log("Custom properties found:", sample.customProperties);
      Object.keys(sample.customProperties).forEach(key => {
        const value = sample.customProperties[key];
        result.push({
          id: uuidv4(),
          name: key,
          type: typeof value === 'number' ? 'number' 
               : typeof value === 'boolean' ? 'boolean'
               : typeof value === 'string' ? 'string'
               : 'unknown',
          category: 'customProperties'
        });
      });
    } else {
      console.log("No customProperties object found in the sample data");
    }
    
    console.log("Extracted fields:", result);
    return result;
  }, [rawData]);
  
  // Process data based on current configuration
  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    
    // Apply conditions
    let filteredData = rawData;
    if (analysisConfig.conditions.length > 0) {
      const conditions = analysisConfig.conditions.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value
      }));
      filteredData = filterData(rawData, conditions);
    }
    
    // Apply grouping/aggregation
    if (analysisConfig.aggregationType !== 'none' && 
        analysisConfig.metrics.length > 0 &&
        analysisConfig.dimensions.length > 0) {
      return aggregateData(
        filteredData, 
        analysisConfig.metrics, 
        analysisConfig.dimensions
      );
    }
    
    return filteredData;
  }, [rawData, analysisConfig]);
  
  // Visualization settings
  const setVisualizationType = (type: VisualizationType) => {
    setAnalysisConfig({
      ...analysisConfig,
      visualization: type
    });
  };
  
  const setAggregationType = (type: AggregationType) => {
    setAnalysisConfig({
      ...analysisConfig,
      aggregationType: type
    });
  };
  
  // Drag and drop handlers
  const handleFieldDrop = (field: string, dropZone: string) => {
    switch (dropZone) {
      case 'metrics':
        metricsDimensions.addMetric(field);
        break;
      case 'dimensions':
        metricsDimensions.addDimension(field);
        break;
      case 'conditions':
        conditions.addCondition();
        break;
      default:
        break;
    }
  };
  
  // Context value
  const contextValue: DashboardContextType = {
    rawData,
    setRawData: updateRawData,
    processedData,
    fields,
    analysisConfig,
    ...metricsDimensions,
    ...conditions,
    ...comparisonGroups,
    setVisualizationType,
    setAggregationType,
    handleFieldDrop
  };
  
  // Initialize with any provided data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      console.log("Initializing with data:", initialData);
      updateRawData(initialData);
    }
  }, [initialData]);
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook for using the dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
