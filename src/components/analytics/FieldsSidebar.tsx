
import React, { useState, useEffect } from 'react';
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

  // Group fields by category - only using Custom Properties as per requirement
  const fieldCategories = React.useMemo(() => {
    const categories: Record<string, typeof fields> = {
      'Custom Properties': [],
    };

    fields.forEach((field) => {
      if (field.category === 'customProperties') {
        categories['Custom Properties'].push(field);
      }
    });

    console.log("Categorized fields:", categories);
    return categories;
  }, [fields]);

  // Filter fields based on search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return fieldCategories;

    const result: Record<string, typeof fields> = {};

    Object.entries(fieldCategories).forEach(([category, categoryFields]) => {
      const filtered = categoryFields.filter((field) =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });

    return result;
  }, [fieldCategories, searchTerm]);

  // Log empty fields for debugging
  useEffect(() => {
    if (fields.length === 0) {
      console.log("Fields array is empty in FieldsSidebar");
    }
  }, [fields]);

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
        {Object.entries(filteredCategories).map(([category, categoryFields]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {category}
            </h3>
            <div className="space-y-2">
              {categoryFields.length > 0 ? (
                categoryFields.map((field) => (
                  <DraggableField key={field.id} field={field} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No fields in this category
                </p>
              )}
            </div>
          </div>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No fields match your search.
          </p>
        )}
      </div>
    </div>
  );
}
