import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const {Schema}=mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\S+@\S+\.\S+$/.test(v); // Simple email regex validation
      },
      message: 'Invalid email format',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // Simple phone number validation
      },
      message: 'Invalid phone number format',
    },
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  profileImage: {
    type: String, // URL of profile image if uploaded (can use Cloudinary)
  },
 
},{timestamps:true});


userSchema.pre("save",async function (next){
    if(this.isModified("password")){
    this.password=await bcrypt.hash(this.password,10)}
    else
    next()
})


userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id, 
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    });
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id, 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    });
};



export const User = mongoose.model('User', userSchema);





