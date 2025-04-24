
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/contexts/DashboardContext';
import { ComparisonGroup } from '@/types/analytics';

export function DataTableView() {
  const { processedData, analysisConfig, comparisonData } = useDashboard();
  
  // Check if we're showing comparison groups
  const showingComparisonGroups = analysisConfig.comparisonGroups.length > 0 && comparisonData && Object.keys(comparisonData).length > 0;
  
  // If no data or comparison groups are available
  if ((!processedData || !processedData.length) && !showingComparisonGroups) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for display</p>
      </div>
    );
  }

  // Determine what to show based on whether we have comparison groups
  if (showingComparisonGroups) {
    // For comparison groups, we show metrics with different group values
    return renderComparisonTable();
  } else {
    // Standard data table view
    return renderStandardTable();
  }
  
  function renderStandardTable() {
    // Get visible columns - combine dimensions and metrics
    const visibleColumns = [
      ...analysisConfig.dimensions,
      ...analysisConfig.metrics
    ];
    
    // If no columns are explicitly selected, show all columns
    const columns = visibleColumns.length > 0 
      ? visibleColumns 
      : Object.keys(processedData[0]).filter(key => 
          key !== 'customproperties' && 
          key !== 'customProperties'
        );
      
    return (
      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.slice(0, 100).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {formatCellValue(row[column] ?? row.customProperties?.[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  function renderComparisonTable() {
    const metrics = analysisConfig.metrics;
    if (!metrics.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please select at least one metric to compare groups</p>
        </div>
      );
    }
    
    // Prepare group names and data
    const groupNames = Object.keys(comparisonData);
    const groupData = Object.values(comparisonData);
    
    // Create aggregated data for each group based on the selected aggregation type
    const aggregatedGroupData = groupData.map(groupItems => {
      if (!groupItems || groupItems.length === 0) return {};
      
      const result: Record<string, any> = {};
      metrics.forEach(metric => {
        // Get all values for this metric in this group
        const values = groupItems
          .map(item => Number(item[metric] || item.customProperties?.[metric] || 0))
          .filter(val => !isNaN(val));
        
        if (values.length > 0) {
          switch (analysisConfig.aggregationType) {
            case 'sum':
              result[metric] = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'average':
              result[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'min':
              result[metric] = Math.min(...values);
              break;
            case 'max':
              result[metric] = Math.max(...values);
              break;
            case 'count':
              result[metric] = values.length;
              break;
            default:
              // For 'none', just show the first value (though this doesn't make much sense for comparisons)
              result[metric] = values[0];
              break;
          }
        }
      });
      
      return result;
    });
    
    return (
      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metrics</TableHead>
              {groupNames.map((name, index) => (
                <TableHead key={index}>{name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric}>
                <TableCell className="font-medium">{metric}</TableCell>
                {aggregatedGroupData.map((groupData, groupIndex) => (
                  <TableCell key={groupIndex}>
                    {formatCellValue(groupData[metric])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  // Helper to format cell values for display
  function formatCellValue(value: any): string {
    if (value === undefined || value === null) {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }
}
