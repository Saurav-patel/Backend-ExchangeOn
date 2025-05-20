import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB= async() => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
      //  console.log(`\n CONNECTED!! DB HOST:${connectionInstance.connection.host}`)
        //connectionInstance.host is used to know the right server that opened server is right or it is of someone else server
        console.log("DBCONNECTED")
        console.log("DB CONNECTED ON PORT",process.env.port)
    }//http:??localhost:8000/api/v1/user/register
    catch(error){
        console.log("CONNECTION ERROR",error.message)
        process.exit(1)       
        
    }
}
export default connectDB
