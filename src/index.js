import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import express from 'express';
import connectDB from './db/db.js';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/message.model.js'; // Assuming you create this model

dotenv.config({
  path: './.env'
});

// Create HTTP server manually
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Change to frontend origin in production
    methods: ['GET', 'POST']
  }
});

// Store socket logic
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, message } = data;

    try {
      const newMessage = new Message({ senderId, receiverId, message });
      const savedMessage = await newMessage.save();
      io.to(receiverId).emit('receiveMessage', savedMessage);
    } catch (error) {
      console.error('❌ Message save error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`server is running at ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("ERROR",error.message)
})



// import express from "express"
// const app=express()
// (async()=>{
//     try{
//         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR:",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("app is listening on port",process.env.PORT)
//         })
//     }catch(error){
//         console.error("ERROR:",error)
//         throw error
//     }
// })()