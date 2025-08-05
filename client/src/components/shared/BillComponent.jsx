import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { server } from '../../constants/config';
import "../../Styles/bill.css"

const BillComponent = ({price, billData, onClose }) => {
  // console.log(billData);
  if (!billData || billData.length === 0) {
    return <p>No bill Data to show</p>;
  }
  const lot=billData[0].parkingLot;
  // console.log(lot);
  const [city,setcity]=useState("")
  const [location,setlocation]=useState("");

  let bill=price*(billData.length);
   useEffect(()=>{
   bill=price*(billData.length); 
   },[])
  billData.forEach(ele=>bill+ele.bill);
  useEffect(()=>{
    const f=async()=>{
      try {
       const res=await axios.post(`${server}/user/api/v1/getparkinglot`,{id:lot},{withCredentials:true});
       console.log(res); 
       setcity(res.data.parkinglots.city);
       setlocation(res.data.parkinglots.location);
      } catch (error) {
        console.log(error);
      }
    }
    f();
  },[]);

  // Assuming billData is an array of updated spots with bills
  return (
    <div className="bill-component">
      <h2 style={{ fontSize: '2rem', color: 'black' }}>Parking Bill</h2>
      <div className="bill-item">
        <p><strong>City : {city}</strong></p>
        <p><strong>Location : {location}</strong></p>
        <p><strong>Your Total Bill Amount is : {bill}</strong></p>
      </div>

      <button onClick={onClose} className="close-btn">
        Close
      </button>
    </div>
  );
};

export default BillComponent;
