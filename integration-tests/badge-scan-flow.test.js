const { createApiClient } = require('./helpers/server');
const puppeteer = require('puppeteer');
const User = require('../backend-tests/models/User');

describe('Parcours de scan de badge', () => {
  let apiClient;
  let browser;
  let page;
  let testUser;
  let testUserId;
  
  beforeAll(async () => {
    // Initialiser le client API
    apiClient = createApiClient(global.API_URL);
    
    // Du00e9marrer le navigateur pour les tests de frontend
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    
    // Cru00e9er un utilisateur de test avec un ticket gratuit
    testUser = new User({
      pseudo: 'ScanTestUser',
      phoneNumber: '+33612345679',
      tickets: [{
        // Ticket valide par du00e9faut (30 jours)
      }]
    });
    
    await testUser.save();
    testUserId = testUser._id.toString();
  });
  
  afterAll(async () => {
    // Fermer le navigateur
    if (browser) {
      await browser.close();
    }
    
    // Nettoyer la base de donnu00e9es
    await User.deleteMany({});
  });
  
  beforeEach(async () => {
    // Cru00e9er une nouvelle page pour chaque test
    page = await browser.newPage();
    
    // Injecter l'ID utilisateur dans localStorage pour simuler une connexion
    await page.evaluateOnNewDocument((userId) => {
      localStorage.setItem('userId', userId);
      localStorage.setItem('userPseudo', 'ScanTestUser');
    }, testUserId);
    
    // Naviguer vers la page de scan
    await page.goto(`${global.API_URL}/scan-page`, { waitUntil: 'networkidle0' });
  });
  
  afterEach(async () => {
    // Fermer la page apru00e8s chaque test
    await page.close();
  });
  
  it('doit scanner un badge pour une zone de jeu et utiliser un ticket', async () => {
    // Vu00e9rifier que le scanner QR est pru00eat
    await page.waitForSelector('#qrScannerCamera', { timeout: 5000 });
    
    // Simuler un scan de QR code en appelant la fonction JavaScript dans le contexte de la page
    await page.evaluate(() => {
      // Simuler le scan d'un QR code (normalement du00e9clenchu00e9 par la camu00e9ra)
      const scanEvent = new CustomEvent('qrCodeScanned', {
        detail: {
          type: 'QR_CODE',
          data: '1234567890',
          target: 'gameZone',
          zone: 'foot'
        }
      });
      
      document.dispatchEvent(scanEvent);
    });
    
    // Attendre que l'u00e9cran de session de jeu s'affiche
    await page.waitForSelector('#gameSessionScreen', { timeout: 5000 });
    
    // Vu00e9rifier que la zone de jeu est affichu00e9e
    const zoneElement = await page.$('#gameZoneTitle');
    expect(zoneElement).not.toBeNull();
    
    const zoneText = await page.$eval('#gameZoneTitle', el => el.textContent);
    expect(zoneText).toContain('Zone Foot');
    
    // Vu00e9rifier dans le backend que le ticket a u00e9tu00e9 utilisu00e9
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.tickets[0].isUsed).toBe(true);
  });
  
  it('doit scanner un badge pour la zone bar/snack sans utiliser de ticket', async () => {
    // Vu00e9rifier que le scanner QR est pru00eat
    await page.waitForSelector('#qrScannerCamera', { timeout: 5000 });
    
    // Cru00e9er un nouvel utilisateur avec un ticket non utilisu00e9
    const barZoneUser = new User({
      pseudo: 'BarZoneUser',
      phoneNumber: '+33612345680',
      tickets: [{
        // Ticket valide par du00e9faut (30 jours)
      }]
    });
    
    await barZoneUser.save();
    const barZoneUserId = barZoneUser._id.toString();
    
    // Mettre u00e0 jour l'ID utilisateur dans le localStorage
    await page.evaluate((userId) => {
      localStorage.setItem('userId', userId);
      localStorage.setItem('userPseudo', 'BarZoneUser');
    }, barZoneUserId);
    
    // Recharger la page pour prendre en compte le nouvel utilisateur
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Simuler un scan de QR code pour la zone bar/snack
    await page.evaluate(() => {
      const scanEvent = new CustomEvent('qrCodeScanned', {
        detail: {
          type: 'QR_CODE',
          data: '0987654321',
          target: 'barZone'
        }
      });
      
      document.dispatchEvent(scanEvent);
    });
    
    // Attendre que l'u00e9cran de la zone bar s'affiche
    await page.waitForSelector('#barZoneScreen', { timeout: 5000 });
    
    // Vu00e9rifier que le message de bienvenue est affichu00e9
    const welcomeElement = await page.$('#barZoneWelcome');
    expect(welcomeElement).not.toBeNull();
    
    const welcomeText = await page.$eval('#barZoneWelcome', el => el.textContent);
    expect(welcomeText).toContain('Bienvenue dans la zone Bar/Snack');
    
    // Vu00e9rifier dans le backend que le ticket n'a PAS u00e9tu00e9 utilisu00e9
    const updatedUser = await User.findById(barZoneUserId);
    expect(updatedUser.tickets[0].isUsed).toBe(false);
  });
});
