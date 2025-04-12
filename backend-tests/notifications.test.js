const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./mocks/server');
const User = require('./models/User');

describe('Notifications API', () => {
  let testUser;
  let testUserId;
  
  // Create a test user before all tests
  beforeAll(async () => {
    // Create a test user
    testUser = new User({
      pseudo: 'NotificationTestUser',
      phoneNumber: '+33689012345'
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
  });
  
  // Clean up database after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
  
  it('should send a notification to a user', async () => {
    const notificationData = {
      userId: testUserId,
      message: 'Ton ami a battu ton record !',
      type: 'friend_record'
    };
    
    const response = await request(app)
      .post('/notifications')
      .send(notificationData)
      .expect(200);
    
    // Check response indicates successful notification
    expect(response.body.message).toBe('Notification sent successfully');
    expect(response.body.notification).toBeDefined();
    expect(response.body.notification.userId).toBe(testUserId);
    expect(response.body.notification.message).toBe('Ton ami a battu ton record !');
    expect(response.body.notification.type).toBe('friend_record');
    expect(response.body.notification.sentAt).toBeDefined();
  });
  
  it('should send an expiration notification', async () => {
    const notificationData = {
      userId: testUserId,
      message: 'Ta partie gratuite expire dans 3 jours !',
      type: 'ticket_expiration'
    };
    
    const response = await request(app)
      .post('/notifications')
      .send(notificationData)
      .expect(200);
    
    // Check response indicates successful notification
    expect(response.body.message).toBe('Notification sent successfully');
    expect(response.body.notification.message).toBe('Ta partie gratuite expire dans 3 jours !');
    expect(response.body.notification.type).toBe('ticket_expiration');
  });
  
  it('should reject notifications with missing required fields', async () => {
    // Missing message
    const incompleteNotification1 = {
      userId: testUserId,
      type: 'friend_record'
    };
    
    await request(app)
      .post('/notifications')
      .send(incompleteNotification1)
      .expect(400);
    
    // Missing userId
    const incompleteNotification2 = {
      message: 'Ton ami a battu ton record !',
      type: 'friend_record'
    };
    
    await request(app)
      .post('/notifications')
      .send(incompleteNotification2)
      .expect(400);
    
    // Missing type
    const incompleteNotification3 = {
      userId: testUserId,
      message: 'Ton ami a battu ton record !'
    };
    
    await request(app)
      .post('/notifications')
      .send(incompleteNotification3)
      .expect(400);
  });
  
  it('should reject notifications for non-existent users', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    
    const notificationData = {
      userId: nonExistentUserId.toString(),
      message: 'Ton ami a battu ton record !',
      type: 'friend_record'
    };
    
    await request(app)
      .post('/notifications')
      .send(notificationData)
      .expect(404);
  });
});
