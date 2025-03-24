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
 * @returns The detected data type ('string', 'number', 'date', 'boolean')
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
  const allDates = nonEmptyValues.every(v => dateRegex.test(String(v)) && !isNaN(Date.parse(String(v))));
  if (allDates) return 'date';
  
  // Check if all values are booleans
  const booleanValues = ['true', 'false', 'yes', 'no', '1', '0'];
  const allBooleans = nonEmptyValues.every(v => 
    booleanValues.includes(String(v).toLowerCase())
  );
  if (allBooleans) return 'boolean';
  
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
