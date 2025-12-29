import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error
    import('../services/errorLogger').then(({ errorLogger }) => {
      errorLogger.logError(error, {
        componentStack: errorInfo.componentStack,
        type: 'error-boundary',
      });
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.BACKGROUND,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONTS.LINE_HEIGHTS.md,
  },
  errorDetails: {
    backgroundColor: COLORS.ERROR_OPACITY,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  errorText: {
    fontSize: FONTS.SIZES.xs,
    color: COLORS.ERROR,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.sm,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: FONTS.WEIGHTS.semibold,
  },
});

export default ErrorBoundary;

