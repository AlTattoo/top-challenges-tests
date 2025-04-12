import { device, element, by, waitFor } from 'detox';
import { mockApiService, mockRankings } from './mocks/apiMock';

describe('Scores and Rankings Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Log in as a test user
    await element(by.id('testLoginButton')).tap();
    // Navigate to the scores screen
    await element(by.id('scoresTabButton')).tap();
  });

  it('should display user\'s latest score', async () => {
    // Mock the API responses
    mockApiService.getScores.mockResolvedValueOnce({
      scores: [
        {
          id: 'score-1',
          gameZone: 'foot',
          score: 120,
          date: new Date().toISOString(),
          location: 'Gonfreville'
        }
      ]
    });
    
    // Wait for scores to load
    await waitFor(element(by.id('latestScoreCard'))).toBeVisible().withTimeout(2000);
    
    // Verify latest score is displayed
    await expect(element(by.id('scoreValue'))).toHaveText('120');
    await expect(element(by.id('gameZoneLabel'))).toHaveText('Zone Foot');
    await expect(element(by.id('locationLabel'))).toHaveText('Gonfreville');
  });

  it('should display local rankings', async () => {
    // Mock the API responses for rankings
    mockApiService.getRankings.mockResolvedValueOnce(mockRankings);
    
    // Select rankings tab
    await element(by.id('rankingsTab')).tap();
    
    // Wait for rankings to load
    await waitFor(element(by.id('localRankingsSection'))).toBeVisible().withTimeout(2000);
    
    // Verify local rankings are displayed
    await expect(element(by.id('localRankingsTitle'))).toHaveText('Top 10 Gonfreville');
    
    // Check that the user appears in the rankings (rank 4)
    const userRankItem = element(by.id('rankItem-4'));
    await expect(userRankItem).toBeVisible();
    await expect(element(by.text('PlayerOne')).withAncestor(userRankItem)).toBeVisible();
    await expect(element(by.text('120')).withAncestor(userRankItem)).toBeVisible();
  });

  it('should display seasonal ranking', async () => {
    // Mock the API responses for rankings
    mockApiService.getRankings.mockResolvedValueOnce(mockRankings);
    
    // Select rankings tab
    await element(by.id('rankingsTab')).tap();
    
    // Select seasonal rankings
    await element(by.id('seasonalRankingsButton')).tap();
    
    // Wait for seasonal rankings to load
    await waitFor(element(by.id('seasonalRankingsSection'))).toBeVisible().withTimeout(2000);
    
    // Verify seasonal ranking is displayed
    await expect(element(by.id('seasonalRankLabel'))).toHaveText('42/1500');
  });

  it('should filter scores by game zone', async () => {
    // Mock the API responses
    mockApiService.getScores.mockResolvedValueOnce({
      scores: [
        {
          id: 'score-1',
          gameZone: 'foot',
          score: 120,
          date: new Date().toISOString(),
          location: 'Gonfreville'
        }
      ]
    });
    
    // Open game zone filter
    await element(by.id('filterButton')).tap();
    await element(by.id('gameZoneFilter')).tap();
    
    // Select foot game zone
    await element(by.id('footZoneOption')).tap();
    
    // Verify filtered scores
    await waitFor(element(by.id('scoresList'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('scoreItem-0'))).toBeVisible();
    await expect(element(by.text('Zone Foot')).withAncestor(by.id('scoreItem-0'))).toBeVisible();
  });

  it('should filter scores by location', async () => {
    // Mock the API responses with filtered data
    mockApiService.getScores.mockResolvedValueOnce({
      scores: [
        {
          id: 'score-1',
          gameZone: 'foot',
          score: 120,
          date: new Date().toISOString(),
          location: 'Gonfreville'
        }
      ]
    });
    
    // Open location filter
    await element(by.id('filterButton')).tap();
    await element(by.id('locationFilter')).tap();
    
    // Select Gonfreville location
    await element(by.id('gonfrevilleOption')).tap();
    
    // Verify filtered scores
    await waitFor(element(by.id('scoresList'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('scoreItem-0'))).toBeVisible();
    await expect(element(by.text('Gonfreville')).withAncestor(by.id('scoreItem-0'))).toBeVisible();
  });
});
