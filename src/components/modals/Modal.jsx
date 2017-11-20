import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import CSSTransition from 'react-transition-group/CSSTransition';

import MessageModal from './MessageModal';
import ElectiveModal from './ElectiveModal';


function toggleModalActive(modal) {
  modal.classList.toggle('modal--active');
}

class Modal extends Component {
  constructor(props) {
    super(props);

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
    if (e.button === 2 && e.target === this.wrapperRef) {
      this.props.onClose();
    }
  }

  render() {
    const { isOpen, onClose, type, data } = this.props;

    return ReactDOM.createPortal((
      <CSSTransition
        in={isOpen}
        timeout={500}
        classNames="modal-"
        onEnter={toggleModalActive}
        onExited={toggleModalActive}
      >
        <div className={`modal modal--${type}`} ref={this.setWrapperRef}>
          <div className="modal__container" role="dialog">
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
    ), document.body);
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
