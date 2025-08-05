import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { ParkingLot } from "./ParkingLot.Model.js";

const Schema = mongoose.Schema;

// Define the RegAuthority Schema
const managerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  contactnumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Basic validation for a 10-digit contact number
      },
      message: props => `${props.value} is not a valid contact number!`
    }
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    lowercase: true,
    match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, 'Please fill a valid email address'],
  },
  dob: {
    type: Date,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure username is unique
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  password: {
    type: String,
    required: true,
    minlength: [3, 'Password must be at least 3 characters long'],
    select:false
  },
  parkinglot:{
    type:mongoose.Schema.Types.ObjectId,
    ref:ParkingLot,
    required:true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});


managerSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Create the Mongoose model
export const Manager = mongoose.model('manager', managerSchema);

