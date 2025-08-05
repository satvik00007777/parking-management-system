import express from "express";
import { AddNewParkingLot, DeleteParkingLot, getDetails, getParkingLots, login, logout, Register, updateParkingLot } from "../Controllers/Auth.controller.js";
import { isAuthority } from "../Middleware/auth.js";

const authRouter=express.Router();


authRouter.route("/register").post(Register)
authRouter.route("/login").post(login)

authRouter.use(isAuthority)

authRouter.route("/me").get(getDetails);
authRouter.route("/logout").get(logout);
authRouter.route("/getparkinglots").get(getParkingLots);
authRouter.route("/addparkingslot").post(AddNewParkingLot);
authRouter.route("/editslot").patch(updateParkingLot)
authRouter.route("/deletelot").delete(DeleteParkingLot);



export {authRouter};


