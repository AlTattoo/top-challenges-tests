import { device, element, by, waitFor } from 'detox';
import { mockApiService } from './mocks/apiMock';

describe('Challenges Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Log in as a test user
    await element(by.id('testLoginButton')).tap();
    // Navigate to the challenges screen
    await element(by.id('challengesTabButton')).tap();
  });

  it('should display active challenges with progress bars', async () => {
    // Mock the API response for challenges
    mockApiService.getChallenges.mockResolvedValueOnce({
      challenges: [
        {
          id: 'challenge-1',
          title: '100 points en zone foot',
          description: 'Atteindre 100 points en zone foot',
          reward: '1 gaufre gratuite',
          progress: 80,
          target: 100,
          completed: false,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'challenge-2',
          title: '50 points en zone basket',
          description: 'Atteindre 50 points en zone basket',
          reward: '1 boisson gratuite',
          progress: 50,
          target: 50,
          completed: true,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
    
    // Wait for challenges to load
    await waitFor(element(by.id('challengesList'))).toBeVisible().withTimeout(2000);
    
    // Verify challenges are displayed
    await expect(element(by.id('challengeItem-0'))).toBeVisible();
    await expect(element(by.id('challengeItem-1'))).toBeVisible();
    
    // Verify first challenge details
    await expect(element(by.text('100 points en zone foot'))).toBeVisible();
    await expect(element(by.id('progressBar-0'))).toBeVisible();
    await expect(element(by.text('80/100'))).toBeVisible();
    await expect(element(by.text('1 gaufre gratuite'))).toBeVisible();
  });

  it('should show completed status for finished challenges', async () => {
    // Mock the API response with a completed challenge
    mockApiService.getChallenges.mockResolvedValueOnce({
      challenges: [
        {
          id: 'challenge-2',
          title: '50 points en zone basket',
          description: 'Atteindre 50 points en zone basket',
          reward: '1 boisson gratuite',
          progress: 50,
          target: 50,
          completed: true,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
    
    // Wait for challenges to load
    await waitFor(element(by.id('challengesList'))).toBeVisible().withTimeout(2000);
    
    // Verify completed challenge has completion indicator
    await expect(element(by.id('completedBadge'))).toBeVisible();
    await expect(element(by.text('Complété'))).toBeVisible();
    
    // Verify reward claim button is available
    await expect(element(by.id('claimRewardButton'))).toBeVisible();
  });

  it('should allow claiming rewards for completed challenges', async () => {
    // Mock the API response with a completed challenge
    mockApiService.getChallenges.mockResolvedValueOnce({
      challenges: [
        {
          id: 'challenge-2',
          title: '50 points en zone basket',
          description: 'Atteindre 50 points en zone basket',
          reward: '1 boisson gratuite',
          progress: 50,
          target: 50,
          completed: true,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
    
    // Wait for challenges to load
    await waitFor(element(by.id('challengesList'))).toBeVisible().withTimeout(2000);
    
    // Tap on the claim reward button
    await element(by.id('claimRewardButton')).tap();
    
    // Verify reward confirmation dialog appears
    await waitFor(element(by.id('rewardConfirmation'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('Félicitations !'))).toBeVisible();
    await expect(element(by.text('1 boisson gratuite'))).toBeVisible();
    
    // Confirm claiming the reward
    await element(by.id('confirmRewardButton')).tap();
    
    // Verify success message
    await waitFor(element(by.id('rewardClaimedMessage'))).toBeVisible().withTimeout(2000);
  });

  it('should show challenge expiration countdown', async () => {
    // Mock the API response with a challenge close to expiration
    const nearExpiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    
    mockApiService.getChallenges.mockResolvedValueOnce({
      challenges: [
        {
          id: 'challenge-1',
          title: '100 points en zone foot',
          description: 'Atteindre 100 points en zone foot',
          reward: '1 gaufre gratuite',
          progress: 80,
          target: 100,
          completed: false,
          expiryDate: nearExpiryDate.toISOString()
        }
      ]
    });
    
    // Wait for challenges to load
    await waitFor(element(by.id('challengesList'))).toBeVisible().withTimeout(2000);
    
    // Verify expiration countdown is shown
    await expect(element(by.id('expiryCountdown'))).toBeVisible();
    await expect(element(by.text('Expire dans: 2 jours'))).toBeVisible();
  });
});
