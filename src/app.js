import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app= express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import UserRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"

//routes declaration

//http://localhost:8000/users/

//routes declaration
app.use("/api/v1/users",UserRouter)
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/products",productRouter)

export { app }

