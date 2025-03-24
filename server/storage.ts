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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCsvFile(insertFile: InsertCsvFile): Promise<CsvFile> {
    const id = this.currentFileId++;
    const now = new Date();
    const file: CsvFile = { 
      ...insertFile, 
      id, 
      createdAt: now 
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
        
        // Check if the item matches all filters
        return Object.entries(filters).every(([field, value]) => {
          if (!value) return true; // Skip empty filters
          
          const fieldValue = rowData[field];
          
          if (Array.isArray(value)) {
            // If the filter value is an array, check if the field value is in the array
            return value.includes(fieldValue);
          } else if (typeof value === 'string') {
            // If the filter value is a string, do a case-insensitive search
            return String(fieldValue).toLowerCase().includes(value.toLowerCase());
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
}

export const storage = new MemStorage();
