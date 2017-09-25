import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ElectiveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elective: {
        images: [],
        grades: [],
        available: [],
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.elective === nextProps.elective) return;
    // Check for full elective object
    if (nextProps.elective.grades) {
      this.setState(() => ({
        elective: {
          ...nextProps.elective,
          images: [...nextProps.elective.images],
          grades: [...nextProps.elective.grades],
          available: [...nextProps.elective.available],
        },
      }));
    } else {
      this.setState(() => ({
        elective: {
          images: [],
          grades: [],
          available: [],
        },
      }));
    }
  }

  onInputChange(e) {
    // Regular Input Fields
    if (e.target.type !== 'checkbox') {
      this.setState({ elective: {
        ...this.state.elective,
        [e.target.name]: e.target.value },
      });
    // Checkbox Input Fields
    } else {
      const type = e.target.name.split('-');
      // Special case for Grades and Available to store data in arrays
      if (type[0] === 'grades' || type[0] === 'available') {
        if (e.target.checked) {
          this.setState({ elective: {
            ...this.state.elective,
            [type[0]]: [...this.state.elective[type[0]], +type[1]],
          } });
        } else {
          this.setState({ elective: {
            ...this.state.elective,
            [type[0]]: this.state.elective[type[0]].filter(grade => grade !== +type[1]),
          } });
        }
      // Regular Checkbox Input Field
      } else {
        this.setState({ elective: {
          ...this.state.elective,
          [e.target.name]: e.target.checked },
        });
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onClose(true, { elective: this.state.elective });
  }

  render() {
    const { elective, onClose } = this.props;
    return (
      <div className="modal-body modal-body--elective">
        <div className="header">
          <h3>{elective.name || 'New Elective'}</h3>
        </div>
        <div className="content">
          <form onSubmit={this.handleSubmit}>
            <div className="form-control">
              <label htmlFor="name">Name:</label>
              <input type="text" name="name" value={this.state.elective.name} onChange={this.onInputChange} />
            </div>
            <div className="form-control">
              <label htmlFor="available">Quarters:</label>
              <label htmlFor="available-1">1 <input type="checkbox" name="available-1" checked={this.state.elective.available.includes(1)} onChange={this.onInputChange} /></label>
              <label htmlFor="available-2">2 <input type="checkbox" name="available-2" checked={this.state.elective.available.includes(2)} onChange={this.onInputChange} /></label>
              <label htmlFor="available-3">3 <input type="checkbox" name="available-3" checked={this.state.elective.available.includes(3)} onChange={this.onInputChange} /></label>
              <label htmlFor="available-4">4 <input type="checkbox" name="available-4" checked={this.state.elective.available.includes(4)} onChange={this.onInputChange} /></label>
            </div>
            <div className="form-control">
              <label htmlFor="grades">Grades:</label>
              <label htmlFor="grades-6">6 <input type="checkbox" name="grades-6" checked={this.state.elective.grades.includes(6)} onChange={this.onInputChange} /></label>
              <label htmlFor="grades-7">7 <input type="checkbox" name="grades-7" checked={this.state.elective.grades.includes(7)} onChange={this.onInputChange} /></label>
              <label htmlFor="grades-8">8 <input type="checkbox" name="grades-8" checked={this.state.elective.grades.includes(8)} onChange={this.onInputChange} /></label>
            </div>
            <div className="form-control">
              <label htmlFor="cap">Cap:</label>
              <input type="number" name="cap" value={this.state.elective.cap} onChange={this.onInputChange} />
            </div>
            <div className="form-control">
              <label htmlFor="semester">Semester:</label>
              <input type="checkbox" name="semester" checked={this.state.elective.semester} onChange={this.onInputChange} />
            </div>
            <div className="form-control">
              <label htmlFor="required">Required:</label>
              <input type="checkbox" name="required" checked={this.state.elective.required} onChange={this.onInputChange} />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description:</label>
              <textarea name="description" value={this.state.elective.description} onChange={this.onInputChange} />
            </div>
          </form>
        </div>
        <div className="controls">
          <button className="warning" onClick={() => onClose(true, { elective: this.state.elective })}>Save</button>
          <button onClick={() => onClose()}>Close</button>
        </div>
      </div>
    );
  }
}

ElectiveModal.propTypes = {
  elective: PropTypes.shape({
    images: PropTypes.array,
    grades: PropTypes.array,
    available: PropTypes.array,
  }),
  onClose: PropTypes.func.isRequired,
};

ElectiveModal.defaultProps = {
  elective: {
    images: [],
    grades: [],
    available: [],
  },
};

export default ElectiveModal;
