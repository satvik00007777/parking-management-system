import express ,{urlencoded} from "express"
import { errorMiddleware } from "./Middleware/ErrorMiddleware.js";
import { connectdb } from "./utils/features.js";
import cookieParser from "cookie-parser";
import { corsOptions } from "./utils/features.js";
import dotenv from "dotenv";
import cors from "cors"
import {ParkingLot} from "./Models/ParkingLot.Model.js"
import {Slot} from "./Models/Slot.Model.js"
import { userRouter } from "./Routes/User.route.js";
import { authRouter } from "./Routes/Auth.route.js";
import { managerRouter } from "./Routes/Manager.route.js";


dotenv.config({
    path:"./.env"
})

export const AdminKey=process.env.ADMIN_SECRET_KEY

const url=process.env.MONGO_URI ;
connectdb(url);

const app=express();
app.use(express.json());
app.use(urlencoded({extended:false}))
app.use(cookieParser());
app.use(cors(corsOptions));

const port = process.env.PORT || 4000;


//routes
app.use("/user/api/v1",userRouter)
app.use("/auth/api/v1",authRouter)
app.use("/manager/api/v1",managerRouter)


app.route("/").get((req,res)=>{
    console.log("request recived");
    res.send("Welcome");
})


app.use(errorMiddleware)

app.listen(port,(err)=>{
    if(!err){
        console.log(`app started listening on the ${port} `)
    }
    else {
        console.log(`failed to listen on the given ${port} with error ${err}`)
    }
})

