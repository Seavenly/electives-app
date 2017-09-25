import React from 'react';
import PropTypes from 'prop-types';


const MessageModal = ({ onClose }) => (
  <div className="modal-body modal-body--message">
    <div className="header">
      <h3>Warning</h3>
    </div>
    <div className="content">
      <p>Are you sure you want to delete the selected items?</p>
    </div>
    <div className="controls">
      <button className="warning" onClick={() => onClose(true)}>Yes</button>
      <button onClick={() => onClose()}>No</button>
    </div>
  </div>
);

MessageModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MessageModal;
