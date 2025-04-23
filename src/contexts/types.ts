
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

export interface DashboardContextType {
  rawData: RawDataItem[];
  setRawData: (data: any) => void;
  processedData: ProcessedDataItem[];
  fields: FieldItem[];
  analysisConfig: AnalysisConfig;
  addMetric: (field: string) => void;
  removeMetric: (field: string) => void;
  addDimension: (field: string) => void;
  removeDimension: (field: string) => void;
  addCondition: () => void;
  updateCondition: (id: string, updates: Partial<FilterCondition>) => void;
  removeCondition: (id: string) => void;
  addComparisonGroup: () => void;
  updateComparisonGroup: (id: string, updates: Partial<ComparisonGroup>) => void;
  addComparisonCondition: (groupId: string, field: string, value: any) => void;
  updateComparisonCondition: (groupId: string, index: number, field: string, value: any) => void;
  removeComparisonCondition: (groupId: string, index: number) => void;
  removeComparisonGroup: (id: string) => void;
  setVisualizationType: (type: VisualizationType) => void;
  setAggregationType: (type: AggregationType) => void;
  handleFieldDrop: (field: string, dropZone: string) => void;
}
