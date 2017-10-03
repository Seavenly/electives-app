import React from 'react';
import PropTypes from 'prop-types';


const MessageModal = ({ onClose }) => (
  <div className="modal__body modal__body--message">
    <div className="modal__header">
      <h3 className="modal__title">Warning</h3>
    </div>
    <div className="modal__content">
      <p>Are you sure you want to delete the selected items?</p>
    </div>
    <div className="modal__controls">
      <button onClick={() => onClose(true)} className="modal__btn modal__btn--warning">Yes</button>
      <button onClick={() => onClose()} className="modal__btn">No</button>
    </div>
  </div>
);

MessageModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MessageModal;
