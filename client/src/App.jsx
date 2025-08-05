import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Registration from "./components/Registration.jsx";
import AuthorityDashboard from "./pages/AuthorityDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import "./Styles/App.css";
import LogoutButton from "./components/shared/Logout.jsx";
// import { Toaster } from "react-hot-toast";
import axios from "axios";
import { server } from "./constants/config.js";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";



function App() {

  const navigate=useNavigate();

  // const [user,setUser]=useState({});

  useEffect(() => {
    const checkUserAuthentication = async () => {
        try {
          const response = await axios.get(`${server}/user/api/v1/me`,{
            withCredentials:true
          });
          // console.log("cheking");
          // console.log(response.status);
          const userRole = response.data.user.vehicleno; // Assuming the role is returned from the server
          
          if (response.status==200) {
            navigate("/user-dashboard");
          }
          return ;
        
        } catch (error) {
          console.error("Token verification failed", error);
          navigate("/"); // If token verification fails, redirect to login page
        }

        try {
          const response = await axios.get(`${server}/auth/api/v1/me`,{
            withCredentials:true
          });
          const userRole = response.data.user; // Assuming the role is returned from the server
          // console.log("auth",response)
          if (userRole) {
            navigate("/authority-dashboard");
            return ;
          }
        
        } catch (error) {
          console.error("Token verification failed", error);
          navigate("/"); // If token verification fails, redirect to login page
        }
        try {
          const response = await axios.get(`${server}/manager/api/v1/me`,{
            withCredentials:true
          });
          // console.log("cheking");
          // console.log(response.status);
          
          if (response.status==200) {
            navigate("/manager-dashboard");
          }
          return ;
        
        } catch (error) {
          console.error("Token verification failed", error);
          navigate("/"); // If token verification fails, redirect to login page
        }
      }

    checkUserAuthentication();
  }, []);

  

  return (
    <>
      <div>
        <LogoutButton />
      </div>
      <div className="App">
        {/* Render LogoutButton inside the Router */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/user-dashboard" element={<UserDashboard  />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard/>} />
          <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
        </Routes>

      </div>
     </>
  );
}

export default App;
