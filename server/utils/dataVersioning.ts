/**
 * Data Versioning Utility for CSV Manager
 * 
 * This module provides functions to track changes to CSV data over time.
 * It helps create audit logs and maintain a history of data modifications.
 */

import { CsvRowData } from '../../shared/schema';

/**
 * Represents a recorded change to CSV data
 */
export interface DataChange {
  timestamp: Date;
  userId?: number;
  action: 'create' | 'update' | 'delete';
  fileId: number;
  recordId: number;
  prevData?: CsvRowData;
  newData?: CsvRowData;
  changedFields?: string[];
}

/**
 * Determines which fields changed between two versions of a data record
 * 
 * @param prevData Previous data state
 * @param newData New data state
 * @returns Array of field names that changed
 */
export function detectChangedFields(prevData: CsvRowData, newData: CsvRowData): string[] {
  const changedFields: string[] = [];
  
  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(prevData), ...Object.keys(newData)]);
  
  // Check each key for differences
  for (const key of allKeys) {
    // Field exists in both versions but values differ
    if (key in prevData && key in newData && prevData[key] !== newData[key]) {
      changedFields.push(key);
    }
    // Field exists in only one version
    else if ((key in prevData && !(key in newData)) || 
             (!(key in prevData) && key in newData)) {
      changedFields.push(key);
    }
  }
  
  return changedFields;
}

/**
 * Creates a change record when data is updated
 * 
 * @param fileId CSV file ID
 * @param recordId Data record ID
 * @param prevData Previous data state
 * @param newData New data state
 * @param userId Optional user ID of who made the change
 * @returns DataChange object representing the change
 */
export function createChangeRecord(
  fileId: number,
  recordId: number,
  prevData: CsvRowData,
  newData: CsvRowData,
  userId?: number
): DataChange {
  const changedFields = detectChangedFields(prevData, newData);
  
  return {
    timestamp: new Date(),
    userId,
    action: 'update',
    fileId,
    recordId,
    prevData,
    newData,
    changedFields
  };
}

/**
 * Creates a change record for new data creation
 * 
 * @param fileId CSV file ID
 * @param recordId Data record ID
 * @param data The new data created
 * @param userId Optional user ID of who created the record
 * @returns DataChange object representing the creation
 */
export function createCreationRecord(
  fileId: number,
  recordId: number,
  data: CsvRowData,
  userId?: number
): DataChange {
  return {
    timestamp: new Date(),
    userId,
    action: 'create',
    fileId,
    recordId,
    newData: data,
    changedFields: Object.keys(data)
  };
}

/**
 * Creates a change record for data deletion
 * 
 * @param fileId CSV file ID
 * @param recordId Data record ID
 * @param data The data that was deleted
 * @param userId Optional user ID of who deleted the record
 * @returns DataChange object representing the deletion
 */
export function createDeletionRecord(
  fileId: number,
  recordId: number,
  data: CsvRowData,
  userId?: number
): DataChange {
  return {
    timestamp: new Date(),
    userId,
    action: 'delete',
    fileId,
    recordId,
    prevData: data,
    changedFields: Object.keys(data)
  };
}

/**
 * Formats a DataChange object into a human-readable description
 * 
 * @param change The DataChange object to format
 * @returns A formatted string describing the change
 */
export function formatChange(change: DataChange): string {
  const timestamp = change.timestamp.toISOString();
  const user = change.userId ? `User ${change.userId}` : 'Anonymous';
  
  switch (change.action) {
    case 'create':
      return `[${timestamp}] ${user} created a new record (ID: ${change.recordId}) in file ${change.fileId}`;
    
    case 'update':
      return `[${timestamp}] ${user} updated record ${change.recordId} in file ${change.fileId}. Changed fields: ${change.changedFields?.join(', ')}`;
    
    case 'delete':
      return `[${timestamp}] ${user} deleted record ${change.recordId} from file ${change.fileId}`;
    
    default:
      return `[${timestamp}] Unknown action on record ${change.recordId}`;
  }
}

// Note: This is just a utility for tracking changes.
// In a production system, you would store these changes in a database table.