const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./mocks/server');
const User = require('./models/User');

describe('Badge Scanning API', () => {
  let testUser;
  let testUserId;
  
  // Create a test user before all tests
  beforeAll(async () => {
    // Create a test user with a valid ticket
    testUser = new User({
      pseudo: 'ScanTestUser',
      phoneNumber: '+33623456789',
      tickets: [{
        // Default ticket valid for 30 days
      }]
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
  });
  
  // Clean up database after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
  
  it('should successfully scan a badge for game zone entry', async () => {
    const scanData = {
      userId: testUserId,
      badgeCode: '1234567890', // Valid 10-digit code
      gameZone: 'foot'
    };
    
    const response = await request(app)
      .post('/scan')
      .send(scanData)
      .expect(200);
    
    // Check response contains game session details
    expect(response.body.message).toBe('Game session started');
    expect(response.body.gameZone).toBe('foot');
    expect(response.body.sessionId).toBeDefined();
    
    // Check that the ticket was marked as used
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.tickets[0].isUsed).toBe(true);
  });
  
  it('should reject scanning with invalid badge code', async () => {
    const invalidScanData = {
      userId: testUserId,
      badgeCode: '12345', // Invalid - too short
      gameZone: 'basket'
    };
    
    await request(app)
      .post('/scan')
      .send(invalidScanData)
      .expect(400);
  });
  
  it('should reject game zone entry if no valid ticket available', async () => {
    // Create a new user with an expired ticket
    const expiredTicketUser = new User({
      pseudo: 'ExpiredTicketUser',
      phoneNumber: '+33634567890',
      tickets: [{
        issueDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isUsed: false
      }]
    });
    
    await expiredTicketUser.save();
    
    const scanData = {
      userId: expiredTicketUser._id.toString(),
      badgeCode: '1234567890',
      gameZone: 'foot'
    };
    
    await request(app)
      .post('/scan')
      .send(scanData)
      .expect(403); // Forbidden - no valid ticket
  });
  
  it('should allow entry to bar/snack zone without using a ticket', async () => {
    // Create a user with a valid ticket
    const barZoneUser = new User({
      pseudo: 'BarZoneUser',
      phoneNumber: '+33645678901',
      tickets: [{
        // Default ticket valid for 30 days
      }]
    });
    
    await barZoneUser.save();
    
    const scanData = {
      userId: barZoneUser._id.toString(),
      badgeCode: '0987654321',
      // No gameZone specified - indicates bar/snack entry
    };
    
    const response = await request(app)
      .post('/scan')
      .send(scanData)
      .expect(200);
    
    expect(response.body.message).toBe('Access granted to bar/snack zone');
    
    // Verify ticket was not used
    const updatedUser = await User.findById(barZoneUser._id);
    expect(updatedUser.tickets[0].isUsed).toBe(false);
  });
});
