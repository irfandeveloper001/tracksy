interface ErrorLog {
  message: string;
  stack?: string;
  component?: string;
  timestamp: string;
  user?: string;
  url?: string;
  userAgent?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  // Log error
  logError(error: Error, component?: string, additionalInfo?: any) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      component: component || 'Unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...additionalInfo,
    };

    // Add to local logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }

    // Send to backend if available
    this.sendToBackend(errorLog).catch((err) => {
      console.warn('Failed to send error to backend:', err);
    });

    // Send to external error tracking (e.g., Sentry) if configured
    if (import.meta.env.VITE_SENTRY_DSN) {
      this.sendToSentry(error, errorLog);
    }
  }

  // Send error to backend
  private async sendToBackend(errorLog: ErrorLog) {
    try {
      // Only send if we have API base URL
      if (import.meta.env.VITE_API_BASE_URL) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
        });
      }
    } catch (error) {
      // Silently fail - don't break the app
    }
  }

  // Send to Sentry (if configured)
  private sendToSentry(error: Error, errorLog: ErrorLog) {
    // Sentry integration would go here
    // This is a placeholder for future implementation
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: errorLog.component,
        },
        extra: errorLog,
      });
    }
  }

  // Get error logs
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Get error summary
  getErrorSummary(): {
    total: number;
    recent: ErrorLog[];
    byComponent: Record<string, number>;
  } {
    const recent = this.logs.slice(-10);
    const byComponent: Record<string, number> = {};

    this.logs.forEach((log) => {
      const component = log.component || 'Unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
    });

    return {
      total: this.logs.length,
      recent,
      byComponent,
    };
  }
}

export default new ErrorLogger();

