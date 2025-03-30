#!/bin/bash

# Feature Branch Creation Script for CSV Manager
# This script helps create a new feature branch following Git Flow conventions

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}CSV Manager - Create Feature Branch${NC}"
echo "========================================"
echo

# Check parameters
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No feature name provided.${NC}"
    echo "Usage: $0 <feature-name>"
    exit 1
fi

# Format feature name
FEATURE_NAME=$(echo "$1" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
BRANCH_NAME="feature/$FEATURE_NAME"

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo -e "${RED}Error: git is not installed.${NC}"
    echo "Please install git first and try again."
    exit 1
fi

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: This directory is not a Git repository.${NC}"
    echo "Please run this script from the root of your Git repository."
    exit 1
fi

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo -e "${RED}Error: Branch '$BRANCH_NAME' already exists.${NC}"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
    
    read -p "Do you want to stash these changes before creating the feature branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        echo "Changes stashed."
    else
        echo "Proceeding with uncommitted changes."
    fi
fi

# Make sure we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${YELLOW}You are not on the develop branch. Switching to develop...${NC}"
    git checkout develop
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to switch to develop branch.${NC}"
        exit 1
    fi
fi

# Pull latest changes from develop
echo "Pulling latest changes from develop..."
git pull origin develop

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Failed to pull latest changes from develop.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without creating feature branch."
        exit 0
    fi
fi

# Create and checkout new feature branch
echo "Creating feature branch '$BRANCH_NAME'..."
git checkout -b $BRANCH_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create feature branch.${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully created feature branch '$BRANCH_NAME'.${NC}"
echo 
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Make your changes for the new feature"
echo "2. Commit your changes with descriptive commit messages"
echo "3. Push your branch with: git push -u origin $BRANCH_NAME"
echo "4. When ready, create a pull request to merge into the develop branch"