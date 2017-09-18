import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSTransition from 'react-transition-group/CSSTransition';

function toggleModalActive(modal) {
  modal.classList.toggle('active');
}

class ElectiveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
    };
  }

  render() {
    const { elective, inProp, close } = this.props;
    return (
      <CSSTransition in={inProp} timeout={500} classNames="fade" onEnter={toggleModalActive} onExited={toggleModalActive}>
        <div className="modal-wrapper">
          <div className="modal">
            <h3>{elective.name}</h3>
          </div>
        </div>
      </CSSTransition>
    );
  }
}

ElectiveModal.propTypes = {
  elective: PropTypes.shape({

  }),
  inProp: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

ElectiveModal.defaultProps = {
  elective: {},
};

export default ElectiveModal;
