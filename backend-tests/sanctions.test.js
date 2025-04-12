const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./mocks/server');
const User = require('./models/User');

describe('Sanctions API', () => {
  let testUser;
  let testUserId;
  let adminUser;
  let adminUserId;
  
  // Create test users before all tests
  beforeAll(async () => {
    // Create a regular test user
    testUser = new User({
      pseudo: 'SanctionTestUser',
      phoneNumber: '+33667890123'
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
    
    // Create an admin user
    adminUser = new User({
      pseudo: 'AdminUser',
      phoneNumber: '+33678901234'
    });
    
    await adminUser.save();
    adminUserId = adminUser._id.toString();
  });
  
  // Clean up database after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
  
  it('should add a sanction to a user', async () => {
    const sanctionData = {
      userId: testUserId,
      reason: 'Comportement inappropriu00e9',
      adminId: adminUserId
    };
    
    const response = await request(app)
      .post('/sanctions')
      .send(sanctionData)
      .expect(201);
    
    // Check response contains the sanction details
    expect(response.body.message).toBe('Sanction recorded successfully');
    expect(response.body.sanction).toBeDefined();
    expect(response.body.sanction.reason).toBe('Comportement inappropriu00e9');
    
    // Check that the sanction was added to the user profile
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.sanctions.length).toBe(1);
    expect(updatedUser.sanctions[0].reason).toBe('Comportement inappropriu00e9');
    expect(updatedUser.sanctions[0].adminId.toString()).toBe(adminUserId);
  });
  
  it('should add multiple sanctions to the same user', async () => {
    const secondSanctionData = {
      userId: testUserId,
      reason: 'Deu00e9gradation de matu00e9riel',
      adminId: adminUserId
    };
    
    await request(app)
      .post('/sanctions')
      .send(secondSanctionData)
      .expect(201);
    
    // Check that the user now has two sanctions
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.sanctions.length).toBe(2);
    
    // Check all sanctions are recorded correctly
    const sanctions = updatedUser.sanctions.map(s => s.reason);
    expect(sanctions).toContain('Comportement inappropriu00e9');
    expect(sanctions).toContain('Deu00e9gradation de matu00e9riel');
  });
  
  it('should reject sanctions with missing required fields', async () => {
    // Missing reason
    const incompleteSanction1 = {
      userId: testUserId,
      adminId: adminUserId
    };
    
    await request(app)
      .post('/sanctions')
      .send(incompleteSanction1)
      .expect(400);
    
    // Missing userId
    const incompleteSanction2 = {
      reason: 'Comportement inappropriu00e9',
      adminId: adminUserId
    };
    
    await request(app)
      .post('/sanctions')
      .send(incompleteSanction2)
      .expect(400);
    
    // Missing adminId
    const incompleteSanction3 = {
      userId: testUserId,
      reason: 'Comportement inappropriu00e9'
    };
    
    await request(app)
      .post('/sanctions')
      .send(incompleteSanction3)
      .expect(400);
  });
  
  it('should reject sanctions for non-existent users', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    
    const sanctionData = {
      userId: nonExistentUserId.toString(),
      reason: 'Comportement inappropriu00e9',
      adminId: adminUserId
    };
    
    await request(app)
      .post('/sanctions')
      .send(sanctionData)
      .expect(404);
  });
});
