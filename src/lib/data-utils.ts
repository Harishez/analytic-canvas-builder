/**
 * Utility functions for data manipulation in the analytics dashboard
 */

// Parse the custom properties string from the data
export function parseCustomProperties(data: any[]): any[] {
  console.log("Parsing custom properties from data array with length:", data.length);
  
  return data.map(item => {
    try {
      // Check if the item has customproperties string
      if (!item.customproperties) {
        console.log("No customproperties found in item:", item);
        return item;
      }
      
      console.log("Processing customproperties string:", item.customproperties);
      
      // Extract the custom properties from the string and parse as JSON
      let customProps;
      try {
        const customPropsStr = item.customproperties.replace(/'/g, '"');
        customProps = JSON.parse(customPropsStr);
        console.log("Successfully parsed customproperties JSON:", customProps);
        
        // Convert string values to appropriate types if needed
        Object.keys(customProps).forEach(key => {
          const value = customProps[key];
          if (typeof value === 'string') {
            // Try to convert to number or boolean if appropriate
            if (value === 'true') {
              customProps[key] = true;
            } else if (value === 'false') {
              customProps[key] = false;
            } else if (!isNaN(Number(value))) {
              customProps[key] = Number(value);
            }
          }
        });
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.log("Failed to parse:", item.customproperties);
        customProps = {};
      }
      
      // Return a new object with the parsed custom properties and the original data
      return {
        ...item,
        customProperties: customProps,
        // Also add top-level properties for easier access
        ...Object.entries(customProps).reduce((acc, [key, value]) => {
          // Skip if the property already exists in the original item
          if (!(key in item)) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>)
      };
    } catch (error) {
      console.error("Error parsing custom properties:", error);
      return item;
    }
  });
}

// Extract all available fields for selection
export function extractAvailableFields(data: any[]): string[] {
  if (!data || data.length === 0) return [];
  
  // Get a sample item to extract fields
  const sampleItem = data[0];
  
  // Extract nested custom properties fields
  let fields: string[] = [];
  
  try {
    const customProps = sampleItem.customProperties || {};
    // Add custom properties fields
    fields = [...Object.keys(customProps)];
    
    // Add other non-nested fields
    const topLevelFields = Object.keys(sampleItem).filter(
      key => key !== 'customproperties' && key !== 'customProperties'
    );
    
    fields = [...fields, ...topLevelFields];
  } catch (error) {
    console.error("Error extracting fields:", error);
  }
  
  return fields;
}

// Filter data based on conditions
export function filterData(
  data: any[], 
  conditions: Array<{field: string; operator: string; value: any}>,
  operators: ('AND' | 'OR')[]
): any[] {
  if (conditions.length === 0) return data;
  
  return data.filter(item => {
    // Handle first condition separately
    let result = evaluateCondition(item, conditions[0]);
    
    // Chain remaining conditions with their operators
    for (let i = 1; i < conditions.length; i++) {
      const operator = operators[i - 1];
      const nextResult = evaluateCondition(item, conditions[i]);
      
      result = operator === 'AND' 
        ? (result && nextResult)
        : (result || nextResult);
    }
    
    return result;
  });
}

function evaluateCondition(
  item: any, 
  condition: {field: string; operator: string; value: any}
): boolean {
  const { field, operator, value } = condition;
  
  // Handle empty field or value
  if (!field || field.trim() === '') return true;
  
  // Get the value from the item, looking in customProperties first
  const itemValue = item.customProperties?.[field] ?? item[field];
  
  // Special case for empty value
  if (value === '' || value === undefined || value === null) {
    if (operator === 'equals') {
      return itemValue === '' || itemValue === undefined || itemValue === null;
    } else if (operator === 'notEquals') {
      return !(itemValue === '' || itemValue === undefined || itemValue === null);
    }
  }
  
  // Handle the case where the item doesn't have this field
  if (itemValue === undefined) {
    return operator === 'notEquals'; // Only "not equals" can be true if field doesn't exist
  }
  
  // Convert value to same type as itemValue for comparison if possible
  const typedValue = typeof itemValue === 'number' ? Number(value) : 
                    typeof itemValue === 'boolean' ? (value === 'true' || value === true) : 
                    String(value);
  
  // Compare based on operator
  switch (operator) {
    case 'equals':
      return itemValue === typedValue;
    case 'notEquals':
      return itemValue !== typedValue;
    case 'greaterThan':
      return itemValue > typedValue;
    case 'lessThan':
      return itemValue < typedValue;
    case 'greaterOrEqual':
      return itemValue >= typedValue;
    case 'lessOrEqual':
      return itemValue <= typedValue;
    case 'contains':
      return String(itemValue).toLowerCase().includes(String(typedValue).toLowerCase());
    case 'startsWith':
      return String(itemValue).toLowerCase().startsWith(String(typedValue).toLowerCase());
    case 'endsWith':
      return String(itemValue).toLowerCase().endsWith(String(typedValue).toLowerCase());
    default:
      return true;
  }
}

// Aggregate data for visualization
export function aggregateData(
  data: any[], 
  metrics: string[], 
  dimensions: string[],
  aggregationType: string = 'sum'
): any[] {
  const result: any[] = [];
  
  // Group data by dimensions
  const groupedData: Record<string, any[]> = {};
  
  data.forEach(item => {
    // Create a key based on dimensions
    const key = dimensions.map(dim => {
      const value = item.customProperties?.[dim] ?? item[dim];
      return `${dim}:${value}`;
    }).join('|');
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    
    groupedData[key].push(item);
  });
  
  // Aggregate metrics for each dimension group
  Object.entries(groupedData).forEach(([key, items]) => {
    const resultItem: Record<string, any> = {};
    
    // Add dimension values
    key.split('|').forEach(dimValue => {
      const [dim, value] = dimValue.split(':');
      resultItem[dim] = isNaN(Number(value)) ? value : Number(value);
    });
    
    // Aggregate metrics
    metrics.forEach(metric => {
      // Extract values for this metric
      const values = items
        .map(item => Number(item[metric] || item.customProperties?.[metric] || 0))
        .filter(val => !isNaN(val));
      
      if (values.length === 0) return;
      
      // Apply the specified aggregation type
      switch (aggregationType) {
        case 'sum':
          resultItem[metric] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'average':
          resultItem[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'min':
          resultItem[metric] = Math.min(...values);
          break;
        case 'max':
          resultItem[metric] = Math.max(...values);
          break;
        case 'count':
          resultItem[metric] = values.length;
          break;
        default:
          // Use sum as default
          resultItem[metric] = values.reduce((sum, val) => sum + val, 0);
      }
    });
    
    result.push(resultItem);
  });
  
  return result;
}

// Process data for comparison groups
export function processDataForComparison(
  data: any[], 
  comparisonGroups: Array<{id: string; name: string; conditions: Array<{field: string; value: any}>}>
): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  // Process each comparison group
  comparisonGroups.forEach(group => {
    const { name, conditions } = group;
    
    // Filter data for this group
    const filteredData = data.filter(item => {
      return conditions.every(condition => {
        const { field, value } = condition;
        const itemValue = item.customProperties?.[field] ?? item[field];
        return itemValue === value;
      });
    });
    
    // Add the filtered data to the result
    result[name] = filteredData;
  });
  
  return result;
}

// Get the appropriate operator label
export function getOperatorLabel(operator: string): string {
  const operatorMap: Record<string, string> = {
    'equals': '=',
    'notEquals': '≠',
    'greaterThan': '>',
    'lessThan': '<',
    'greaterOrEqual': '≥',
    'lessOrEqual': '≤',
    'contains': 'contains',
    'startsWith': 'starts with',
    'endsWith': 'ends with'
  };
  
  return operatorMap[operator] || operator;
}

// Generate colors for charts
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#3573f0', // analytics-blue
    '#8b5cf6', // analytics-purple
    '#e879f9', // analytics-pink
    '#22c55e', // analytics-green
    '#f59e0b', // analytics-yellow
    '#ef4444', // analytics-red
    '#94a3b8', // analytics-gray
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // For more colors, generate variations
  const result = [...baseColors];
  let currentIndex = 0;
  
  while (result.length < count) {
    const baseColor = baseColors[currentIndex % baseColors.length];
    const variation = (Math.floor(currentIndex / baseColors.length) + 1) * 10;
    
    // Lighten or darken based on iteration
    const newColor = currentIndex % 2 === 0 
      ? lightenColor(baseColor, variation)
      : darkenColor(baseColor, variation);
      
    result.push(newColor);
    currentIndex++;
  }
  
  return result;
}

// Helper to lighten a hex color
function lightenColor(hex: string, percent: number): string {
  return modifyColor(hex, percent, true);
}

// Helper to darken a hex color
function darkenColor(hex: string, percent: number): string {
  return modifyColor(hex, percent, false);
}

// Modify a hex color
function modifyColor(hex: string, percent: number, lighten: boolean): string {
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  // Lighten or darken
  const amount = lighten ? percent : -percent;
  
  // Calculate new RGB values
  const nr = Math.min(255, Math.max(0, Math.round(r + (r * amount / 100))));
  const ng = Math.min(255, Math.max(0, Math.round(g + (g * amount / 100))));
  const nb = Math.min(255, Math.max(0, Math.round(b + (b * amount / 100))));
  
  // Convert back to hex
  return `#${(nr << 16 | ng << 8 | nb).toString(16).padStart(6, '0')}`;
}

// Sample data for initial testing - simplified to match the request
export const sampleData = {
  data: {
    result: [
      {
        customproperties: '{"isPriceListApplied":false,"itemsInCart":18,"isOfferApplied":true,"inventoryCount":349,"time":120}',
        appversion: "3.7.0",
        userid: 0,
        deviceid: 2141999127683,
        platform: "Android",
        osversion: "10"
      },
      {
        customproperties: '{"isPriceListApplied":true,"itemsInCart":15,"isOfferApplied":false,"inventoryCount":220,"time":90}',
        appversion: "3.7.0",
        userid: 1,
        deviceid: 3141999127555,
        platform: "iOS",
        osversion: "15.1"
      }
    ]
  },
  status: 200
};
