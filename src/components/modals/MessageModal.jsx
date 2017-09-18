/* eslint-env browser */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSTransition from 'react-transition-group/CSSTransition';


function toggleModalActive(modal) {
  modal.classList.toggle('active');
}

class MessageModal extends Component {
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
      this.props.close();
    }
  }

  render() {
    const { inProp, close } = this.props;

    return (
      <CSSTransition in={inProp} timeout={500} classNames="fade" onEnter={toggleModalActive} onExited={toggleModalActive}>
        <div className="modal-wrapper" ref={this.setWrapperRef}>
          <div className="modal" role="dialog">
            <div className="message">Are you sure you want to delete the selected items?</div>
            <div className="controls">
              <button className="warning" onClick={() => close(true)}>Yes</button>
              <button onClick={() => close()}>No</button>
            </div>
          </div>
        </div>
      </CSSTransition>
    );
  }
}

MessageModal.propTypes = {
  inProp: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default MessageModal;
