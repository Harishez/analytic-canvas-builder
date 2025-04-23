
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { FieldsSidebar } from './FieldsSidebar';
import { ConditionBuilder } from './ConditionBuilder';
import { ComparisonBuilder } from './ComparisonBuilder';
import { VisualizationPanel } from './VisualizationPanel';
import { MetricsDimensionsDropZone } from './MetricsDimensionsDropZone';

interface DashboardProps {
  initialData?: any;
}

export function Dashboard({ initialData }: DashboardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardProvider initialData={initialData}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with fields */}
          <div className="md:col-span-1">
            <FieldsSidebar className="mb-6" />
            <ComparisonBuilder className="mb-6" />
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <ConditionBuilder className="mb-6" />
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Drag Fields for Analysis</h2>
              <MetricsDimensionsDropZone />
            </div>
            <VisualizationPanel />
          </div>
        </div>
      </DashboardProvider>
    </DndProvider>
  );
}
