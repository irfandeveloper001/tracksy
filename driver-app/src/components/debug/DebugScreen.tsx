import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { clearError } from '../../store/slices/tripSlice';
import { clearError as clearLocationError } from '../../store/slices/locationSlice';
import { clearError as clearEmergencyError } from '../../store/slices/emergencySlice';
import offlineService from '../../services/offlineService';
import syncService from '../../services/syncService';
import voiceService from '../../services/voiceService';
import logger from '../../services/logger';
import { DESIGN } from '../../constants/design';

const DebugScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTrip, currentLocation, route, emergency } = useSelector(
    (state: RootState) => ({
      currentTrip: state.trip.currentTrip,
      currentLocation: state.location.currentLocation,
      route: state.route.route,
      emergency: state.emergency,
    })
  );

  const [isOnline, setIsOnline] = useState(true);
  const [queuedLocations, setQueuedLocations] = useState(0);
  const [queuedIncidents, setQueuedIncidents] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(voiceService.isVoiceEnabled());
  const [testLog, setTestLog] = useState('');

  useEffect(() => {
    loadDebugInfo();
    const interval = setInterval(loadDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDebugInfo = async () => {
    const online = await offlineService.isOnline();
    setIsOnline(online);

    const locations = await offlineService.getLocationQueue();
    setQueuedLocations(locations.filter((loc: any) => !loc.synced).length);

    const incidents = await offlineService.getIncidentQueue();
    setQueuedIncidents(incidents.filter((inc: any) => !inc.synced).length);
  };

  const handleClearErrors = () => {
    dispatch(clearError());
    dispatch(clearLocationError());
    dispatch(clearEmergencyError());
    logger.info('All errors cleared');
  };

  const handleSyncNow = async () => {
    try {
      logger.info('Manual sync triggered');
      await syncService.syncAll();
      await loadDebugInfo();
      logger.info('Sync completed');
    } catch (error) {
      logger.error('Sync failed', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await offlineService.clearAll();
      await loadDebugInfo();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache', error);
    }
  };

  const handleTestVoice = () => {
    voiceService.announceNextStop('Test Stop', 500);
    logger.info('Voice test triggered');
  };

  const handleToggleVoice = (value: boolean) => {
    voiceService.setEnabled(value);
    setVoiceEnabled(value);
    logger.info(`Voice prompts ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Environment:</Text>
            <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network:</Text>
            <Text
              style={[
                styles.infoValue,
                { color: isOnline ? DESIGN.COLORS.SUCCESS : DESIGN.COLORS.ERROR },
              ]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Trip:</Text>
            <Text style={styles.infoValue}>
              {currentTrip ? `Trip #${currentTrip.id}` : 'None'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Location:</Text>
            <Text style={styles.infoValue}>
              {currentLocation
                ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                : 'Not available'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Route:</Text>
            <Text style={styles.infoValue}>
              {route?.name || 'Not assigned'}
            </Text>
          </View>
        </View>

        {/* Offline Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Data</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Queued Locations:</Text>
            <Text style={styles.infoValue}>{queuedLocations}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Queued Incidents:</Text>
            <Text style={styles.infoValue}>{queuedIncidents}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSyncNow}
            disabled={!isOnline}
          >
            <Text style={styles.actionButtonText}>Sync Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearCache}
          >
            <Text style={styles.actionButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Voice Prompts:</Text>
            <Switch
              value={voiceEnabled}
              onValueChange={handleToggleVoice}
              trackColor={{
                false: DESIGN.COLORS.DIVIDER,
                true: DESIGN.COLORS.PRIMARY,
              }}
            />
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTestVoice}
          >
            <Text style={styles.actionButtonText}>Test Voice</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearErrors}
          >
            <Text style={styles.actionButtonText}>Clear All Errors</Text>
          </TouchableOpacity>
        </View>

        {/* Log Output */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Log</Text>
            <TextInput
              style={styles.logInput}
              placeholder="Enter test message..."
              placeholderTextColor={DESIGN.COLORS.TEXT_SECONDARY}
              value={testLog}
              onChangeText={setTestLog}
              multiline
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                logger.info('Test log:', testLog);
                setTestLog('');
              }}
            >
              <Text style={styles.actionButtonText}>Log Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.SURFACE,
  },
  content: {
    padding: DESIGN.SPACING.M,
  },
  section: {
    backgroundColor: DESIGN.COLORS.BACKGROUND,
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.L,
    marginBottom: DESIGN.SPACING.M,
    ...DESIGN.SHADOWS.MEDIUM,
  },
  sectionTitle: {
    fontSize: DESIGN.FONTS.SIZE.L,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.TEXT,
    marginBottom: DESIGN.SPACING.M,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DESIGN.SPACING.S,
  },
  infoLabel: {
    fontSize: DESIGN.FONTS.SIZE.M,
    color: DESIGN.COLORS.TEXT_SECONDARY,
  },
  infoValue: {
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.MEDIUM,
    color: DESIGN.COLORS.TEXT,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN.SPACING.M,
  },
  switchLabel: {
    fontSize: DESIGN.FONTS.SIZE.M,
    color: DESIGN.COLORS.TEXT,
  },
  actionButton: {
    backgroundColor: DESIGN.COLORS.PRIMARY,
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.M,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DESIGN.SPACING.S,
    minHeight: DESIGN.TOUCH_TARGETS.MIN_HEIGHT,
  },
  clearButton: {
    backgroundColor: DESIGN.COLORS.ERROR,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
  },
  logInput: {
    backgroundColor: DESIGN.COLORS.SURFACE,
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.M,
    fontSize: DESIGN.FONTS.SIZE.M,
    color: DESIGN.COLORS.TEXT,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: DESIGN.SPACING.S,
  },
});

export default DebugScreen;

