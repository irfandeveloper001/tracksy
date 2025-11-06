// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    this.recordMetric(name, duration);

    if (import.meta.env.DEV && duration > 100) {
      console.warn(`⚠️ Slow function detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    this.recordMetric(name, duration);

    if (import.meta.env.DEV && duration > 1000) {
      console.warn(`⚠️ Slow async function detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  // Record custom metric
  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Send to analytics if configured
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
      this.sendToAnalytics(metric);
    }
  }

  // Get performance summary
  getSummary(): {
    total: number;
    average: number;
    slowest: PerformanceMetric[];
    fastest: PerformanceMetric[];
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        average: 0,
        slowest: [],
        fastest: [],
      };
    }

    const total = this.metrics.reduce((sum, m) => sum + m.value, 0);
    const average = total / this.metrics.length;
    const sorted = [...this.metrics].sort((a, b) => b.value - a.value);

    return {
      total: this.metrics.length,
      average: Math.round(average * 100) / 100,
      slowest: sorted.slice(0, 5),
      fastest: sorted.slice(-5).reverse(),
    };
  }

  // Send to analytics
  private sendToAnalytics(metric: PerformanceMetric) {
    // Placeholder for analytics integration
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        metric_name: metric.name,
        metric_value: metric.value,
      });
    }
  }
}

const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

// Helper function to measure component render
export function measureRender<T>(componentName: string, renderFn: () => T): T {
  return performanceMonitor.measureFunction(`render:${componentName}`, renderFn);
}

// Helper function to measure API call
export async function measureApiCall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measureAsyncFunction(`api:${endpoint}`, apiCall);
}

