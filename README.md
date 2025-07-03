# ForkFlow CRM

ForkFlow CRM is a website-first, mobile UI friendly CRM application designed for food brokers who visit restaurants and stores. It's built with React, react-admin, TypeScript, Tailwind CSS, and Supabase.

## Getting Started

### Installation

To set up the project, follow these steps:

```bash
# Install dependencies
npm install

# Install Playwright browsers for E2E tests
npx playwright install
```

### Running the Application

To start the development server:

```bash
# Start the full development stack (Supabase + React dev server)
make start

# Or, start individual services:
make start-supabase  # Start Supabase locally only
make start-app       # Start React dev server only
npm run dev          # Alternative to make start-app
```

The application will typically be available at `http://localhost:5173/`.

### Database Operations

```bash
# Apply database migrations
make supabase-migrate-database

# Reset and clear the database
make supabase-reset-database
```

### Testing and Quality

```bash
# Run unit tests (Vitest)
make test

# Run ESLint + Prettier checks
make lint

# Auto-fix linting issues
npm run lint:apply

# Auto-format code
npm run prettier:apply

# Run all E2E tests
npm run test:e2e
```

## Documentation

*   **Main Documentation Hub**: [doc/Readme.md](doc/Readme.md)
*   **Authentication System Guide**: [doc/developer/authentication.md](doc/developer/authentication.md)
*   **Project Roadmap & Planning**: [TODO.md](TODO.md)
