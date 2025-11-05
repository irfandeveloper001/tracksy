# Testing Guide - Driver App

## 🧪 Testing Overview

This guide covers testing strategies and tools for the driver app.

---

## 📋 Test Types

### 1. Unit Tests
Test individual functions and components in isolation.

**Location:** `src/tests/`

**Example:**
```typescript
// src/tests/services/authService.test.ts
describe('AuthService', () => {
  it('should login successfully', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests
Test how multiple components/services work together.

**Example:**
```typescript
// Test trip start flow
describe('Trip Management', () => {
  it('should start trip and update location', async () => {
    // Test implementation
  });
});
```

### 3. Component Tests
Test React components with React Native Testing Library.

**Example:**
```typescript
// src/tests/components/PrimaryButton.test.tsx
describe('PrimaryButton', () => {
  it('should call onPress when pressed', () => {
    // Test implementation
  });
});
```

---

## 🛠️ Testing Setup

### Required Dependencies

```bash
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest \
  @types/jest \
  react-test-renderer
```

### Configuration

**jest.config.js** - Already created
**src/tests/__mocks__/setup.ts** - Mock setup

---

## 📝 Test Examples

### Service Tests

```typescript
// Test auth service
import authService from '../../services/authService';

describe('AuthService', () => {
  it('should login with valid credentials', async () => {
    const result = await authService.login('test@example.com', 'password');
    expect(result.token).toBeDefined();
  });
});
```

### Component Tests

```typescript
// Test button component
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../components/buttons/PrimaryButton';

describe('PrimaryButton', () => {
  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Test" onPress={onPress} />
    );
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## 🧪 Manual Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Token refresh

### Location Tracking
- [ ] Request location permissions
- [ ] Get current location
- [ ] Start location tracking
- [ ] Stop location tracking
- [ ] Background location tracking
- [ ] Location accuracy filtering
- [ ] Adaptive location updates

### Trip Management
- [ ] Start trip
- [ ] End trip
- [ ] View current trip
- [ ] View trip history
- [ ] Trip details view

### Route Management
- [ ] View assigned route
- [ ] View route stops
- [ ] Mark stop arrival
- [ ] View route on map

### Passenger Management
- [ ] View passengers list
- [ ] Check-in passenger
- [ ] View seat layout
- [ ] Assign seats

### Emergency Features
- [ ] Send emergency alert
- [ ] Report incident
- [ ] View notifications

### Offline Functionality
- [ ] Cache route data
- [ ] Queue location updates
- [ ] Queue incident reports
- [ ] Sync when online
- [ ] Offline indicator

---

## 🐛 Debug Tools

### Debug Screen
Access via Profile screen (Development only):
- View app information
- View current state
- View offline data queue
- Manual sync trigger
- Clear cache
- Test voice prompts
- Clear errors

### Logger Service
Use `logger` for consistent logging:

```typescript
import logger from '../services/logger';

logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', error, context);
```

---

## 📊 Test Coverage Goals

- **Services:** 80%+
- **Components:** 70%+
- **Utils:** 90%+
- **Hooks:** 80%+

---

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- authService.test.ts
```

---

## ✅ Testing Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the component/service does, not how it does it

2. **Use Descriptive Test Names**
   - `it('should login successfully with valid credentials')`

3. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the function
   - Assert: Verify the result

4. **Mock External Dependencies**
   - API calls, AsyncStorage, NetInfo, etc.

5. **Test Edge Cases**
   - Empty data, null values, network errors, etc.

---

## 🔍 Debugging Tips

1. **Use React Native Debugger**
2. **Enable remote debugging**
3. **Check console logs**
4. **Use Debug Screen**
5. **Check Redux DevTools**
6. **Monitor network requests**

---

## 📝 Test Documentation

Document test scenarios and expected behavior for each feature.

