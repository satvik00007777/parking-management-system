import React from "react";

function ParkingLayout() {
  const slots = [
    { id: 1, status: "available" },
    { id: 2, status: "booked" },
    { id: 3, status: "occupied" },
    { id: 4, status: "available" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "booked":
        return "blue";
      case "occupied":
        return "orange";
      default:
        return "grey";
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {slots.map((slot) => (
        <div
          key={slot.id}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: getStatusColor(slot.status),
          }}
        >
          {slot.id}
        </div>
      ))}
    </div>
  );
}

export default ParkingLayout;
