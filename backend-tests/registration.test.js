const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./mocks/server');
const User = require('./models/User');

describe('Registration API', () => {
  // Clean up database after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });

  it('should register a new user with a free ticket', async () => {
    const userData = {
      pseudo: 'PlayerOne',
      phoneNumber: '+33612345678'
    };

    const response = await request(app)
      .post('/register')
      .send(userData)
      .expect(201);

    // Check the response contains the user data
    expect(response.body.user).toBeDefined();
    expect(response.body.user.pseudo).toBe(userData.pseudo);
    
    // Check that the user has a free ticket
    expect(response.body.user.tickets).toBeDefined();
    expect(response.body.user.tickets.length).toBe(1);
    
    // Verify user was actually created in database
    const user = await User.findOne({ pseudo: userData.pseudo });
    expect(user).toBeDefined();
    expect(user.phoneNumber).toBe(userData.phoneNumber);
    
    // Verify ticket details
    expect(user.tickets.length).toBe(1);
    expect(user.tickets[0].isUsed).toBe(false);
    
    // Check ticket expiration (should be 30 days from now)
    const ticketDate = new Date(user.tickets[0].issueDate);
    const expiryDate = new Date(user.tickets[0].expiryDate);
    const daysDifference = Math.floor((expiryDate - ticketDate) / (1000 * 60 * 60 * 24));
    expect(daysDifference).toBe(30);
  });

  it('should reject registration with missing required fields', async () => {
    // Missing phone number
    const incompleteData1 = {
      pseudo: 'PlayerTwo'
    };

    await request(app)
      .post('/register')
      .send(incompleteData1)
      .expect(400);

    // Missing pseudo
    const incompleteData2 = {
      phoneNumber: '+33612345679'
    };

    await request(app)
      .post('/register')
      .send(incompleteData2)
      .expect(400);
  });

  it('should reject registration with duplicate pseudo or phone number', async () => {
    // First create a user
    const existingUser = {
      pseudo: 'PlayerThree',
      phoneNumber: '+33612345680'
    };

    await request(app)
      .post('/register')
      .send(existingUser)
      .expect(201);

    // Try to register with same pseudo
    const duplicatePseudo = {
      pseudo: 'PlayerThree',
      phoneNumber: '+33612345681'
    };

    await request(app)
      .post('/register')
      .send(duplicatePseudo)
      .expect(409);

    // Try to register with same phone number
    const duplicatePhone = {
      pseudo: 'PlayerFour',
      phoneNumber: '+33612345680'
    };

    await request(app)
      .post('/register')
      .send(duplicatePhone)
      .expect(409);
  });
});
