/**
 * React Hook for Offline Voicemail Management
 * Provides reactive state management for offline-first voicemail operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineVoicemailStore, type Voicemail } from '../stores/offlineVoicemailStore';
import { syncManager } from '../sync/syncManager';

interface VoicemailState {
  voicemails: Voicemail[];
  unreadCount: number;
  archivedCount: number;
  isLoading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  error: string | null;
}

interface VoicemailStats {
  total: number;
  unread: number;
  archived: number;
  pendingSyncActions: number;
  storageSize: number;
}

export function useOfflineVoicemails() {
  const [state, setState] = useState<VoicemailState>({
    voicemails: [],
    unreadCount: 0,
    archivedCount: 0,
    isLoading: true,
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    error: null
  });

  const [stats, setStats] = useState<VoicemailStats>({
    total: 0,
    unread: 0,
    archived: 0,
    pendingSyncActions: 0,
    storageSize: 0
  });

  /**
   * Update state from voicemail store
   */
  const updateState = useCallback(() => {
    const voicemails = offlineVoicemailStore.getVoicemails();
    const unreadVoicemails = offlineVoicemailStore.getUnreadVoicemails();
    const archivedVoicemails = offlineVoicemailStore.getArchivedVoicemails();

    setState(prev => ({
      ...prev,
      voicemails,
      unreadCount: unreadVoicemails.length,
      archivedCount: archivedVoicemails.length,
      isLoading: false
    }));

    setStats(prev => ({
      ...prev,
      total: voicemails.length,
      unread: unreadVoicemails.length,
      archived: archivedVoicemails.length
    }));
  }, []);

  /**
   * Update stats from storage
   */
  const updateStats = useCallback(async () => {
    try {
      const storageStats = await offlineVoicemailStore.getStorageStats();
      setStats(prev => ({
        ...prev,
        pendingSyncActions: storageStats.pendingSyncActions,
        storageSize: storageStats.estimatedSize
      }));
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }, []);

  /**
   * Initialize voicemail store and setup listeners
   */
  useEffect(() => {
    let mounted = true;

    const initializeStore = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        if (!offlineVoicemailStore.isStoreInitialized()) {
          await offlineVoicemailStore.initialize();
        }
        
        if (mounted) {
          updateState();
          updateStats();
        }
      } catch (error) {
        console.error('Failed to initialize voicemail store:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Initialization failed'
          }));
        }
      }
    };

    initializeStore();

    return () => {
      mounted = false;
    };
  }, [updateState, updateStats]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Voicemail store listeners
    const handleVoicemailsLoaded = () => {
      updateState();
      updateStats();
    };

    const handleVoicemailAdded = () => {
      updateState();
      updateStats();
    };

    const handleVoicemailUpdated = () => {
      updateState();
      updateStats();
    };

    const handleVoicemailDeleted = () => {
      updateState();
      updateStats();
    };

    const handleVoicemailsRefreshed = () => {
      updateState();
      setState(prev => ({ ...prev, lastSync: Date.now() }));
    };

    // Sync manager listeners
    const handleNetworkStatus = (data: { online: boolean }) => {
      setState(prev => ({ ...prev, isOnline: data.online }));
      updateStats();
    };

    const handleSyncStarted = () => {
      setState(prev => ({ ...prev, isSyncing: true }));
    };

    const handleSyncCompleted = () => {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSync: Date.now() 
      }));
      updateStats();
    };

    const handleSyncError = (data: { error: any }) => {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: `Sync failed: ${data.error?.message || 'Unknown error'}`
      }));
    };

    // Register listeners
    offlineVoicemailStore.on('voicemails-loaded', handleVoicemailsLoaded);
    offlineVoicemailStore.on('voicemail-added', handleVoicemailAdded);
    offlineVoicemailStore.on('voicemail-updated', handleVoicemailUpdated);
    offlineVoicemailStore.on('voicemail-deleted', handleVoicemailDeleted);
    offlineVoicemailStore.on('voicemails-refreshed', handleVoicemailsRefreshed);

    syncManager.on('network-status', handleNetworkStatus);
    syncManager.on('sync-started', handleSyncStarted);
    syncManager.on('sync-completed', handleSyncCompleted);
    syncManager.on('sync-error', handleSyncError);

    // Cleanup listeners
    return () => {
      offlineVoicemailStore.off('voicemails-loaded', handleVoicemailsLoaded);
      offlineVoicemailStore.off('voicemail-added', handleVoicemailAdded);
      offlineVoicemailStore.off('voicemail-updated', handleVoicemailUpdated);
      offlineVoicemailStore.off('voicemail-deleted', handleVoicemailDeleted);
      offlineVoicemailStore.off('voicemails-refreshed', handleVoicemailsRefreshed);

      syncManager.off('network-status', handleNetworkStatus);
      syncManager.off('sync-started', handleSyncStarted);
      syncManager.off('sync-completed', handleSyncCompleted);
      syncManager.off('sync-error', handleSyncError);
    };
  }, [updateState, updateStats]);

  /**
   * Voicemail operations
   */
  const operations = {
    // Mark voicemail as read/unread
    markAsRead: useCallback(async (id: string, isRead: boolean = true): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.markAsRead(id, isRead);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to mark as ${isRead ? 'read' : 'unread'}: ${error}`
        }));
        return false;
      }
    }, []),

    // Archive/unarchive voicemail
    archive: useCallback(async (id: string, isArchived: boolean = true): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.archiveVoicemail(id, isArchived);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to ${isArchived ? 'archive' : 'unarchive'}: ${error}`
        }));
        return false;
      }
    }, []),

    // Delete voicemail
    delete: useCallback(async (id: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.deleteVoicemail(id);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to delete voicemail: ${error}`
        }));
        return false;
      }
    }, []),

    // Add tag to voicemail
    addTag: useCallback(async (id: string, tag: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.addTag(id, tag);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to add tag: ${error}`
        }));
        return false;
      }
    }, []),

    // Remove tag from voicemail
    removeTag: useCallback(async (id: string, tag: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.removeTag(id, tag);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to remove tag: ${error}`
        }));
        return false;
      }
    }, []),

    // Search voicemails
    search: useCallback((query: string): Voicemail[] => {
      return offlineVoicemailStore.searchVoicemails(query);
    }, []),

    // Refresh from server
    refresh: useCallback(async (): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.refreshFromServer();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to refresh: ${error}`
        }));
        return false;
      }
    }, []),

    // Force sync
    forceSync: useCallback(async (): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await offlineVoicemailStore.forceSyncNow();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to sync: ${error}`
        }));
        return false;
      }
    }, []),

    // Clear offline data
    clearOfflineData: useCallback(async (): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        const result = await offlineVoicemailStore.clearOfflineData();
        if (result) {
          updateState();
          updateStats();
        }
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to clear offline data: ${error}`
        }));
        return false;
      }
    }, [updateState, updateStats]),

    // Clear error
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, [])
  };

  /**
   * Utility functions
   */
  const utils = {
    // Get voicemail by ID
    getVoicemail: useCallback((id: string): Voicemail | null => {
      return offlineVoicemailStore.getVoicemail(id);
    }, []),

    // Get unread voicemails
    getUnreadVoicemails: useCallback((): Voicemail[] => {
      return offlineVoicemailStore.getUnreadVoicemails();
    }, []),

    // Get archived voicemails
    getArchivedVoicemails: useCallback((): Voicemail[] => {
      return offlineVoicemailStore.getArchivedVoicemails();
    }, []),

    // Format last sync time
    getLastSyncFormatted: useCallback((): string => {
      if (!state.lastSync) return 'Never';
      
      const now = Date.now();
      const diff = now - state.lastSync;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    }, [state.lastSync]),

    // Format storage size
    getStorageSizeFormatted: useCallback((): string => {
      const bytes = stats.storageSize;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }, [stats.storageSize])
  };

  return {
    // State
    ...state,
    stats,
    
    // Operations
    ...operations,
    
    // Utilities
    ...utils
  };
}