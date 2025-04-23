
import { v4 as uuidv4 } from 'uuid';
import { AnalysisConfig, ComparisonGroup } from '@/types/analytics';

export function useComparisonGroups(config: AnalysisConfig, setConfig: (config: AnalysisConfig) => void) {
  const addComparisonGroup = () => {
    const newGroup: ComparisonGroup = {
      id: uuidv4(),
      name: `Group ${config.comparisonGroups.length + 1}`,
      conditions: []
    };
    
    setConfig({
      ...config,
      comparisonGroups: [...config.comparisonGroups, newGroup]
    });
  };

  const updateComparisonGroup = (id: string, updates: Partial<ComparisonGroup>) => {
    setConfig({
      ...config,
      comparisonGroups: config.comparisonGroups.map(g => 
        g.id === id ? { ...g, ...updates } : g
      )
    });
  };

  const addComparisonCondition = (groupId: string, field: string, value: any) => {
    setConfig({
      ...config,
      comparisonGroups: config.comparisonGroups.map(g => 
        g.id === groupId 
          ? { ...g, conditions: [...g.conditions, { field, value }] }
          : g
      )
    });
  };

  const updateComparisonCondition = (groupId: string, index: number, field: string, value: any) => {
    setConfig({
      ...config,
      comparisonGroups: config.comparisonGroups.map(g => {
        if (g.id !== groupId) return g;
        
        const updatedConditions = [...g.conditions];
        updatedConditions[index] = { field, value };
        
        return { ...g, conditions: updatedConditions };
      })
    });
  };

  const removeComparisonCondition = (groupId: string, index: number) => {
    setConfig({
      ...config,
      comparisonGroups: config.comparisonGroups.map(g => {
        if (g.id !== groupId) return g;
        
        const updatedConditions = [...g.conditions];
        updatedConditions.splice(index, 1);
        
        return { ...g, conditions: updatedConditions };
      })
    });
  };

  const removeComparisonGroup = (id: string) => {
    setConfig({
      ...config,
      comparisonGroups: config.comparisonGroups.filter(g => g.id !== id)
    });
  };

  return {
    addComparisonGroup,
    updateComparisonGroup,
    addComparisonCondition,
    updateComparisonCondition,
    removeComparisonCondition,
    removeComparisonGroup
  };
}
