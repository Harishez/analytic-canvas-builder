
import React from 'react';
import { useDrag } from 'react-dnd';
import { FieldItem } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface DraggableFieldProps {
  field: FieldItem;
  className?: string;
}

export function DraggableField({ field, className }: DraggableFieldProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { id: field.id, name: field.name, type: field.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Get appropriate color based on field type
  const getTypeColor = () => {
    switch (field.type) {
      case 'number':
        return 'bg-analytics-blue/10 border-analytics-blue/30 text-analytics-blue';
      case 'string':
        return 'bg-analytics-green/10 border-analytics-green/30 text-analytics-green';
      case 'boolean':
        return 'bg-analytics-purple/10 border-analytics-purple/30 text-analytics-purple';
      default:
        return 'bg-analytics-gray/10 border-analytics-gray/30 text-analytics-gray';
    }
  };

  return (
    <div
      ref={drag}
      className={cn(
        'draggable-item px-3 py-1.5 rounded-md border flex items-center justify-between gap-2 cursor-grab hover:shadow-sm transition-all',
        getTypeColor(),
        isDragging ? 'opacity-50' : 'opacity-100',
        className
      )}
    >
      <span className="text-sm font-medium">{field.name}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/30">
        {field.type}
      </span>
    </div>
  );
}
