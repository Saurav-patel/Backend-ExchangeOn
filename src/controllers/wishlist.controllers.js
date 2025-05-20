import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { Favorite } from "../models/favorite.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  
  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  
  const existingWishlistItem = await Favorite.findOne({ user: userId, product: productId });
  if (existingWishlistItem) {
    return res.status(400).json(new ApiResponse(400, {}, "Product is already in your wishlist"));
  }

  
  const favorite = await Favorite.create({
    user: userId,
    product: productId,
  });

  return res.status(201).json(new ApiResponse(201, favorite, "Product added to wishlist"));
});


const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  
  const favorite = await Favorite.findOneAndDelete({ user: userId, product: productId });
  if (!favorite) {
    throw new apiError(404, "Product not found in your wishlist");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Product removed from wishlist"));
});

export { addToWishlist, removeFromWishlist };
