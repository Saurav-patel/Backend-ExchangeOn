import { addToWishlist, removeFromWishlist } from "../controllers/wishlist.controllers.js";
import { Router } from "express";
import { getUserProducts ,wishlistProducts } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllProducts } from "../controllers/product.controllers.js";
const router=Router()
router.use(verifyJWT)
router.route('/get-product').get(verifyJWT,getUserProducts)
router.route('/wishlist').post(verifyJWT,wishlistProducts)
router.delete("/wishlist/:productId", verifyJWT, removeFromWishlist);
router.post("/wishlist", verifyJWT , addToWishlist);
router.get('/products',getAllProducts)
export default router