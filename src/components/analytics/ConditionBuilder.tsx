
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/contexts/DashboardContext';
import { FilterCondition, OperatorType } from '@/types/analytics';
import { getOperatorLabel } from '@/lib/data-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConditionBuilderProps {
  className?: string;
}

export function ConditionBuilder({ className }: ConditionBuilderProps) {
  const { 
    fields, 
    analysisConfig, 
    addCondition, 
    updateCondition, 
    removeCondition 
  } = useDashboard();
  
  const operators: { value: OperatorType; label: string }[] = [
    { value: 'equals', label: 'Equals (=)' },
    { value: 'notEquals', label: 'Not Equals (≠)' },
    { value: 'greaterThan', label: 'Greater Than (>)' },
    { value: 'lessThan', label: 'Less Than (<)' },
    { value: 'greaterOrEqual', label: 'Greater or Equal (≥)' },
    { value: 'lessOrEqual', label: 'Less or Equal (≤)' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Filter Conditions</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={addCondition}
        >
          Add Condition
        </Button>
      </div>

      {analysisConfig.conditions.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No conditions added. Click "Add Condition" to start filtering your data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {analysisConfig.conditions.map((condition) => (
            <div 
              key={condition.id} 
              className="flex flex-wrap gap-2 items-center p-3 bg-muted/50 rounded-md"
            >
              <div className="flex-1 min-w-[150px]">
                <Select>
                  <select 
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                    className="w-full"
                  >
                    <option value="" disabled>Select field</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.name}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <Select>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, { operator: e.target.value as OperatorType })}
                    className="w-full"
                  >
                    <option value="" disabled>Select operator</option>
                    {operators.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  placeholder="Enter value"
                  className="w-full"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(condition.id)}
                aria-label="Remove condition"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {analysisConfig.conditions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mt-2">
          <span className="text-sm font-medium">Active filters:</span>
          {analysisConfig.conditions.map((condition) => (
            <Badge key={condition.id} variant="secondary" className="font-normal">
              {condition.field} {getOperatorLabel(condition.operator)} {condition.value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
