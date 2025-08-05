import express from "express";
import { getDetails, getLocationsForCity, getParkingLot, getParkingLots, getparkingspots, login, logout, Register, startTimer, stopTimerAndCreateBill, updateslots } from "../Controllers/User.controller.js";
import { isAuthenticated } from "../Middleware/auth.js";

const userRouter=express.Router();


userRouter.route("/register").post(Register)
userRouter.route("/login").post(login)
userRouter.route("/getparkinglot").post(getParkingLot);

//now user must login to access the below routes
userRouter.use(isAuthenticated)

userRouter.route("/me").get(getDetails);
userRouter.route("/logout").get(logout);
userRouter.route("/getlots").get(getParkingLots);
userRouter.route("/getlotsforlocation").get(getLocationsForCity);

userRouter.route("/parkingspots").get(getparkingspots);
userRouter.route("/updateslots").patch(updateslots);
userRouter.route("/startTimer").patch(startTimer);
userRouter.route("/stopTimer").patch(stopTimerAndCreateBill);



export { userRouter };


