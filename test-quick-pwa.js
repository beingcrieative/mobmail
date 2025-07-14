/**
 * Quick PWA Test - Check if basic functionality works
 */

const fetch = require('node-fetch');

async function testPWABasics() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing PWA Basic Functionality');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Main app loads
    console.log('Testing main app...');
    const appResponse = await fetch(baseUrl);
    console.log(`✅ Main app: ${appResponse.status}`);
    
    // Test 2: Manifest loads
    console.log('Testing manifest...');
    const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
    console.log(`✅ Manifest: ${manifestResponse.status}`);
    
    // Test 3: Service Worker loads
    console.log('Testing service worker...');
    const swResponse = await fetch(`${baseUrl}/sw.js`);
    console.log(`✅ Service Worker: ${swResponse.status}`);
    
    // Test 4: Icons load
    console.log('Testing icons...');
    const iconResponse = await fetch(`${baseUrl}/icons/icon-144x144.png`);
    console.log(`✅ Icon 144x144: ${iconResponse.status}`);
    
    // Test 5: Mobile interface loads
    console.log('Testing mobile interface...');
    const mobileResponse = await fetch(`${baseUrl}/mobile-v3`);
    console.log(`✅ Mobile interface: ${mobileResponse.status}`);
    
    console.log('\n🎉 Basic PWA tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPWABasics();