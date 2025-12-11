#!/usr/bin/env node

// Quick API testing script for demo
const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing BookByBlock API...\n');

  try {
    // Health check
    console.log('1. Health Check...');
    const health = await fetch(`${API_BASE}/health`);
    console.log('✅', await health.json());

    // Create event (requires blockchain)
    console.log('\n2. Create Event...');
    const createEvent = await fetch(`${API_BASE}/api/admin/create-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Concert',
        symbol: 'CONCERT',
        basePrice: '0.01',
        totalSupply: 100
      })
    });
    
    if (createEvent.ok) {
      const eventResult = await createEvent.json();
      console.log('✅ Event created:', eventResult.data);
      
      const eventId = eventResult.data.eventId;
      const ticketContract = eventResult.data.ticketContract;

      // Get event details
      console.log('\n3. Get Event Details...');
      const eventDetails = await fetch(`${API_BASE}/api/events/${eventId}`);
      console.log('✅', await eventDetails.json());

      // Generate QR (will fail without ticket)
      console.log('\n4. Generate QR Code...');
      const qr = await fetch(`${API_BASE}/api/qr/${ticketContract}/1`);
      const qrResult = await qr.json();
      
      if (qr.ok) {
        console.log('✅ QR generated, expires at:', new Date(qrResult.data.expiresAt));
      } else {
        console.log('⚠️  QR failed (expected - no ticket minted):', qrResult.error);
      }

    } else {
      console.log('⚠️  Event creation failed (expected - needs blockchain)');
    }

    // Analytics
    console.log('\n5. Analytics...');
    const analytics = await fetch(`${API_BASE}/api/admin/analytics`);
    console.log('✅', await analytics.json());

    console.log('\n🎉 API tests completed!');
    console.log('📚 Full docs: http://localhost:3001/docs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
