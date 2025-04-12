const express = require('express');
const app = require('../../backend-tests/mocks/server');

/**
 * Démarre un serveur Express pour les tests d'intégration
 * @param {number} port - Le port sur lequel démarrer le serveur
 * @returns {Promise<http.Server>} - Le serveur HTTP
 */
exports.startServer = (port) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Serveur de test démarré sur le port ${port}`);
      resolve(server);
    });
  });
};

/**
 * Crée un client API pour les tests d'intégration
 * @param {string} baseUrl - L'URL de base de l'API
 * @returns {Object} - Le client API
 */
exports.createApiClient = (baseUrl) => {
  return {
    // Inscription d'un utilisateur
    register: async (userData) => {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return response.json();
    },

    // Scan d'un badge
    scanBadge: async (scanData) => {
      const response = await fetch(`${baseUrl}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData),
      });

      return response.json();
    },

    // Enregistrement d'un score
    recordScore: async (scoreData) => {
      const response = await fetch(`${baseUrl}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      return response.json();
    },

    // Récupération des scores
    getScores: async (userId, params = {}) => {
      const queryParams = new URLSearchParams({
        userId,
        ...params,
      });

      const response = await fetch(`${baseUrl}/scores?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.json();
    },
  };
};
