import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").notNull().unique(),
  username: text("username").notNull().unique(),
  roles: text("roles").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const csvFiles = pgTable("csv_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  headers: text("headers").array().notNull(),
});

export const csvData = pgTable("csv_data", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => csvFiles.id).notNull(),
  rowData: jsonb("row_data").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCsvFileSchema = createInsertSchema(csvFiles).pick({
  filename: true,
  originalName: true,
  userId: true,
  headers: true,
});

export const insertCsvDataSchema = createInsertSchema(csvData).pick({
  fileId: true,
  rowData: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCsvFile = z.infer<typeof insertCsvFileSchema>;
export type CsvFile = typeof csvFiles.$inferSelect;

export type InsertCsvData = z.infer<typeof insertCsvDataSchema>;
export type CsvData = typeof csvData.$inferSelect;

// Custom type for CSV row data
export type CsvRowData = Record<string, string | number | boolean>;
