# Changelog

All notable changes to the CSV Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Feature flagging infrastructure for gradual rollout of new features
- User preference storage for filter and view configurations

## [0.1.0] - 2023-03-30
### Added
- Initial application structure with client and server components
- CSV file upload and parsing functionality
- UI components: header panel, filter panel, grid panel, and details panel
- Chart visualization with auto-detection of appropriate chart types
- User-selectable columns in the filter panel
- Support for arbitrary CSV file structures
- Basic version control with Git and GitHub integration

### Changed
- Removed authentication requirements to simplify access
- Updated storage.ts to handle variable field filtering logic
- Enhanced FilterPanel to dynamically adapt to any CSV structure

### Fixed
- Resolved codebase corruption by restoring to checkpoint 4d60b884