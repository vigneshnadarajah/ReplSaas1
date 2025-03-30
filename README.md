# CSV Manager

An advanced web application for CSV data management, offering powerful filtering, data visualization, and export capabilities.

## Features

- **CSV File Upload**: Support for any CSV format with automatic field detection
- **Interactive Data Grid**: Browse, sort, and page through CSV records
- **Advanced Filtering**: Dynamic filtering system that adapts to any CSV structure
- **Data Visualization**: Automatic chart generation based on data types
- **Export Capabilities**: Download your filtered data as CSV or JSON
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- Frontend: React, TypeScript, TailwindCSS
- Backend: Node.js, Express
- Data Handling: CSV parsing with auto-detection
- Visualization: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/csv-manager.git
   cd csv-manager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5000`

## Development Workflow

### Branching Strategy

We follow Git Flow for development:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `release/*`: Release preparation branches
- `hotfix/*`: Emergency fixes for production

### Development Scripts

The project includes several scripts to streamline development:

#### Creating a Feature Branch

```bash
./scripts/create-feature.sh feature-name
```

This script:
- Checks for uncommitted changes
- Switches to the develop branch
- Pulls the latest changes
- Creates a new feature branch
- Provides next step instructions

#### Creating a Release

```bash
./scripts/release.sh
```

This script:
- Bumps the version number (major, minor, or patch)
- Updates the CHANGELOG.md automatically
- Creates a release branch
- Commits the version changes
- Provides instructions for completing the release

#### Bumping Version Manually

```bash
node scripts/bump-version.js [major|minor|patch]
```

### Commit Guidelines

We use conventional commits for clear version history:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or improving tests
- `chore:` - Changes to the build process or auxiliary tools

### Continuous Integration

The project uses GitHub Actions for CI/CD:

- Automatic build and testing on push to main/develop
- Version validation on release branches
- TypeScript type checking
- Linting and formatting checks

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

### Version Tracking

- `VERSION` file: Contains the current version number
- `CHANGELOG.md`: Documents all notable changes for each version
- `SCHEMA_CHANGELOG.md`: Tracks changes to the data model

## License

This project is licensed under the MIT License - see the LICENSE file for details.