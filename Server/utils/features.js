import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ParkingLot } from "../Models/ParkingLot.Model.js";

export const cookieOptions={
  secure:true,
  httpOnly:true,
  sameSite:"none",
  maxAge:24*60*60*1000
}

export const connectdb = async (uri) => {
    try {
      const data = await mongoose.connect(uri, { dbName: "ParkingSystem" });
      console.log(`Connected to DB: ${data.connection.host}`);
    } catch (err) {
      console.error("Error in connecting to database from utils folder:", err.message);
      throw err;
    }
 }

 export const sendTokenUser=(res,user,code,message)=>{
    const token=jwt.sign({_id:user.id},process.env.JWT_SECRET);
    return res.status(code).cookie("ParkingSystemUser",token,cookieOptions).json({
      success:true,
      token,
      message,
      user
    })
  }
  export const sendTokenAuthority=(res,user,code,message)=>{
    const token=jwt.sign({_id:user.id},process.env.JWT_SECRET);
    return res.status(code).cookie("ParkingSystemAuthority",token,cookieOptions).json({
      success:true,
      token,
      message,
      user
    })
  }
  export const sendTokenManager=(res,user,code,message)=>{
    const token=jwt.sign({_id:user.id},process.env.JWT_SECRET);
    return res.status(code).cookie("ParkingSystemManager",token,cookieOptions).json({
      success:true,
      token,
      message,
      user
    })
  }

export const TryCatch=(passedfunction)=> async(req,res,next)=>{
     try{
      await passedfunction(req,res,next);
     }
     catch(error){
      console.log("error found in the try catch");
      console.log(error);
      next(error);
     }
  }

  export const corsOptions={
    origin:["http://localhost:5173","http://localhost:4173/",process.env.CLIENT_URL],
    credentials:true
  }

  export async function getAllParkingLots() {
    try {
      const parkingLots = await ParkingLot.find().exec(); // Retrieve all documents from ParkingLot collection
      return parkingLots; // This will return an array of objects
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      throw error; // Rethrow the error for further handling if necessary
    }
  }

  export const bill=async(id)=>{

  }