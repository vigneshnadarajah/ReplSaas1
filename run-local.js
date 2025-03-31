#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting CSV Manager app locally...');
console.log('This script uses localhost instead of 0.0.0.0 to avoid ENOTSUP errors');

// Make sure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

try {
  console.log('Starting server on localhost:5000...');
  execSync('tsx server/local.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  process.exit(1);
}