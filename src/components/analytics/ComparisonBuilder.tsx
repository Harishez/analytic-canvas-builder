
import React from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import { Badge } from '@/components/ui/badge';

interface ComparisonBuilderProps {
  className?: string;
}

export function ComparisonBuilder({ className }: ComparisonBuilderProps) {
  const { 
    fields, 
    analysisConfig, 
    addComparisonGroup,
    updateComparisonGroup,
    addComparisonCondition,
    updateComparisonCondition,
    removeComparisonCondition,
    removeComparisonGroup
  } = useDashboard();
  
  const [editingName, setEditingName] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState<string>('');
  
  const handleStartEditName = (groupId: string, currentName: string) => {
    setEditingName(groupId);
    setNewName(currentName);
  };
  
  const handleSaveName = (groupId: string) => {
    if (newName.trim()) {
      updateComparisonGroup(groupId, { name: newName });
    }
    setEditingName(null);
  };
  
  // Get boolean fields for comparison conditions
  const booleanFields = fields.filter(field => field.type === 'boolean');
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Comparison Groups</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addComparisonGroup}
        >
          Add Group
        </Button>
      </div>
      
      {analysisConfig.comparisonGroups.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No comparison groups created. Click "Add Group" to create groups for comparison.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analysisConfig.comparisonGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {editingName === group.id ? (
                    <div className="flex gap-2 items-center flex-1">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveName(group.id)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <CardTitle 
                      className="text-base flex gap-2 items-center cursor-pointer"
                      onClick={() => handleStartEditName(group.id, group.name)}
                    >
                      {group.name}
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeComparisonGroup(group.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.conditions.map((condition, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select>
                        <select
                          value={condition.field}
                          onChange={(e) => 
                            updateComparisonCondition(group.id, idx, e.target.value, condition.value)
                          }
                          className="w-full"
                        >
                          <option value="" disabled>Select field</option>
                          {booleanFields.map((field) => (
                            <option key={field.id} value={field.name}>
                              {field.name}
                            </option>
                          ))}
                        </select>
                      </Select>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Is</span>
                        <Switch
                          checked={condition.value}
                          onCheckedChange={(checked) => 
                            updateComparisonCondition(group.id, idx, condition.field, checked)
                          }
                        />
                        <span className="text-sm">{condition.value ? 'True' : 'False'}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeComparisonCondition(group.id, idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => addComparisonCondition(group.id, '', false)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                  
                  {group.conditions.length > 0 && (
                    <div className="mt-2 pt-2 border-t flex flex-wrap gap-1">
                      {group.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline">
                          {condition.field}: {condition.value ? 'True' : 'False'}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
