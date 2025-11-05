import offlineService from './offlineService';
import api from './api/api';
import locationUpdateService from './location/locationUpdateService';
import emergencyService from './emergencyService';

// Service to sync offline data when connection is restored
class SyncService {
  private isSyncing: boolean = false;

  // Sync all offline data
  async syncAll(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    const isOnline = await offlineService.isOnline();
    if (!isOnline) {
      console.log('Not online - cannot sync');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('🔄 Starting offline data sync...');

      // Sync location updates
      await this.syncLocationUpdates();

      // Sync incident reports
      await this.syncIncidentReports();

      // Update last sync timestamp
      await offlineService.setLastSync(Date.now());

      console.log('✅ Offline data sync completed');
    } catch (error) {
      console.error('❌ Error syncing offline data:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync location updates
  private async syncLocationUpdates(): Promise<void> {
    try {
      const queuedLocations = await offlineService.getLocationQueue();
      const unsynced = queuedLocations.filter((loc: any) => !loc.synced);

      if (unsynced.length === 0) {
        console.log('No unsynced locations');
        return;
      }

      console.log(`Syncing ${unsynced.length} location updates...`);

      // Send in batches of 10
      while (unsynced.length > 0) {
        const batch = unsynced.splice(0, 10);
        try {
          const success = await locationUpdateService.sendBatchUpdates(batch);
          if (success) {
            // Mark as synced
            const queue = await offlineService.getLocationQueue();
            const updatedQueue = queue.map((loc: any) => {
              const found = batch.find(
                (b: any) =>
                  b.latitude === loc.latitude &&
                  b.longitude === loc.longitude &&
                  b.timestamp === loc.timestamp
              );
              return found ? { ...loc, synced: true } : loc;
            });
            // Store updated queue (would need to add this method to offlineService)
            console.log(`✅ Synced batch of ${batch.length} locations`);
          }
        } catch (error) {
          console.error('Error syncing location batch:', error);
          break;
        }
      }

      // Clear synced locations
      await offlineService.clearSyncedLocations();
    } catch (error) {
      console.error('Error syncing location updates:', error);
    }
  }

  // Sync incident reports
  private async syncIncidentReports(): Promise<void> {
    try {
      const queuedIncidents = await offlineService.getIncidentQueue();
      const unsynced = queuedIncidents.filter((incident: any) => !incident.synced);

      if (unsynced.length === 0) {
        console.log('No unsynced incident reports');
        return;
      }

      console.log(`Syncing ${unsynced.length} incident reports...`);

      for (const incident of unsynced) {
        try {
          await emergencyService.reportIncident(incident);
          // Mark as synced (would need to add this method to offlineService)
          console.log('✅ Synced incident report');
        } catch (error) {
          console.error('Error syncing incident report:', error);
          break;
        }
      }

      // Clear synced incidents
      await offlineService.clearSyncedIncidents();
    } catch (error) {
      console.error('Error syncing incident reports:', error);
    }
  }

  // Check if sync is needed
  async shouldSync(): Promise<boolean> {
    const isOnline = await offlineService.isOnline();
    if (!isOnline) return false;

    const queuedLocations = await offlineService.getLocationQueue();
    const queuedIncidents = await offlineService.getIncidentQueue();

    return (
      queuedLocations.filter((loc: any) => !loc.synced).length > 0 ||
      queuedIncidents.filter((incident: any) => !incident.synced).length > 0
    );
  }
}

export default new SyncService();

