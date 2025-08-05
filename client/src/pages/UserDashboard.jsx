// src/components/UserDashboard.js
import React, { useEffect, useState } from 'react';
import '../Styles/UserDashboard.css';
import axios from "axios"
import {server} from "../constants/config"
import SubmitComponent from "../components/shared/SubmitComponent"
import BillComponent from '../components/shared/BillComponent';

function UserDashboard() {
  // console.log(user._id);
  const [parking ,setparking]=useState([]);
  const [user,setUser]=useState(null);
  useEffect(() => {
    const checkUserAuthentication = async () => {
        try {
          const response = await axios.get(`${server}/user/api/v1/me`,{
            withCredentials:true
          });
          setUser(response.data.user)
        } catch (error) {
          console.error("Token verification failed", error);
        }
      }
    checkUserAuthentication();
  }, []);
  // console.log(user?._id);

  
  useEffect(() => {
    const func = async () => {
        const res = await axios.get(`${server}/user/api/v1/getlots`, { withCredentials: true });
        if (res.status === 200) {
            const lots = res.data.parkinglots.map(lot => ({
                ...lot,
                id: lot._id,
                name: lot.city,
                capacity: lot.numberofslots,
                price:lot.price
            }));
            setparking(lots);

            // Set initial values for selectedLocation and selectedParking based on the first lot
            if (lots.length > 0) {
                setSelectedLocation(lots[0].name);
                setSelectedParking(lots[0].location);
            }
        } else {
            console.log("API response error:", res.status);
        }
    };
    func();
}, []);


  const [parkinglocations,setparkinglocations]=useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedParking, setSelectedParking] = useState('');

  useEffect(() => {
    if (!selectedLocation) return; // Avoid API call if there's no location selected
    const func = async () => {
        const res = await axios.get(`${server}/user/api/v1/getlotsforlocation?city=${selectedLocation}`, { withCredentials: true });
        if (res.status === 200) {
            const lots = res.data.locations.map(lot => ({
                ...lot,
                id: lot._id,
                name: lot.city,
                capacity: lot.numberofslots
            }));
            setparkinglocations(lots);
            if(lots.length>=1)
            setSelectedParking(lots[0].location)
           
        } else {
            console.log("API response error:", res.status);
        }
    };
    func();
}, [selectedLocation]);

  const [parkingSpots, setParkingSpots] = useState([]);
  const [fixedparkingspots,setfixedparkingspots]=useState([]);//using this to revert back changes made


  useEffect(()=>{
    // console.log("changed");
    if (!selectedParking) return;
    const func=async ()=>{

      try {
        const res=await axios.get(`${server}/user/api/v1/parkingspots?city=${selectedLocation}&location=${selectedParking}`,{withCredentials:true});
        const lots = res.data.spots.map(lot => ({
          ...lot,
          id: lot._id,
      }));
      setParkingSpots(lots);
      setfixedparkingspots(lots);
      } catch (error) {
        console.log(error);
      }

    }
    func();
  },[selectedParking])

  
  

  const handleParkingLocation=(e)=>{
    setSelectedLocation(e.target.value)
  }

  const handleParkingSelection = (e) => {
    setSelectedParking(e.target.value);
  };

  const [reservedSpot, setReservedSpot] = useState([]);
  const [occupiedSpot,setOccupiedSpot]=useState([]);
  const [availableSpot,setAvailableSpot]=useState([]);
  const [bills,setBills]=useState([]);
  const [showBill,setShowBill]=useState(false);

  const [submitChanges,setSubmitChanges]=useState(false);
  // console.log(parkingSpots)
  useEffect(()=>{
    if(reservedSpot.length<1 && occupiedSpot.length<1 && availableSpot.length<1)return ;
    // console.log("reserved spots",reservedSpot)
    // console.log("occupied spots",occupiedSpot)
    // console.log("available spots",availableSpot)
    setSubmitChanges(true);
  },[reservedSpot,occupiedSpot,availableSpot])


  const cancelChanges =()=>{
  
    setParkingSpots(fixedparkingspots);
    setOccupiedSpot([]);
    setReservedSpot([]);
    setAvailableSpot([]);
    setSubmitChanges(false);
  }

  const [refresh,setrefresh]=useState(false);
  useEffect(()=>{
    // console.log("changed");
    if (!selectedParking) return;
    const func=async ()=>{

      try {
        const res=await axios.get(`${server}/user/api/v1/parkingspots?city=${selectedLocation}&location=${selectedParking}`,{withCredentials:true});
        const lots = res.data.spots.map(lot => ({
          ...lot,
          id: lot._id,
      }));
      setParkingSpots(lots);
      setfixedparkingspots(lots);
      } catch (error) {
        console.log(error);
      }

    }
    func();
    setrefresh(false);
  },[refresh])

  const saveChanges=async()=>{

    try {
      const data= {occupiedSpots:occupiedSpot};
      if(occupiedSpot.length>=1);
      {const res=await axios.patch(`${server}/user/api/v1/startTimer`,data,{withCredentials:true});
      // console.log("occupied",res.data);
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const data= {availableSpots:availableSpot};
      if(availableSpot.length>=1);
      {
      const res=await axios.patch(`${server}/user/api/v1/stopTimer`,data,{withCredentials:true});
      console.log("available",res.data);
      console.log(res.data.updatedSpots);
      setBills(prev=>[...prev,...res.data.updatedSpots]);
      console.log(bills);
      setShowBill(true);
    }
    } catch (error) {
      console.log(error);
    }

    try {
      const res=await axios.patch(`${server}/user/api/v1/updateslots`,{reserved:reservedSpot,occupied:occupiedSpot,available:availableSpot,id:user?._id},{withCredentials:true})
      console.log(res)
    } catch (error) {
      console.log(error);
    }
    setSubmitChanges(false);
      setAvailableSpot([]);
      setOccupiedSpot([]);
      setReservedSpot([]);
    setLockSpots([]);
    setrefresh(true);
  }


  
  
  const [lockSpots,setLockSpots]=useState([]);
  const handleSpotAction = (spotId, newStatus) => {
    if (lockSpots.includes(spotId)) {
      // Prevent changes if the spot is locked
      alert("Please save your current changes before making further updates to this spot.");
      return;
    }

    if (newStatus === "available") {
      setAvailableSpot((prev) => [...prev, spotId]);
      setOccupiedSpot((prev) => prev.filter((ele) => ele !== spotId));
      setReservedSpot((prev) => prev.filter((ele) => ele !== spotId));
    } else if (newStatus === "reserved") {
      setAvailableSpot((prev) => prev.filter((ele) => ele !== spotId));
      setReservedSpot((prev) => [...prev, spotId]);
    } else {
      setOccupiedSpot((prev) => [...prev, spotId]);
      setReservedSpot((prev) => prev.filter((ele) => ele !== spotId));
    }

    setLockSpots((prev) => [...prev, spotId]); // Lock the spot for further changes
    setSubmitChanges(true);
    console.log(`Spot ${spotId} status updated to ${newStatus}`);
    setParkingSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === spotId ? { ...spot, status: newStatus } : spot
      )
    );
  };
  // console.log("parking spots",parkingSpots)
  return (
     <>
     {showBill ? <BillComponent price={parkingSpots[0]?.price || 10} onClose={()=>{setShowBill(false); setBills([])}} billData={bills}/>:
      <div className="dashboard-container">
      <h2>User Dashboard</h2>

      <label>Select Parking City: </label>
      <select value={selectedLocation} onChange={handleParkingLocation}>
      <option value="" disabled>Select a parking lot</option>
        {parking.map((lot) => (
          <option key={lot.id} value={lot.name}>
            {lot.name} 
          </option>
        ))}
      </select>

      <label>Select Parking Location: </label>
      <select value={selectedParking} onChange={handleParkingSelection}>
      <option value="" disabled>Select a parking lot</option>
        {parkinglocations.map((lot) => (
          <option key={lot.id} value={lot.location}>
            {lot.location} 
          </option>
        ))}
      </select>

      <h3>Available Parking Spots in {selectedLocation} at {selectedParking} </h3>
      <div className="parking-spots">
        {parkingSpots.map( (spot,index) => (
          
          <div
            key={spot.id}
            className={`parking-spot ${spot.status}`}
          >
            <p>Spot {index+1}</p>
            <p>Status: {spot.status}</p>
            <p>Price: {spot.price}</p>
            {spot.status === "reserved" && spot.user?.toString()===user._id.toString()   && (
                  <>
                    <button onClick={() => handleSpotAction(spot.id, "occupied")} disabled={lockSpots.includes(spot.id)}>
                      Occupy Spot
                    </button>
                  </>
                )}
                {spot.status === "occupied" && (
                  <button onClick={() => handleSpotAction(spot.id, "available")} disabled={lockSpots.includes(spot.id)}>
                    Leave Spot
                  </button>
                )}
                {spot.status === "available" && (
                  <button onClick={() => handleSpotAction(spot.id, "reserved")} disabled={lockSpots.includes(spot.id)}>
                    Reserve Spot
                  </button>
                )}
          </div>
         
        ))}
      </div>
      {submitChanges && <SubmitComponent  onCancel={cancelChanges} onConfirm={saveChanges} />}
    </div>
  }
     
     </>
   
    
  );
}


export default UserDashboard;
