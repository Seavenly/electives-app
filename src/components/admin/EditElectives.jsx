import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '../modals/Modal';

class EditElectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      modal: {},
      elective: {},
    };

    this.setElective = this.setElective.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  setElective(elective) {
    this.setState({ elective });
  }

  handleInputChange(e) {
    this.setState({
      form: { ...this.state.form, [e.target.value]: e.target.checked },
    });
  }

  handleRemove() {
    const checkedElectives = Object.keys(this.state.form).filter(key => this.state.form[key]);
    this.props.removeElectives(checkedElectives);
  }

  handleSave(elective) {
    this.props.saveElective(elective);
  }

  openModal(type) {
    this.setState({ modal: { [type]: true } });
  }

  closeModal(confirm, response) {
    if (confirm) {
      if (this.state.modal.message) this.handleRemove();
      else if (this.state.modal.elective) this.handleSave(response.elective);
    }
    this.setState({
      elective: {},
      modal: {},
    });
  }

  render() {
    const { electives } = this.props;

    return (
      <div className="view--editElectives">
        <h2>Edit Electives</h2>
        <div className="edit-table">
          <div className="controls">
            <button>Add</button>
            <button onClick={() => this.openModal('message')}>Remove</button>
          </div>
          <div className="items">
            {electives.map(elective => (
              <div key={elective.id} className={`item ${this.state.form[elective.id] ? 'checked' : ''}`}>
                <div className="c1"><input type="checkbox" value={elective.id} checked={this.state.form[elective.id]} onChange={this.handleInputChange} /></div>
                <div className="c2">{elective.name}</div>
                <div className="c3"><button onClick={() => this.setElective(elective) || this.openModal('elective')}>Edit</button></div>
              </div>
            ))}
          </div>
        </div>
        <Modal
          type="message"
          isOpen={this.state.modal.message}
          onClose={this.closeModal}
        />
        <Modal
          type="elective"
          isOpen={this.state.modal.elective}
          onClose={this.closeModal}
          data={this.state.elective}
        />
      </div>
    );
  }
}

EditElectives.propTypes = {
  electives: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeElectives: PropTypes.func.isRequired,
  saveElective: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  electives: state.electives,
});

const mapDispatchToProps = dispatch => ({
  removeElectives: ids => dispatch({ type: 'DELETE_ELECTIVES', ids }),
  saveElective: elective => dispatch({ type: 'UPDATE_ELECTIVE', elective }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditElectives);
