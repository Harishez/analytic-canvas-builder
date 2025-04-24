
import React from 'react';
import { 
  ChartPie,
  BarChart,
  LineChart,
  AreaChart,
  Table2
} from 'lucide-react';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDashboard } from '@/contexts/DashboardContext';
import { AggregationType, VisualizationType } from '@/types/analytics';
import { BarChartView } from './charts/BarChartView';
import { LineChartView } from './charts/LineChartView';
import { AreaChartView } from './charts/AreaChartView';
import { PieChartView } from './charts/PieChartView';
import { DataTableView } from './tables/DataTableView';

interface VisualizationPanelProps {
  className?: string;
}

export function VisualizationPanel({ className }: VisualizationPanelProps) {
  const { 
    analysisConfig, 
    setVisualizationType, 
    setAggregationType,
    comparisonData
  } = useDashboard();
  
  const aggregationOptions: { value: AggregationType; label: string }[] = [
    { value: 'none', label: 'No Aggregation' },
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'count', label: 'Count' },
  ];
  
  // Render the appropriate visualization
  const renderVisualization = () => {
    switch (analysisConfig.visualization) {
      case 'bar':
        return <BarChartView />;
      case 'line':
        return <LineChartView />;
      case 'area':
        return <AreaChartView />;
      case 'pie':
        return <PieChartView />;
      case 'table':
        return <DataTableView />;
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Select visualization type</p>
          </div>
        );
    }
  };
  
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Visualization</h2>
          <p className="text-sm text-muted-foreground">
            Choose how to visualize your data
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={analysisConfig.aggregationType}
            onValueChange={(value) => setAggregationType(value as AggregationType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Aggregation Type" />
            </SelectTrigger>
            <SelectContent>
              {aggregationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <ToggleGroup
            type="single"
            value={analysisConfig.visualization}
            onValueChange={(value) => value && setVisualizationType(value as VisualizationType)}
            className="flex"
          >
            <ToggleGroupItem value="bar" aria-label="Bar Chart">
              <BarChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line Chart">
              <LineChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="area" aria-label="Area Chart">
              <AreaChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="pie" aria-label="Pie Chart">
              <ChartPie className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Data Table">
              <Table2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-4 chart-container">
        {renderVisualization()}
      </div>
    </div>
  );
}
