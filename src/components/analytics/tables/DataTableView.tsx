
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

export function DataTableView() {
  const { processedData, analysisConfig } = useDashboard();
  
  // Check if there's data to display
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for display</p>
      </div>
    );
  }
  
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
