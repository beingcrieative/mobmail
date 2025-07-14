/**
 * Comprehensive PWA Security Test Suite for VoicemailAI
 * Tests all implemented security features and PWA functionality
 * Run this in browser console to validate the complete security-first PWA implementation
 */

console.log('🛡️ Starting VoicemailAI PWA Security Test Suite');
console.log('=' .repeat(60));

// Test configuration
const TEST_CONFIG = {
  baseUrl: window.location.origin,
  apiEndpoint: '/api/agent/chat',
  testTimeout: 30000,
  maxRetries: 3
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  results: []
};

/**
 * Utility functions for testing
 */
function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const message = `${emoji} ${name}${details ? ': ' + details : ''}`;
  console.log(message);
  
  testResults.results.push({ name, status, details, timestamp: Date.now() });
  
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeout = TEST_CONFIG.testTimeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * FASE 1: Security Foundation Tests
 */
async function testSecurityFoundation() {
  console.log('\n🔒 FASE 1: Security Foundation Tests');
  console.log('-'.repeat(40));

  // Test 1.1: Content Security Policy
  try {
    const response = await fetchWithTimeout('/');
    const csp = response.headers.get('content-security-policy');
    
    if (csp) {
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'connect-src',
        'img-src',
        'font-src',
        'worker-src'
      ];
      
      const missingDirectives = requiredDirectives.filter(directive => 
        !csp.includes(directive)
      );
      
      if (missingDirectives.length === 0) {
        logTest('1.1 Content Security Policy', 'PASS', 'All required directives present');
      } else {
        logTest('1.1 Content Security Policy', 'FAIL', `Missing: ${missingDirectives.join(', ')}`);
      }
    } else {
      logTest('1.1 Content Security Policy', 'FAIL', 'CSP header not found');
    }
  } catch (error) {
    logTest('1.1 Content Security Policy', 'FAIL', error.message);
  }

  // Test 1.2: Security Headers
  try {
    const response = await fetchWithTimeout('/');
    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'strict-transport-security': 'max-age=31536000',
      'referrer-policy': 'strict-origin-when-cross-origin'
    };

    let headersPassed = 0;
    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      const actualValue = response.headers.get(header);
      if (actualValue && actualValue.includes(expectedValue.split(';')[0])) {
        headersPassed++;
      }
    }

    if (headersPassed === Object.keys(securityHeaders).length) {
      logTest('1.2 Security Headers', 'PASS', `${headersPassed}/${Object.keys(securityHeaders).length} headers present`);
    } else {
      logTest('1.2 Security Headers', 'WARN', `${headersPassed}/${Object.keys(securityHeaders).length} headers present`);
    }
  } catch (error) {
    logTest('1.2 Security Headers', 'FAIL', error.message);
  }

  // Test 1.3: API Rate Limiting
  try {
    console.log('   Testing API rate limiting (this may take 30+ seconds)...');
    const requests = [];
    const startTime = Date.now();
    
    // Send requests quickly to trigger rate limiting
    for (let i = 0; i < 12; i++) {
      requests.push(
        fetchWithTimeout(TEST_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VoicemailAI-Test-Suite/1.0.0',
            'X-Forwarded-For': `192.168.1.${100 + i}` // Simulate different IPs
          },
          body: JSON.stringify({
            message: `Test request ${i + 1}`,
            sessionId: `test-session-${Date.now()}-${i}`
          })
        }).catch(err => ({ status: 0, error: err.message }))
      );
      
      // Small delay between requests
      await sleep(100);
    }

    const responses = await Promise.all(requests);
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    const successCount = responses.filter(r => r.status === 200).length;
    
    if (rateLimitedCount > 0) {
      logTest('1.3 API Rate Limiting', 'PASS', `${successCount} allowed, ${rateLimitedCount} rate limited`);
    } else {
      logTest('1.3 API Rate Limiting', 'WARN', 'No rate limiting detected');
    }
  } catch (error) {
    logTest('1.3 API Rate Limiting', 'FAIL', error.message);
  }

  // Test 1.4: Input Sanitization
  try {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '${7*7}',
      '{{7*7}}',
      '<%- 7*7 %>',
      '<img src=x onerror=alert("XSS")>',
      '\'; DROP TABLE users; --'
    ];

    let blockedCount = 0;
    for (const maliciousInput of maliciousInputs) {
      try {
        const response = await fetchWithTimeout(TEST_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VoicemailAI-Test-Suite/1.0.0'
          },
          body: JSON.stringify({
            message: maliciousInput,
            sessionId: `security-test-${Date.now()}`
          })
        });

        const data = await response.json();
        
        // Check if input was properly sanitized or blocked
        if (response.status === 400 && data.error && data.error.includes('Invalid input')) {
          blockedCount++;
        }
      } catch (error) {
        // Network errors don't count as blocking
      }
      
      await sleep(200); // Avoid overwhelming the server
    }

    if (blockedCount >= maliciousInputs.length * 0.8) {
      logTest('1.4 Input Sanitization', 'PASS', `${blockedCount}/${maliciousInputs.length} malicious inputs blocked`);
    } else {
      logTest('1.4 Input Sanitization', 'WARN', `${blockedCount}/${maliciousInputs.length} malicious inputs blocked`);
    }
  } catch (error) {
    logTest('1.4 Input Sanitization', 'FAIL', error.message);
  }
}

/**
 * FASE 2: PWA Infrastructure Tests
 */
async function testPWAInfrastructure() {
  console.log('\n📱 FASE 2: PWA Infrastructure Tests');
  console.log('-'.repeat(40));

  // Test 2.1: Service Worker Registration
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        logTest('2.1 Service Worker Registration', 'PASS', `Scope: ${registration.scope}`);
      } else {
        logTest('2.1 Service Worker Registration', 'FAIL', 'No service worker registered');
      }
    } else {
      logTest('2.1 Service Worker Registration', 'FAIL', 'Service Worker API not supported');
    }
  } catch (error) {
    logTest('2.1 Service Worker Registration', 'FAIL', error.message);
  }

  // Test 2.2: Service Worker File Accessibility
  try {
    const response = await fetchWithTimeout('/sw.js');
    const contentType = response.headers.get('content-type');
    
    if (response.ok && contentType && contentType.includes('javascript')) {
      logTest('2.2 Service Worker File', 'PASS', `Status: ${response.status}, Type: ${contentType}`);
    } else {
      logTest('2.2 Service Worker File', 'FAIL', `Status: ${response.status}, Type: ${contentType}`);
    }
  } catch (error) {
    logTest('2.2 Service Worker File', 'FAIL', error.message);
  }

  // Test 2.3: Manifest File Validation
  try {
    const response = await fetchWithTimeout('/manifest.json');
    
    if (response.ok) {
      const manifest = await response.json();
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        logTest('2.3 Manifest Validation', 'PASS', `All required fields present`);
      } else {
        logTest('2.3 Manifest Validation', 'FAIL', `Missing fields: ${missingFields.join(', ')}`);
      }
    } else {
      logTest('2.3 Manifest Validation', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('2.3 Manifest Validation', 'FAIL', error.message);
  }

  // Test 2.4: HTTPS Requirement
  try {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isHTTPS || isLocalhost) {
      logTest('2.4 HTTPS Requirement', 'PASS', `Protocol: ${window.location.protocol}`);
    } else {
      logTest('2.4 HTTPS Requirement', 'FAIL', 'PWA requires HTTPS in production');
    }
  } catch (error) {
    logTest('2.4 HTTPS Requirement', 'FAIL', error.message);
  }
}

/**
 * FASE 3: Offline & Storage Tests
 */
async function testOfflineStorage() {
  console.log('\n💾 FASE 3: Offline & Storage Tests');
  console.log('-'.repeat(40));

  // Test 3.1: IndexedDB Support
  try {
    if ('indexedDB' in window) {
      // Test IndexedDB functionality
      const dbName = 'VoicemailAI-Test-' + Date.now();
      const request = indexedDB.open(dbName, 1);
      
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          indexedDB.deleteDatabase(dbName);
          resolve();
        };
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          db.createObjectStore('test', { keyPath: 'id' });
        };
      });
      
      logTest('3.1 IndexedDB Support', 'PASS', 'IndexedDB accessible and functional');
    } else {
      logTest('3.1 IndexedDB Support', 'FAIL', 'IndexedDB not supported');
    }
  } catch (error) {
    logTest('3.1 IndexedDB Support', 'FAIL', error.message);
  }

  // Test 3.2: Local Storage Encryption (if available)
  try {
    if (window.encryptionService || window.offlineStorage) {
      logTest('3.2 Encryption Service', 'PASS', 'Encryption service available');
    } else {
      logTest('3.2 Encryption Service', 'WARN', 'Encryption service not loaded in global scope');
    }
  } catch (error) {
    logTest('3.2 Encryption Service', 'FAIL', error.message);
  }

  // Test 3.3: Cache API Support
  try {
    if ('caches' in window) {
      const cacheName = 'test-cache-' + Date.now();
      const cache = await caches.open(cacheName);
      await cache.put('/test', new Response('test'));
      const cached = await cache.match('/test');
      await caches.delete(cacheName);
      
      if (cached) {
        logTest('3.3 Cache API Support', 'PASS', 'Cache API functional');
      } else {
        logTest('3.3 Cache API Support', 'FAIL', 'Cache API not working');
      }
    } else {
      logTest('3.3 Cache API Support', 'FAIL', 'Cache API not supported');
    }
  } catch (error) {
    logTest('3.3 Cache API Support', 'FAIL', error.message);
  }

  // Test 3.4: Storage Quota
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quotaMB = Math.round(estimate.quota / 1024 / 1024);
      const usageMB = Math.round(estimate.usage / 1024 / 1024);
      
      logTest('3.4 Storage Quota', 'PASS', `Quota: ${quotaMB}MB, Used: ${usageMB}MB`);
    } else {
      logTest('3.4 Storage Quota', 'WARN', 'Storage quota API not available');
    }
  } catch (error) {
    logTest('3.4 Storage Quota', 'FAIL', error.message);
  }
}

/**
 * FASE 4: Authentication & Biometric Tests
 */
async function testAuthentication() {
  console.log('\n🔐 FASE 4: Authentication & Security Tests');
  console.log('-'.repeat(40));

  // Test 4.1: Web Crypto API Support
  try {
    if (window.crypto && window.crypto.subtle) {
      // Test AES-GCM encryption
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      const data = new TextEncoder().encode('test data');
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      if (encrypted) {
        logTest('4.1 Web Crypto API', 'PASS', 'AES-GCM encryption functional');
      } else {
        logTest('4.1 Web Crypto API', 'FAIL', 'Encryption failed');
      }
    } else {
      logTest('4.1 Web Crypto API', 'FAIL', 'Web Crypto API not supported');
    }
  } catch (error) {
    logTest('4.1 Web Crypto API', 'FAIL', error.message);
  }

  // Test 4.2: WebAuthn Support (for biometric)
  try {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        logTest('4.2 WebAuthn/Biometric', 'PASS', 'Biometric authentication available');
      } else {
        logTest('4.2 WebAuthn/Biometric', 'WARN', 'WebAuthn supported but no biometric authenticator');
      }
    } else {
      logTest('4.2 WebAuthn/Biometric', 'WARN', 'WebAuthn API not supported');
    }
  } catch (error) {
    logTest('4.2 WebAuthn/Biometric', 'FAIL', error.message);
  }

  // Test 4.3: Secure Context
  try {
    if (window.isSecureContext) {
      logTest('4.3 Secure Context', 'PASS', 'Running in secure context');
    } else {
      logTest('4.3 Secure Context', 'FAIL', 'Not running in secure context');
    }
  } catch (error) {
    logTest('4.3 Secure Context', 'FAIL', error.message);
  }

  // Test 4.4: Session Storage Security
  try {
    // Test that sensitive data isn't stored in plain text
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    let foundSensitiveData = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive) && 
        value && value.length > 10 && !value.includes('encrypted')
      )) {
        foundSensitiveData++;
      }
    }
    
    if (foundSensitiveData === 0) {
      logTest('4.4 Session Storage Security', 'PASS', 'No sensitive data found in plain text');
    } else {
      logTest('4.4 Session Storage Security', 'WARN', `${foundSensitiveData} potentially sensitive items found`);
    }
  } catch (error) {
    logTest('4.4 Session Storage Security', 'FAIL', error.message);
  }
}

/**
 * FASE 5: Performance & UX Tests
 */
async function testPerformanceUX() {
  console.log('\n⚡ FASE 5: Performance & UX Tests');
  console.log('-'.repeat(40));

  // Test 5.1: App Install Prompt
  try {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasInstallPrompt = window.deferredPrompt || window.beforeinstallprompt;
    
    if (isStandalone) {
      logTest('5.1 App Install Status', 'PASS', 'App is installed and running in standalone mode');
    } else if (hasInstallPrompt) {
      logTest('5.1 App Install Status', 'PASS', 'Install prompt available');
    } else {
      logTest('5.1 App Install Status', 'WARN', 'Install prompt not available');
    }
  } catch (error) {
    logTest('5.1 App Install Status', 'FAIL', error.message);
  }

  // Test 5.2: Responsive Design
  try {
    const isMobile = window.innerWidth <= 768;
    const hasViewportMeta = document.querySelector('meta[name="viewport"]');
    const viewportContent = hasViewportMeta ? hasViewportMeta.getAttribute('content') : '';
    
    if (hasViewportMeta && viewportContent.includes('width=device-width')) {
      logTest('5.2 Responsive Design', 'PASS', `Viewport configured, width: ${window.innerWidth}px`);
    } else {
      logTest('5.2 Responsive Design', 'FAIL', 'Viewport meta tag missing or incorrect');
    }
  } catch (error) {
    logTest('5.2 Responsive Design', 'FAIL', error.message);
  }

  // Test 5.3: Touch Support
  try {
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (hasTouchSupport) {
      logTest('5.3 Touch Support', 'PASS', `Max touch points: ${navigator.maxTouchPoints || 'unknown'}`);
    } else {
      logTest('5.3 Touch Support', 'WARN', 'Touch support not detected');
    }
  } catch (error) {
    logTest('5.3 Touch Support', 'FAIL', error.message);
  }

  // Test 5.4: Network Status Detection
  try {
    if ('onLine' in navigator) {
      const isOnline = navigator.onLine;
      logTest('5.4 Network Status', 'PASS', `Online: ${isOnline}`);
    } else {
      logTest('5.4 Network Status', 'WARN', 'Network status API not available');
    }
  } catch (error) {
    logTest('5.4 Network Status', 'FAIL', error.message);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    await testSecurityFoundation();
    await sleep(1000);
    
    await testPWAInfrastructure();
    await sleep(1000);
    
    await testOfflineStorage();
    await sleep(1000);
    
    await testAuthentication();
    await sleep(1000);
    
    await testPerformanceUX();
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
  
  const duration = Date.now() - startTime;
  
  // Print final results
  console.log('\n' + '='.repeat(60));
  console.log('🏁 VoicemailAI PWA Security Test Suite Complete');
  console.log('='.repeat(60));
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.results.length}`);
  
  const successRate = ((testResults.passed / testResults.results.length) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All critical tests passed! Your PWA security implementation is solid.');
  } else if (testResults.failed <= 2) {
    console.log('\n👍 Good security implementation with minor issues to address.');
  } else {
    console.log('\n⚠️  Several security issues detected. Please review the failed tests.');
  }
  
  // Export results for further analysis
  window.pwaTestResults = testResults;
  console.log('\n📋 Detailed results available in: window.pwaTestResults');
  
  return testResults;
}

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  window.runPWASecurityTests = runAllTests;
  console.log('🚀 PWA Security Test Suite loaded. Run window.runPWASecurityTests() to start testing.');
  
  // Auto-start if hash indicates testing mode
  if (window.location.hash === '#test') {
    setTimeout(runAllTests, 1000);
  }
}

// Export for node environment
if (typeof module !== 'undefined') {
  module.exports = { runAllTests, testResults };
}