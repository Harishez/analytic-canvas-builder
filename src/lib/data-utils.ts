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
  conditionOperator: 'AND' | 'OR' = 'AND'
): any[] {
  return data.filter(item => {
    const results = conditions.map(condition => {
      const { field, operator, value } = condition;
      const itemValue = item.customProperties?.[field] ?? item[field];
      
      switch (operator) {
        case 'equals':
          return itemValue === value;
        case 'notEquals':
          return itemValue !== value;
        case 'greaterThan':
          return itemValue > value;
        case 'lessThan':
          return itemValue < value;
        case 'greaterOrEqual':
          return itemValue >= value;
        case 'lessOrEqual':
          return itemValue <= value;
        case 'contains':
          return String(itemValue).includes(String(value));
        case 'startsWith':
          return String(itemValue).startsWith(String(value));
        case 'endsWith':
          return String(itemValue).endsWith(String(value));
        default:
          return true;
      }
    });

    return conditionOperator === 'AND' 
      ? results.every(result => result)
      : results.some(result => result);
  });
}

// Aggregate data for visualization
export function aggregateData(
  data: any[], 
  metrics: string[], 
  dimensions: string[]
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
      const values = items.map(item => 
        item.customProperties?.[metric] ?? item[metric]
      ).filter(value => value !== undefined && value !== null);
      
      // Calculate aggregations
      resultItem[`${metric}_sum`] = values.reduce((sum, val) => sum + Number(val), 0);
      resultItem[`${metric}_avg`] = values.length > 0 
        ? resultItem[`${metric}_sum`] / values.length 
        : 0;
      resultItem[`${metric}_min`] = Math.min(...values);
      resultItem[`${metric}_max`] = Math.max(...values);
      resultItem[`${metric}_count`] = values.length;
    });
    
    result.push(resultItem);
  });
  
  return result;
}

// Group data for comparisons
export function groupDataForComparison(
  data: any[],
  groupingConditions: Array<{field: string; value: any}>
): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  // Generate all possible condition combinations
  const conditionLabels: string[] = [];
  
  // Function to recursively generate condition combinations
  function generateConditions(
    index: number, 
    currentCondition: Record<string, any>, 
    currentLabel: string
  ) {
    if (index >= groupingConditions.length) {
      conditionLabels.push(currentLabel.trim());
      result[currentLabel.trim()] = data.filter(item => {
        return Object.entries(currentCondition).every(([field, value]) => {
          return item.customProperties?.[field] === value || item[field] === value;
        });
      });
      return;
    }
    
    const { field, value } = groupingConditions[index];
    
    // Condition is true
    generateConditions(
      index + 1,
      { ...currentCondition, [field]: true },
      `${currentLabel} ${field}=true`
    );
    
    // Condition is false
    generateConditions(
      index + 1,
      { ...currentCondition, [field]: false },
      `${currentLabel} ${field}=false`
    );
  }
  
  generateConditions(0, {}, '');
  
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

// Process data for the case in the example
export function processExampleCase(data: any[]): {
  condition1: any[];
  condition2: any[];
  condition3: any[];
} {
  const filteredData = data.filter(
    item => item.inventoryCount > 100 && item.itemsInCart > 10
  );
  
  // Case 1: offer is applied & price list not applied
  const condition1 = filteredData.filter(
    item => item.isOfferApplied === true && item.isPriceListApplied === false
  );
  
  // Case 2: Offer is not applied & price list is applied
  const condition2 = filteredData.filter(
    item => item.isOfferApplied === false && item.isPriceListApplied === true
  );
  
  // Case 3: both not applied
  const condition3 = filteredData.filter(
    item => item.isOfferApplied === false && item.isPriceListApplied === false
  );
  
  return {
    condition1,
    condition2,
    condition3
  };
}

// Sample data for initial testing
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
        customproperties: '{"isPriceListApplied":false,"itemsInCart":19,"isOfferApplied":true,"inventoryCount":329,"time":145}',
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
      },
      {
        customproperties: '{"isPriceListApplied":true,"itemsInCart":12,"isOfferApplied":false,"inventoryCount":180,"time":110}',
        appversion: "3.7.1",
        userid: 2,
        deviceid: 4141999127444,
        platform: "Android",
        osversion: "11"
      },
      {
        customproperties: '{"isPriceListApplied":false,"itemsInCart":8,"isOfferApplied":false,"inventoryCount":420,"time":60}',
        appversion: "3.7.0",
        userid: 3,
        deviceid: 5141999127333,
        platform: "iOS",
        osversion: "14.5"
      },
      {
        customproperties: '{"isPriceListApplied":false,"itemsInCart":22,"isOfferApplied":false,"inventoryCount":150,"time":180}',
        appversion: "3.7.2",
        userid: 4,
        deviceid: 6141999127222,
        platform: "Android",
        osversion: "12"
      },
      {
        customproperties: '{"isPriceListApplied":true,"itemsInCart":14,"isOfferApplied":true,"inventoryCount":280,"time":130}',
        appversion: "3.7.1",
        userid: 5,
        deviceid: 7141999127111,
        platform: "iOS",
        osversion: "15.2"
      },
      {
        customproperties: '{"isPriceListApplied":false,"itemsInCart":17,"isOfferApplied":true,"inventoryCount":310,"time":155}',
        appversion: "3.7.0",
        userid: 6,
        deviceid: 8141999127000,
        platform: "Android",
        osversion: "10"
      }
    ]
  },
  status: 200
};
