#!/bin/bash

# Setup Git Repository Script for CSV Manager
# This script initializes a new Git repository with the proper structure
# for CSV Manager development workflow.

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}CSV Manager Git Repository Setup${NC}"
echo "========================================"
echo

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo -e "${RED}Error: git is not installed.${NC}"
    echo "Please install git first and try again."
    exit 1
fi

# Check if this is already a git repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}Warning: This directory is already a Git repository.${NC}"
    echo "This script is intended for initializing a new repository."
    
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without changes."
        exit 0
    fi
else
    # Initialize new git repository
    echo "Initializing a new Git repository..."
    git init
    echo -e "${GREEN}Git repository initialized.${NC}"
fi

# Create develop branch
echo "Creating develop branch..."
git checkout -b develop
echo -e "${GREEN}Develop branch created.${NC}"

# Add all files to git
echo "Adding all files to the repository..."
git add .

# Make initial commit
echo "Making initial commit..."
git commit -m "chore: initial commit"
echo -e "${GREEN}Initial commit created.${NC}"

# Create main branch
echo "Creating main branch..."
git branch main
echo -e "${GREEN}Main branch created.${NC}"

# Instructions for remote repository
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Create a remote repository on GitHub or your preferred Git platform"
echo "2. Add the remote repository with:"
echo "   git remote add origin https://github.com/yourusername/csv-manager.git"
echo "3. Push your branches with:"
echo "   git push -u origin develop"
echo "   git push -u origin main"
echo
echo -e "${GREEN}Setup completed successfully!${NC}"