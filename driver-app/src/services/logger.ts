// Logging service for debugging and error tracking
// Can be extended to integrate with error reporting services (Sentry, etc.)

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isDev: boolean = __DEV__;
  private logLevel: LogLevel = this.isDev ? LogLevel.DEBUG : LogLevel.INFO;

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Debug logs (only in development)
  debug(message: string, data?: any): void {
    if (this.isDev && this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  // Info logs
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  // Warning logs
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  // Error logs
  error(message: string, error?: any, context?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, error || '', context || '');
      
      // In production, send to error reporting service
      if (!this.isDev) {
        // this.sendToErrorReportingService(message, error, context);
      }
    }
  }

  // Log location updates (for debugging)
  logLocation(location: any): void {
    if (this.isDev) {
      this.debug('Location Update', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
      });
    }
  }

  // Log API calls
  logApiCall(method: string, url: string, data?: any): void {
    if (this.isDev) {
      this.debug(`API ${method} ${url}`, data);
    }
  }

  // Log API errors
  logApiError(method: string, url: string, error: any): void {
    this.error(`API ${method} ${url} failed`, error, {
      method,
      url,
    });
  }

  // Check if should log at this level
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
}

export default new Logger();
export { LogLevel };

