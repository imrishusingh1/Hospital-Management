const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  },
  iconName: {
    type: String,
    default: 'Stethoscope'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
