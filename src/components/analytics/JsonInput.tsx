
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface JsonInputProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export function JsonInput({ onDataChange, initialData }: JsonInputProps) {
  const { toast } = useToast();
  const [jsonText, setJsonText] = useState<string>(() => {
    try {
      return JSON.stringify(initialData, null, 2);
    } catch (e) {
      return '{}';
    }
  });
  
  const handleApply = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      onDataChange(parsedData);
      toast({
        title: "JSON Applied",
        description: "Dashboard data updated successfully",
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Custom Data Input</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="font-mono text-sm h-40 mb-4"
          placeholder="Paste your JSON data here..."
        />
        <div className="flex justify-end">
          <Button onClick={handleApply}>Apply Data</Button>
        </div>
      </CardContent>
    </Card>
  );
}
