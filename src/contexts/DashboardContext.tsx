
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FilterCondition, 
  ComparisonGroup, 
  FieldItem, 
  AnalysisConfig,
  VisualizationType,
  AggregationType,
  RawDataItem,
  ProcessedDataItem
} from '@/types/analytics';
import { 
  parseCustomProperties, 
  filterData, 
  groupDataForComparison, 
  aggregateData 
} from '@/lib/data-utils';
import { useToast } from '@/hooks/use-toast';

// Context interface
interface DashboardContextType {
  // Raw and processed data
  rawData: RawDataItem[];
  setRawData: (data: any) => void;
  processedData: ProcessedDataItem[];
  
  // Available fields
  fields: FieldItem[];
  
  // Current analysis configuration
  analysisConfig: AnalysisConfig;
  
  // Methods to update configuration
  addMetric: (field: string) => void;
  removeMetric: (field: string) => void;
  addDimension: (field: string) => void;
  removeDimension: (field: string) => void;
  
  // Filter conditions
  addCondition: () => void;
  updateCondition: (id: string, updates: Partial<FilterCondition>) => void;
  removeCondition: (id: string) => void;
  
  // Comparison groups
  addComparisonGroup: () => void;
  updateComparisonGroup: (id: string, updates: Partial<ComparisonGroup>) => void;
  addComparisonCondition: (groupId: string, field: string, value: any) => void;
  updateComparisonCondition: (groupId: string, index: number, field: string, value: any) => void;
  removeComparisonCondition: (groupId: string, index: number) => void;
  removeComparisonGroup: (id: string) => void;
  
  // Visualization settings
  setVisualizationType: (type: VisualizationType) => void;
  setAggregationType: (type: AggregationType) => void;
  
  // Drag and drop handlers
  handleFieldDrop: (field: string, dropZone: string) => void;
}

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
  // State for raw and processed data
  const [rawData, setRawData] = useState<RawDataItem[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(defaultAnalysisConfig);
  const { toast } = useToast();
  
  // Initialize with raw data
  const updateRawData = (data: any) => {
    try {
      // Extract data if it has a nested structure
      const dataArray = data.data?.result || data.result || data;
      
      // Parse custom properties
      const parsedData = parseCustomProperties(dataArray);
      setRawData(parsedData);
      
      console.log("Raw data updated:", parsedData);
      
      // Show success message
      toast({
        title: "Data loaded successfully",
        description: `Loaded ${parsedData.length} records`,
      });
    } catch (error) {
      console.error("Error processing raw data:", error);
      setRawData([]);
      
      // Show error message
      toast({
        title: "Error loading data",
        description: "Failed to process the provided data",
        variant: "destructive",
      });
    }
  };
  
  // Detect fields from raw data
  const fields: FieldItem[] = useMemo(() => {
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
  const processedData: ProcessedDataItem[] = useMemo(() => {
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
  
  // Metrics management
  const addMetric = (field: string) => {
    if (!analysisConfig.metrics.includes(field)) {
      setAnalysisConfig({
        ...analysisConfig,
        metrics: [...analysisConfig.metrics, field]
      });
      toast({
        description: `Added ${field} as a metric`,
      });
    }
  };
  
  const removeMetric = (field: string) => {
    setAnalysisConfig({
      ...analysisConfig,
      metrics: analysisConfig.metrics.filter(m => m !== field)
    });
  };
  
  // Dimensions management
  const addDimension = (field: string) => {
    if (!analysisConfig.dimensions.includes(field)) {
      setAnalysisConfig({
        ...analysisConfig,
        dimensions: [...analysisConfig.dimensions, field]
      });
      toast({
        description: `Added ${field} as a dimension`,
      });
    }
  };
  
  const removeDimension = (field: string) => {
    setAnalysisConfig({
      ...analysisConfig,
      dimensions: analysisConfig.dimensions.filter(d => d !== field)
    });
  };
  
  // Conditions management
  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    setAnalysisConfig({
      ...analysisConfig,
      conditions: [...analysisConfig.conditions, newCondition]
    });
  };
  
  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setAnalysisConfig({
      ...analysisConfig,
      conditions: analysisConfig.conditions.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    });
  };
  
  const removeCondition = (id: string) => {
    setAnalysisConfig({
      ...analysisConfig,
      conditions: analysisConfig.conditions.filter(c => c.id !== id)
    });
  };
  
  // Comparison groups management
  const addComparisonGroup = () => {
    const newGroup: ComparisonGroup = {
      id: uuidv4(),
      name: `Group ${analysisConfig.comparisonGroups.length + 1}`,
      conditions: []
    };
    
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: [...analysisConfig.comparisonGroups, newGroup]
    });
  };
  
  const updateComparisonGroup = (id: string, updates: Partial<ComparisonGroup>) => {
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: analysisConfig.comparisonGroups.map(g => 
        g.id === id ? { ...g, ...updates } : g
      )
    });
  };
  
  const addComparisonCondition = (groupId: string, field: string, value: any) => {
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: analysisConfig.comparisonGroups.map(g => 
        g.id === groupId 
          ? { ...g, conditions: [...g.conditions, { field, value }] }
          : g
      )
    });
  };
  
  const updateComparisonCondition = (groupId: string, index: number, field: string, value: any) => {
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: analysisConfig.comparisonGroups.map(g => {
        if (g.id !== groupId) return g;
        
        const updatedConditions = [...g.conditions];
        updatedConditions[index] = { field, value };
        
        return { ...g, conditions: updatedConditions };
      })
    });
  };
  
  const removeComparisonCondition = (groupId: string, index: number) => {
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: analysisConfig.comparisonGroups.map(g => {
        if (g.id !== groupId) return g;
        
        const updatedConditions = [...g.conditions];
        updatedConditions.splice(index, 1);
        
        return { ...g, conditions: updatedConditions };
      })
    });
  };
  
  const removeComparisonGroup = (id: string) => {
    setAnalysisConfig({
      ...analysisConfig,
      comparisonGroups: analysisConfig.comparisonGroups.filter(g => g.id !== id)
    });
  };
  
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
        addMetric(field);
        break;
      case 'dimensions':
        addDimension(field);
        break;
      case 'conditions':
        // Add a new condition with this field
        const newCondition: FilterCondition = {
          id: uuidv4(),
          field,
          operator: 'equals',
          value: ''
        };
        
        setAnalysisConfig({
          ...analysisConfig,
          conditions: [...analysisConfig.conditions, newCondition]
        });
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
    addMetric,
    removeMetric,
    addDimension,
    removeDimension,
    addCondition,
    updateCondition,
    removeCondition,
    addComparisonGroup,
    updateComparisonGroup,
    addComparisonCondition,
    updateComparisonCondition,
    removeComparisonCondition,
    removeComparisonGroup,
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
