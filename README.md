# TOP CHALLENGES - Tests Automatisés

Ce projet contient des tests automatisés pour l'application mobile TOP CHALLENGES, une salle de loisirs connectée où les joueurs s'affrontent dans différentes zones de jeu.

## Structure du projet

```
├── backend-tests/    # Tests pour l'API Node.js/Express
├── frontend-tests/   # Tests pour l'application React Native
└── config/           # Fichiers de configuration des tests
```

## Installation

```bash
npm install
```

## Tests Backend

Les tests backend utilisent Jest et Supertest pour tester les API REST:

```bash
npm run test:backend
```

## Tests Frontend

Les tests frontend utilisent Detox pour tester l'application React Native:

```bash
npm run test:frontend
```

## Fonctionnalités testées

### Backend
- Inscription des joueurs
- Scan de badge QR
- Gestion des scores et classements
- Système de sanctions
- Envoi de notifications

### Frontend
- Écran d'inscription
- Fonctionnalité de scan QR
- Affichage des scores et classements
- Visualisation des replays
- Système de challenges
- Achat de personnalisations
