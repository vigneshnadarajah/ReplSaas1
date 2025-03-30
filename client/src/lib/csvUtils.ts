/**
 * CSV Utility functions for the CSV Manager application
 */

/**
 * Formats a CSV row data status field with appropriate styling class
 * @param status The status string value
 * @returns A class string for styling the status badge
 */
export const getStatusClass = (status: string): string => {
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('active')) {
    return 'bg-green-100 text-green-800';
  } else if (lowerStatus.includes('inactive')) {
    return 'bg-red-100 text-red-800';
  } else if (lowerStatus.includes('pending')) {
    return 'bg-orange-100 text-orange-800';
  }
  
  return 'bg-gray-100 text-gray-800';
};

/**
 * Formats date values to a consistent format
 * @param dateString A date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return dateString;
  }
};

/**
 * Detects the data type of a CSV column
 * @param values Array of values from a column
 * @returns The detected data type ('string', 'number', 'date', 'boolean', 'category')
 */
export const detectColumnType = (values: any[]): string => {
  // Skip empty values
  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonEmptyValues.length === 0) return 'string';
  
  // Check if all values are numbers
  const allNumbers = nonEmptyValues.every(v => !isNaN(Number(v)));
  if (allNumbers) return 'number';
  
  // Check if all values are dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
  const yearRegex = /^(19|20)\d{2}$/; // Year format detection (1900-2099)
  
  // Check for years first
  if (nonEmptyValues.every(v => yearRegex.test(String(v)))) {
    return 'year';
  }
  
  // Then check for full dates
  const allDates = nonEmptyValues.every(v => dateRegex.test(String(v)) && !isNaN(Date.parse(String(v))));
  if (allDates) return 'date';
  
  // Check if all values are booleans
  const booleanValues = ['true', 'false', 'yes', 'no', '1', '0'];
  const allBooleans = nonEmptyValues.every(v => 
    booleanValues.includes(String(v).toLowerCase())
  );
  if (allBooleans) return 'boolean';
  
  // Check if it's a categorical field with few unique values
  const uniqueValues = new Set(nonEmptyValues.map(v => String(v).toLowerCase()));
  if (uniqueValues.size <= 15 && uniqueValues.size > 1) {
    return 'category';
  }
  
  // Default to string
  return 'string';
};

/**
 * Gets a user's initials from a name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Gets the appropriate chart type for a field based on its name and data type
 * @param fieldName The name of the field
 * @param dataType The detected data type
 * @returns The recommended chart type ('pie', 'bar', 'line')
 */
export const getRecommendedChartType = (fieldName: string, dataType: string): 'pie' | 'bar' | 'line' => {
  // Use lowercase for consistent comparisons
  const lowerFieldName = fieldName.toLowerCase();
  
  // Year or Date fields often work well with line charts
  if (dataType === 'year' || dataType === 'date' || lowerFieldName.includes('year') || lowerFieldName.includes('date')) {
    return 'line';
  }
  
  // Numeric fields often work well with bar charts
  if (dataType === 'number') {
    // Small ranges might work better as pie charts
    return 'bar';
  }
  
  // Categorical fields with few values work well with pie charts
  if (dataType === 'category' || dataType === 'boolean') {
    return 'pie';
  }
  
  // Status fields typically work well with pie charts
  if (lowerFieldName.includes('status') || 
      lowerFieldName.includes('type') || 
      lowerFieldName.includes('category')) {
    return 'pie';
  }
  
  // Default to bar for other cases
  return 'bar';
};

/**
 * Function to determine a color based on status
 * @param status The status value
 * @returns A color code for the status
 */
export const statusColor = (status: string): string => {
  const lowerStatus = String(status).toLowerCase();
  
  if (lowerStatus.includes('active') || lowerStatus.includes('approved') || lowerStatus.includes('success')) {
    return 'bg-green-100 text-green-800';
  } else if (lowerStatus.includes('inactive') || lowerStatus.includes('rejected') || lowerStatus.includes('failed')) {
    return 'bg-red-100 text-red-800';
  } else if (lowerStatus.includes('pending') || lowerStatus.includes('review') || lowerStatus.includes('wait')) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (lowerStatus.includes('draft') || lowerStatus.includes('new')) {
    return 'bg-blue-100 text-blue-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Identifies status fields in CSV data
 * @param headers Array of column headers
 * @returns Array of potential status field names
 */
export const identifyStatusFields = (headers: string[]): string[] => {
  return headers.filter(header => {
    const lower = header.toLowerCase();
    return lower.includes('status') || 
           lower.includes('state') || 
           lower.includes('condition') || 
           lower === 'type' ||
           lower.includes('status');
  });
};

/**
 * Identifies date/time fields in CSV data
 * @param headers Array of column headers
 * @returns Array of potential date field names
 */
export const identifyDateFields = (headers: string[]): string[] => {
  return headers.filter(header => {
    const lower = header.toLowerCase();
    return lower.includes('date') || 
           lower.includes('time') || 
           lower.includes('year') || 
           lower.includes('created') || 
           lower.includes('updated') ||
           lower.includes('timestamp');
  });
};
