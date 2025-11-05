import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import analyticsService, {
  PerformanceMetrics,
  DailyStats,
} from '../../services/analyticsService';
import { COLORS } from '../../constants';

type TimePeriod = 'today' | 'week' | 'month';

const PerformanceScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tripHistory } = useSelector((state: RootState) => state.trip);
  const [period, setPeriod] = useState<TimePeriod>('today');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      if (period === 'today') {
        const todayMetrics = await analyticsService.getTodayMetrics();
        setMetrics(todayMetrics);
      } else {
        // Calculate from trip history if backend endpoint not available
        const stats = calculateStatsFromHistory(period);
        setMetrics(stats);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Fallback to calculating from trip history
      const stats = calculateStatsFromHistory(period);
      setMetrics(stats);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatsFromHistory = (period: TimePeriod): PerformanceMetrics => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const filteredTrips = tripHistory.filter((trip) => {
      const tripDate = new Date(trip.start_time || trip.created_at);
      return tripDate >= startDate && trip.status === 'completed';
    });

    const tripsCompleted = filteredTrips.length;
    const totalDistance = filteredTrips.reduce(
      (sum, trip) => sum + (trip.distance || 0),
      0
    );
    const totalDrivingTime = filteredTrips.reduce(
      (sum, trip) => sum + (trip.duration || 0),
      0
    );
    const hours = totalDrivingTime / 3600;
    const km = totalDistance / 1000;
    const averageSpeed = hours > 0 ? km / hours : 0;

    // Calculate on-time percentage (placeholder - would need scheduled times)
    const onTimePercentage = tripsCompleted > 0 ? 85 : 0; // Placeholder

    return {
      tripsCompleted,
      totalDistance,
      totalDrivingTime,
      averageSpeed: averageSpeed,
      onTimePercentage,
      totalPassengers: 0, // Would need to calculate from passengers
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Period Selector */}
      <View style={styles.card}>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
            onPress={() => setPeriod('today')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'today' && styles.periodButtonTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'week' && styles.periodButtonTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === 'month' && styles.periodButtonTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Metrics */}
      {metrics && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.tripsCompleted}</Text>
              <Text style={styles.metricLabel}>Trips Completed</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatDistance(metrics.totalDistance)}
              </Text>
              <Text style={styles.metricLabel}>Total Distance</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatDuration(metrics.totalDrivingTime)}
              </Text>
              <Text style={styles.metricLabel}>Driving Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {metrics.averageSpeed.toFixed(1)} km/h
              </Text>
              <Text style={styles.metricLabel}>Avg Speed</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {metrics.onTimePercentage.toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>On-Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.totalPassengers}</Text>
              <Text style={styles.metricLabel}>Passengers</Text>
            </View>
          </View>
        </View>
      )}

      {/* Performance Chart Placeholder */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Trends</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            📊 Performance charts will be displayed here
          </Text>
          <Text style={styles.chartNote}>
            Charts require react-native-chart-kit or similar library
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TripHistory')}
        >
          <Text style={styles.actionButtonText}>View Trip History</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  chartNote: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.5,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default PerformanceScreen;

