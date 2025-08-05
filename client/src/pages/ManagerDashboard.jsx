import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../constants/config'; // Ensure you define the server constant
import SubmitComponent from '../components/shared/SubmitComponent'; 
import BillComponent from '../components/shared/BillComponent';

const ManagerDashboard = () => {
  const [parkingspots, setparkingspots] = useState([]);
  const [fixedparkingspots, setfixedparkingspots] = useState([]);
  const [availablespots, setavailablespots] = useState([]);
  const [occupiedspots, setoccupiedspots] = useState([]);
  const [reservedspots, setreservedspots] = useState([]);
  const [submitChanges, setSubmitChanges] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [bills, setBills] = useState([]);

  const [lockSpots, setLockSpots] = useState([]); // Track spots that are locked for changes
  const [city,setcity]=useState("")
  const [location,setlocation]=useState("")

  // Fetch parking spots data on mount
  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        const res = await axios.get(`${server}/manager/api/v1/getparkinglots`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          const lots = res.data.lots.map((ele) => ({
            ...ele,
            id: ele._id,
            name: ele.city
          }));
          setparkingspots(lots);
          setfixedparkingspots(lots);
        } else {
          console.error("Failed to fetch parking spots");
        }
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      }

      try {
        const res = await axios.get(`${server}/manager/api/v1/getmanagerparkinglot`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          const parkinglotdetails=res.data.lot.parkinglot;
          setcity(parkinglotdetails.city);
          setlocation(parkinglotdetails.location);
          
        } else {
          console.error("Failed to fetch parking spots");
        }
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      }
    };

    fetchParkingSpots();
  }, []);

  // Handle spot action (change status)
  const handleSpotAction = (spotId, newStatus) => {
  if (lockSpots.includes(spotId)) {
    alert("Please save your current changes before making further updates to this spot.");
    return;
  }

  setparkingspots((prevSpots) =>
    prevSpots.map((spot) =>
      spot.id === spotId ? { ...spot, status: newStatus } : spot
    )
  );

  if (newStatus === "available") {
    setavailablespots((prev) => [...prev, spotId]);
    setoccupiedspots((prev) => prev.filter((ele) => ele !== spotId));
    setreservedspots((prev) => prev.filter((ele) => ele !== spotId));
  } else if (newStatus === "reserved") {
    setavailablespots((prev) => prev.filter((ele) => ele !== spotId));
    setreservedspots((prev) => [...prev, spotId]);
  } else {
    setoccupiedspots((prev) => [...prev, spotId]);
    setreservedspots((prev) => prev.filter((ele) => ele !== spotId));

    // Add mock vehicle assignment
    setvehicle_no((prev) => [
      ...prev,
      { slotid: spotId, vehicleNo: { vehicleno: "ABC-123" } },
    ]);
  }

  setLockSpots((prev) => [...prev, spotId]);
  setSubmitChanges(true);
  console.log(`Spot ${spotId} status updated to ${newStatus}`);
};


  const cancelChanges = () => {
    setparkingspots(fixedparkingspots);
    setoccupiedspots([]);
    setavailablespots([]);
    setreservedspots([]);
    setSubmitChanges(false);
    setLockSpots([]); // Reset lock on spots
  };

  const saveChanges = async () => {
    try {
      const data = { occupiedSpots: occupiedspots };
      if (occupiedspots.length >= 1) {
        const res = await axios.patch(`${server}/manager/api/v1/startTimer`, data, { withCredentials: true });
        console.log("occupied", res.data);
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const data = { availableSpots: availablespots };
      if (availablespots.length >= 1) {
        const res = await axios.patch(`${server}/manager/api/v1/stopTimer`, data, { withCredentials: true });
        console.log("available", res.data);
        setBills((prev) => [...prev, ...res.data.updatedSpots]);
        setShowBill(true);
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const res = await axios.patch(`${server}/manager/api/v1/updateslots`, {
        occupied: occupiedspots,
        available: availablespots,
        reserved: reservedspots
      }, { withCredentials: true });
      console.log(res);
    } catch (error) {
      console.log(error);
    }

    // After saving, unlock the spots
    setLockSpots([]);
    setSubmitChanges(false);
    setavailablespots([]);
    setoccupiedspots([]);
    setreservedspots([]);
  };

  const [vehicle_no,setvehicle_no]=useState([]);

  useEffect(()=>{
    const func=async()=>{
      try {
        const res=await axios.get(`${server}/manager/api/v1/getvehicleno`,{withCredentials:true});
        // console.log(res.data.data);
        setvehicle_no(res.data?.data);
     
      } catch (error) {
        console.log("error while trying to fetch vehicle no");
      } } 
    func();
  },[])

  
  return (
    <>
      {showBill ? <BillComponent onClose={()=>{setShowBill(false); setBills([])}} billData={bills} price={parkingspots[0]?.price} /> :
        <div>
          <h1>Manager Dashboard of {city}, {location}</h1>
          <div className="parking-spots">
            {parkingspots.map((spot, index) => 
              {
              return (
              <div key={spot.id} className={`parking-spot ${spot.status}`}>
                <p>Spot {index + 1}</p>
                <p>Status: {spot.status}</p>
                <p>Price : {spot.price}</p>

                {
                  spot.status==="occupied" && (vehicle_no[index]?.slotid===spot.id)
                  &&
                  <p>Vehicle No: {vehicle_no[index]?.vehicleNo?.vehicleno || "occupied by manager"}</p>
                }
                

                {/* Action Buttons */}
                {spot.status === "reserved" && (
                  <>
                    <button onClick={() => handleSpotAction(spot.id, "available")} disabled={lockSpots.includes(spot.id)}>
                      Make Available
                    </button>
                    <button onClick={() => handleSpotAction(spot.id, "occupied")} disabled={lockSpots.includes(spot.id)}>
                      Mark as Occupied
                    </button>
                  </>
                )}
                {spot.status === "occupied" && (
                  <button onClick={() => handleSpotAction(spot.id, "available")} disabled={lockSpots.includes(spot.id)}>
                    Make Available
                  </button>
                )}
                {spot.status === "available" && (
                  <button onClick={() => handleSpotAction(spot.id, "reserved")} disabled={lockSpots.includes(spot.id)}>
                    Reserve Spot
                  </button>
                )}
              </div>
            )
})}
          </div>
          {submitChanges && <SubmitComponent onCancel={cancelChanges} onConfirm={saveChanges} />}
        </div>
      }
    </>
  );
};

export default ManagerDashboard;
