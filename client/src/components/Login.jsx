import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../Styles/Login.css';
import axios from "axios";
import { server } from "../constants/config";
import Dialog from "./shared/Dialog";  // Assuming Dialog is located in the shared folder

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [Adminkey,setAdminKey]=useState("");
  const [city,setcity]=useState("");
  const [location,setlocation]=useState("");
  const [dialog, setIsDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("user");

  const navigate = useNavigate();


  const HandleRegister = () => {
    navigate("/register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = {
      username,
      password,
    };
    setPassword("");
    setUsername("");
    setAdminKey("");
    setcity("");
    setlocation("");

    if(role=="user"){
      try {
        const res = await axios.post(`${server}/user/api/v1/login`, formData,{withCredentials:true});
        // console.log(res);
        navigate("/user-dashboard");
      } catch (error) {
        console.log(error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);  // Show dialog
      }
    }
    else if(role==="manager"){
      formData.city=city;
      formData.location=location;
      try {
        const res = await axios.post(`${server}/manager/api/v1/login`, formData,{withCredentials:true});
        // console.log(res);
        navigate("/manager-dashboard");
      } catch (error) {
        console.log(error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);  // Show dialog
      }
    }
    else {
      formData.adminkey=Adminkey;
      try {
        const res = await axios.post(`${server}/auth/api/v1/login`, formData,{withCredentials:true});
        // console.log(res);
        navigate("/authority-dashboard");
      } catch (error) {
        console.log(error);
        setMessage(error?.response?.data?.errorMessage || "Something went wrong");
        setIsDialog(true);  // Show dialog
      }
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="user">User</option>
          <option value="manager">manager</option>
          <option value="Registration authority">Registration Authority</option>
        </select>
        <input
          type="text"
          name="username"
          placeholder="UserName"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {role==="manager"  && <input
          type="text"
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setcity(e.target.value)}
          required
        />
}
{
        role==="manager"  && <input
          type="text"
          name="location"
          placeholder="Location"
          value={location}
          onChange={(e) => setlocation(e.target.value)}
          required
        />

        


        }
        {role==="Registration authority"  && <input
          type="text"
          name="adminkey"
          placeholder="AdminKey"
          value={Adminkey}
          onChange={(e) => setAdminKey(e.target.value)}
          required
        />}
        <button type="submit">Login</button>
      </form>
      <h3>Don't have an Account? <button onClick={HandleRegister}>Register</button></h3>

      {/* Dialog component */}
      {dialog && (
        <Dialog
          onClose={() => setIsDialog(false)}  // Correctly passing a function reference
          message={message}
          isOpen={dialog}
        />
      )}
    </div>
  );
}

export default Login;
