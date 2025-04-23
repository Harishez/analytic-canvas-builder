
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/contexts/DashboardContext';
import { DraggableField } from './DraggableField';

interface FieldsSidebarProps {
  className?: string;
}

export function FieldsSidebar({ className }: FieldsSidebarProps) {
  const { fields } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  console.log("Available fields in sidebar:", fields);

  // Filter fields based on search term
  const filteredFields = React.useMemo(() => {
    if (!searchTerm) return fields;
    
    return fields.filter((field) => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fields, searchTerm]);

  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Available Fields</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Custom Properties
          </h3>
          <div className="space-y-2">
            {filteredFields.length > 0 ? (
              filteredFields.map((field) => (
                <DraggableField key={field.id} field={field} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {fields.length === 0 ? "No fields available - load data first" : "No fields match your search"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
