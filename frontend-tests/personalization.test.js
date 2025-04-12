import { device, element, by, waitFor } from 'detox';
import { mockApiService } from './mocks/apiMock';

describe('Personalization Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Log in as a test user
    await element(by.id('testLoginButton')).tap();
    // Navigate to the profile screen
    await element(by.id('profileTabButton')).tap();
    // Navigate to the personalization section
    await element(by.id('personalizationButton')).tap();
  });

  it('should display available skins for purchase', async () => {
    // Mock the API response for skins
    mockApiService.getSkins.mockResolvedValueOnce({
      skins: [
        {
          id: 'skin-1',
          name: 'Cadre nu00e9on',
          price: 1,
          isActive: false,
          purchaseDate: null
        },
        {
          id: 'skin-2',
          name: 'Cadre or',
          price: 2,
          isActive: false,
          purchaseDate: null
        }
      ]
    });
    
    // Wait for skins to load
    await waitFor(element(by.id('skinsList'))).toBeVisible().withTimeout(2000);
    
    // Verify skins are displayed
    await expect(element(by.id('skinItem-0'))).toBeVisible();
    await expect(element(by.id('skinItem-1'))).toBeVisible();
    
    // Verify first skin details
    await expect(element(by.text('Cadre nu00e9on'))).toBeVisible();
    await expect(element(by.text('1 u20ac'))).toBeVisible();
    await expect(element(by.id('buyButton-0'))).toBeVisible();
  });

  it('should purchase a skin successfully', async () => {
    // Mock the API responses
    mockApiService.getSkins.mockResolvedValueOnce({
      skins: [
        {
          id: 'skin-1',
          name: 'Cadre nu00e9on',
          price: 1,
          isActive: false,
          purchaseDate: null
        }
      ]
    });
    
    mockApiService.purchaseSkin.mockResolvedValueOnce({
      message: 'Skin purchased successfully',
      skin: {
        id: 'skin-1',
        name: 'Cadre nu00e9on',
        price: 1,
        isActive: true,
        purchaseDate: new Date().toISOString()
      }
    });
    
    // Wait for skins to load
    await waitFor(element(by.id('skinsList'))).toBeVisible().withTimeout(2000);
    
    // Tap on the buy button
    await element(by.id('buyButton-0')).tap();
    
    // Verify payment confirmation dialog appears
    await waitFor(element(by.id('paymentConfirmation'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('Confirmer l\'achat'))).toBeVisible();
    await expect(element(by.text('Cadre nu00e9on'))).toBeVisible();
    await expect(element(by.text('1 u20ac'))).toBeVisible();
    
    // Confirm the purchase
    await element(by.id('confirmPurchaseButton')).tap();
    
    // Verify success message
    await waitFor(element(by.id('purchaseSuccessMessage'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('Achat ru00e9ussi !'))).toBeVisible();
    
    // Verify the skin is now marked as purchased
    await waitFor(element(by.id('activeSkinBadge'))).toBeVisible().withTimeout(2000);
  });

  it('should activate a previously purchased skin', async () => {
    // Mock the API response with a purchased but inactive skin
    mockApiService.getSkins.mockResolvedValueOnce({
      skins: [
        {
          id: 'skin-1',
          name: 'Cadre nu00e9on',
          price: 1,
          isActive: false,
          purchaseDate: new Date().toISOString()
        }
      ]
    });
    
    // Wait for skins to load
    await waitFor(element(by.id('skinsList'))).toBeVisible().withTimeout(2000);
    
    // Verify the skin shows as purchased but not active
    await expect(element(by.id('purchasedBadge'))).toBeVisible();
    await expect(element(by.id('activateButton'))).toBeVisible();
    
    // Tap on the activate button
    await element(by.id('activateButton')).tap();
    
    // Verify the skin is now marked as active
    await waitFor(element(by.id('activeSkinBadge'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('Actif'))).toBeVisible();
  });

  it('should show error for failed purchase', async () => {
    // Mock the API responses
    mockApiService.getSkins.mockResolvedValueOnce({
      skins: [
        {
          id: 'skin-1',
          name: 'Cadre nu00e9on',
          price: 1,
          isActive: false,
          purchaseDate: null
        }
      ]
    });
    
    // Mock a failed purchase
    mockApiService.purchaseSkin.mockRejectedValueOnce(new Error('Payment failed'));
    
    // Wait for skins to load
    await waitFor(element(by.id('skinsList'))).toBeVisible().withTimeout(2000);
    
    // Tap on the buy button
    await element(by.id('buyButton-0')).tap();
    
    // Confirm the purchase in the dialog
    await waitFor(element(by.id('paymentConfirmation'))).toBeVisible().withTimeout(2000);
    await element(by.id('confirmPurchaseButton')).tap();
    
    // Verify error message is shown
    await waitFor(element(by.id('purchaseErrorMessage'))).toBeVisible().withTimeout(2000);
    await expect(element(by.text('L\'achat a u00e9chouu00e9. Veuillez ru00e9essayer.'))).toBeVisible();
  });
});
