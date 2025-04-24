
import { v4 as uuidv4 } from 'uuid';
import { AnalysisConfig, FilterCondition, OperatorType } from '@/types/analytics';

export function useConditions(config: AnalysisConfig, setConfig: (config: AnalysisConfig) => void) {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    setConfig({
      ...config,
      conditions: [...config.conditions, newCondition],
      conditionOperators: config.conditions.length > 0 
        ? [...config.conditionOperators, 'AND'] 
        : config.conditionOperators
    });
  };

  // Updated to match the interface in DashboardContextType
  const updateCondition = (id: string, field: string, operator: string, value: any) => {
    setConfig({
      ...config,
      conditions: config.conditions.map(c => 
        c.id === id ? { ...c, field, operator: operator as OperatorType, value } : c
      )
    });
  };

  const removeCondition = (id: string) => {
    setConfig({
      ...config,
      conditions: config.conditions.filter(c => c.id !== id)
    });
  };

  return {
    addCondition,
    updateCondition,
    removeCondition
  };
}
