#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Make sure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

try {
  console.log('Starting CSV Manager app on localhost...');
  execSync('tsx server/local.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting server:', error.message);
  process.exit(1);
}