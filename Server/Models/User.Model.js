import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,  // trims extra spaces
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      contactnumber: {
        type: String,
        required: true,
        unique: true, 
        validate: {
          validator: function(v) {
            return /\d{10}/.test(v);  // Basic validation for 10-digit contact number
          },
          message: props => `${props.value} is not a valid contact number!`,
        },
      },
      email: {
        type: String,
        required: true,
        unique: true,  // Ensure the email is unique
        lowercase: true,  // Store email in lowercase
        validate: {
          validator: function(v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);  // Simple email regex
          },
          message: props => `${props.value} is not a valid email!`,
        },
      },
      dob: {
        type: Date,
        required: true,
      },
      vehicleno: {
        type: String,
        required: true,
        unique: true,  // Ensure the vehicle number is unique
        lowercase:true,
      },
      username: {
        type: String,
        required: true,
        unique: true,  // Ensure the user ID is unique
      },
      password: {
        type: String,
        required: true,
        select:false  // Minimum password length
      },
},{Timestamp:true})


userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  

  userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
  

export const User=mongoose.model("User",userSchema);