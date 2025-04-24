
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
    console.log(`Updating condition: id=${id}, field=${field}, operator=${operator}, value=${value}`);
    setConfig({
      ...config,
      conditions: config.conditions.map(c => 
        c.id === id ? { ...c, field, operator: operator as OperatorType, value } : c
      )
    });
  };

  const removeCondition = (id: string) => {
    const index = config.conditions.findIndex(c => c.id === id);
    if (index === -1) return;

    const newConditions = config.conditions.filter(c => c.id !== id);
    
    // Remove the operator at the correct position
    let newOperators = [...config.conditionOperators];
    if (index > 0 && index <= config.conditionOperators.length) {
      newOperators.splice(index - 1, 1);
    }

    setConfig({
      ...config,
      conditions: newConditions,
      conditionOperators: newOperators
    });
  };

  return {
    addCondition,
    updateCondition,
    removeCondition
  };
}
