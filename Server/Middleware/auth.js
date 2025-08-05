
import {ErrorHandler} from "../utils/Utility.js"
import jwt from "jsonwebtoken"

export const isAuthenticated=(req,_,next)=>{
    const token=  req.cookies["ParkingSystemUser"];
    if(!token){
        return next(new ErrorHandler("Please login to access this route ",401));
    }
    const decodedData=jwt.verify(token ,process.env.JWT_SECRET);
    req.user=decodedData._id;// now after this middlware i can access _id in any middleware after this middleware
    next();
}

export const isAuthority=(req,_,next)=>{
    const token=  req.cookies["ParkingSystemAuthority"];
    // console.log("token",token);
    // console.log("req",req.cookies);
    if(!token){
        return next(new ErrorHandler("Only Registration Authority can access this route",401));
    }
    const secretKey=jwt.verify(token ,process.env.JWT_SECRET);
    req.authority=secretKey._id;
    next();
}

export const isManger=(req,_,next)=>{
    // console.log("inside")
    const token=  req.cookies["ParkingSystemManager"];
    // console.log("token",token)
    if(!token){
        return next(new ErrorHandler("Only Registration manager can access this route",401));
    }
    // console.log("manager is loged in (middleware)")
    const secretKey=jwt.verify(token ,process.env.JWT_SECRET);
    req.manager=secretKey._id;
    next();
}