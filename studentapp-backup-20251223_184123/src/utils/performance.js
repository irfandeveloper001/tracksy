// Performance optimization utilities

// Memoize expensive computations
export const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache[key]) {
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
};

// Debounce function calls
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function calls
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Note: React.lazy is for web, use dynamic imports for React Native

// Optimize list rendering
export const getItemLayout = (itemHeight) => (data, index) => ({
  length: itemHeight,
  offset: itemHeight * index,
  index,
});

// Check if component should re-render (helper for React.memo)
export const areEqual = (prevProps, nextProps, keys) => {
  return !keys.some((key) => prevProps[key] !== nextProps[key]);
};

