# Playwright Test Automation Project

A modern test automation framework built with Playwright and TypeScript.

## Project Structure

```
├── src/
│   ├── pages/          # Page Object Models
│   ├── components/     # Reusable UI components
│   ├── utils/          # Utility functions and helpers
│   ├── fixtures/       # Test fixtures and custom hooks
│   └── helpers/        # Helper functions
├── tests/
│   ├── e2e/           # End-to-end tests
│   ├── api/           # API tests
│   └── unit/          # Unit tests
├── config/            # Configuration files
├── reports/           # Test reports
└── .github/workflows/ # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

### Authentication Setup

To improve development workflow, the project uses Playwright's auth state feature to save and reuse authentication:

1. **First-time setup**: Run the authentication setup to save login state:
   ```bash
   npx playwright test tests/auth.setup.ts --project=setup
   ```

2. **Auth state storage**: The authentication state is saved to `playwright/.auth/user.json` (gitignored)

3. **Automatic auth**: All tests will automatically use the saved auth state, no need to login in each test

4. **Refresh auth**: If authentication expires, simply re-run the setup command

Note: The auth state includes cookies and local storage. It persists across test runs until you manually delete it or it expires.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI mode
```bash
npm run test:ui
```

### Run specific browser tests
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### Run API tests only
```bash
npm run test:api
```

### Run E2E tests only
```bash
npm run test:e2e
```

### Run tests in parallel
```bash
npm run test:parallel
```

## View Test Reports

After running tests, view the HTML report:
```bash
npm run report
```

## Code Generation

Generate tests using Playwright's codegen:
```bash
npm run codegen
```

## Linting and Formatting

### Run ESLint
```bash
npm run lint
```

### Fix ESLint issues
```bash
npm run lint:fix
```

### Format code with Prettier
```bash
npm run format
```

### Check formatting
```bash
npm run format:check
```

## Test Reports

The framework generates multiple report formats:
- HTML Report: `reports/html/`
- JSON Report: `reports/json/results.json`
- JUnit XML: `reports/junit/results.xml`
- Allure Report: `reports/allure-results/`

## Best Practices

1. **Page Object Model**: Use page objects for better maintainability
2. **Test Isolation**: Each test should be independent
3. **Explicit Waits**: Use Playwright's built-in waiting mechanisms
4. **Parallel Execution**: Tests run in parallel by default
5. **Screenshots & Videos**: Captured on failure for debugging

## Configuration

Main configuration is in `playwright.config.ts`. Key settings:
- `testDir`: Test directory location
- `timeout`: Test timeout settings
- `retries`: Retry configuration
- `projects`: Browser configurations
- `reporter`: Report formats

## Environment Variables

See `.env.example` for available environment variables.

## CI/CD

The project includes GitHub Actions workflows for continuous integration.