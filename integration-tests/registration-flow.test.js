const { createApiClient } = require('./helpers/server');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

// Cette suite de tests simule un parcours complet d'inscription
// du frontend jusqu'au backend
describe('Parcours d\'inscription', () => {
  let apiClient;
  let browser;
  let page;
  
  beforeAll(async () => {
    // Initialiser le client API
    apiClient = createApiClient(global.API_URL);
    
    // Du00e9marrer le navigateur pour les tests de frontend
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
  });
  
  afterAll(async () => {
    // Fermer le navigateur
    if (browser) {
      await browser.close();
    }
  });
  
  beforeEach(async () => {
    // Cru00e9er une nouvelle page pour chaque test
    page = await browser.newPage();
    await page.goto(`${global.API_URL}/register-page`, { waitUntil: 'networkidle0' });
  });
  
  afterEach(async () => {
    // Fermer la page apru00e8s chaque test
    await page.close();
  });
  
  it('doit inscrire un utilisateur depuis le frontend et vu00e9rifier le ticket dans le backend', async () => {
    // Simulation des interactions utilisateur sur le frontend
    await page.type('#pseudoInput', 'PlayerOne');
    await page.type('#phoneInput', '+33612345678');
    await page.click('#submitButton');
    
    // Attendre que la redirection vers le dashboard soit effectuu00e9e
    await page.waitForSelector('#dashboardScreen', { timeout: 5000 });
    
    // Vu00e9rifier que le ticket gratuit est affichu00e9 sur le frontend
    const ticketElement = await page.$('#freeTicketBadge');
    expect(ticketElement).not.toBeNull();
    
    const ticketText = await page.$eval('#freeTicketBadge', el => el.textContent);
    expect(ticketText).toContain('1 partie gratuite');
    
    // Obtenir l'ID utilisateur depuis le frontend (peut u00eatre stocku00e9 dans un data-attribute ou localStorage)
    const userId = await page.evaluate(() => {
      return localStorage.getItem('userId');
    });
    
    expect(userId).toBeDefined();
    
    // Vu00e9rifier dans le backend que l'utilisateur existe avec le bon ticket
    const { scores } = await apiClient.getScores(userId);
    
    // Vu00e9rifier que l'utilisateur existe dans la base de donnu00e9es
    expect(scores).toBeDefined();
    
    // Ru00e9cupu00e9rer les donnu00e9es complu00e8tes de l'utilisateur (dans une implu00e9mentation ru00e9elle nous aurions un endpoint du00e9diu00e9)
    const response = await fetch(`${global.API_URL}/users/${userId}`);
    const userData = await response.json();
    
    // Vu00e9rifier que l'utilisateur a bien un ticket gratuit
    expect(userData.tickets.length).toBe(1);
    expect(userData.tickets[0].isUsed).toBe(false);
    
    // Vu00e9rifier l'expiration du ticket (30 jours)
    const issueDate = new Date(userData.tickets[0].issueDate);
    const expiryDate = new Date(userData.tickets[0].expiryDate);
    const daysDifference = Math.floor((expiryDate - issueDate) / (1000 * 60 * 60 * 24));
    expect(daysDifference).toBe(30);
  });
});
