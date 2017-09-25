import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSTransition from 'react-transition-group/CSSTransition';

import MessageModal from './MessageModal';
import ElectiveModal from './ElectiveModal';


function toggleModalActive(modal) {
  modal.classList.toggle('active');
}

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(e) {
    if (e.target === this.wrapperRef) {
      this.props.onClose();
    }
  }

  render() {
    const { isOpen, onClose, type, data } = this.props;

    return (
      <CSSTransition in={isOpen} timeout={500} classNames="fade" onEnter={toggleModalActive} onExited={toggleModalActive}>
        <div className="modal-wrapper" ref={this.setWrapperRef}>
          <div className="modal" role="dialog">
            {(() => {
              switch (type) {
                case 'message':
                  return <MessageModal onClose={onClose} />;
                case 'elective':
                  return <ElectiveModal onClose={onClose} elective={data} />;
                default:
                  return null;
              }
            })()}
          </div>
        </div>
      </CSSTransition>
    );
  }
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({}),
};

Modal.defaultProps = {
  data: {},
};

export default Modal;
