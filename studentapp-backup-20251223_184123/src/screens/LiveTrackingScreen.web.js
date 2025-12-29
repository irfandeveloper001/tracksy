import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants';

export default function LiveTrackingScreen() {
  const openDocs = () => {
    Linking.openURL('https://docs.expo.dev/workflow/web-support/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🗺️ Live Tracking Not Available on Web</Text>
        <Text style={styles.message}>
          The real-time bus map relies on native modules that are only available in the Android and
          iOS versions of Tracksy.
        </Text>
        <Text style={styles.message}>
          Please install the mobile app or use the Expo Go client to access live tracking.
        </Text>

        <View style={styles.instructions}>
          <Text style={styles.subtitle}>How to try it:</Text>
          <Text style={styles.listItem}>1. Install the Expo Go app on your device.</Text>
          <Text style={styles.listItem}>2. Run `npm start` and scan the QR code.</Text>
          <Text style={styles.listItem}>3. Open the “Live Tracking” tab inside the mobile app.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={openDocs}>
          <Text style={styles.buttonText}>Learn about Expo Web Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: FONTS.SIZES.xxl,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  instructions: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  listItem: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  button: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: FONTS.SIZES.md,
  },
});

