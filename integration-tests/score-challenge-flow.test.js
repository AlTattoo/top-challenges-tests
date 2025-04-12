const { createApiClient } = require('./helpers/server');
const puppeteer = require('puppeteer');
const User = require('../backend-tests/models/User');

describe('Parcours d\'enregistrement de score et impact sur les challenges', () => {
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
    
    // Cru00e9er un utilisateur de test avec un challenge
    testUser = new User({
      pseudo: 'ScoreTestUser',
      phoneNumber: '+33612345681',
      challenges: [{
        title: '100 points en zone foot',
        description: 'Atteindre 100 points en zone foot',
        reward: '1 gaufre gratuite',
        progress: 0,
        target: 100,
        completed: false,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
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
      localStorage.setItem('userPseudo', 'ScoreTestUser');
    }, testUserId);
  });
  
  afterEach(async () => {
    // Fermer la page apru00e8s chaque test
    await page.close();
  });
  
  it('doit enregistrer un score depuis le frontend et mettre u00e0 jour la progression du challenge', async () => {
    // Simuler une partie terminu00e9e avec un score
    // Dans une vraie application, cela serait du00e9clenchu00e9 automatiquement par le jeu
    
    // Naviguer vers la page de ru00e9sultat de jeu
    await page.goto(`${global.API_URL}/game-result`, { waitUntil: 'networkidle0' });
    
    // Vu00e9rifier que la page de ru00e9sultat s'affiche
    await page.waitForSelector('#gameResultScreen', { timeout: 5000 });
    
    // Le score est normalement du00e9fini par le jeu, mais nous le simulons ici
    await page.evaluate(() => {
      // Donne l'impression que ces valeurs viennent du jeu
      document.getElementById('scoreValue').textContent = '80';
      document.getElementById('gameZoneInput').value = 'foot';
      document.getElementById('locationInput').value = 'Gonfreville';
    });
    
    // Soumettre le score
    await page.click('#submitScoreButton');
    
    // Attendre que le score soit enregistru00e9 et que la page se mette u00e0 jour
    await page.waitForSelector('#scoreRegisteredSuccess', { timeout: 5000 });
    
    // Vu00e9rifier que le message de succu00e8s s'affiche
    const successElement = await page.$('#scoreRegisteredSuccess');
    expect(successElement).not.toBeNull();
    
    // Vu00e9rifier dans le backend que le score a u00e9tu00e9 enregistru00e9
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.scores.length).toBe(1);
    expect(updatedUser.scores[0].score).toBe(80);
    expect(updatedUser.scores[0].gameZone).toBe('foot');
    
    // Vu00e9rifier que le challenge a u00e9tu00e9 mis u00e0 jour
    expect(updatedUser.challenges[0].progress).toBe(80);
    expect(updatedUser.challenges[0].completed).toBe(false);
    
    // Naviguer vers la page des challenges pour vu00e9rifier que le front-end affiche correctement la progression
    await page.goto(`${global.API_URL}/challenges`, { waitUntil: 'networkidle0' });
    
    // Vu00e9rifier que la page des challenges s'affiche
    await page.waitForSelector('#challengesList', { timeout: 5000 });
    
    // Vu00e9rifier que la barre de progression affiche 80/100
    const progressText = await page.$eval('#progressText-0', el => el.textContent);
    expect(progressText).toContain('80/100');
  });
  
  it('doit compu00e9ter un challenge quand le score atteint la cible', async () => {
    // Naviguer vers la page de ru00e9sultat de jeu
    await page.goto(`${global.API_URL}/game-result`, { waitUntil: 'networkidle0' });
    
    // Vu00e9rifier que la page de ru00e9sultat s'affiche
    await page.waitForSelector('#gameResultScreen', { timeout: 5000 });
    
    // Simuler un score qui compu00e8tera le challenge (80 + 30 = 110 > 100)
    await page.evaluate(() => {
      document.getElementById('scoreValue').textContent = '30';
      document.getElementById('gameZoneInput').value = 'foot';
      document.getElementById('locationInput').value = 'Gonfreville';
    });
    
    // Soumettre le score
    await page.click('#submitScoreButton');
    
    // Attendre que le score soit enregistru00e9 et que la page se mette u00e0 jour
    await page.waitForSelector('#scoreRegisteredSuccess', { timeout: 5000 });
    
    // Attendre que l'alerte de challenge compu00e9tu00e9 s'affiche
    await page.waitForSelector('#challengeCompletedAlert', { timeout: 5000 });
    
    // Vu00e9rifier que l'alerte contient le bon message
    const alertText = await page.$eval('#challengeCompletedAlert', el => el.textContent);
    expect(alertText).toContain('Challenge compu00e9tu00e9 !');
    expect(alertText).toContain('100 points en zone foot');
    
    // Vu00e9rifier dans le backend que le challenge est marqu00e9 comme compu00e9tu00e9
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.challenges[0].progress).toBeGreaterThanOrEqual(100);
    expect(updatedUser.challenges[0].completed).toBe(true);
    
    // Naviguer vers la page des challenges pour vu00e9rifier que le front-end affiche correctement le challenge compu00e9tu00e9
    await page.goto(`${global.API_URL}/challenges`, { waitUntil: 'networkidle0' });
    
    // Vu00e9rifier que la page des challenges s'affiche
    await page.waitForSelector('#challengesList', { timeout: 5000 });
    
    // Vu00e9rifier que le badge "Compu00e9tu00e9" est affichu00e9
    const completedBadge = await page.$('#completedBadge');
    expect(completedBadge).not.toBeNull();
    
    // Vu00e9rifier que le bouton pour ru00e9clamer la ru00e9compense est disponible
    const claimButton = await page.$('#claimRewardButton');
    expect(claimButton).not.toBeNull();
  });
});
