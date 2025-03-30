# Schema Changelog

This file documents changes to the database schema for the CSV Manager application.

## Version 0.1.0 (Initial Schema)

### Tables

#### `users`
- `id`: serial, primary key
- `replitId`: text, not null, unique
- `username`: text, not null, unique
- `roles`: text array
- `createdAt`: timestamp, default now(), not null

#### `csvFiles`
- `id`: serial, primary key
- `filename`: text, not null
- `originalName`: text, not null
- `userId`: integer, references users.id
- `createdAt`: timestamp, default now(), not null
- `headers`: text array, not null

#### `csvData`
- `id`: serial, primary key
- `fileId`: integer, references csvFiles.id, not null
- `rowData`: jsonb, not null

### Types
- `InsertUser`: Zod schema for user insertion
- `User`: Inferred type from users table
- `InsertCsvFile`: Zod schema for CSV file insertion
- `CsvFile`: Inferred type from csvFiles table
- `InsertCsvData`: Zod schema for CSV data insertion
- `CsvData`: Inferred type from csvData table
- `CsvRowData`: Custom type for CSV row data (Record<string, string | number | boolean>)

## Planned Future Changes

- Add `lastUpdated` timestamp to track when records are modified
- Add soft delete capability with `isDeleted` boolean flag 
- Add support for saved filter configurations
- Add versioning to track changes to CSV data