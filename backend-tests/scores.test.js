const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./mocks/server');
const User = require('./models/User');

describe('Scores API', () => {
  let testUser;
  let testUserId;
  
  // Create a test user before all tests
  beforeAll(async () => {
    // Create a test user
    testUser = new User({
      pseudo: 'ScoreTestUser',
      phoneNumber: '+33656789012',
      // Add a challenge related to foot zone
      challenges: [{
        title: '100 points en zone foot',
        description: 'Atteindre 100 points en zone foot',
        reward: '1 gaufre gratuite',
        progress: 0,
        target: 100,
        completed: false,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }]
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
  });
  
  // Clean up database after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
  
  it('should record a new score', async () => {
    const scoreData = {
      userId: testUserId,
      gameZone: 'foot',
      score: 80,
      location: 'Gonfreville'
    };
    
    const response = await request(app)
      .post('/scores')
      .send(scoreData)
      .expect(201);
    
    // Check response contains the new score
    expect(response.body.message).toBe('Score recorded successfully');
    expect(response.body.newScore).toBeDefined();
    expect(response.body.newScore.gameZone).toBe('foot');
    expect(response.body.newScore.score).toBe(80);
    expect(response.body.newScore.location).toBe('Gonfreville');
    
    // Check that the score was added to the user profile
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.scores.length).toBe(1);
    expect(updatedUser.scores[0].score).toBe(80);
    
    // Check that the challenge progress was updated
    expect(updatedUser.challenges[0].progress).toBe(80);
    expect(updatedUser.challenges[0].completed).toBe(false);
  });
  
  it('should update challenge progress and mark as completed when target is reached', async () => {
    const scoreData = {
      userId: testUserId,
      gameZone: 'foot',
      score: 40, // This will push the total to 120, exceeding the 100 target
      location: 'Gonfreville'
    };
    
    const response = await request(app)
      .post('/scores')
      .send(scoreData)
      .expect(201);
    
    // Check that the challenge progress was updated and marked as completed
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.challenges[0].progress).toBe(120);
    expect(updatedUser.challenges[0].completed).toBe(true);
  });
  
  it('should retrieve all scores for a user', async () => {
    const response = await request(app)
      .get('/scores')
      .query({ userId: testUserId })
      .expect(200);
    
    // Check that all scores are returned
    expect(response.body.scores).toBeDefined();
    expect(response.body.scores.length).toBe(2);
    
    // Scores should be sorted by date (newest first)
    expect(response.body.scores[0].score).toBe(40);
    expect(response.body.scores[1].score).toBe(80);
  });
  
  it('should filter scores by game zone', async () => {
    // Add a score for a different game zone
    const basketScoreData = {
      userId: testUserId,
      gameZone: 'basket',
      score: 50,
      location: 'Gonfreville'
    };
    
    await request(app)
      .post('/scores')
      .send(basketScoreData)
      .expect(201);
    
    // Now retrieve only foot scores
    const response = await request(app)
      .get('/scores')
      .query({ userId: testUserId, gameZone: 'foot' })
      .expect(200);
    
    // Check that only foot scores are returned
    expect(response.body.scores).toBeDefined();
    expect(response.body.scores.length).toBe(2);
    expect(response.body.scores[0].gameZone).toBe('foot');
    expect(response.body.scores[1].gameZone).toBe('foot');
  });
  
  it('should filter scores by location', async () => {
    // Add a score for a different location
    const differentLocationData = {
      userId: testUserId,
      gameZone: 'foot',
      score: 60,
      location: 'Paris'
    };
    
    await request(app)
      .post('/scores')
      .send(differentLocationData)
      .expect(201);
    
    // Now retrieve only Gonfreville scores
    const response = await request(app)
      .get('/scores')
      .query({ userId: testUserId, location: 'Gonfreville' })
      .expect(200);
    
    // Check that only Gonfreville scores are returned
    expect(response.body.scores).toBeDefined();
    expect(response.body.scores.every(score => score.location === 'Gonfreville')).toBe(true);
  });
});
