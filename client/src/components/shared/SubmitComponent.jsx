import React from 'react';
import '../../Styles/Submit.css'; // Optional for styling

const SubmitComponent = ({  onConfirm, onCancel }) => {

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        
          <button onClick={onConfirm} className="confirm-btn">Confirm</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        
      </div>
    </div>
  );
};

export default SubmitComponent;
