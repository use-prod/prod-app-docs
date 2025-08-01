#!/usr/bin/env node

/**
 * Simple API Key Test - matches your working curl command exactly
 */

const QLOO_API_KEY = process.env.QLOO_API_KEY;

async function testApiKey() {
  console.log("🔑 Testing Qloo API Key...");
  console.log(`Using API Key: ${QLOO_API_KEY.substring(0, 8)}...`);
  
  // Match your exact working curl command
  const url = "https://hackathon.api.qloo.com/v2/insights/?filter.type=urn%3Aentity%3Adestination&filter.tags=urn%3Atag%3Agenre%3Adestination%3Aart_culture";
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': QLOO_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(`❌ Error Body:`, errorText);
      return false;
    }

    const data = await response.json();
    console.log(`✅ API Key is working!`);
    console.log(`📊 Received ${data.results?.length || 0} destination results`);
    
    if (data.results && data.results.length > 0) {
      console.log(`📍 Sample destinations:`);
      data.results.slice(0, 3).forEach((dest: any, i: number) => {
        console.log(`  ${i + 1}. ${dest.name || dest.id} (affinity: ${dest.affinity || 'N/A'})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Network Error:`, error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testApiKey().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testApiKey };