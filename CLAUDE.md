# Favbet Test Automation Project

## Project Overview
This is a Playwright-based test automation project for testing Favbet.ua website functionality. The project includes both UI (E2E) and API test cases covering user authentication, favorites management, social media integration, settings changes, and bonus/games management.

## Test Requirements

### UI Tests
1. **Favorites Management Test** - Login, navigate to Live, add/remove favorites
2. **YouTube Integration Test** - Verify social media channel and specific video
3. **Settings Test** - Language and theme switching

### API Tests
1. **Bonuses Test** - Fetch and verify user bonuses
2. **Instant Games Favorites Test** - Add games to favorites and verify via API

## Project Structure
```
├── src/pages/          # Page Object Models for Favbet pages
├── src/utils/          # Utilities (auth, data, logger)
├── src/fixtures/       # Test fixtures
├── tests/e2e/          # UI tests for Favbet
├── tests/api/          # API tests for Favbet
└── config/             # Environment configurations
```

## Key Commands
- **Run all tests**: `npm test`
- **Run UI tests only**: `npm run test:e2e`
- **Run API tests only**: `npm run test:api`
- **Run in debug mode**: `npm run test:debug`
- **Run with UI mode**: `npm run test:ui`
- **Generate new tests**: `npm run codegen`
- **Lint check**: `npm run lint`
- **Type check**: `npx tsc --noEmit`
- **Start MCP server**: `npm run mcp:start`
- **Test MCP connection**: `npm run mcp:test`

## Important URLs and Endpoints
- **Base URL**: https://favbet.ua
- **API Base URL**: To be determined from Favbet API documentation
- **YouTube Channel**: Favbet official YouTube channel

## Authentication
- Tests require a registered user account on favbet.ua
- Credentials should be stored in `.env` file (never commit)
- Consider using test-specific accounts to avoid conflicts

## Test Data Management
- User credentials: Store in `.env` file
- Test data constants: Located in `src/utils/test-data.ts`
- Dynamic test data: Generate using helper functions

## Best Practices for This Project
1. **Page Objects**: Create separate page objects for each Favbet page (Login, Live, Favorites, Settings)
2. **API Helpers**: Create reusable functions for common API operations (login, get favorites)
3. **Selectors**: Use data-testid attributes when available, fallback to stable CSS selectors
4. **Waits**: Use Playwright's built-in wait mechanisms for dynamic content
5. **Screenshots**: Capture on failures for debugging
6. **Parallel Execution**: Tests should be independent to run in parallel

## Known Challenges
1. **Dynamic Content**: Live betting content changes frequently - use appropriate waits
2. **Authentication**: May need to handle captcha or 2FA
3. **Localization**: Tests need to work with both Ukrainian and English interfaces
4. **External Dependencies**: YouTube integration tests depend on external service

## Environment Variables Required
```
BASE_URL=https://favbet.ua
TEST_USER_EMAIL=your_test_user@email.com
TEST_USER_PASSWORD=your_test_password
API_BASE_URL=https://api.favbet.ua
```

## Debugging Tips
1. Use `page.pause()` to debug interactively
2. Enable headed mode with `npm run test:headed`
3. Always run tests in headed mode during local development. 
4. Use VS Code's Playwright extension for better debugging experience
5. Check screenshots in `test-results/` folder for failures

## CI/CD Considerations
- Tests should run in headless mode in CI
- Consider using test accounts specific to CI environment
- May need to handle different network conditions
- YouTube tests might be flaky due to external dependency

## Playwright MCP (Model Context Protocol)

This project includes Playwright MCP server integration, enabling AI assistants like Claude to interact directly with web browsers and assist with test automation tasks.

### MCP Features
- **Browser Automation**: Direct control of browser instances through AI
- **Accessibility Testing**: Analyze page structure without screenshots
- **Test Generation**: Generate test code based on page analysis
- **JavaScript Execution**: Execute custom scripts in browser context
- **Deterministic Actions**: Structured, reliable browser interactions

### MCP Configuration
The project includes `.mcp.json` configuration file with:
- Playwright MCP server setup
- Ukrainian locale and Europe/Kiev timezone defaults
- Persistent browser context for session management
- Favbet-specific environment settings

### Using MCP with Claude
When Claude has MCP access, you can:
1. Ask Claude to navigate to specific Favbet pages
2. Request analysis of page elements and structure
3. Generate test code for specific scenarios
4. Debug failing tests by examining live page state
5. Validate accessibility and localization

### MCP Commands
- `npm run mcp:start` - Start the MCP server
- `npm run mcp:test` - Test MCP connection

### MCP Best Practices
1. Use MCP for exploratory testing and debugging
2. Let Claude analyze page structure before writing selectors
3. Use MCP to verify element visibility and interactivity
4. Leverage MCP for generating initial test implementations
5. Always review and validate generated test code

## Next Steps
1. Implement page objects for all required Favbet pages
2. Create authentication helper for reuse across tests
3. Implement all UI test cases from assignment
4. Research Favbet API documentation for API tests
5. Add retry logic for flaky tests
6. Set up proper test data management
7. Configure MCP for team collaboration