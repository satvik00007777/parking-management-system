import React, { useEffect, useState } from 'react';
import '../Styles/Dashboard.css';
import axios from 'axios';
import { server } from '../constants/config.js';

function RegistrationAuthorityDashboard() {
  const [parkingLots, setParkingLots] = useState([]);

  useEffect(()=>{
    const getLots=async()=>{
      try {
        const res=await axios.get(`${server}/auth/api/v1/getparkinglots`,{withCredentials:true});
        let lots=res.data.parkinglots;
        lots=lots.map((lot)=>({...lot,id: lot._id, name: lot.city, capacity: lot.numberofslots}))
        //console.log(lots);
        setParkingLots(lots)
      } catch (error) {
        console.log("error while getting Parking Lots");
        console.log(error);
      }
    }
    getLots();
  },[parkingLots])

  // console.log("parking Lots",parkingLots)

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentLot, setCurrentLot] = useState({});

  const handleEditLot = (lot) => {
    setCurrentLot(lot);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name,value);
    setCurrentLot({ ...currentLot, [name]: value });
  };

  const handleSaveChanges = async() => {

    // console.log("inside save changes",parkingLots);
    const data={...currentLot,
      city:currentLot.name,
      numberofslots:currentLot.capacity,
      price:currentLot.price,
      _id:currentLot.id
    }
    
    try {
      const res=await axios.patch(`${server}/auth/api/v1/editslot`,data,{withCredentials:true})
      console.log(res);
      setParkingLots((prevLots) =>
        prevLots.map((lot) =>{
          return lot.id === currentLot.id ? currentLot : lot
        }
        )
      );
    } catch (error) {
      console.log(error);
    }
    finally{
    setIsEditing(false);
    setCurrentLot(null);
    }
  
  };

  const handleAddLot = () => {
    setCurrentLot({
      id: parkingLots.length + 1, // Assuming unique ID is auto-generated
      name: '',
      location: '',
      price:10,
      capacity: 0
    });
    setIsAdding(true);
  };

  const handleSaveNewLot = async() => {
    const data={...currentLot,
      city:currentLot.name,
      numberofslots:currentLot.capacity
    }
    try {
      const res=await axios.post(`${server}/auth/api/v1/addparkingslot`,data,{withCredentials:true})
      console.log(res)
      setParkingLots([...parkingLots, currentLot]);
    } catch (error) {
      console.log(error);
    }
    finally{
    setIsAdding(false);
    setCurrentLot(null);
    console.log(res);
  }
  };

  const DeleteLot= async (lot)=>{
    console.log("lot to be Deleted",lot);
    try {
      const res=await axios.delete(`${server}/auth/api/v1/deletelot`,{data: lot,withCredentials:true});
      console.log("lot Deleted",lot);
      setParkingLots((prev) => prev.filter((ele) => ele.id !== lot.id));
    } catch (error) {
      console.log("Error in Deleting the Parking Lot",error);
    }
  }

  return (
    <div className="dashboard-container">
      <h2>Registration Authority Dashboard</h2>
      <h3>Managed Parking Lots</h3>
      
      <div className="parking-lots">
        {parkingLots.map(lot => (
          <div key={lot.id} className="parking-lot">
            <p>City: {lot.name}</p>
            <p>Location: {lot.location}</p>
            <p>Capacity: {lot.capacity}</p>
            <p>Price: {lot.price || 10}</p>
            <button onClick={() => handleEditLot(lot)}>Edit Lot Details</button>
            <button onClick={() => DeleteLot(lot)}>Delete Parking Lot</button>
          </div>
        ))}
      </div>
      
      <button onClick={handleAddLot} className="add-lot-btn">Add New Parking Lot</button>

      {(isEditing || isAdding) && (
        <div className="edit-modal" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}>
          <h3>{isEditing ? 'Edit Parking Lot' : 'Add New Parking Lot'}</h3>
          <form>
            <label>
              City:
              <input
                type="text"
                name="name"
                value={currentLot.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={currentLot.location}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Capacity:
              <input
                type="number"
                name="capacity"
                value={currentLot.capacity}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                name="price"
                value={currentLot.price}
                onChange={handleInputChange}
              />
            </label>
            <button type="button" onClick={isEditing ? handleSaveChanges : handleSaveNewLot}>
              {isEditing ? 'Save Changes' : 'Add Parking Lot'}
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setIsAdding(false); }}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default RegistrationAuthorityDashboard;
