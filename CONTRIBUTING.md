# Contributing to GoXpress

Thank you for your interest in contributing to GoXpress! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/goxpress.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add: feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL database (or Supabase account)
- Git

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Environment Variables**:
   - Copy `.env.example` to `.env` in both backend and frontend folders
   - Fill in your database credentials and other configuration

4. **Run Database Migrations**:
   ```bash
   # Connect to your database and run migration files in order
   psql "your-database-url"
   \i backend/sql/001_schema.sql
   \i backend/sql/002_seed.sql
   # ... continue with all migration files
   ```

5. **Start Development Servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Code Style

### JavaScript/React
- Use ES6+ syntax
- Use functional components with hooks
- Follow existing code formatting
- Add comments for complex logic
- Use meaningful variable names

### CSS
- Use CSS custom properties for theming
- Follow BEM naming convention where applicable
- Keep styles modular and reusable

### Git Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Use imperative mood: "Move cursor to..." not "Moves cursor to..."
- Prefix commits:
  - `Add:` for new features
  - `Fix:` for bug fixes
  - `Update:` for updates to existing features
  - `Remove:` for removing code/files
  - `Refactor:` for code refactoring
  - `Docs:` for documentation changes

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update documentation if you're changing functionality
3. Ensure all tests pass (if tests exist)
4. Make sure your code follows the project's code style
5. The PR will be merged once reviewed and approved

## Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

## Feature Requests

We welcome feature requests! Please:
- Check if the feature has already been requested
- Clearly describe the feature and its benefits
- Provide examples or mockups if possible

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions about contributing!

Thank you for contributing to GoXpress! 🚀
