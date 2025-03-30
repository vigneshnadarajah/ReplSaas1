#!/usr/bin/env node

/**
 * Version Bumping Script for CSV Manager
 * 
 * This script updates the version in VERSION file according to semantic versioning.
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const versionFile = path.join(rootDir, 'VERSION');

// Read current version
let currentVersion = '0.1.0';
try {
  currentVersion = fs.readFileSync(versionFile, 'utf8').trim();
} catch (error) {
  console.warn('VERSION file not found, creating with default 0.1.0');
}

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Get bump type from args
const bumpType = process.argv[2] || 'patch';

// Calculate new version
let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

// Write new version
fs.writeFileSync(versionFile, newVersion);

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);

// Update the CHANGELOG.md with a new unreleased section
const changelogFile = path.join(rootDir, 'CHANGELOG.md');
try {
  let changelog = fs.readFileSync(changelogFile, 'utf8');
  
  // Check if we already have an Unreleased section
  if (changelog.includes('## [Unreleased]')) {
    // Update the existing Unreleased section
    changelog = changelog.replace(
      '## [Unreleased]',
      `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().split('T')[0]}`
    );
  } else {
    // Add a new Unreleased section
    changelog = changelog.replace(
      '# Changelog',
      '# Changelog\n\n## [Unreleased]'
    );
  }
  
  fs.writeFileSync(changelogFile, changelog);
  console.log(`CHANGELOG.md updated with version ${newVersion}`);
} catch (error) {
  console.error('Failed to update CHANGELOG.md:', error.message);
}

console.log(`
Next steps:
1. Update CHANGELOG.md with details of changes
2. Commit changes: git commit -am "chore(release): bump version to ${newVersion}"
3. Create tag: git tag v${newVersion}
4. Push changes: git push && git push --tags
`);