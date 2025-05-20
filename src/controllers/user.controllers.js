import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/fileupcloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Product } from "../models/product.model.js";
import { Favorite } from "../models/wishlist.model.js";
//import {userSchema} from "../models/user.model.js"
import bcrypt from "bcrypt"
import mongoose from "mongoose";
const generateAccessandRefreshToken = async (userId) => {
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User  not found");
        }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update the user's refresh token
        user.refreshToken = refreshToken; // Update the instance, not the model
        await user.save({ validateBeforeSave: false }); // Save the user instance

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens");
    }
};
const registerUser=asyncHandler(async(req,res)=>{
console.log(req.files)

  
    const {name,email,password,phone,location}=req.body
    
    //console.log(req.files)
    console.log(req.body)  
    // if(fullname===""){
    //     throw new apiError(400,"fullname is required")
    // }  
                           //OR
    if(
        [name,email,phone,password].some((field)=>
            field?.trim()==="")

        ){
            throw new apiError(400,"All fields are required")
        }
        const existedUser=await User.findOne({
            $or:[{ name },{ email }]
        })
        if(existedUser){
            throw new apiError(409,"User already exists")
        }
        const profileImageLocalPath=req.files?.profileImage?.[0]?.path
        // const coverImageLocalPath=req.files?.coverImage?.[0]?.path

        //  if(!avatarLocalPath){
        //      throw new apiError(400,"avatar file is required")
        //  }
        //  const avatar=avatarLocalPath? await uploadOnCloudinary(avatarLocalPath):null
        //  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
        //  if(!avatar){
        //      throw new apiError(400,"avatar is required")
        //  }
          const user=await User.create({
            name,
            email,
            password,
            phone,
            location,
            profileImage:profileImageLocalPath||null
            
        })
        const createdUser=await User.findById(user._id)//mongodb default generate _id for users,
        //to check user is created or not we used above line
        .select(
            "-password -refreshToken"
        )
        if(!createdUser){
            throw new apiError(500,"something went wrong")
        }
        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered successfully")
        )
    })

    const loginUser=asyncHandler(async(req,res)=>{
       //req.body->data
       //validate username or email
       //find the user
       //check password
       //generate tokens
       
       
        const{name,email,password}=req.body
        //console.log(password)
        
        if(!name){
            throw new apiError(400,"username  is not valid")
        }
        const user=await User.findOne({name})

        if(!user){
            throw new apiError(404,"Username does not exist")
        }
        //const isPasswordValid=await user.isPasswordCorrect(password)
        
        const isPasswordValid=await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            throw new apiError(401,"Invalid Password")
        }
        const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id)

        const loggedInUser=await User.findById(user._id).select("-password,-refreshToken")
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,{
                    user:loggedInUser,accessToken,
                    refreshToken
                },
                "User loggedIn Successfully",
                res.cookie()
            )
        )
    })
    
    const logOutUser=asyncHandler(async(req,res)=>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset:{
                    refreshToken:1    //this removes the field from document
                }
            },{
                new:true
            }
        )
        const options={
            httpOnly:true,
            secure:true
        }
        
        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"user loggedOut"))

        
    })
    
        const refreshAccessToken=asyncHandler(async(req,res)=>{
        const incomingRefreshToken=    req.cookies.refreshToken || req.body.refreshToken
        //console.log(incomingRefreshToken)
            if(!incomingRefreshToken){
                throw new apiError(401,"Unauthorized request")
            }
            const decodedToken=jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
            const user=await User.findById(decodedToken?._id)
            if(!user){
                throw new apiError(401,"invalid refreh token")
            }
            if(incomingRefreshToken!==user?.refreshToken){
                throw new apiError(401,"refresh token is expired or used")
            }
            const options={
                httpOnly:true,
                secure:true
            }
           const {accessToken,newrefreshToken}= await generateAccessandRefreshToken(user._id)
            return res.status(200)
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newrefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken,refreshToken:newrefreshToken},
                    "Access token refreshed"
                )
            )
        })



    const changeCurrentPassword=asyncHandler(async(req,res)=>{
        const {oldPassword,newPassword}=req.body
        const user=await User.findById(req.user?._id)
        const isPasswordCorrect=await bcrypt.compare(oldPassword,user.password)
        if(!isPasswordCorrect){
            throw new apiError(400,"invalid user password")
        }
        user.password=newPassword
        await user.save({validateBeforeSave:false})
        return res.status(200)
        .json(new ApiResponse(200,{},"password changed successfully"))
    })

    const getCurrentUser=asyncHandler(async(req,res)=>{
        return res.status(200)
        .json(new ApiResponse(200,req.user,"current user fetched successfully"))
    })
    const updateAccountDetails=asyncHandler(async(req,res)=>{
        const{email,name}=req.body
        if(!name||!email){
            throw new apiError(400,"all fields are required")
        }
        const user=await User.findByIdAndUpdate(
            req.user?._id,
        {
            $set:{
                name:name,
                email:email
            }
        },
         {new:true}).select("-password")
         return res.status(200)
         .json(new ApiResponse(200,user,"account details updated successfully"))
    })

    // controllers/product.controller.js (or in your route file)


const getUserProducts = async (req, res) => {
  try {
    const name = req.params.name;

    const products = await Product.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(name),
        },
      },
      {
        $lookup: {
          from: 'users', // MongoDB collection name
          localField: 'postedBy',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          condition: 1,
          images: 1,
          location: 1,
          createdAt: 1,
          isSold: 1,
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            phone: '$userDetails.phone',
            location: '$userDetails.location',
          },
        },
      },
    ]);

    res.status(200).
    json( new ApiResponse(200,"data fetched successfully",  products) );
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
const wishlistProducts = asyncHandler(async(req,res)=>{
    const name=req.params.name
    const wishlistData=await Favorite.aggregate([
        //const name=req.params.name
        
            { $match: 
                { user: new mongoose.Types.ObjectId(name) }
             },
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'productDetails',
              },
            },
            { $unwind: '$productDetails' 
        
            },
            {
              $lookup: {
                from: 'users',
                localField: 'productDetails.postedBy',
                foreignField: '_id',
                as: 'productPoster',
              },
            },
            { $unwind: '$productPoster'
        
             },
            {
              $project: {
                _id: '$productDetails._id',
                title: '$productDetails.title',
                description: '$productDetails.description',
                price: '$productDetails.price',
                category: '$productDetails.category',
                condition: '$productDetails.condition',
                images: '$productDetails.images',
                location: '$productDetails.location',
                createdAt: '$productDetails.createdAt',
                isSold: '$productDetails.isSold',
                postedBy: {
                  _id: '$productPoster._id',
                  name: '$productPoster.name',
                  email: '$productPoster.email',
                  phone: '$productPoster.phone',
                  location: '$productPoster.location',
                },
              },
            },
          ]);
    


    
  if(!wishlistData){
    throw new apiError(400,"error",error)
  }
  
  
  
   res.status(200).json({
    success: true,

    wishlistProducts:wishlistData,
  });

})


    
    
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserProducts,
    wishlistProducts,
   
       updateAccountDetails
}