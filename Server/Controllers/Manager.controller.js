import { Manager } from "../Models/Manager.Model.js";
import { ValidateUser } from "../utils/validation.js";
import { sendTokenManager, TryCatch } from "../utils/features.js";
import { ParkingLot } from "../Models/ParkingLot.Model.js";
import {ErrorHandler} from "../utils/Utility.js"
import { compare } from "bcrypt";
import { cookieOptions } from "../utils/features.js";
import {Slot} from "../Models/Slot.Model.js"
import moment from "moment";
import { User } from "../Models/User.Model.js";

const Register=TryCatch (async (req,res,next)=>{
    console.log("recieved");
      const {name,address,contactnumber,email,dob,username,password,city,location}=req.body;
  
      const fields = {
          name,
          address,
          contactnumber,
          email,
          dob,
          username,
          password,
          city,
          location
        };
  
          for(let key in fields){
          const value=fields[key];
          const result=ValidateUser(value,key);
          // console.log(result);
          if(result?.valid==false){
              // console.log(result)
              return next(new ErrorHandler(result.message,404));
          }
        }

        const parkinglot=await ParkingLot.findOne({city,location});
        // console.log(parkinglot);
        if(!parkinglot){
          return next(new ErrorHandler("No parking lot found for given city and location"))
        }
        fields.parkinglot=parkinglot;
        const manager=await Manager.create(fields);

  
  
      return res.status(200).json({
          success:true,
          message:"RegAuthority Created Succesfully"
      })
  })

  const login=TryCatch (async (req,res,next)=>{
    // console.log(req.manager);
    const {username,password,city,location}=req.body;
    // console.log(username,password,city,location);
    if(!username || username.trim()=="" ){
      return next(new ErrorHandler("username can not be empty",400));
    }
    if(!password || password.trim()==""){
      return next(new ErrorHandler("password can not be empty",400));
    }
    if(!city || city.trim()==""){
      return next(new ErrorHandler("city can not be empty",400));
    }
    if(!location || location.trim()==""){
      return next(new ErrorHandler("location can not be empty",400));
    }
  
    const manager=await Manager.findOne({username}).select("+password");
  
    if(!manager){
      return next(new ErrorHandler("Invalid username or password",401));
    }
  
    const isMatch = await compare(password, manager.password);
  
  
    if(!isMatch){
      return next(new ErrorHandler("Invalid username or password",401));
    }

    const lot=await ParkingLot.findById(manager.parkinglot);
    if (lot?.city === city.toString().toLowerCase() && lot?.location === location.toString().toLowerCase())
    sendTokenManager(res,manager,200,`Welcome Back ${manager.name}`)
    else
    return next(new ErrorHandler("No parking lot exist with given location and city"));
  })

  const logout=TryCatch( async (req,res,next)=>{
    console.log(req.user);
  console.log(req.manager);
  console.log(req.authority);
  res.status(200).cookie("ParkingSystemManager","",{...cookieOptions,maxAge:0}).json({
    success:true,
    message :"logout success and cookie also deleted"
})
  
  })

  const getDetails =TryCatch( async(req,res,next)=>{
    const manager=await Manager.findById(req.manager);
    if(!manager){
      return next (new ErrorHandler("No manager found ",404))
    }
    return res.status(200).json({
      success:true,
      manager
    })
  })

  const getManagerParkingLot =TryCatch( async(req,res,next)=>{
    const manager=await Manager.findById(req.manager);
    if(!manager){
      return next (new ErrorHandler("No manager found ",404))
    }
    const lot=await manager.populate("parkinglot");
    if(!lot ){
      return next(new ErrorHandler("No lot found for given manager",400));
    }
    return res.status(200).json({
      success:true,
      lot
    })
  })

  const getParkingLots=TryCatch(async (req,res,next)=>{
    // console.log(req.manager);
    const  manager=await Manager.findById(req.manager);
    const lot =await ParkingLot.find(manager.parkinglot).populate("slots");
    if(!lot){
      return next(new ErrorHandler("No parking lot found",404));

    }
    return res.status(200).json({
      success:true,
      lots:lot[0].slots,
      numberofslots:lot[0].slots.length
    })
  })

  const updateParkingLot = TryCatch(async (req, res, next) => {
    const { available = [], occupied = [],reserved=[] } = req.body;
  
    // Validate input arrays
    if (available.length < 1 && occupied.length < 1 && reserved.length<1) {
      return next(new ErrorHandler("Array can't be empty", 400));
    }
  
    // Find manager and parking lot
    const manager = await Manager.findById(req.manager);
    if (!manager) {
      return next(new ErrorHandler("No Manager found", 404));
    }
    
    const parkinglot = await ParkingLot.findById(manager.parkinglot).populate("slots");
  if (!parkinglot) {
    return next(new ErrorHandler("No Parking Lot found", 404));
  }

  // Update parking lot slots
  const updatedSlots = parkinglot.slots.map((slot) => {
    if (available.includes(slot._id.toString())) {
      return { ...slot.toObject(), status: "available" }; // Convert Mongoose object to plain JS object
    } else if (occupied.includes(slot._id.toString())) {
      return { ...slot.toObject(), status: "occupied" };
    }
   else if (reserved.includes(slot._id.toString())) {
      return { ...slot.toObject(), status: "reserved" };
    }
    return slot.toObject();
  });

  // Save updated slots back to the parking lot
  parkinglot.slots = updatedSlots;
  await parkinglot.save();
  
    await Slot.updateMany(
      { _id: { $in: available } },
      { $set: { status: "available",user:null } }
    );
    
    await Slot.updateMany(
      { _id: { $in: occupied } },
      { $set: { status: "occupied" } }
    );

    await Slot.updateMany({ _id:{$in:reserved}},{$set:{status:"reserved"}});
    
  
    return res.status(200).json({
      success: true,
      message: "Parking lot updated successfully",
    });
  });
  
  const startTimer = TryCatch(async (req, res, next) => {
    const { occupiedSpots } = req.body; // Array of occupied spots (Array of Slot IDs)
    // console.log("startTimer",occupiedSpots);
    // console.log("startTimer",occupiedSpots);
    if ( occupiedSpots.length === 0) {
      return next(new ErrorHandler("no spots provided",400));
    }
  
    // Loop through all occupied spots to start the timer if necessary
    const spotsToUpdate = [];
  
    for (const spotId of occupiedSpots) {
      const spot = await Slot.findById(spotId);
      console.log(spot);
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
    const parkinglot=await Manager.findById(req.manager).populate("parkinglot");

    if(!parkinglot){
      return next (new ErrorHandler("failed to find a manager with given manager id"));
    }

    const slots=parkinglot.parkinglot.slots;

    const response= slots.map(async(ele)=>{
      return  await Slot.findById(ele);
      
    })

    const data =await Promise.all(response);

    const userobj=data.map((ele)=>{
      if(ele.status==="occupied"){
        return {slotid:ele._id,user:ele.user};
      }
    })

    const vNo=userobj.map(async(ele)=>{
      if(ele){
        return {
          ...ele,
          vehicleNo:await User.findById(ele.user)
        }
      }
    })
  
    const vehicleNo=await Promise.all(vNo);
    // console.log(vehicleNo);


    return res.status(200).json({
      success:true,
      data:vehicleNo
    })
  
  })

  

  
  

  export {Register,login,logout,getDetails,getParkingLots,updateParkingLot,startTimer,stopTimerAndCreateBill,getManagerParkingLot,getvehicleno}