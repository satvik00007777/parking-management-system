
import React from 'react';
import '../../Styles/Dialog.css';  // Add custom styles for the dialog

const Dialog = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render the dialog if not open

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-message">{message}</div>
        <button className="dialog-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Dialog;
