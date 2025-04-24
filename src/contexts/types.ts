
import {
  AnalysisConfig,
  RawDataItem,
  ProcessedDataItem,
  FieldItem,
  DropZoneType,
  ComparisonGroup,
  OperatorType
} from '@/types/analytics';

export interface DashboardContextType {
  rawData: RawDataItem[];
  setRawData: (data: any) => void;
  processedData: ProcessedDataItem[];
  comparisonData: Record<string, any[]>;
  fields: FieldItem[];
  analysisConfig: AnalysisConfig;
  
  // Metrics and dimensions
  addMetric: (metric: string) => void;
  removeMetric: (metric: string) => void;
  addDimension: (dimension: string) => void;
  removeDimension: (dimension: string) => void;
  
  // Conditions
  addCondition: () => void;
  removeCondition: (id: string) => void;
  updateCondition: (id: string, field: string, operator: string, value: any) => void;
  updateConditionOperator: (index: number, operator: 'AND' | 'OR') => void;
  
  // Comparison groups
  addComparisonGroup: () => void;
  updateComparisonGroup: (id: string, updates: Partial<ComparisonGroup>) => void;
  addComparisonCondition: (groupId: string, field: string, value: any) => void;
  updateComparisonCondition: (groupId: string, index: number, field: string, value: any) => void;
  removeComparisonCondition: (groupId: string, index: number) => void;
  removeComparisonGroup: (id: string) => void;
  
  // Visualization settings
  setVisualizationType: (type: string) => void;
  setAggregationType: (type: string) => void;
  
  // Drag and drop
  handleFieldDrop: (field: string, dropZone: DropZoneType) => void;
}
