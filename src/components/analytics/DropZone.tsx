
import React from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';
import { DropZoneType } from '@/types/analytics';

interface DropZoneProps {
  onDrop: (item: any) => void;
  type: DropZoneType;
  children?: React.ReactNode;
  className?: string;
  title?: string;
  empty?: boolean;
}

export function DropZone({ 
  onDrop, 
  type, 
  children, 
  className, 
  title,
  empty = false
}: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'FIELD',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Different styles based on zone type
  const getZoneStyle = () => {
    switch (type) {
      case 'metrics':
        return 'border-analytics-blue/30 bg-analytics-blue/5';
      case 'dimensions':
        return 'border-analytics-purple/30 bg-analytics-purple/5';
      case 'conditions':
        return 'border-analytics-yellow/30 bg-analytics-yellow/5';
      case 'comparisons':
        return 'border-analytics-green/30 bg-analytics-green/5';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {title && (
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      )}
      <div
        ref={drop}
        className={cn(
          'rounded-lg border-2 border-dashed p-4 transition-all min-h-[100px]',
          getZoneStyle(),
          isOver && canDrop ? 'ring-2 ring-offset-1 scale-[1.01]' : '',
          empty ? 'flex items-center justify-center' : ''
        )}
      >
        {empty && !children ? (
          <p className="text-sm text-gray-500">
            Drag fields here
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
