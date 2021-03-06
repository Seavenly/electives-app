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
    this.props.deleteElectives(checkedElectives);
  }

  handleSave({ elective }) {
    // If an elective is set in state, then that elective is being updated
    if (this.state.elective.name) this.props.updateElective(elective);
    else this.props.createElective(elective);
  }

  openModal(type) {
    this.setState({ modal: { [type]: true } });
  }

  closeModal(confirm, response) {
    if (confirm) {
      // Check which type of modal is currently open to perform action
      if (this.state.modal.message) this.handleRemove();
      else if (this.state.modal.elective) this.handleSave(response);
    }
    // Reset modal state
    this.setState({
      elective: {},
      modal: {},
    });
  }

  render() {
    const { electives } = this.props;

    return (
      <div className="admin-page admin-page--electives">
        <h2 className="admin-page__title">Edit Electives</h2>
        <div className="admin-table">
          <div className="admin-table__controls">
            <button onClick={() => this.openModal('elective')} className="admin-table__btn">Add</button>
            <button onClick={() => this.openModal('message')} className="admin-table__btn">Remove</button>
          </div>
          <div className="admin-table__rows">
            {electives.sort((a, b) => a.name > b.name).map(elective => (
              <div key={elective.id} className={`admin-table__row ${this.state.form[elective.id] ? 'admin-table__row--checked' : ''}`}>
                <div className="admin-table__col">
                  <input
                    type="checkbox"
                    value={elective.id}
                    checked={this.state.form[elective.id]}
                    onChange={this.handleInputChange}
                    className="admin-table__checkbox"
                  />
                </div>
                <div className="admin-table__col">{elective.name}</div>
                <div className="admin-table__col">
                  <button onClick={() => this.setElective(elective) || this.openModal('elective')} className="admin-table__btn">Edit</button>
                </div>
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
  deleteElectives: PropTypes.func.isRequired,
  updateElective: PropTypes.func.isRequired,
  createElective: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  electives: [...state.electives],
});

const mapDispatchToProps = dispatch => ({
  deleteElectives: ids => dispatch({ type: 'DELETE_ELECTIVES', ids }),
  updateElective: elective => dispatch({ type: 'UPDATE_ELECTIVE', elective }),
  createElective: elective => dispatch({ type: 'CREATE_ELECTIVE', elective }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditElectives);
