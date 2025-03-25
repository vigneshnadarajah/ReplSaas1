import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, type AuthRequest } from "./middleware/auth";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { insertCsvFileSchema, insertCsvDataSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads");
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype !== "text/csv" && path.extname(file.originalname).toLowerCase() !== ".csv") {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Handler for uploading CSV file
  app.post("/api/csv/upload", authMiddleware, upload.single("csvFile"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const csvFilePath = req.file.path;
      const parser = fs.createReadStream(csvFilePath).pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      );

      const records: any[] = [];
      const headers: string[] = [];
      let isFirstRow = true;

      for await (const record of parser) {
        if (isFirstRow) {
          Object.keys(record).forEach(header => headers.push(header));
          isFirstRow = false;
        }
        records.push(record);
      }

      if (records.length === 0) {
        return res.status(400).json({ message: "CSV file is empty" });
      }

      try {
        // Create CSV file record
        const csvFile = await storage.createCsvFile(insertCsvFileSchema.parse({
          filename: req.file.filename,
          originalName: req.file.originalname,
          userId: 1, // Default user ID for now
          headers: headers,
        }));

        // Create CSV data records
        for (const record of records) {
          await storage.createCsvData(insertCsvDataSchema.parse({
            fileId: csvFile.id,
            rowData: record,
          }));
        }

        res.status(201).json({
          message: "CSV file uploaded and processed successfully",
          file: csvFile,
          recordCount: records.length,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Validation error",
            details: fromZodError(error).message
          });
        }
        throw error;
      }

    } catch (error) {
      console.error("Error processing CSV file:", error);
      res.status(500).json({ message: "Error processing CSV file", error: (error as Error).message });
    }
  });

  // Get list of uploaded CSV files
  app.get("/api/csv/files", async (req, res) => {
    try {
      const files = await storage.getCsvFiles();
      res.json(files);
    } catch (error) {
      console.error("Error getting CSV files:", error);
      res.status(500).json({ message: "Error getting CSV files", error: (error as Error).message });
    }
  });

  // Get CSV file by ID
  app.get("/api/csv/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const file = await storage.getCsvFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "CSV file not found" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error getting CSV file:", error);
      res.status(500).json({ message: "Error getting CSV file", error: (error as Error).message });
    }
  });

  // Get CSV data by file ID with pagination
  app.get("/api/csv/data/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const file = await storage.getCsvFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "CSV file not found" });
      }

      const { data, total } = await storage.getCsvDataByFileId(fileId, page, limit);
      
      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        headers: file.headers
      });
    } catch (error) {
      console.error("Error getting CSV data:", error);
      res.status(500).json({ message: "Error getting CSV data", error: (error as Error).message });
    }
  });

  // Get CSV data record by ID
  app.get("/api/csv/data-item/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid record ID" });
      }

      const data = await storage.getCsvDataById(id);
      if (!data) {
        return res.status(404).json({ message: "CSV data record not found" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error getting CSV data record:", error);
      res.status(500).json({ message: "Error getting CSV data record", error: (error as Error).message });
    }
  });

  // Search CSV data
  app.get("/api/csv/search/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const searchTerm = req.query.term as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }

      const fields = req.query.fields ? (req.query.fields as string).split(',') : undefined;

      const results = await storage.searchCsvData(fileId, searchTerm, fields);
      res.json(results);
    } catch (error) {
      console.error("Error searching CSV data:", error);
      res.status(500).json({ message: "Error searching CSV data", error: (error as Error).message });
    }
  });

  // Filter CSV data
  app.post("/api/csv/filter/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const filters = req.body.filters || {};
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { data, total } = await storage.filterCsvData(fileId, filters, page, limit);
      
      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error filtering CSV data:", error);
      res.status(500).json({ message: "Error filtering CSV data", error: (error as Error).message });
    }
  });

  // Export CSV data
  app.post("/api/csv/export/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const format = req.query.format as string || 'csv';
      const filters = req.body.filters || {};

      const file = await storage.getCsvFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "CSV file not found" });
      }

      // Get all data (no pagination)
      const { data } = await storage.filterCsvData(fileId, filters, 1, Number.MAX_SAFE_INTEGER);
      
      if (format === 'csv') {
        // Format data for CSV export
        const exportData = data.map(item => item.rowData);
        
        // Generate CSV
        stringify(exportData, {
          header: true,
          columns: file.headers,
        }, (err, output) => {
          if (err) {
            throw new Error(`Error generating CSV: ${err.message}`);
          }
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
          res.send(output);
        });
      } else if (format === 'json') {
        // Export as JSON
        const exportData = data.map(item => item.rowData);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName.replace('.csv', '.json')}"`);
        res.json(exportData);
      } else {
        return res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error) {
      console.error("Error exporting CSV data:", error);
      res.status(500).json({ message: "Error exporting CSV data", error: (error as Error).message });
    }
  });

  // Delete CSV file
  app.delete("/api/csv/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const file = await storage.getCsvFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "CSV file not found" });
      }

      const deleted = await storage.deleteCsvFile(fileId);
      if (deleted) {
        res.json({ message: "CSV file deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete CSV file" });
      }
    } catch (error) {
      console.error("Error deleting CSV file:", error);
      res.status(500).json({ message: "Error deleting CSV file", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
