#!/bin/bash

# Release Script for CSV Manager
# This script helps create a new release following Git Flow conventions

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}CSV Manager - Release Script${NC}"
echo "========================================"
echo

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

# Read current version
if [ ! -f "VERSION" ]; then
    echo -e "${RED}Error: VERSION file not found.${NC}"
    exit 1
fi

CURRENT_VERSION=$(cat VERSION)
echo "Current version: $CURRENT_VERSION"

# Ask for release type
echo
echo "What type of release would you like to make?"
echo "1) Major (x.0.0)"
echo "2) Minor (0.x.0)"
echo "3) Patch (0.0.x)"
read -p "Enter your choice (1-3): " RELEASE_TYPE

case $RELEASE_TYPE in
    1)
        VERSION_TYPE="major"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3|"")
        VERSION_TYPE="patch"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Bump version
echo "Bumping $VERSION_TYPE version..."
node scripts/bump-version.js $VERSION_TYPE

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to bump version.${NC}"
    exit 1
fi

NEW_VERSION=$(cat VERSION)
echo "New version: $NEW_VERSION"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
    
    read -p "Do you want to stash these changes before creating the release? (y/n) " -n 1 -r
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

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
echo "Creating release branch $RELEASE_BRANCH..."
git checkout -b $RELEASE_BRANCH

# Commit version changes
git add VERSION CHANGELOG.md
git commit -m "chore(release): bump version to $NEW_VERSION"

echo -e "${GREEN}Release preparation complete!${NC}"
echo 
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the release changes"
echo "2. Make any final adjustments and commit them"
echo "3. Merge the release branch into main:"
echo "   git checkout main"
echo "   git merge --no-ff $RELEASE_BRANCH"
echo "4. Tag the release:"
echo "   git tag -a v$NEW_VERSION -m \"Release v$NEW_VERSION\""
echo "5. Merge the release branch back to develop:"
echo "   git checkout develop"
echo "   git merge --no-ff $RELEASE_BRANCH"
echo "6. Delete the release branch:"
echo "   git branch -d $RELEASE_BRANCH"
echo "7. Push everything:"
echo "   git push origin main develop --tags"