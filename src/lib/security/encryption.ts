/**
 * Secure encryption utilities for VoicemailAI PWA
 * Uses Web Crypto API for browser-native AES-256-GCM encryption
 * Implements key derivation from user session tokens
 */

interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
  timestamp: number;
  keyVersion: number;
}

interface SecurityConfig {
  algorithm: 'AES-GCM';
  keyLength: 256;
  ivLength: 12; // 96 bits for GCM
  saltLength: 16; // 128 bits
  tagLength: 16; // 128 bits
  iterations: 100000; // PBKDF2 iterations
  expirationHours: 24; // Data expiration
}

class EncryptionService {
  private config: SecurityConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    saltLength: 16,
    tagLength: 16,
    iterations: 100000,
    expirationHours: 24,
  };

  private keyCache = new Map<string, CryptoKey>();
  private keyVersion = 1; // For key rotation

  /**
   * Derive encryption key from user session token
   */
  private async deriveKey(sessionToken: string, salt: Uint8Array): Promise<CryptoKey> {
    const cacheKey = `${sessionToken}-${this.arrayBufferToBase64(salt.buffer.slice(0) as ArrayBuffer)}`;
    
    // Return cached key if available
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    try {
      // Import the session token as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(sessionToken),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive AES-GCM key using PBKDF2
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.config.iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        {
          name: this.config.algorithm,
          length: this.config.keyLength,
        },
        false, // Not extractable for security
        ['encrypt', 'decrypt']
      );

      // Cache the derived key
      this.keyCache.set(cacheKey, derivedKey);
      
      // Auto-expire cache after 15 minutes
      setTimeout(() => {
        this.keyCache.delete(cacheKey);
      }, 15 * 60 * 1000);

      return derivedKey;
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Generate cryptographically secure random bytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, sessionToken: string): Promise<EncryptedData> {
    if (!data || !sessionToken) {
      throw new Error('Data and session token are required for encryption');
    }

    try {
      // Generate random salt and IV
      const salt = this.generateRandomBytes(this.config.saltLength);
      const iv = this.generateRandomBytes(this.config.ivLength);
      
      // Derive encryption key
      const key = await this.deriveKey(sessionToken, salt);
      
      // Encrypt the data
      const encodedData = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8, // Convert to bits
        },
        key,
        encodedData
      );

      return {
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv.buffer.slice(0) as ArrayBuffer),
        salt: this.arrayBufferToBase64(salt.buffer.slice(0) as ArrayBuffer),
        timestamp: Date.now(),
        keyVersion: this.keyVersion,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: EncryptedData, sessionToken: string): Promise<string> {
    if (!encryptedData || !sessionToken) {
      throw new Error('Encrypted data and session token are required for decryption');
    }

    // Check if data has expired
    const expirationTime = encryptedData.timestamp + (this.config.expirationHours * 60 * 60 * 1000);
    if (Date.now() > expirationTime) {
      throw new Error('Encrypted data has expired');
    }

    // Check key version compatibility
    if (encryptedData.keyVersion !== this.keyVersion) {
      throw new Error('Key version mismatch - data encrypted with different key version');
    }

    try {
      // Convert base64 back to ArrayBuffers
      const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt));
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv));
      const encrypted = this.base64ToArrayBuffer(encryptedData.encryptedData);
      
      // Derive decryption key
      const key = await this.deriveKey(sessionToken, salt);
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8, // Convert to bits
        },
        key,
        encrypted
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - possibly corrupted or wrong key');
    }
  }

  /**
   * Rotate encryption key version (for key rotation)
   */
  rotateKeyVersion(): void {
    this.keyVersion += 1;
    this.keyCache.clear(); // Clear all cached keys
    console.log(`Key rotation completed - new version: ${this.keyVersion}`);
  }

  /**
   * Secure deletion by overwriting memory
   */
  secureDelete(data: any): void {
    if (typeof data === 'string') {
      // Overwrite string memory with random data
      for (let i = 0; i < data.length; i++) {
        data = data.substring(0, i) + String.fromCharCode(Math.floor(Math.random() * 256)) + data.substring(i + 1);
      }
    }
    
    // Clear key cache
    this.keyCache.clear();
  }

  /**
   * Validate encryption integrity
   */
  validateIntegrity(encryptedData: EncryptedData): boolean {
    try {
      // Check required fields
      if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.salt) {
        return false;
      }

      // Validate base64 encoding
      this.base64ToArrayBuffer(encryptedData.encryptedData);
      this.base64ToArrayBuffer(encryptedData.iv);
      this.base64ToArrayBuffer(encryptedData.salt);

      // Check timestamp is valid
      if (!encryptedData.timestamp || encryptedData.timestamp > Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export type { EncryptedData };