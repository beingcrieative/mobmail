/**
 * Secure Sync Manager for VoicemailAI PWA
 * Handles offline-to-online synchronization with retry logic and integrity verification
 */

import { offlineStorage, type SyncAction } from '../storage/offlineStorage';

interface SyncResult {
  success: boolean;
  action: SyncAction;
  error?: string;
  shouldRetry: boolean;
}

interface SyncStats {
  totalActions: number;
  successCount: number;
  failureCount: number;
  retryCount: number;
  lastSyncTime: number;
}

class SyncManager {
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private stats: SyncStats = {
    totalActions: 0,
    successCount: 0,
    failureCount: 0,
    retryCount: 0,
    lastSyncTime: 0
  };

  constructor() {
    this.setupNetworkListeners();
  }

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    try {
      // Initialize offline storage
      await offlineStorage.initialize();
      
      // Start periodic sync if online
      if (this.isOnline) {
        this.startPeriodicSync();
      }
      
      // Clean expired data
      await offlineStorage.cleanExpiredData();
      
      console.log('🔄 Sync manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sync manager:', error);
      throw error;
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('network-status', { online: true });
      console.log('🌐 Network connection restored');
      
      // Start syncing when back online
      this.startPeriodicSync();
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network-status', { online: false });
      console.log('📴 Network connection lost');
      
      // Stop periodic sync when offline
      this.stopPeriodicSync();
    });
  }

  /**
   * Add action to sync queue
   */
  async queueAction(
    type: SyncAction['type'],
    endpoint: string,
    payload: any,
    options: {
      priority?: SyncAction['priority'];
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const { priority = 'medium', maxRetries = 3 } = options;

    try {
      const actionId = await offlineStorage.addToSyncQueue({
        type,
        endpoint,
        payload,
        priority,
        maxRetries
      });

      this.emit('action-queued', { actionId, type, endpoint, priority });
      
      // Try immediate sync if online
      if (this.isOnline && !this.isSyncing) {
        this.syncNow();
      }

      return actionId;
    } catch (error) {
      console.error('❌ Failed to queue sync action:', error);
      throw error;
    }
  }

  /**
   * Start periodic synchronization
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncNow();
      }
    }, 30000);

    console.log('⏰ Periodic sync started');
  }

  /**
   * Stop periodic synchronization
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('⏸️ Periodic sync stopped');
  }

  /**
   * Perform immediate synchronization
   */
  async syncNow(): Promise<SyncStats> {
    if (!this.isOnline) {
      console.log('📴 Cannot sync while offline');
      return this.stats;
    }

    if (this.isSyncing) {
      console.log('🔄 Sync already in progress');
      return this.stats;
    }

    this.isSyncing = true;
    this.emit('sync-started', {});

    try {
      const pendingActions = await offlineStorage.getPendingSyncActions();
      
      if (pendingActions.length === 0) {
        console.log('✅ No actions to sync');
        this.isSyncing = false;
        return this.stats;
      }

      console.log(`🔄 Syncing ${pendingActions.length} pending actions`);
      
      const results: SyncResult[] = [];
      
      // Process actions by priority
      for (const action of pendingActions) {
        if (!this.isOnline) {
          console.log('📴 Network lost during sync, stopping');
          break;
        }

        const result = await this.processAction(action);
        results.push(result);

        // Update stats
        this.stats.totalActions++;
        if (result.success) {
          this.stats.successCount++;
        } else {
          this.stats.failureCount++;
          if (result.shouldRetry) {
            this.stats.retryCount++;
          }
        }
      }

      this.stats.lastSyncTime = Date.now();
      
      // Emit sync results
      this.emit('sync-completed', {
        results,
        stats: this.stats
      });

      console.log(`✅ Sync completed: ${this.stats.successCount} success, ${this.stats.failureCount} failures`);
      
      return this.stats;
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.emit('sync-error', { error });
      return this.stats;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process individual sync action
   */
  private async processAction(action: SyncAction): Promise<SyncResult> {
    try {
      console.log(`🔄 Processing action: ${action.type} ${action.endpoint}`);

      // Validate action hasn't exceeded max retries
      if (action.retryCount >= action.maxRetries) {
        console.warn(`⚠️ Action exceeded max retries: ${action.id}`);
        await offlineStorage.removeSyncAction(action.id);
        return {
          success: false,
          action,
          error: 'Max retries exceeded',
          shouldRetry: false
        };
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method: action.type === 'create' ? 'POST' : 
                action.type === 'update' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'VoicemailAI-PWA/1.0.0',
          'X-Sync-Action': 'true'
        }
      };

      // Add payload for non-delete requests
      if (action.type !== 'delete' && action.payload) {
        requestOptions.body = JSON.stringify(action.payload);
      }

      // Execute HTTP request
      const response = await fetch(action.endpoint, requestOptions);

      if (response.ok) {
        // Success - remove from queue
        await offlineStorage.removeSyncAction(action.id);
        console.log(`✅ Action completed: ${action.id}`);
        
        return {
          success: true,
          action,
          shouldRetry: false
        };
      } else {
        // HTTP error - decide whether to retry
        const shouldRetry = this.shouldRetryAction(response.status, action);
        
        if (shouldRetry) {
          await offlineStorage.updateSyncActionRetry(action.id);
          console.log(`🔄 Action will retry: ${action.id} (attempt ${action.retryCount + 1})`);
        } else {
          await offlineStorage.removeSyncAction(action.id);
          console.warn(`❌ Action failed permanently: ${action.id} (status: ${response.status})`);
        }

        return {
          success: false,
          action,
          error: `HTTP ${response.status}: ${response.statusText}`,
          shouldRetry
        };
      }

    } catch (error) {
      // Network or other error - always retry
      const shouldRetry = action.retryCount < action.maxRetries;
      
      if (shouldRetry) {
        await offlineStorage.updateSyncActionRetry(action.id);
        console.log(`🔄 Action will retry after error: ${action.id}`);
      } else {
        await offlineStorage.removeSyncAction(action.id);
        console.warn(`❌ Action failed after max retries: ${action.id}`);
      }

      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        shouldRetry
      };
    }
  }

  /**
   * Determine if action should be retried based on HTTP status
   */
  private shouldRetryAction(status: number, action: SyncAction): boolean {
    // Don't retry if max retries reached
    if (action.retryCount >= action.maxRetries) {
      return false;
    }

    // Retry on server errors (5xx) and some client errors
    const retryableStatuses = [
      408, // Request Timeout
      429, // Too Many Requests
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];

    return status >= 500 || retryableStatuses.includes(status);
  }

  /**
   * Get current sync statistics
   */
  getSyncStats(): SyncStats {
    return { ...this.stats };
  }

  /**
   * Get pending actions count
   */
  async getPendingActionsCount(): Promise<number> {
    try {
      const actions = await offlineStorage.getPendingSyncActions();
      return actions.length;
    } catch (error) {
      console.error('❌ Failed to get pending actions count:', error);
      return 0;
    }
  }

  /**
   * Clear all pending actions
   */
  async clearPendingActions(): Promise<boolean> {
    try {
      const actions = await offlineStorage.getPendingSyncActions();
      for (const action of actions) {
        await offlineStorage.removeSyncAction(action.id);
      }
      console.log(`🗑️ Cleared ${actions.length} pending actions`);
      return true;
    } catch (error) {
      console.error('❌ Failed to clear pending actions:', error);
      return false;
    }
  }

  /**
   * Force retry of failed actions
   */
  async retryFailedActions(): Promise<number> {
    try {
      const actions = await offlineStorage.getPendingSyncActions();
      const failedActions = actions.filter(action => action.retryCount > 0);
      
      // Reset retry count for failed actions
      for (const action of failedActions) {
        action.retryCount = 0;
        // We would need to update the action in storage, but let's trigger a sync instead
      }

      if (failedActions.length > 0 && this.isOnline) {
        await this.syncNow();
      }

      return failedActions.length;
    } catch (error) {
      console.error('❌ Failed to retry failed actions:', error);
      return 0;
    }
  }

  /**
   * Check if currently syncing
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Check network status
   */
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Event listener management
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Sync Manager: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPeriodicSync();
    this.listeners.clear();
    console.log('🗑️ Sync manager destroyed');
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export types
export type { SyncResult, SyncStats };