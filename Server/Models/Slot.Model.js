import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Slot Schema
const slotSchema = new Schema({
  status: {
    type: String,
    enum: ['reserved', 'available', 'occupied'], // Slot status options
    required: true,
  },
  parkingLot: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingLot', // Reference to the ParkingLot model
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  timerStart: { // Store the time when the slot was occupied
    type: Date,
    default: null,
  },
  bill: { // Store the calculated bill for the parking spot
    type: Number,
    default: 0,
  },
  price:{
    type:Number,
    default:10   
  }
});

// Create the Mongoose Slot model
export const Slot = mongoose.model('Slot', slotSchema);

