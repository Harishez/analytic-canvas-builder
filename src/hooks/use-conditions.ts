
import { v4 as uuidv4 } from 'uuid';
import { AnalysisConfig, FilterCondition } from '@/types/analytics';

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
      conditions: [...config.conditions, newCondition]
    });
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConfig({
      ...config,
      conditions: config.conditions.map(c => 
        c.id === id ? { ...c, ...updates } : c
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
