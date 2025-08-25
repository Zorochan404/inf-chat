import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  
  avatar: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  },

  emailVerified: {
    type: Boolean,
    default: false,

  },

  role: {
    type: String,
    enum: ['teacher', 'admin', 'student'],
    default: 'student',
  },

  department: {
    type: String,
    
  },

  isActive: {
    type: Boolean,
  },

  studentid: {
    type: String,
    
  },
  year: {
    type: String,
    
  },
  batch: {
    type: String,
    
  },
  semester: {
    type: String,
    
  },
  professorid: {
    type: String
  },
 specialisation: {
    type: [String],
    
  },
  bio: {
    type: String,
    
  },
  officeHours: {
    type: String
  },
  subjects: {
    type: [String],
    
  },
  isOnline: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});


export const User = mongoose.model('User', userSchema);
