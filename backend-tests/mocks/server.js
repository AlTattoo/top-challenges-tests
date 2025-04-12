const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

// Create Express app
const app = express();
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { pseudo, phoneNumber, profilePicture } = req.body;
    
    // Validate required fields
    if (!pseudo || !phoneNumber) {
      return res.status(400).json({ error: 'Pseudo and phone number are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ pseudo }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this pseudo or phone number already exists' });
    }
    
    // Create new user with a free ticket
    const newUser = new User({
      pseudo,
      phoneNumber,
      profilePicture: profilePicture || null,
      tickets: [{
        // This will automatically create a ticket valid for 30 days
      }]
    });
    
    await newUser.save();
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        pseudo: newUser.pseudo,
        tickets: newUser.tickets
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Scan badge endpoint
app.post('/scan', async (req, res) => {
  try {
    const { userId, badgeCode, gameZone } = req.body;
    
    // Validate required fields
    if (!userId || !badgeCode) {
      return res.status(400).json({ error: 'User ID and badge code are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate QR code (simplified for testing)
    if (badgeCode.length !== 10) {
      return res.status(400).json({ error: 'Invalid badge code' });
    }
    
    // Process game zone entry
    if (gameZone) {
      // Check if user has a valid ticket
      const validTicket = user.tickets.find(ticket => 
        !ticket.isUsed && new Date(ticket.expiryDate) > new Date()
      );
      
      if (!validTicket) {
        return res.status(403).json({ error: 'No valid ticket available' });
      }
      
      // Mark ticket as used
      validTicket.isUsed = true;
      await user.save();
      
      return res.status(200).json({
        message: 'Game session started',
        gameZone,
        sessionId: mongoose.Types.ObjectId()
      });
    }
    
    // Process bar/snack zone entry (no ticket required)
    return res.status(200).json({
      message: 'Access granted to bar/snack zone'
    });
  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Scores endpoints
app.post('/scores', async (req, res) => {
  try {
    const { userId, gameZone, score, location } = req.body;
    
    // Validate required fields
    if (!userId || !gameZone || !score || !location) {
      return res.status(400).json({ error: 'User ID, game zone, score, and location are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add score to user profile
    user.scores.push({
      gameZone,
      score,
      location,
      date: new Date()
    });
    
    await user.save();
    
    // Update challenges progress based on score
    const relevantChallenges = user.challenges.filter(challenge => 
      !challenge.completed && 
      challenge.title.toLowerCase().includes(gameZone.toLowerCase())
    );
    
    for (const challenge of relevantChallenges) {
      challenge.progress += score;
      if (challenge.progress >= challenge.target) {
        challenge.completed = true;
      }
    }
    
    await user.save();
    
    return res.status(201).json({
      message: 'Score recorded successfully',
      newScore: user.scores[user.scores.length - 1],
      updatedChallenges: relevantChallenges
    });
  } catch (error) {
    console.error('Score recording error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/scores', async (req, res) => {
  try {
    const { userId, gameZone, location } = req.query;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Filter scores based on game zone and location if provided
    let filteredScores = [...user.scores];
    if (gameZone) {
      filteredScores = filteredScores.filter(score => score.gameZone === gameZone);
    }
    if (location) {
      filteredScores = filteredScores.filter(score => score.location === location);
    }
    
    // Sort scores by date (newest first)
    filteredScores.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return res.status(200).json({
      scores: filteredScores
    });
  } catch (error) {
    console.error('Score retrieval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sanctions endpoint
app.post('/sanctions', async (req, res) => {
  try {
    const { userId, reason, adminId } = req.body;
    
    // Validate required fields
    if (!userId || !reason || !adminId) {
      return res.status(400).json({ error: 'User ID, reason, and admin ID are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if admin exists
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Add sanction to user profile
    user.sanctions.push({
      reason,
      adminId,
      date: new Date()
    });
    
    await user.save();
    
    return res.status(201).json({
      message: 'Sanction recorded successfully',
      sanction: user.sanctions[user.sanctions.length - 1]
    });
  } catch (error) {
    console.error('Sanction recording error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications endpoint
app.post('/notifications', async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    
    // Validate required fields
    if (!userId || !message || !type) {
      return res.status(400).json({ error: 'User ID, message, and type are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // In a real application, you would send a push notification here
    // For testing purposes, we'll just simulate a successful notification
    
    return res.status(200).json({
      message: 'Notification sent successfully',
      notification: {
        userId,
        message,
        type,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Notification sending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
