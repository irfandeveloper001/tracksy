# Testing Guide - Phase 9

## Overview
This guide covers the testing setup and strategy for the Student Mobile Application.

## Testing Framework Setup

### Jest Configuration
- **Framework**: Jest with React Native preset
- **Location**: `jest.config.js`
- **Setup File**: `jest.setup.js`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── services/            # Service tests
│   ├── store/               # Redux tests
│   ├── utils/               # Utility tests
│   └── integration/         # Integration tests
```

## Test Categories

### 1. Unit Tests

#### Utility Functions (`src/__tests__/utils/`)
- ✅ `validation.test.js` - Form validation tests
- ✅ `performance.test.js` - Performance utility tests

#### Redux Reducers (`src/__tests__/store/`)
- ✅ `authSlice.test.js` - Authentication state management tests

#### Services (`src/__tests__/services/`)
- ✅ `authService.test.js` - Authentication service tests

#### Components (`src/__tests__/components/`)
- ✅ `Button.test.js` - Button component tests
- ✅ `Input.test.js` - Input component tests

### 2. Integration Tests

#### API Integration (`src/__tests__/integration/api.test.js`)
- ✅ Authentication flow
- ✅ Booking operations
- ✅ API error handling

#### WebSocket Integration (`src/__tests__/integration/websocket.test.js`)
- ✅ WebSocket connection
- ✅ Bus location updates
- ✅ Route deviation alerts

## Test Coverage

### Current Coverage
- **Utility Functions**: ~85%
- **Redux Reducers**: ~80%
- **Services**: ~75%
- **Components**: ~70%

### Target Coverage
- **Overall**: 70% minimum
- **Critical Paths**: 85% minimum
- **Utilities**: 90% minimum

## Mocking Strategy

### AsyncStorage
```javascript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Geolocation
```javascript
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));
```

### React Native Maps
```javascript
jest.mock('react-native-maps', () => {
  // Mock implementation
});
```

### Socket.io
```javascript
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  }));
});
```

## Writing Tests

### Component Test Example
```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Test" onPress={() => {}} />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

### Service Test Example
```javascript
import { authService } from '../../services/authService';
import api from '../../services/api';

jest.mock('../../services/api');

describe('AuthService', () => {
  it('should login successfully', async () => {
    api.post.mockResolvedValue({ success: true, data: { token: 'test' } });
    const result = await authService.login('email', 'password');
    expect(result.success).toBe(true);
  });
});
```

### Redux Test Example
```javascript
import authReducer, { loginSuccess } from '../../store/slices/authSlice';

describe('Auth Reducer', () => {
  it('should handle login success', () => {
    const action = loginSuccess({ user: {}, token: 'test' });
    const state = authReducer(initialState, action);
    expect(state.isAuthenticated).toBe(true);
  });
});
```

## Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the function
   - Assert: Verify the result

2. **Test Isolation**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Don't rely on test execution order

3. **Mock External Dependencies**
   - Mock API calls
   - Mock AsyncStorage
   - Mock navigation

4. **Test Edge Cases**
   - Null/undefined values
   - Empty arrays/strings
   - Error conditions

5. **Meaningful Test Names**
   - Use descriptive names
   - Follow pattern: "should [expected behavior] when [condition]"

## Continuous Integration

### Pre-commit Hooks (Recommended)
```bash
# Run tests before commit
npm test
```

### CI/CD Pipeline (Recommended)
```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test -- --coverage
```

## Debugging Tests

### Debug in VS Code
1. Set breakpoints in test files
2. Run test with debugger
3. Use `console.log` for debugging

### Common Issues
1. **Mock not working**: Check jest.mock() placement
2. **Async issues**: Use `async/await` or `waitFor`
3. **Snapshot issues**: Update snapshots with `-u` flag

## Next Steps

### Additional Tests Needed
- [ ] Navigation flow tests
- [ ] Screen component tests
- [ ] Location service tests
- [ ] Push notification tests
- [ ] End-to-end tests (E2E)

### Testing Tools to Consider
- **React Native Testing Library**: Already included
- **Detox**: For E2E testing
- **Flipper**: For debugging
- **Storybook**: For component development

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

