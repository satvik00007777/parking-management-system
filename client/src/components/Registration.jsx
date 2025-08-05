import "../Styles/Register.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../constants/config";
import { toast } from "react-hot-toast";
import Dialog from "./shared/Dialog";

function Registration() {
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [dialog, setIsDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactnumber: "",
    email: "",
    dob: "",
    vehicleno: "",  // Default to an empty string
    username: "",
    password: "",
    adminkey: "",  // Default to an empty string
    city:"",
    location:""
  });

  // Effect hook to clear form fields based on the selected role
  useEffect(() => {
    // Ensure the form fields are controlled even when they're cleared
    if (role === "user") {
      setFormData((prevData) => ({
        ...prevData,
        vehicleno: "",  // Ensure vehicleno is always an empty string
        adminkey: prevData.adminkey || "", // Ensure adminkey stays as an empty string
      }));
    } else if (role === "Registration authority") {
      setFormData((prevData) => ({
        ...prevData,
        adminkey: "",  // Ensure adminkey is cleared and remains an empty string
        vehicleno: prevData.vehicleno || "", // Ensure vehicleno stays as an empty string
      }));
    }
    else{
      setFormData((prevData) => ({
        ...prevData,
       city:"",
       location:"",
      }));
    }
  }, [role]);

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("form Data", formData);

    if (role === "user") {
      try {
        const response = await axios.post(`${server}/user/api/v1/register`, formData, { withCredentials: true });
        console.log(response);
        navigate("/"); // Redirect after successful registration
        setFormData({
          name: "",
          address: "",
          contactnumber: "",
          email: "",
          dob: "",
          vehicleno: "",
          username: "",
          password: "",
          adminkey: "",
        }); // Reset the form data after success
      } catch (error) {
        console.error("Registration error:", error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);
      }
    } else if(role==="Registration authority") {
      try {
        const response = await axios.post(`${server}/auth/api/v1/register`, formData, { withCredentials: true });
        setMessage(response?.message || "You Registered Successfully");
        navigate("/"); // Redirect after successful registration
        setFormData({
          name: "",
          address: "",
          contactnumber: "",
          email: "",
          dob: "",
          vehicleno: "",
          username: "",
          password: "",
          adminkey: "",
        }); // Reset the form data after success
      } catch (error) {
        console.error("Registration error:", error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);
        setFormData({
          name: "",
          address: "",
          contactnumber: "",
          email: "",
          dob: "",
          vehicleno: "",
          username: "",
          password: "",
          adminkey: "",
        }); // Optionally reset form data on error
      }
    }
    else {
      try {
        const response = await axios.post(`${server}/manager/api/v1/register`, formData, { withCredentials: true });
        console.log(response);
        navigate("/"); // Redirect after successful registration
        setFormData({
          name: "",
          address: "",
          contactnumber: "",
          email: "",
          dob: "",
          vehicleno: "",
          username: "",
          password: "",
          adminkey: "",
          city:"",
          location:""
        }); // Reset the form data after success
      } catch (error) {
        console.error("Registration error:", error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);
      }
    }
  };

  const renderRoleSpecificFields = () => {
    if (role === "user") {
      return (
        <input
          type="text"
          name="vehicleno"
          placeholder="Vehicle Number"
          value={formData.vehicleno}
          onChange={handleInputChange}
          required
        />
      );
    } else if (role === "Registration authority") {
      return (
        <input
          type="text"
          name="adminkey"
          placeholder="AdminKey"
          value={formData.adminkey}
          onChange={handleInputChange}
          required
        />
      );
    }
    else {
      return (
        <>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
        </>
      );
    }
    return null; // Default fallback if no specific role
  };

  return (
    <div>
      <div className="container">
        <h2>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="Registration authority">Registration Authority</option>
        </select>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="contactnumber"
            placeholder="Contact Number"
            value={formData.contactnumber}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          {renderRoleSpecificFields()}
          <button type="submit">Register</button>
        </form>
        <h3>
          Already have an Account? <button onClick={handleLogin}>Login</button>
        </h3>
      </div>
      {dialog && (
        <Dialog
          onClose={() => setIsDialog(false)} // Correctly passing a function reference to close the dialog
          message={message}
          isOpen={dialog}
        />
      )}
    </div>
  );
}

export default Registration;
