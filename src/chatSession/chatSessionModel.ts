import mongoose, { Schema } from 'mongoose';


const chatSessionSchema = new mongoose.Schema({
student_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    
  },

  professor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  last_message_id: {
    type: String,
  },

  unreadCount: {
    type: Number,
  },

  isActive: {
    type: Boolean,
  },

}, {
  timestamps: true,
});


export const chatSession = mongoose.model('chatSession', chatSessionSchema);
