import { device, element, by, waitFor } from 'detox';
import { mockApiService } from './mocks/apiMock';

describe('Registration Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to the registration screen
    await element(by.id('welcomeButton')).tap();
  });

  it('should display all registration form elements', async () => {
    // Check all UI elements are present
    await expect(element(by.id('registrationTitle'))).toBeVisible();
    await expect(element(by.id('pseudoInput'))).toBeVisible();
    await expect(element(by.id('phoneInput'))).toBeVisible();
    await expect(element(by.id('profilePictureButton'))).toBeVisible();
    await expect(element(by.id('submitButton'))).toBeVisible();
  });

  it('should show validation errors for invalid inputs', async () => {
    // Try to submit with empty fields
    await element(by.id('submitButton')).tap();
    await expect(element(by.id('pseudoError'))).toBeVisible();
    await expect(element(by.id('phoneError'))).toBeVisible();

    // Enter invalid phone number (too short)
    await element(by.id('pseudoInput')).typeText('PlayerOne');
    await element(by.id('phoneInput')).typeText('1234');
    await element(by.id('submitButton')).tap();
    await expect(element(by.id('phoneError'))).toBeVisible();
  });

  it('should register a new user successfully', async () => {
    // Fill the form with valid data
    await element(by.id('pseudoInput')).typeText('PlayerOne');
    await element(by.id('phoneInput')).typeText('+33612345678');
    
    // Mock the API response
    mockApiService.register.mockResolvedValueOnce({
      user: {
        id: 'mock-user-id',
        pseudo: 'PlayerOne',
        tickets: [{
          id: 'ticket-1',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }]
      }
    });
    
    // Submit the form
    await element(by.id('submitButton')).tap();
    
    // Wait for the dashboard to appear (redirect after successful registration)
    await waitFor(element(by.id('dashboardScreen'))).toBeVisible().withTimeout(2000);
    
    // Check that the user has a free ticket displayed
    await expect(element(by.id('freeTicketBadge'))).toBeVisible();
    await expect(element(by.text('1 partie gratuite'))).toBeVisible();
  });

  it('should allow uploading a profile picture', async () => {
    // Open profile picture selector
    await element(by.id('profilePictureButton')).tap();
    
    // Mock selecting a picture from gallery
    await element(by.id('galleryOption')).tap();
    
    // Verify that profile picture preview is displayed
    await expect(element(by.id('profilePicturePreview'))).toBeVisible();
  });
});
