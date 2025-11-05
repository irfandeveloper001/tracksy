import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DESIGN } from '../constants/design';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DESIGN.SPACING.XL,
  },
  icon: {
    fontSize: DESIGN.FONTS.SIZE.XXL,
    marginBottom: DESIGN.SPACING.M,
  },
  title: {
    fontSize: DESIGN.FONTS.SIZE.XL,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.TEXT,
    marginBottom: DESIGN.SPACING.S,
    textAlign: 'center',
  },
  message: {
    fontSize: DESIGN.FONTS.SIZE.M,
    color: DESIGN.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: DESIGN.SPACING.XL,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.M,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: DESIGN.COLORS.SURFACE,
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.M,
    marginBottom: DESIGN.SPACING.L,
  },
  errorTitle: {
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.ERROR,
    marginBottom: DESIGN.SPACING.S,
  },
  errorText: {
    fontSize: DESIGN.FONTS.SIZE.S,
    color: DESIGN.COLORS.TEXT,
    fontFamily: 'monospace',
    marginBottom: DESIGN.SPACING.S,
  },
  errorStack: {
    fontSize: DESIGN.FONTS.SIZE.XS,
    color: DESIGN.COLORS.TEXT_SECONDARY,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: DESIGN.COLORS.PRIMARY,
    paddingHorizontal: DESIGN.SPACING.XL,
    paddingVertical: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.M,
    minHeight: DESIGN.TOUCH_TARGETS.MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
  },
});

export default ErrorBoundary;

