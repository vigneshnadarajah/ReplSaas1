import { users, type User, type InsertUser, csvFiles, type CsvFile, type InsertCsvFile, csvData, type CsvData, type InsertCsvData, type CsvRowData } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // CSV Files Operations
  createCsvFile(file: InsertCsvFile): Promise<CsvFile>;
  getCsvFiles(): Promise<CsvFile[]>;
  getCsvFileById(id: number): Promise<CsvFile | undefined>;
  deleteCsvFile(id: number): Promise<boolean>;

  // CSV Data Operations
  createCsvData(data: InsertCsvData): Promise<CsvData>;
  getCsvDataByFileId(fileId: number, page: number, limit: number): Promise<{data: CsvData[], total: number}>;
  getCsvDataById(id: number): Promise<CsvData | undefined>;
  searchCsvData(fileId: number, searchTerm: string, fields?: string[]): Promise<CsvData[]>;
  filterCsvData(fileId: number, filters: Record<string, any>, page: number, limit: number): Promise<{data: CsvData[], total: number}>;
  
  // Get unique values for a specific column
  getUniqueColumnValues(fileId: number, columnName: string, limit?: number): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private csvFiles: Map<number, CsvFile>;
  private csvDataItems: Map<number, CsvData>;
  private currentUserId: number;
  private currentFileId: number;
  private currentDataId: number;

  constructor() {
    this.users = new Map();
    this.csvFiles = new Map();
    this.csvDataItems = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    this.currentDataId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.replitId === replitId,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      roles: insertUser.roles || null
    };
    this.users.set(id, user);
    return user;
  }

  async createCsvFile(insertFile: InsertCsvFile): Promise<CsvFile> {
    const id = this.currentFileId++;
    const now = new Date();
    const file: CsvFile = { 
      id,
      filename: insertFile.filename,
      originalName: insertFile.originalName,
      userId: insertFile.userId ?? null, // Ensure userId is never undefined
      createdAt: now,
      headers: insertFile.headers
    };
    this.csvFiles.set(id, file);
    return file;
  }

  async getCsvFiles(): Promise<CsvFile[]> {
    return Array.from(this.csvFiles.values());
  }

  async getCsvFileById(id: number): Promise<CsvFile | undefined> {
    return this.csvFiles.get(id);
  }

  async deleteCsvFile(id: number): Promise<boolean> {
    // Delete associated data first
    Array.from(this.csvDataItems.values())
      .filter(item => item.fileId === id)
      .forEach(item => this.csvDataItems.delete(item.id));
    
    return this.csvFiles.delete(id);
  }

  async createCsvData(insertData: InsertCsvData): Promise<CsvData> {
    const id = this.currentDataId++;
    const data: CsvData = { ...insertData, id };
    this.csvDataItems.set(id, data);
    return data;
  }

  async getCsvDataByFileId(fileId: number, page: number = 1, limit: number = 10): Promise<{data: CsvData[], total: number}> {
    const items = Array.from(this.csvDataItems.values())
      .filter(item => item.fileId === fileId);
    
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    return {
      data: items.slice(startIndex, endIndex),
      total
    };
  }

  async getCsvDataById(id: number): Promise<CsvData | undefined> {
    return this.csvDataItems.get(id);
  }

  async searchCsvData(fileId: number, searchTerm: string, fields?: string[]): Promise<CsvData[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return Array.from(this.csvDataItems.values())
      .filter(item => {
        if (item.fileId !== fileId) return false;
        
        const rowData = item.rowData as CsvRowData;
        
        if (fields && fields.length > 0) {
          // Search only in specified fields
          return fields.some(field => {
            const value = rowData[field];
            return value !== undefined && 
              String(value).toLowerCase().includes(lowerSearchTerm);
          });
        } else {
          // Search in all fields
          return Object.values(rowData).some(value => 
            String(value).toLowerCase().includes(lowerSearchTerm)
          );
        }
      });
  }

  async filterCsvData(fileId: number, filters: Record<string, any>, page: number = 1, limit: number = 10): Promise<{data: CsvData[], total: number}> {
    const allItems = Array.from(this.csvDataItems.values())
      .filter(item => {
        if (item.fileId !== fileId) return false;
        
        const rowData = item.rowData as CsvRowData;
        
        // Handle special filters
        if (filters._global) {
          // Global search across all fields
          const searchTerm = filters._global.toLowerCase();
          const matches = Object.values(rowData).some(val => 
            String(val).toLowerCase().includes(searchTerm)
          );
          if (!matches) return false;
        }
        
        // Handle dynamic status filters (status_[value])
        const statusFilters = Object.keys(filters).filter(key => key.startsWith('status_'));
        if (statusFilters.length > 0) {
          // Find a status field in rowData - common names like Status, status, state, etc.
          const statusFieldKeys = Object.keys(rowData).filter(key => 
            key.toLowerCase() === 'status' || 
            key.toLowerCase() === 'state' || 
            key.toLowerCase() === 'condition'
          );
          
          if (statusFieldKeys.length > 0) {
            const statusField = statusFieldKeys[0]; // Use the first matching status field
            const status = String(rowData[statusField] || '').toLowerCase();
            
            // Check if any status filter matches
            const statusValues = statusFilters.map(filter => filter.replace('status_', ''));
            const statusMatches = statusValues.some(val => status === val);
            
            if (statusFilters.length > 0 && !statusMatches) return false;
          }
        }
        
        // Handle date range filters more generically
        if (filters.date_from || filters.date_to) {
          // Try to find a date field in the data
          const potentialDateFields = Object.keys(rowData).filter(key => {
            const val = String(rowData[key] || '');
            // Look for fields that could be dates or years
            return (
              key.toLowerCase().includes('date') || 
              key.toLowerCase().includes('year') || 
              key.toLowerCase() === 'created' || 
              key.toLowerCase().includes('timestamp') ||
              (val.length === 4 && /^\d{4}$/.test(val)) // Looks like a year
            );
          });
          
          if (potentialDateFields.length > 0) {
            const dateField = potentialDateFields[0]; // Use first potential date field
            const dateValue = rowData[dateField];
            
            // Handle year value
            if (typeof dateValue === 'string' && /^\d{4}$/.test(dateValue)) {
              const year = parseInt(dateValue, 10);
              
              if (filters.date_from) {
                const fromYear = parseInt(filters.date_from, 10);
                if (!isNaN(fromYear) && year < fromYear) return false;
              }
              
              if (filters.date_to) {
                const toYear = parseInt(filters.date_to, 10);
                if (!isNaN(toYear) && year > toYear) return false;
              }
            }
            // You could add more date formats here if needed
          }
        }
        
        // Handle regular field filters (excluding special ones)
        return Object.entries(filters).every(([field, value]) => {
          // Skip special filters
          if (field === '_global' || 
              field.startsWith('status_') || 
              field === 'date_from' || 
              field === 'date_to') {
            return true;
          }
          
          if (value === null || value === undefined || value === '') return true; // Skip empty filters
          
          // Clean field name from BOM character if present
          const cleanField = field.replace(/^\ufeff/, '');
          
          // Try to find the field value, accounting for potential BOM character in the field name
          let fieldValue = rowData[field];
          
          // If field not found directly, try the clean version
          if (fieldValue === undefined && field !== cleanField) {
            fieldValue = rowData[cleanField];
          }
          
          // If still not found, look for fields that match when BOM is removed
          if (fieldValue === undefined) {
            const possibleKey = Object.keys(rowData).find(key => 
              key.replace(/^\ufeff/, '') === cleanField || 
              key === '\ufeff' + cleanField
            );
            
            if (possibleKey) {
              fieldValue = rowData[possibleKey];
            } else {
              return true; // Skip if field doesn't exist at all
            }
          }
          
          // Now apply the filter logic
          if (Array.isArray(value)) {
            // If the filter value is an array, check if the field value is in the array
            return value.includes(fieldValue);
          } else if (typeof value === 'string') {
            // If the filter value is a string, do a case-insensitive search
            return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
          } else if (typeof value === 'number') {
            // For numeric comparisons
            if (typeof fieldValue === 'string' && !isNaN(Number(fieldValue))) {
              return Number(fieldValue) === value;
            } else {
              return fieldValue === value;
            }
          } else {
            // Otherwise, just check for equality
            return fieldValue === value;
          }
        });
      });
    
    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    return {
      data: allItems.slice(startIndex, endIndex),
      total
    };
  }

  async getUniqueColumnValues(fileId: number, columnName: string, limit: number = 50): Promise<string[]> {
    const items = Array.from(this.csvDataItems.values())
      .filter(item => item.fileId === fileId);
    
    // Create a Set to track unique values
    const uniqueValues = new Set<string>();
    
    // Clean column name from BOM character if present
    const cleanColumnName = columnName.replace(/^\ufeff/, '');
    
    // Collect all unique values for the specified column
    // Try both the original column name and the cleaned version (handles BOM characters)
    items.forEach(item => {
      const rowData = item.rowData as CsvRowData;
      
      // Try the original column name first
      if (rowData[columnName] !== undefined) {
        uniqueValues.add(String(rowData[columnName]));
      } 
      // If not found and it differs from the clean version, try the clean version
      else if (columnName !== cleanColumnName && rowData[cleanColumnName] !== undefined) {
        uniqueValues.add(String(rowData[cleanColumnName]));
      }
      // For BOM characters at the beginning of values
      else {
        // Check for keys that might have BOM characters
        const possibleKeys = Object.keys(rowData).filter(key => 
          key.replace(/^\ufeff/, '') === cleanColumnName
        );
        
        if (possibleKeys.length > 0) {
          uniqueValues.add(String(rowData[possibleKeys[0]]));
        }
      }
    });
    
    // Convert to array, sort, and limit if needed
    return Array.from(uniqueValues)
      .sort()
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
