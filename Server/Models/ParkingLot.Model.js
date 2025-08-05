import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the ParkingLot Schema
const parkingLotSchema = new Schema({
  city: {
    type: String,
    required: true,
    lowercase:true,
  },
  location: {
    type: String,
    required: true,
    lowercase:true,
  },
  numberofslots: {
    type: Number,
    required: true,
  },
  price:{
    type:Number,
    required:true,
  },
  slots: [{
    type: Schema.Types.ObjectId,
    ref: 'Slot', // Array of references to the Slot model
  }]
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Create the Mongoose ParkingLot model
export const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);
