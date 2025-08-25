import mongoose, { Schema } from 'mongoose';


const directMessageSchema = new mongoose.Schema({
    chat_id: {
    type: Schema.Types.ObjectId,
    ref: 'chatSession',
  },

    sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    
  },

  receiver_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  content: {
    type: String,
  },

  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
  },

  fileUrl: {
    type: String,
  },

  fileName: {
    type: String,
  },

  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
  },

}, {
  timestamps: true,
});


export const directMessage = mongoose.model('DirectMessage', directMessageSchema);
