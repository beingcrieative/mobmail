/**
 * Offline-First Voicemail Store for VoicemailAI PWA
 * Provides secure offline voicemail management with automatic sync
 */

import { offlineStorage } from '../storage/offlineStorage';
import { syncManager } from '../sync/syncManager';

interface Voicemail {
  id: string;
  fromNumber: string;
  fromName?: string;
  transcription: string;
  audioUrl?: string;
  duration: number;
  timestamp: number;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  metadata?: Record<string, any>;
}

interface VoicemailAction {
  type: 'markRead' | 'markUnread' | 'archive' | 'unarchive' | 'delete' | 'addTag' | 'removeTag';
  voicemailId: string;
  data?: any;
  timestamp: number;
}

class OfflineVoicemailStore {
  private voicemails: Map<string, Voicemail> = new Map();
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private isInitialized = false;

  /**
   * Initialize the offline voicemail store
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize dependencies
      await offlineStorage.initialize();
      await syncManager.initialize();

      // Load cached voicemails
      await this.loadVoicemailsFromCache();

      // Setup sync event listeners
      this.setupSyncListeners();

      this.isInitialized = true;
      console.log('📱 Offline voicemail store initialized');
    } catch (error) {
      console.error('❌ Failed to initialize offline voicemail store:', error);
      throw error;
    }
  }

  /**
   * Load voicemails from offline storage
   */
  private async loadVoicemailsFromCache(): Promise<void> {
    try {
      const cachedVoicemails = await offlineStorage.getDataByType('voicemail');
      
      this.voicemails.clear();
      for (const voicemail of cachedVoicemails) {
        this.voicemails.set(voicemail.id, voicemail);
      }

      console.log(`📂 Loaded ${this.voicemails.size} voicemails from cache`);
      this.emit('voicemails-loaded', { count: this.voicemails.size });
    } catch (error) {
      console.error('❌ Failed to load voicemails from cache:', error);
    }
  }

  /**
   * Setup sync event listeners
   */
  private setupSyncListeners(): void {
    syncManager.on('sync-completed', (data) => {
      // Refresh voicemails after successful sync
      this.refreshFromServer();
    });

    syncManager.on('network-status', (data) => {
      if (data.online) {
        // When back online, refresh from server
        this.refreshFromServer();
      }
    });
  }

  /**
   * Get all voicemails (from cache)
   */
  getVoicemails(): Voicemail[] {
    return Array.from(this.voicemails.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get voicemail by ID
   */
  getVoicemail(id: string): Voicemail | null {
    return this.voicemails.get(id) || null;
  }

  /**
   * Get unread voicemails
   */
  getUnreadVoicemails(): Voicemail[] {
    return this.getVoicemails().filter(vm => !vm.isRead);
  }

  /**
   * Get archived voicemails
   */
  getArchivedVoicemails(): Voicemail[] {
    return this.getVoicemails().filter(vm => vm.isArchived);
  }

  /**
   * Search voicemails by transcription or caller
   */
  searchVoicemails(query: string): Voicemail[] {
    const searchTerm = query.toLowerCase();
    return this.getVoicemails().filter(vm => 
      vm.transcription.toLowerCase().includes(searchTerm) ||
      vm.fromName?.toLowerCase().includes(searchTerm) ||
      vm.fromNumber.includes(searchTerm) ||
      vm.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Add new voicemail (from server or manual entry)
   */
  async addVoicemail(voicemail: Omit<Voicemail, 'id'>): Promise<string> {
    const id = `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newVoicemail: Voicemail = {
      id,
      ...voicemail
    };

    try {
      // Store in memory
      this.voicemails.set(id, newVoicemail);

      // Store in offline cache
      await offlineStorage.storeData(
        `voicemail_${id}`,
        'voicemail',
        newVoicemail,
        { encrypt: true, expiresIn: 30 * 24 * 60 * 60 } // 30 days
      );

      // Queue sync action if this is a new voicemail
      if (syncManager.isNetworkOnline()) {
        await syncManager.queueAction(
          'create',
          '/api/transcriptions',
          newVoicemail,
          { priority: 'high' }
        );
      }

      this.emit('voicemail-added', { voicemail: newVoicemail });
      console.log(`📧 Voicemail added: ${id}`);
      
      return id;
    } catch (error) {
      console.error('❌ Failed to add voicemail:', error);
      throw error;
    }
  }

  /**
   * Mark voicemail as read/unread
   */
  async markAsRead(id: string, isRead: boolean = true): Promise<boolean> {
    return this.updateVoicemail(id, { isRead }, {
      type: isRead ? 'markRead' : 'markUnread',
      voicemailId: id,
      timestamp: Date.now()
    });
  }

  /**
   * Archive/unarchive voicemail
   */
  async archiveVoicemail(id: string, isArchived: boolean = true): Promise<boolean> {
    return this.updateVoicemail(id, { isArchived }, {
      type: isArchived ? 'archive' : 'unarchive',
      voicemailId: id,
      timestamp: Date.now()
    });
  }

  /**
   * Delete voicemail
   */
  async deleteVoicemail(id: string): Promise<boolean> {
    try {
      const voicemail = this.voicemails.get(id);
      if (!voicemail) {
        console.warn(`⚠️ Voicemail not found: ${id}`);
        return false;
      }

      // Remove from memory
      this.voicemails.delete(id);

      // Remove from offline storage
      await offlineStorage.deleteData(`voicemail_${id}`);

      // Queue delete action for sync
      await syncManager.queueAction(
        'delete',
        `/api/transcriptions/${id}`,
        null,
        { priority: 'medium' }
      );

      this.emit('voicemail-deleted', { id, voicemail });
      console.log(`🗑️ Voicemail deleted: ${id}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete voicemail:', error);
      return false;
    }
  }

  /**
   * Add tag to voicemail
   */
  async addTag(id: string, tag: string): Promise<boolean> {
    const voicemail = this.voicemails.get(id);
    if (!voicemail) return false;

    if (!voicemail.tags.includes(tag)) {
      const updatedTags = [...voicemail.tags, tag];
      return this.updateVoicemail(id, { tags: updatedTags }, {
        type: 'addTag',
        voicemailId: id,
        data: { tag },
        timestamp: Date.now()
      });
    }

    return true;
  }

  /**
   * Remove tag from voicemail
   */
  async removeTag(id: string, tag: string): Promise<boolean> {
    const voicemail = this.voicemails.get(id);
    if (!voicemail) return false;

    const updatedTags = voicemail.tags.filter(t => t !== tag);
    return this.updateVoicemail(id, { tags: updatedTags }, {
      type: 'removeTag',
      voicemailId: id,
      data: { tag },
      timestamp: Date.now()
    });
  }

  /**
   * Update voicemail with action tracking
   */
  private async updateVoicemail(
    id: string,
    updates: Partial<Voicemail>,
    action: VoicemailAction
  ): Promise<boolean> {
    try {
      const voicemail = this.voicemails.get(id);
      if (!voicemail) {
        console.warn(`⚠️ Voicemail not found: ${id}`);
        return false;
      }

      // Update in memory
      const updatedVoicemail = { ...voicemail, ...updates };
      this.voicemails.set(id, updatedVoicemail);

      // Update in offline storage
      await offlineStorage.storeData(
        `voicemail_${id}`,
        'voicemail',
        updatedVoicemail,
        { encrypt: true, expiresIn: 30 * 24 * 60 * 60 }
      );

      // Queue action for sync
      await syncManager.queueAction(
        'update',
        `/api/transcriptions/${id}`,
        { action, updates },
        { priority: 'medium' }
      );

      this.emit('voicemail-updated', { id, voicemail: updatedVoicemail, action });
      console.log(`📝 Voicemail updated: ${id} (${action.type})`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update voicemail:', error);
      return false;
    }
  }

  /**
   * Refresh voicemails from server (when online)
   */
  async refreshFromServer(): Promise<boolean> {
    if (!syncManager.isNetworkOnline()) {
      console.log('📴 Cannot refresh while offline');
      return false;
    }

    try {
      console.log('🔄 Refreshing voicemails from server...');
      
      const response = await fetch('/api/transcriptions', {
        headers: {
          'User-Agent': 'VoicemailAI-PWA/1.0.0',
          'X-Offline-Refresh': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverVoicemails: Voicemail[] = await response.json();
      
      // Update local cache with server data
      for (const voicemail of serverVoicemails) {
        this.voicemails.set(voicemail.id, voicemail);
        
        // Update offline storage
        await offlineStorage.storeData(
          `voicemail_${voicemail.id}`,
          'voicemail',
          voicemail,
          { encrypt: true, expiresIn: 30 * 24 * 60 * 60 }
        );
      }

      this.emit('voicemails-refreshed', { 
        count: serverVoicemails.length,
        timestamp: Date.now()
      });
      
      console.log(`✅ Refreshed ${serverVoicemails.length} voicemails from server`);
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh from server:', error);
      return false;
    }
  }

  /**
   * Get offline storage statistics
   */
  async getStorageStats(): Promise<{
    voicemailsCount: number;
    pendingSyncActions: number;
    estimatedSize: number;
  }> {
    try {
      const stats = await offlineStorage.getStorageStats();
      const pendingActions = await syncManager.getPendingActionsCount();
      
      return {
        voicemailsCount: this.voicemails.size,
        pendingSyncActions: pendingActions,
        estimatedSize: stats.estimatedSize
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        voicemailsCount: 0,
        pendingSyncActions: 0,
        estimatedSize: 0
      };
    }
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<boolean> {
    try {
      this.voicemails.clear();
      await offlineStorage.clearAll();
      
      this.emit('offline-data-cleared', {});
      console.log('🗑️ All offline voicemail data cleared');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
      return false;
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<boolean> {
    try {
      const stats = await syncManager.syncNow();
      return stats.successCount > 0 || stats.totalActions === 0;
    } catch (error) {
      console.error('❌ Failed to force sync:', error);
      return false;
    }
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
          console.error(`Voicemail Store: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Check if store is initialized
   */
  isStoreInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get sync manager instance
   */
  getSyncManager() {
    return syncManager;
  }
}

// Export singleton instance
export const offlineVoicemailStore = new OfflineVoicemailStore();

// Export types
export type { Voicemail, VoicemailAction };