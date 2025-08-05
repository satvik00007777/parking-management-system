import { getAllParkingLots,  sendTokenUser, TryCatch } from "../utils/features.js";
import {ErrorHandler} from "../utils/Utility.js"
import { ValidateUser } from "../utils/validation.js";
import { User } from "../Models/User.Model.js";
import { compare } from "bcrypt";
import { cookieOptions } from "../utils/features.js";
import { ParkingLot } from "../Models/ParkingLot.Model.js";
import { Slot } from "../Models/Slot.Model.js";
import moment from "moment";

const Register=TryCatch (async (req,res,next)=>{
    const {name,address,contactnumber,email,dob,vehicleno,username,password}=req.body;

    const fields = {
        name,
        address,
        contactnumber,
        email,
        dob,
        vehicleno,
        username,
        password
      };

        for(let key in fields){
        const value=fields[key];
        const result=ValidateUser(value,key);
        // console.log(result);
        if(result?.valid==false){
            // console.log(result.message)
            return next(new ErrorHandler(result.message,400));
        }
      }

    const user=await User.create(fields);

    return res.status(200).json({
        success:true,
        message:"User Created Succesfully"
    })
})

const login=TryCatch (async (req,res,next)=>{
  const {username,password}=req.body;
  if(!username || username.trim()==""){
    return next(new ErrorHandler("username can not be empty",400));
  }
  if(!password || password.trim()==""){
    return next(new ErrorHandler("password can not be empty",400));
  }

  const user=await User.findOne({username}).select("+password");

  if(!user){
    return next(new ErrorHandler("Invalid username or password",401));
  }

  // const isMatching=await compare(user.password,password);
  const isMatch = await compare(password, user.password);


  if(!isMatch){
    return next(new ErrorHandler("Invalid username or password",401));
  }

  sendTokenUser(res,user,200,`Welcome Back ${user.name}`)
})


const logout=TryCatch( async (req,res,next)=>{
  console.log(req.user);
  console.log(req.manager);
  console.log(req.authority);
  res.status(200).cookie("ParkingSystemUser","",{...cookieOptions,maxAge:0}).json({
    success:true,
    message :"logout success and cookie also deleted"
})

})

const getDetails =TryCatch( async(req,res,next)=>{

  const user=await User.findById(req.user);
  if(!user){
    return next (new ErrorHandler("No user found ",404))
  }
  return res.status(200).json({
    success:true,
    user
  })
})
//return only unique city names
const getParkingLots=TryCatch(async (req,res,next)=>{
  const parkinglots=await getAllParkingLots();
  // console.log(parkinglots);
  let lots=parkinglots;
  let seenNames = new Set();  
    // console.log(lots);
    lots = lots.filter((lot) => {
      if (seenNames.has(lot.city)) {
        return false;  
      } else {
        seenNames.add(lot.city);
        return true;  // Keep this object
      }
    })
    // console.log(lots);
  return res.status(200).json({
    success:true,
    parkinglots:lots
  })
})

const getParkingLot=TryCatch(async (req,res,next)=>{
  const {id}=req.body;
  if(!id || id.trim()==="")
    return next(new ErrorHandler("No id provided",400));
  const lot=await ParkingLot.findById(id);
  if(!lot){
    return next(new ErrorHandler("No parking lot found",404));
  }
  return res.status(200).json({
    success:true,
    parkinglots:lot
  })
})

const getLocationsForCity= TryCatch(async(req,res,next)=>{
  const {city}=req.query;

  if(!city){
    return next(new ErrorHandler("Please provide city ",404))
  }

  console.log(city);

  const locations=await ParkingLot.find({city});
  console.log(locations);

  if(locations.length<1){
    return next (new ErrorHandler("No city found ",404))
  }

  console.log(locations);
  return res.status(200).json({
    success:true,
    locations
  })
}) 

const getparkingspots=TryCatch(async (req,res,next)=>{
  const {city,location}=req.query;
  console.log(req.query);
  if(!city || !location || city.trim()=="" || location.trim()==""){
    return next(new ErrorHandler("Provide city and location",404));
  }
  const spots=await ParkingLot.find({city,location}).populate("slots");
  if(!spots){
    return next(new ErrorHandler("No spots found for given location",404))
  }
  // console.log(spots[0].slots);
  return res.status(200).json({
    success:true,
    spots:spots[0].slots
  })
})

const updateslots=TryCatch( async (req,res,next)=>{
  let {reserved,occupied,available,id}=req.body;
  reserved=reserved||[];
  occupied=occupied||[];
  available=available||[];
  if(occupied.length<1 && reserved.length<1 && available.length<1){
    return next(new ErrorHandler("Empty Array recieved",404));
  }
  // console.log(reserved,occupied);

  const res1=await Slot.updateMany({_id:{$in:reserved}},{$set:{status:"reserved",user:id}});
  const res2=await Slot.updateMany({_id:{$in:occupied}},{$set:{status:"occupied",user:id}});
  const res3=await Slot.updateMany({_id:{$in:available}},{$set:{status:"available",user:null}});

  return res.status(200).json({
    success:'true',
    message:"All slots updated successfully"
  });
})

const startTimer = TryCatch(async (req, res, next) => {
  // console.log("inside start Timer");
  const { occupiedSpots } = req.body; // Array of occupied spots (Array of Slot IDs)
  console.log(occupiedSpots);
  if ( !Array.isArray(occupiedSpots) && occupiedSpots.length === 0) {
    return next(new ErrorHandler("no spots provided",400));
  }

  // Loop through all occupied spots to start the timer if necessary
  const spotsToUpdate = [];

  for (const spotId of occupiedSpots) {
    const spot = await Slot.findById(spotId);
    // console.log(spot);
    if (!spot) {
      continue; // Skip if spot doesn't exist
    }

    // If the spot is occupied and the timerStart is not set, we need to set it
    if (spot.status==="reserved" && !spot.timerStart) {
      spot.timerStart = new Date(); // Start the timer
      spot.status="occupied";
      await spot.save();
      spotsToUpdate.push(spot);
    }
  }

  // Respond back with the updated spots
  res.status(200).json({
    message: spotsToUpdate.length > 0 
? `${spotsToUpdate.length} spots are now being timed.` // If condition is true
: "You must reserve this spot before occupying", // If condition is false
    updatedSpots: spotsToUpdate
  });
});

// Function to stop the timer and calculate the bill for occupied spots
const stopTimerAndCreateBill = TryCatch(async (req, res, next) => {
  const { availableSpots } = req.body; // Array of available spots (Array of Slot IDs)

  if (!Array.isArray(availableSpots) || availableSpots.length === 0) {
    return next(new ErrorHandler("no spots provided",400));
  }

  const spotsToUpdate = [];

  for (const spotId of availableSpots) {
    const spot = await Slot.findById(spotId);

    if (!spot) {
      continue; // Skip if spot doesn't exist
    }
    console.log(spot);
    // If the spot is available and the timerStart exists, calculate the bill
    if (spot.status === 'occupied' && spot.timerStart) {
      const timeOccupied = moment().diff(moment(spot.timerStart), 'hours', true); // Calculate the hours the spot was occupied
      const ratePerHour = 10; // For example: 10 currency units per hour

      spot.bill = Math.round(timeOccupied * ratePerHour); // Calculate the bill based on time occupied
      spot.timerStart = null; // Reset the timer
      spot.status = 'available'; // Update the status
      await spot.save();
      spotsToUpdate.push(spot);
    }
  }

  // Respond back with the updated spots and their bill details
  res.status(200).json({
    message: `${spotsToUpdate.length} spots have been updated with the final bill.`,
    updatedSpots: spotsToUpdate
  });
});

const getvehicleno=TryCatch( async (req,res,next)=>{
  const {userId}=req.body;
  if(!userId){
    return next (new ErrorHandler("No user Id provided to get vehicle no",400));
  }
  const user=await User.findById(userId);
  if(!user){
    return next(new ErrorHandler("No user found with the given userId",400));
  }
  // console.log(user);

  return res.status(200).json({
    success:true,
    data:user.vehicleno
  })

})

export {Register,login,logout,getDetails,getParkingLots,getLocationsForCity,getparkingspots,updateslots,startTimer,stopTimerAndCreateBill,getParkingLot,getvehicleno}