import mongoose from 'mongoose';

const citizenReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['road', 'water', 'power', 'waste', 'other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coords: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2;
      },
      message: 'Coordinates must be [longitude, latitude]'
    }
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: null
  },
  photos: {
    type: [String], // Array of image URLs/paths
    default: []
  },
  photoCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'Citizen'
  }
});

// Update updatedAt on save
citizenReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.photoCount = this.photos.length;
  next();
});

export default mongoose.model('CitizenReport', citizenReportSchema);
