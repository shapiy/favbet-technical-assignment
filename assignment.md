# Favbet Test Automation Assignment

## Pre-condition
Register user in favbet.ua

## UI Test Solution

Create UI test solution that contains the following test cases:

### Test 1 - Favorites Management
1. login to favbet.ua
2. Navigate to Live
3. Add several items to favorites
4. Navigate to favorites.
5. Check selected items are present.
6. Remove any item
7. Refresh page and check item is removed.

### Test 2 - YouTube Social Network Integration
1. login to favbet.ua
2. Navigate to Youtube social network
3. Check accurate channel is opened
4. Check video 'FAVBET | Support Those Who Support Us: ENGLAND | 2022 FIFA World Cup' is present.

### Test 3 - Settings Configuration
1. login to favbet.ua
2. open settings page
3. change language to english\ukrainian.
4. verify language is updated
5. update theme to dark\light
6. check theme is applied

## API Test Solution

Create API test solution that contains the following test cases:

**Note**: API login implementation can be complex. If you feel pressed by time, feel free to reuse browser context and login steps from UI tests instead of implementing direct API authentication.

### Test 1 - Bonuses API
1. Login
2. get the list of bonuses
3. check accurate list of bonuses is returned

### Test 2 - Instant Games Favorites API
1. login
2. add some instant games to favorites
3. get the list of favorites instant games
4. check favorites contain accurate list of games (previously added)

## Delivery Requirements

### 1. GitHub Repository
- Share the complete solution as a GitHub repository
- Include all source code, test files, and configuration
- Provide clear repository structure and documentation

### 2. Test Evidence
- Attach screenshots of test passing results
- Include videos of test execution (Playwright supports video recording)
- Provide test reports showing successful execution
- Document any test failures with error screenshots
