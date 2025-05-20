import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";


const getAllProducts = asyncHandler(async (req, res) => {
  try {
        const products = await Product.aggregate([
      {
        $lookup: {
          from: "users", 
          localField: "postedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", 
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
            _id: "$userDetails._id",
            name: "$userDetails.name",
            email: "$userDetails.email",
            phone: "$userDetails.phone",
            location: "$userDetails.location",
          },
        },
      },
    ]);


    res.status(200).json(new ApiResponse(200, "Products fetched successfully", products));
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { getAllProducts };
