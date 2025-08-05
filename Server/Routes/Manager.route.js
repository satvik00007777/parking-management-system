import express from "express";
import { login, Register,logout, getDetails,getParkingLots,updateParkingLot, startTimer, stopTimerAndCreateBill, getManagerParkingLot, getvehicleno } from "../Controllers/Manager.controller.js";
import { isManger } from "../Middleware/auth.js";
const managerRouter=express.Router();


managerRouter.route("/register").post(Register)
managerRouter.route("/login").post(login)

//now user must login to access the below routes
managerRouter.use(isManger);

managerRouter.route("/me").get(getDetails);
managerRouter.route("/getmanagerparkinglot").get(getManagerParkingLot);
managerRouter.route("/logout").get(logout);
managerRouter.route("/getparkinglots").get(getParkingLots);
managerRouter.route("/updateslots").patch(updateParkingLot)
managerRouter.route("/startTimer").patch(startTimer)
managerRouter.route("/stopTimer").patch(stopTimerAndCreateBill)
managerRouter.route("/getvehicleno").get(getvehicleno);



export {managerRouter};


