
/**
 * Types for the analytics dashboard
 */

// Condition operators
export type OperatorType = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterOrEqual' 
  | 'lessOrEqual'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

// Filter condition structure  
export interface FilterCondition {
  id: string;
  field: string;
  operator: OperatorType;
  value: any;
}

// Definition of a comparison group
export interface ComparisonGroup {
  id: string;
  name: string;
  conditions: {
    field: string;
    value: any;
  }[];
}

// Type for draggable field items
export interface FieldItem {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'string' | 'date' | 'unknown';
  category?: string;
}

// Configuration for a specific analysis
export interface AnalysisConfig {
  metrics: string[]; // Fields to analyze/aggregate
  dimensions: string[]; // Fields to group by
  conditions: FilterCondition[]; // Conditions to filter the data
  conditionOperators: ('AND' | 'OR')[]; // Operators between conditions (length will be conditions.length - 1)
  comparisonGroups: ComparisonGroup[]; // Comparison groups
  visualization: VisualizationType; // Type of visualization
  aggregationType: AggregationType; // Type of aggregation
}

// Available aggregation types
export type AggregationType = 'none' | 'sum' | 'average' | 'min' | 'max' | 'count';

// Available visualization types
export type VisualizationType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'area'
  | 'table';

// Raw data item structure
export interface RawDataItem {
  [key: string]: any;
  customProperties?: {
    [key: string]: any;
  };
}

// Processed/aggregated data item structure
export interface ProcessedDataItem {
  [key: string]: any;
}

// Chart dataset structure
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
}

// Chart data structure
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Zone where fields can be dragged to
export type DropZoneType = 'metrics' | 'dimensions' | 'conditions' | 'comparisons';
