// models/favorite.model.js
//const mongoose = require('mongoose');
import mongoose from "mongoose";
import { Schema } from "mongoose";
const favoriteSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
},
  product: { 
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true 
},
});

export const Favorite = mongoose.model('Favorite', favoriteSchema);
