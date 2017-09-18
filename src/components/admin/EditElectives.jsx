import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MessageModal from '../modals/MessageModal';
import ElectiveModal from '../modals/ElectiveModal';

class EditElectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      messageModal: false,
      electiveModal: false,
      elective: {},
    };

    this.setElective = this.setElective.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleMessageModal = this.toggleMessageModal.bind(this);
    this.toggleElectiveModal = this.toggleElectiveModal.bind(this);
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

  toggleMessageModal(confirm = false) {
    this.setState({ messageModal: !this.state.messageModal });
    if (confirm) this.handleRemove();
  }

  toggleElectiveModal(confirm = false) {
    this.setState({ electiveModal: !this.state.electiveModal });
  }

  render() {
    const { electives } = this.props;

    return (
      <div className="view--editElectives">
        <h2>Edit Electives</h2>
        <div className="edit-table">
          <div className="controls">
            <button>Add</button>
            <button onClick={() => this.toggleMessageModal()}>Remove</button>
          </div>
          <div className="items">
            {electives.map(e => (
              <div key={e.id} className={`item ${this.state.form[e.id] ? 'checked' : ''}`}>
                <div className="c1"><input type="checkbox" value={e.id} checked={this.state.form[e.id]} onChange={this.handleInputChange} /></div>
                <div className="c2">{e.name}</div>
                <div className="c3"><button onClick={() => this.setElective(e) || this.toggleElectiveModal()}>Edit</button></div>
              </div>
            ))}
          </div>
        </div>
        <MessageModal
          inProp={this.state.messageModal}
          close={this.toggleMessageModal}
        />
        <ElectiveModal
          inProp={this.state.electiveModal}
          close={this.toggleElectiveModal}
          elective={this.state.elective}
        />
      </div>
    );
  }
}

EditElectives.propTypes = {
  electives: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeElectives: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  electives: state.electives,
});

const mapDispatchToProps = dispatch => ({
  removeElectives: ids => dispatch({ type: 'REMOVE_ELECTIVES', ids }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditElectives);
