import { memoize, debounce, throttle, getItemLayout, areEqual } from '../../utils/performance';

describe('Performance Utilities', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      let callCount = 0;
      const expensiveFunction = (a, b) => {
        callCount++;
        return a + b;
      };

      const memoized = memoize(expensiveFunction);

      expect(memoized(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      expect(memoized(1, 2)).toBe(3);
      expect(callCount).toBe(1); // Should use cache

      expect(memoized(2, 3)).toBe(5);
      expect(callCount).toBe(2); // New call
    });

    it('should handle different arguments separately', () => {
      const fn = (a, b) => a * b;
      const memoized = memoize(fn);

      expect(memoized(2, 3)).toBe(6);
      expect(memoized(4, 5)).toBe(20);
      expect(memoized(2, 3)).toBe(6); // Should use cache
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debounced = debounce(mockFn, 300);

      debounced();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls if called again', () => {
      const mockFn = jest.fn();
      const debounced = debounce(mockFn, 300);

      debounced();
      debounced();
      debounced();

      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should limit function execution frequency', () => {
      const mockFn = jest.fn();
      const throttled = throttle(mockFn, 300);

      throttled();
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttled();
      expect(mockFn).toHaveBeenCalledTimes(1); // Still 1

      jest.advanceTimersByTime(300);
      throttled();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('getItemLayout', () => {
    it('should return correct layout for item at index', () => {
      const itemHeight = 100;
      const getLayout = getItemLayout(itemHeight);
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

      expect(getLayout(data, 0)).toEqual({
        length: 100,
        offset: 0,
        index: 0,
      });

      expect(getLayout(data, 1)).toEqual({
        length: 100,
        offset: 100,
        index: 1,
      });

      expect(getLayout(data, 2)).toEqual({
        length: 100,
        offset: 200,
        index: 2,
      });
    });
  });

  describe('areEqual', () => {
    it('should return true when all specified keys are equal', () => {
      const prevProps = { a: 1, b: 2, c: 3 };
      const nextProps = { a: 1, b: 2, c: 4 };

      expect(areEqual(prevProps, nextProps, ['a', 'b'])).toBe(true);
    });

    it('should return false when any specified key differs', () => {
      const prevProps = { a: 1, b: 2 };
      const nextProps = { a: 1, b: 3 };

      expect(areEqual(prevProps, nextProps, ['a', 'b'])).toBe(false);
    });
  });
});

