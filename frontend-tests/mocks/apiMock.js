// Mock des réponses API pour les tests frontend

export const mockUserData = {
  id: 'mock-user-id',
  pseudo: 'PlayerOne',
  phoneNumber: '+33612345678',
  profilePicture: null,
  tickets: [
    {
      id: 'ticket-1',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isUsed: false
    }
  ],
  scores: [
    {
      id: 'score-1',
      gameZone: 'foot',
      score: 120,
      date: new Date().toISOString(),
      location: 'Gonfreville'
    },
    {
      id: 'score-2',
      gameZone: 'basket',
      score: 85,
      date: new Date().toISOString(),
      location: 'Gonfreville'
    }
  ],
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
  ],
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
  ],
  skins: [
    {
      id: 'skin-1',
      name: 'Cadre néon',
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
  ],
  sanctions: []
};

export const mockRankings = {
  local: [
    { rank: 1, pseudo: 'Champion', score: 150, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 2, pseudo: 'Runner', score: 140, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 3, pseudo: 'BronzeStar', score: 130, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 4, pseudo: 'PlayerOne', score: 120, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 5, pseudo: 'Competitor', score: 110, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 6, pseudo: 'GoodPlayer', score: 100, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 7, pseudo: 'Average', score: 90, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 8, pseudo: 'Beginner', score: 80, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 9, pseudo: 'Rookie', score: 70, location: 'Gonfreville', gameZone: 'foot' },
    { rank: 10, pseudo: 'Newbie', score: 60, location: 'Gonfreville', gameZone: 'foot' }
  ],
  seasonal: [
    { rank: 42, pseudo: 'PlayerOne', score: 120, totalPlayers: 1500 }
  ]
};

// Mock des fonctions API
export const mockApiService = {
  register: jest.fn().mockImplementation((pseudo, phoneNumber) => {
    return Promise.resolve({
      user: {
        ...mockUserData,
        pseudo,
        phoneNumber
      }
    });
  }),
  
  scanBadge: jest.fn().mockImplementation((userId, badgeCode, gameZone) => {
    if (badgeCode.length !== 10) {
      return Promise.reject(new Error('Invalid badge code'));
    }
    
    return Promise.resolve({
      message: gameZone ? 'Game session started' : 'Access granted to bar/snack zone',
      gameZone,
      sessionId: 'mock-session-id'
    });
  }),
  
  getScores: jest.fn().mockImplementation((userId, gameZone, location) => {
    let scores = [...mockUserData.scores];
    
    if (gameZone) {
      scores = scores.filter(score => score.gameZone === gameZone);
    }
    
    if (location) {
      scores = scores.filter(score => score.location === location);
    }
    
    return Promise.resolve({ scores });
  }),
  
  getRankings: jest.fn().mockImplementation((gameZone, location) => {
    return Promise.resolve(mockRankings);
  }),
  
  getReplays: jest.fn().mockImplementation((userId) => {
    return Promise.resolve({ replays: mockUserData.replays });
  }),
  
  getChallenges: jest.fn().mockImplementation((userId) => {
    return Promise.resolve({ challenges: mockUserData.challenges });
  }),
  
  getSkins: jest.fn().mockImplementation(() => {
    return Promise.resolve({ skins: mockUserData.skins });
  }),
  
  purchaseSkin: jest.fn().mockImplementation((userId, skinId) => {
    const skin = mockUserData.skins.find(s => s.id === skinId);
    
    if (!skin) {
      return Promise.reject(new Error('Skin not found'));
    }
    
    return Promise.resolve({
      message: 'Skin purchased successfully',
      skin: {
        ...skin,
        purchaseDate: new Date().toISOString(),
        isActive: true
      }
    });
  }),
  
  shareReplay: jest.fn().mockImplementation((replayId, platform) => {
    return Promise.resolve({
      message: `Replay shared on ${platform}`,
      shareUrl: `https://top-challenges.example.com/share/${replayId}`
    });
  })
};
