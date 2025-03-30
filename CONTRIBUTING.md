# Contributing to CSV Manager

Thank you for considering contributing to CSV Manager! This document provides guidelines and instructions to help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

1. Use the GitHub issue search — check if the issue has already been reported.
2. Check if the issue has been fixed — try to reproduce it using the latest `main` or `develop` branch.
3. Use the bug report template to create the issue.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

1. Use the GitHub issue search to see if the enhancement has already been suggested.
2. Use the feature request template to create the issue.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

* [Beginner issues](https://github.com/yourusername/csv-manager/labels/beginner) - issues which should only require a few lines of code.
* [Help wanted issues](https://github.com/yourusername/csv-manager/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues.

### Pull Requests

The process described here has several goals:

- Maintain code quality
- Fix problems that are important to users
- Engage the community in working toward the best possible CSV Manager
- Enable a sustainable system for the project's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in the pull request template
2. Follow the styling and testing standards
3. After you submit your pull request, verify that all status checks are passing

## Development Process

### Setting Up the Development Environment

1. Fork and clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

### Branching Strategy

We follow Git Flow for development:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `release/*`: Release preparation branches
- `hotfix/*`: Emergency fixes for production

Use the provided scripts to create branches:

```bash
./scripts/create-feature.sh feature-name
```

### Coding Standards

- Follow the TypeScript style guide
- Write meaningful commit messages following the conventional commits format
- Maintain test coverage

### Version Control and Releases

- Version numbers follow [Semantic Versioning](https://semver.org/)
- All notable changes are documented in CHANGELOG.md
- Schema changes are tracked in SCHEMA_CHANGELOG.md

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable prefix:
    * `feat:` when adding a new feature
    * `fix:` when fixing a bug
    * `docs:` when changing documentation
    * `style:` for changes that don't affect code behavior (formatting, etc.)
    * `refactor:` for code changes that neither fix a bug nor add a feature
    * `perf:` for performance improvements
    * `test:` for adding missing tests or modifying existing tests
    * `chore:` for changes to the build process or auxiliary tools

### JavaScript/TypeScript Styleguide

* Use ES6 syntax where possible
* Prefer arrow functions
* Use interface over type (in most cases)
* Avoid any type - use proper types
* Prefer async/await over promises

### Documentation Styleguide

* Use [Markdown](https://daringfireball.net/projects/markdown/).
* Reference all classes, methods, and variables in backticks: \`variable\`
* Include code examples where appropriate

## Additional Notes

### Issue and Pull Request Labels

Labels help us track and manage issues and pull requests.

#### Type of Issue and Issue State

| Label name | Description |
| --- | --- |
| `bug` | Confirmed bugs or reports that are likely to be bugs |
| `enhancement` | Feature requests |
| `documentation` | Documentation improvements |
| `duplicate` | Issues which are duplicates of other issues |
| `help-wanted` | The CSV Manager team would like extra help on this issue |
| `invalid` | Issues which aren't valid (e.g., user errors) |
| `question` | Questions about the CSV Manager functionality |
| `wontfix` | The CSV Manager team has decided not to fix these issues |

#### Topic Categories

| Label name | Description |
| --- | --- |
| `frontend` | Related to the React frontend |
| `backend` | Related to the Express backend |
| `performance` | Related to application performance |
| `security` | Related to security concerns |
| `testing` | Related to testing |
| `ui` | Related to visual design |
| `beginner` | Good for newcomers |

Thank you for contributing to CSV Manager!