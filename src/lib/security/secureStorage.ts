/**
 * Secure storage wrapper for VoicemailAI PWA
 * Encrypts data before localStorage storage and decrypts on retrieval
 * Implements automatic expiration and secure deletion
 */

import { encryptionService, type EncryptedData } from './encryption';

interface StorageOptions {
  expirationHours?: number;
  sessionToken?: string;
  fallbackToPlaintext?: boolean; // For non-sensitive data
}

interface StorageItem {
  type: 'encrypted' | 'plaintext';
  data: EncryptedData | string;
  expiresAt: number;
  sensitive: boolean;
}

class SecureStorageService {
  private storagePrefix = 'voicemailai_secure_';
  private sessionTokenKey = 'session_token';
  private defaultExpirationHours = 24;

  /**
   * Get current session token for encryption/decryption
   */
  private getSessionToken(): string | null {
    try {
      // Try to get from memory first, then localStorage
      const token = localStorage.getItem(this.sessionTokenKey);
      return token;
    } catch (error) {
      console.error('Failed to retrieve session token:', error);
      return null;
    }
  }

  /**
   * Set session token (called during authentication)
   */
  setSessionToken(token: string): void {
    try {
      localStorage.setItem(this.sessionTokenKey, token);
    } catch (error) {
      console.error('Failed to store session token:', error);
    }
  }

  /**
   * Clear session token (called during logout)
   */
  clearSessionToken(): void {
    try {
      localStorage.removeItem(this.sessionTokenKey);
    } catch (error) {
      console.error('Failed to clear session token:', error);
    }
  }

  /**
   * Generate prefixed storage key
   */
  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  /**
   * Check if stored item has expired
   */
  private isExpired(item: StorageItem): boolean {
    return Date.now() > item.expiresAt;
  }

  /**
   * Securely store data with encryption
   */
  async setSecureItem(
    key: string, 
    value: any, 
    options: StorageOptions = {}
  ): Promise<boolean> {
    const {
      expirationHours = this.defaultExpirationHours,
      sessionToken,
      fallbackToPlaintext = false
    } = options;

    const storageKey = this.getStorageKey(key);
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    
    try {
      // Determine if this is sensitive data that needs encryption
      const isSensitive = this.isSensitiveKey(key);
      const token = sessionToken || this.getSessionToken();
      
      let storageItem: StorageItem;

      if (isSensitive && token) {
        // Encrypt sensitive data
        try {
          const encryptedData = await encryptionService.encrypt(
            JSON.stringify(value), 
            token
          );
          
          storageItem = {
            type: 'encrypted',
            data: encryptedData,
            expiresAt,
            sensitive: true
          };
        } catch (encryptionError) {
          console.error('Encryption failed:', encryptionError);
          
          if (fallbackToPlaintext) {
            console.warn(`Falling back to plaintext storage for key: ${key}`);
            storageItem = {
              type: 'plaintext',
              data: JSON.stringify(value),
              expiresAt,
              sensitive: false
            };
          } else {
            throw encryptionError;
          }
        }
      } else {
        // Store non-sensitive data as plaintext
        storageItem = {
          type: 'plaintext',
          data: JSON.stringify(value),
          expiresAt,
          sensitive: false
        };
      }

      localStorage.setItem(storageKey, JSON.stringify(storageItem));
      return true;

    } catch (error) {
      console.error(`Failed to store secure item ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt stored data
   */
  async getSecureItem<T>(
    key: string, 
    options: StorageOptions = {}
  ): Promise<T | null> {
    const { sessionToken } = options;
    const storageKey = this.getStorageKey(key);

    try {
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(storedData);

      // Check expiration
      if (this.isExpired(storageItem)) {
        console.log(`Stored item ${key} has expired, removing...`);
        await this.removeSecureItem(key);
        return null;
      }

      // Handle encrypted data
      if (storageItem.type === 'encrypted') {
        const token = sessionToken || this.getSessionToken();
        if (!token) {
          console.warn(`No session token available for decrypting ${key}`);
          return null;
        }

        try {
          const decryptedData = await encryptionService.decrypt(
            storageItem.data as EncryptedData, 
            token
          );
          return JSON.parse(decryptedData);
        } catch (decryptionError) {
          console.error(`Failed to decrypt ${key}:`, decryptionError);
          // Remove corrupted encrypted data
          await this.removeSecureItem(key);
          return null;
        }
      }

      // Handle plaintext data
      return JSON.parse(storageItem.data as string);

    } catch (error) {
      console.error(`Failed to retrieve secure item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove stored item with secure deletion
   */
  async removeSecureItem(key: string): Promise<boolean> {
    const storageKey = this.getStorageKey(key);

    try {
      // Get the item first for secure deletion
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        // Securely overwrite the data
        encryptionService.secureDelete(storedData);
      }

      localStorage.removeItem(storageKey);
      return true;

    } catch (error) {
      console.error(`Failed to remove secure item ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if a key contains sensitive data that should be encrypted
   */
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      'voicemail',
      'transcription',
      'conversation',
      'agent',
      'user_data',
      'auth',
      'token',
      'session',
      'profile',
      'subscription'
    ];

    return sensitivePatterns.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Clear all stored data (used during logout)
   */
  async clearAllSecureData(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      
      // Find all keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key.replace(this.storagePrefix, ''));
        }
      }

      // Remove all secure items
      for (const key of keysToRemove) {
        await this.removeSecureItem(key);
      }

      // Clear session token
      this.clearSessionToken();

      console.log(`Cleared ${keysToRemove.length} secure storage items`);

    } catch (error) {
      console.error('Failed to clear secure data:', error);
    }
  }

  /**
   * Cleanup expired items
   */
  async cleanupExpiredItems(): Promise<number> {
    let cleanedCount = 0;

    try {
      const keysToCheck: string[] = [];
      
      // Find all keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToCheck.push(key);
        }
      }

      // Check each item for expiration
      for (const fullKey of keysToCheck) {
        try {
          const storedData = localStorage.getItem(fullKey);
          if (storedData) {
            const storageItem: StorageItem = JSON.parse(storedData);
            
            if (this.isExpired(storageItem)) {
              const key = fullKey.replace(this.storagePrefix, '');
              await this.removeSecureItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to check expiration for ${fullKey}:`, error);
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired storage items`);
      }

    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
    }

    return cleanedCount;
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalItems: number;
    encryptedItems: number;
    plaintextItems: number;
    totalSize: number;
  } {
    let totalItems = 0;
    let encryptedItems = 0;
    let plaintextItems = 0;
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          totalItems++;
          
          const data = localStorage.getItem(key);
          if (data) {
            totalSize += data.length;
            
            try {
              const item: StorageItem = JSON.parse(data);
              if (item.type === 'encrypted') {
                encryptedItems++;
              } else {
                plaintextItems++;
              }
            } catch {
              // Count as plaintext if can't parse
              plaintextItems++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get storage stats:', error);
    }

    return {
      totalItems,
      encryptedItems,
      plaintextItems,
      totalSize
    };
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();

// Legacy localStorage wrapper for easy migration
export const secureLocalStorage = {
  async setItem(key: string, value: any, options?: StorageOptions): Promise<boolean> {
    return secureStorage.setSecureItem(key, value, options);
  },
  
  async getItem<T>(key: string, options?: StorageOptions): Promise<T | null> {
    return secureStorage.getSecureItem<T>(key, options);
  },
  
  async removeItem(key: string): Promise<boolean> {
    return secureStorage.removeSecureItem(key);
  },
  
  async clear(): Promise<void> {
    return secureStorage.clearAllSecureData();
  }
};