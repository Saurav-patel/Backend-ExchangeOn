 import multer from "multer";
 import { app } from "../app.js";
 const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, './public/uploads')
     },
     filename: function (req, file, cb) {
      //to make file name as your wish
      //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
       cb(null, file.originalname)
     }//NOTE:cb i.e callback
   })
  
 export  const upload = multer({ 
     storage,
  })