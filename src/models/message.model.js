//const mongoose = require('mongoose');
import mongoose from "mongoose";
import { User } from "./user.model.js"
const {Schema}=mongoose
const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Message = mongoose.model('Message', messageSchema);
