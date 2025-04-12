const mongoose = require('mongoose');

// User Schema for the application
const userSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  tickets: [{
    type: new mongoose.Schema({
      issueDate: {
        type: Date,
        default: Date.now
      },
      expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      isUsed: {
        type: Boolean,
        default: false
      }
    }, { _id: true })
  }],
  scores: [{
    type: new mongoose.Schema({
      gameZone: {
        type: String,
        required: true,
        enum: ['foot', 'basket', 'tir', 'petanque', 'minigolf']
      },
      score: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      location: {
        type: String,
        required: true
      }
    }, { _id: true })
  }],
  replays: [{
    type: new mongoose.Schema({
      gameZone: {
        type: String,
        required: true
      },
      videoUrl: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        required: true
      }
    }, { _id: true })
  }],
  challenges: [{
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      reward: {
        type: String,
        required: true
      },
      progress: {
        type: Number,
        default: 0
      },
      target: {
        type: Number,
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      expiryDate: {
        type: Date,
        required: true
      }
    }, { _id: true })
  }],
  skins: [{
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: false
      },
      purchaseDate: {
        type: Date,
        default: Date.now
      }
    }, { _id: true })
  }],
  sanctions: [{
    type: new mongoose.Schema({
      reason: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }, { _id: true })
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
