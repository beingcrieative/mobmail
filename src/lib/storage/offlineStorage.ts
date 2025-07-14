/**
 * Secure Offline Storage System for VoicemailAI PWA
 * Implements encrypted IndexedDB storage with data integrity verification
 * Supports offline-first voicemail management and secure sync queue
 */

import { encryptionService } from '../security/encryption';

interface OfflineData {
  id: string;
  type: 'voicemail' | 'action' | 'settings' | 'chat';
  data: any;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
  version: string;
  integrity: string;
}

interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
}

class OfflineStorageManager {
  private dbName = 'VoicemailAI-Secure';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;

  /**
   * Initialize offline storage with security measures
   */
  async initialize(): Promise<boolean> {
    try {
      // Generate or retrieve encryption key
      await this.initializeEncryption();
      
      // Open IndexedDB
      await this.openDatabase();
      
      console.log('✅ Offline storage initialized securely');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize offline storage:', error);
      return false;
    }
  }

  /**
   * Initialize encryption for offline storage
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Generate a dedicated offline storage key
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        false, // Non-extractable for security
        ['encrypt', 'decrypt']
      );
      
      console.log('🔐 Offline storage encryption key generated');
    } catch (error) {
      throw new Error('Failed to initialize offline storage encryption: ' + error);
    }
  }

  /**
   * Open IndexedDB with proper schema
   */
  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB: ' + request.error));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('📂 IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('retryCount', 'retryCount', { unique: false });
        }

        console.log('🏗️ IndexedDB schema created/updated');
      };
    });
  }

  /**
   * Store encrypted data offline
   */
  async storeData(id: string, type: OfflineData['type'], data: any, options: {
    encrypt?: boolean;
    expiresIn?: number; // seconds
  } = {}): Promise<boolean> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const { encrypt = true, expiresIn } = options;
      let processedData = data;
      let integrity = '';

      // Encrypt sensitive data
      if (encrypt && type !== 'settings') {
        const encrypted = await this.encryptData(JSON.stringify(data));
        processedData = encrypted;
        integrity = await this.generateIntegrity(JSON.stringify(data));
      } else {
        integrity = await this.generateIntegrity(JSON.stringify(data));
      }

      const offlineData: OfflineData = {
        id,
        type,
        data: processedData,
        encrypted: encrypt && type !== 'settings',
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined,
        version: '1.0.0',
        integrity
      };

      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await this.promisifyRequest(store.put(offlineData));

      console.log(`💾 Stored offline data: ${id} (type: ${type}, encrypted: ${offlineData.encrypted})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to store offline data:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt offline data
   */
  async getData(id: string): Promise<any | null> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const result = await this.promisifyRequest(store.get(id));

      if (!result) {
        return null;
      }

      // Check expiration
      if (result.expiresAt && Date.now() > result.expiresAt) {
        await this.deleteData(id);
        console.log(`🗑️ Expired offline data removed: ${id}`);
        return null;
      }

      // Decrypt if encrypted
      if (result.encrypted && this.encryptionKey) {
        const decrypted = await this.decryptData(result.data);
        const parsedData = JSON.parse(decrypted);
        
        // Verify integrity
        const currentIntegrity = await this.generateIntegrity(decrypted);
        if (currentIntegrity !== result.integrity) {
          console.warn(`⚠️ Data integrity check failed for: ${id}`);
          await this.deleteData(id);
          return null;
        }
        
        return parsedData;
      }

      // Verify integrity for unencrypted data
      const currentIntegrity = await this.generateIntegrity(JSON.stringify(result.data));
      if (currentIntegrity !== result.integrity) {
        console.warn(`⚠️ Data integrity check failed for: ${id}`);
        await this.deleteData(id);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to get offline data:', error);
      return null;
    }
  }

  /**
   * Get all data by type
   */
  async getDataByType(type: OfflineData['type']): Promise<any[]> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      const results = await this.promisifyRequest(index.getAll(type));

      const validData = [];
      for (const result of results) {
        // Check expiration
        if (result.expiresAt && Date.now() > result.expiresAt) {
          await this.deleteData(result.id);
          continue;
        }

        // Decrypt if needed
        if (result.encrypted && this.encryptionKey) {
          try {
            const decrypted = await this.decryptData(result.data);
            const parsedData = JSON.parse(decrypted);
            
            // Verify integrity
            const currentIntegrity = await this.generateIntegrity(decrypted);
            if (currentIntegrity === result.integrity) {
              validData.push({ id: result.id, ...parsedData });
            }
          } catch (error) {
            console.warn(`⚠️ Failed to decrypt data: ${result.id}`);
          }
        } else {
          // Verify integrity for unencrypted data
          const currentIntegrity = await this.generateIntegrity(JSON.stringify(result.data));
          if (currentIntegrity === result.integrity) {
            validData.push({ id: result.id, ...result.data });
          }
        }
      }

      return validData;
    } catch (error) {
      console.error('❌ Failed to get data by type:', error);
      return [];
    }
  }

  /**
   * Delete offline data
   */
  async deleteData(id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await this.promisifyRequest(store.delete(id));
      
      console.log(`🗑️ Deleted offline data: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete offline data:', error);
      return false;
    }
  }

  /**
   * Add action to sync queue
   */
  async addToSyncQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const syncAction: SyncAction = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        ...action
      };

      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await this.promisifyRequest(store.put(syncAction));

      console.log(`📤 Added to sync queue: ${syncAction.id} (${action.type} ${action.endpoint})`);
      return syncAction.id;
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
      throw error;
    }
  }

  /**
   * Get pending sync actions
   */
  async getPendingSyncActions(): Promise<SyncAction[]> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const results = await this.promisifyRequest(store.getAll());

      // Sort by priority and timestamp
      return results.sort((a, b) => {
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });
    } catch (error) {
      console.error('❌ Failed to get pending sync actions:', error);
      return [];
    }
  }

  /**
   * Remove action from sync queue
   */
  async removeSyncAction(id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await this.promisifyRequest(store.delete(id));
      
      console.log(`✅ Removed from sync queue: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to remove sync action:', error);
      return false;
    }
  }

  /**
   * Update sync action retry count
   */
  async updateSyncActionRetry(id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const action = await this.promisifyRequest(store.get(id));
      
      if (action) {
        action.retryCount++;
        await this.promisifyRequest(store.put(action));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to update sync action retry:', error);
      return false;
    }
  }

  /**
   * Clean expired data
   */
  async cleanExpiredData(): Promise<number> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('expiresAt');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const expiredItems = await this.promisifyRequest(index.getAll(range));
      
      let cleanedCount = 0;
      for (const item of expiredItems) {
        if (item.expiresAt && item.expiresAt <= now) {
          await this.promisifyRequest(store.delete(item.id));
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired offline data items`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('❌ Failed to clean expired data:', error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    offlineDataCount: number;
    syncQueueCount: number;
    estimatedSize: number;
  }> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const offlineTransaction = this.db.transaction(['offlineData'], 'readonly');
      const offlineStore = offlineTransaction.objectStore('offlineData');
      const offlineCount = await this.promisifyRequest(offlineStore.count());

      const syncTransaction = this.db.transaction(['syncQueue'], 'readonly');
      const syncStore = syncTransaction.objectStore('syncQueue');
      const syncCount = await this.promisifyRequest(syncStore.count());

      // Estimate storage size (rough calculation)
      const estimatedSize = (offlineCount * 1024) + (syncCount * 512); // Rough bytes estimate

      return {
        offlineDataCount: offlineCount,
        syncQueueCount: syncCount,
        estimatedSize
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { offlineDataCount: 0, syncQueueCount: 0, estimatedSize: 0 };
    }
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<boolean> {
    if (!this.db) {
      throw new Error('Offline storage not initialized');
    }

    try {
      const transaction = this.db.transaction(['offlineData', 'syncQueue'], 'readwrite');
      
      await this.promisifyRequest(transaction.objectStore('offlineData').clear());
      await this.promisifyRequest(transaction.objectStore('syncQueue').clear());
      
      console.log('🗑️ All offline data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
      return false;
    }
  }

  /**
   * Encrypt data using Web Crypto API
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBytes
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using Web Crypto API
   */
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Generate data integrity hash
   */
  private async generateIntegrity(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));
  }

  /**
   * Convert IDBRequest to Promise
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Export types for external use
export type { OfflineData, SyncAction };