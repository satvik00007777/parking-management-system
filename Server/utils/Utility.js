class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export { ErrorHandler };

  export const createParkingLot = async () => {
    try {
      // Create a new Parking Lot
      const parkingLot = new ParkingLot({
        city: 'Noida',
        location: 'Sector 11',
        numberOfSlots: 20,
      });
      
      // Save the ParkingLot to the database
      await parkingLot.save();
  
      // Now create the slots for this parking lot
      const slotPromises = [];
      for (let i = 0; i < parkingLot.numberOfSlots; i++) {
        const slot = new Slot({
          status: 'vacant', // Initially, all slots are vacant
          parkingLot: parkingLot._id,
        });
  
        // Save each slot to the database and push the promise into the array
        slotPromises.push(slot.save());
      }
  
      // Wait for all slots to be saved and add them to the ParkingLot's slots array
      const slots = await Promise.all(slotPromises);
  
      // Update the parking lot with the created slots
      parkingLot.slots = slots.map(slot => slot._id);
      await parkingLot.save();
  
      console.log('Parking lot and slots created successfully!');
    } catch (error) {
      console.error('Error creating parking lot:', error);
    }
  };
  