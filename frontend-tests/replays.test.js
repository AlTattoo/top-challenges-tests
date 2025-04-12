import { device, element, by, waitFor } from 'detox';
import { mockApiService } from './mocks/apiMock';

describe('Replays Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Log in as a test user
    await element(by.id('testLoginButton')).tap();
    // Navigate to the replays screen
    await element(by.id('replaysTabButton')).tap();
  });

  it('should display the 5 most recent replays', async () => {
    // Mock the API response for replays
    mockApiService.getReplays.mockResolvedValueOnce({
      replays: [
        {
          id: 'replay-1',
          gameZone: 'foot',
          videoUrl: 'https://example.com/videos/replay1.mp4',
          date: new Date().toISOString(),
          score: 120
        },
        {
          id: 'replay-2',
          gameZone: 'basket',
          videoUrl: 'https://example.com/videos/replay2.mp4',
          date: new Date().toISOString(),
          score: 85
        },
        {
          id: 'replay-3',
          gameZone: 'tir',
          videoUrl: 'https://example.com/videos/replay3.mp4',
          date: new Date().toISOString(),
          score: 95
        },
        {
          id: 'replay-4',
          gameZone: 'petanque',
          videoUrl: 'https://example.com/videos/replay4.mp4',
          date: new Date().toISOString(),
          score: 75
        },
        {
          id: 'replay-5',
          gameZone: 'minigolf',
          videoUrl: 'https://example.com/videos/replay5.mp4',
          date: new Date().toISOString(),
          score: 110
        }
      ]
    });
    
    // Wait for replays to load
    await waitFor(element(by.id('replaysList'))).toBeVisible().withTimeout(2000);
    
    // Verify that 5 replays are shown
    await expect(element(by.id('replayItem-0'))).toBeVisible();
    await expect(element(by.id('replayItem-1'))).toBeVisible();
    await expect(element(by.id('replayItem-2'))).toBeVisible();
    await expect(element(by.id('replayItem-3'))).toBeVisible();
    await expect(element(by.id('replayItem-4'))).toBeVisible();
    
    // Verify first replay details
    await expect(element(by.text('Zone Foot')).withAncestor(by.id('replayItem-0'))).toBeVisible();
    await expect(element(by.text('120 points')).withAncestor(by.id('replayItem-0'))).toBeVisible();
  });

  it('should play a replay video when tapped', async () => {
    // Mock the API response for replays
    mockApiService.getReplays.mockResolvedValueOnce({
      replays: [
        {
          id: 'replay-1',
          gameZone: 'foot',
          videoUrl: 'https://example.com/videos/replay1.mp4',
          date: new Date().toISOString(),
          score: 120
        }
      ]
    });
    
    // Wait for replays to load
    await waitFor(element(by.id('replaysList'))).toBeVisible().withTimeout(2000);
    
    // Tap on the first replay
    await element(by.id('replayItem-0')).tap();
    
    // Verify that video player is shown
    await waitFor(element(by.id('videoPlayer'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('playPauseButton'))).toBeVisible();
  });

  it('should share a replay on social media', async () => {
    // Mock the API responses
    mockApiService.getReplays.mockResolvedValueOnce({
      replays: [
        {
          id: 'replay-1',
          gameZone: 'foot',
          videoUrl: 'https://example.com/videos/replay1.mp4',
          date: new Date().toISOString(),
          score: 120
        }
      ]
    });
    
    mockApiService.shareReplay.mockResolvedValueOnce({
      message: 'Replay shared on facebook',
      shareUrl: 'https://top-challenges.example.com/share/replay-1'
    });
    
    // Wait for replays to load
    await waitFor(element(by.id('replaysList'))).toBeVisible().withTimeout(2000);
    
    // Tap on the share button of the first replay
    await element(by.id('shareButton-0')).tap();
    
    // Verify that share options are shown
    await waitFor(element(by.id('shareOptions'))).toBeVisible().withTimeout(2000);
    
    // Select Facebook sharing
    await element(by.id('facebookShareOption')).tap();
    
    // Verify success message is shown
    await waitFor(element(by.id('shareSuccessMessage'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('Replay partagé sur Facebook avec succès'))).toBeVisible();
  });

  it('should filter replays by game zone', async () => {
    // Mock the API response with filtered data
    mockApiService.getReplays.mockResolvedValueOnce({
      replays: [
        {
          id: 'replay-1',
          gameZone: 'foot',
          videoUrl: 'https://example.com/videos/replay1.mp4',
          date: new Date().toISOString(),
          score: 120
        }
      ]
    });
    
    // Open filter
    await element(by.id('filterButton')).tap();
    
    // Select foot game zone
    await element(by.id('footZoneOption')).tap();
    
    // Verify filtered replays
    await waitFor(element(by.id('replaysList'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('replayItem-0'))).toBeVisible();
    await expect(element(by.text('Zone Foot')).withAncestor(by.id('replayItem-0'))).toBeVisible();
  });
});
