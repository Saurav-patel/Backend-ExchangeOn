// models/product.model.js
//const mongoose = require('mongoose');
import mongoose from "mongoose";
const {Schema}=mongoose
const productSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description should be at least 10 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [1, 'Price must be at least 1'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Others'], 
  },
  condition: {
    type: String,
    enum: ['New', 'Used'],
    required: [true, 'Condition is required'],
  },
  images: {
    type: [String], // Array of image URLs
    required: [true, 'At least one image is required'],
  },
  location: {
    type: String,
    required: [true, 'Product location is required'],
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  
  isSold: {
    type: Boolean,
    default: false, 
  },
});

export const Product = mongoose.model('Product', productSchema);
