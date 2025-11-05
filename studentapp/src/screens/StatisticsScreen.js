import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripStatistics, fetchUsageStatistics } from '../store/slices/tripSlice';
import StatCard from '../components/StatCard';
import { COLORS, SPACING, FONTS } from '../constants';

const StatisticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { statistics, usageStatistics, isLoading } = useSelector((state) => state.trip);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Fetch statistics when component mounts
    const params = getDateRangeParams(selectedPeriod);
    dispatch(fetchTripStatistics(params));
    dispatch(fetchUsageStatistics(params));
  }, [dispatch, selectedPeriod]);

  // Get date range params based on period
  const getDateRangeParams = (period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const params = getDateRangeParams(selectedPeriod);
      await dispatch(fetchTripStatistics(params)).unwrap();
      await dispatch(fetchUsageStatistics(params)).unwrap();
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Period options
  const periods = [
    { id: 'week', label: 'Week', icon: '📅' },
    { id: 'month', label: 'Month', icon: '📆' },
    { id: 'year', label: 'Year', icon: '📊' },
  ];

  // Render period selector
  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      {periods.map((period) => {
        const isSelected = selectedPeriod === period.id;
        return (
          <TouchableOpacity
            key={period.id}
            style={[styles.periodButton, isSelected && styles.periodButtonSelected]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={styles.periodIcon}>{period.icon}</Text>
            <Text
              style={[
                styles.periodLabel,
                isSelected && styles.periodLabelSelected,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.PRIMARY]}
          tintColor={COLORS.PRIMARY}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics & Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Your trip statistics and usage insights
        </Text>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Trip Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Trips"
            value={statistics.totalTrips || 0}
            subtitle="All time"
            icon="🚌"
            color={COLORS.PRIMARY}
          />
          <StatCard
            title="Completed"
            value={statistics.completedTrips || 0}
            subtitle="Successful trips"
            icon="✅"
            color={COLORS.SUCCESS}
          />
          <StatCard
            title="On-Time"
            value={`${statistics.onTimePercentage || 0}%`}
            subtitle="On-time percentage"
            icon="⏰"
            color={COLORS.INFO}
          />
          <StatCard
            title="Avg Wait Time"
            value={`${statistics.averageWaitingTime || 0} min`}
            subtitle="Average waiting"
            icon="⏳"
            color={COLORS.WARNING}
          />
        </View>
      </View>

      {/* Environmental Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Distance Traveled"
            value={`${statistics.totalDistance || 0} km`}
            subtitle="Total distance"
            icon="📍"
            color={COLORS.SECONDARY}
          />
          <StatCard
            title="CO₂ Saved"
            value={`${statistics.co2Saved || 0} kg`}
            subtitle="Carbon saved"
            icon="🌱"
            color={COLORS.SUCCESS}
          />
        </View>
      </View>

      {/* Usage Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>📊 Peak Usage</Text>
          <Text style={styles.insightText}>
            {usageStatistics.peakHours
              ? `Most active during ${usageStatistics.peakHours[0]?.hour || 'N/A'}:00`
              : 'No usage data available'}
          </Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🎯 Favorite Route</Text>
          <Text style={styles.insightText}>
            {usageStatistics.favoriteRoute
              ? usageStatistics.favoriteRoute
              : 'No route data available'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('TripHistory')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Trip History</Text>
            <Text style={styles.actionSubtitle}>
              See all your past trips and bookings
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.SIZES.xxl,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  periodButtonSelected: {
    backgroundColor: COLORS.PRIMARY + '20',
  },
  periodIcon: {
    fontSize: 18,
  },
  periodLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  periodLabelSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs / 2,
  },
  actionSubtitle: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  actionArrow: {
    fontSize: FONTS.SIZES.lg,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.sm,
  },
});

export default StatisticsScreen;

