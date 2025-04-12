import { device, element, by, waitFor } from 'detox';
import { mockApiService } from './mocks/apiMock';
import mockCamera from './mocks/react-native-camera.mock';

describe('Badge Scanning Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Log in as a test user
    await element(by.id('testLoginButton')).tap();
    // Navigate to the scan screen
    await element(by.id('scanTabButton')).tap();
  });

  it('should show camera for scanning QR codes', async () => {
    await expect(element(by.id('qrScannerCamera'))).toBeVisible();
    await expect(element(by.id('scanInstructions'))).toBeVisible();
  });

  it('should process valid QR code scan for game zone', async () => {
    // Mock the API response for scanning a badge
    mockApiService.scanBadge.mockResolvedValueOnce({
      message: 'Game session started',
      gameZone: 'foot',
      sessionId: 'mock-session-id'
    });
    
    // Simulate a QR code scan
    const validQRData = {
      type: 'QR_CODE',
      data: '1234567890',
      target: 'gameZone',
      zone: 'foot'
    };
    
    // Trigger the mock barcode scanner
    mockCamera.mockBarCodeScanned(validQRData);
    
    // Wait for the game session screen to appear
    await waitFor(element(by.id('gameSessionScreen'))).toBeVisible().withTimeout(2000);
    
    // Verify game zone is displayed
    await expect(element(by.id('gameZoneTitle'))).toBeVisible();
    await expect(element(by.text('Zone Foot'))).toBeVisible();
  });

  it('should process valid QR code scan for bar/snack zone', async () => {
    // Mock the API response for scanning a badge for bar zone
    mockApiService.scanBadge.mockResolvedValueOnce({
      message: 'Access granted to bar/snack zone'
    });
    
    // Simulate a QR code scan
    const validQRData = {
      type: 'QR_CODE',
      data: '0987654321',
      target: 'barZone'
    };
    
    // Trigger the mock barcode scanner
    mockCamera.mockBarCodeScanned(validQRData);
    
    // Wait for the bar zone screen to appear
    await waitFor(element(by.id('barZoneScreen'))).toBeVisible().withTimeout(2000);
    
    // Verify bar zone welcome message is displayed
    await expect(element(by.text('Bienvenue dans la zone Bar/Snack'))).toBeVisible();
  });

  it('should show error for invalid QR code', async () => {
    // Mock the API rejection for invalid badge
    mockApiService.scanBadge.mockRejectedValueOnce(new Error('Invalid badge code'));
    
    // Simulate an invalid QR code scan
    const invalidQRData = {
      type: 'QR_CODE',
      data: '12345', // Too short
      target: 'gameZone',
      zone: 'foot'
    };
    
    // Trigger the mock barcode scanner
    mockCamera.mockBarCodeScanned(invalidQRData);
    
    // Wait for the error message to appear
    await waitFor(element(by.id('errorMessage'))).toBeVisible().withTimeout(2000);
    
    // Verify error message
    await expect(element(by.text('Code QR invalide'))).toBeVisible();
  });

  it('should show error when no valid ticket is available', async () => {
    // Mock the API rejection for no valid ticket
    mockApiService.scanBadge.mockRejectedValueOnce(new Error('No valid ticket available'));
    
    // Simulate a QR code scan
    const validQRData = {
      type: 'QR_CODE',
      data: '1234567890',
      target: 'gameZone',
      zone: 'foot'
    };
    
    // Trigger the mock barcode scanner
    mockCamera.mockBarCodeScanned(validQRData);
    
    // Wait for the error message to appear
    await waitFor(element(by.id('errorMessage'))).toBeVisible().withTimeout(2000);
    
    // Verify error message
    await expect(element(by.text('Aucun ticket valide disponible'))).toBeVisible();
  });
});
