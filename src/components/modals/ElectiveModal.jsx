import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ElectiveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elective: {
        name: '',
        description: '',
        semester: false,
        required: false,
        cap: 0,
        images: [],
        grades: [],
        available: [],
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.isChecked = this.isChecked.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.elective.id === nextProps.elective.id) return;
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
          name: '',
          description: '',
          semester: false,
          required: false,
          cap: 0,
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

  isChecked(key, value) {
    return this.state.elective[key] && this.state.elective[key].includes(value);
  }

  render() {
    const { elective, onClose } = this.props;

    return (
      <div className="modal__body">
        <div className="modal__header">
          <h3 className="modal__title">{elective.name || 'New Elective'}</h3>
        </div>
        <div className="modal__content">
          <form onSubmit={this.handleSubmit} className="m-form">
            <div className="m-form__group">
              <label htmlFor="m-name" className="m-form__label">Name:</label>
              <input id="m-name" type="text" name="name" value={this.state.elective.name} onChange={this.onInputChange} className="m-form__control" />
            </div>
            <div className="m-form__group">
              <label htmlFor="m-available" className="m-form__label">Quarters:</label>
              <label htmlFor="m-available-1" className="m-form__label">
                1 <input id="m-available-1" type="checkbox" name="available-1" checked={this.isChecked('available', 1)} onChange={this.onInputChange} className="m-form__control" />
              </label>
              <label htmlFor="m-available-2" className="m-form__label">
                2 <input id="m-available-2" type="checkbox" name="available-2" checked={this.isChecked('available', 2)} onChange={this.onInputChange} className="m-form__control" />
              </label>
              <label htmlFor="m-available-3" className="m-form__label">
                3 <input id="m-available-3" type="checkbox" name="available-3" checked={this.isChecked('available', 3)} onChange={this.onInputChange} className="m-form__control" />
              </label>
              <label htmlFor="m-available-4" className="m-form__label">
                4 <input id="m-available-4" type="checkbox" name="available-4" checked={this.isChecked('available', 4)} onChange={this.onInputChange} className="m-form__control" />
              </label>
            </div>
            <div className="m-form__group">
              <label htmlFor="m-grades" className="m-form__label">Grades:</label>
              <label htmlFor="m-grades-6" className="m-form__label">
                6 <input id="m-grades-6" type="checkbox" name="grades-6" checked={this.isChecked('grades', 6)} onChange={this.onInputChange} className="m-form__control" />
              </label>
              <label htmlFor="m-grades-7" className="m-form__label">
                7 <input id="m-grades-7" type="checkbox" name="grades-7" checked={this.isChecked('grades', 7)} onChange={this.onInputChange} className="m-form__control" />
              </label>
              <label htmlFor="m-grades-8" className="m-form__label">
                8 <input id="m-grades-8" type="checkbox" name="grades-8" checked={this.isChecked('grades', 8)} onChange={this.onInputChange} className="m-form__control" />
              </label>
            </div>
            <div className="m-form__group">
              <label htmlFor="m-cap" className="m-form__label">Cap:</label>
              <input id="m-cap" type="number" name="cap" value={this.state.elective.cap} onChange={this.onInputChange} className="m-form__control" />
            </div>
            <div className="m-form__group">
              <label htmlFor="m-semester" className="m-form__label">Semester:</label>
              <input id="m-semester" type="checkbox" name="semester" checked={this.state.elective.semester} onChange={this.onInputChange} className="m-form__control" />
            </div>
            <div className="m-form__group">
              <label htmlFor="m-required" className="m-form__label">Required:</label>
              <input id="m-required" type="checkbox" name="required" checked={this.state.elective.required} onChange={this.onInputChange} className="m-form__control" />
            </div>
            <div className="m-form__group">
              <label htmlFor="m-description" className="m-form__label">Description:</label>
              <textarea id="m-description" name="description" type="textarea" value={this.state.elective.description} onChange={this.onInputChange} className="m-form__control" />
            </div>
          </form>
        </div>
        <div className="modal__controls">
          <button onClick={() => onClose(true, { elective: this.state.elective })} className="modal__btn modal__btn--warning">Save</button>
          <button onClick={() => onClose()} className="modal__btn">Close</button>
        </div>
      </div>
    );
  }
}

ElectiveModal.propTypes = {
  elective: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    semester: PropTypes.bool,
    required: PropTypes.bool,
    cap: PropTypes.number,
    images: PropTypes.array,
    grades: PropTypes.array,
    available: PropTypes.array,
  }),
  onClose: PropTypes.func.isRequired,
};

ElectiveModal.defaultProps = {
  elective: {
    name: '',
    description: '',
    semester: false,
    required: false,
    cap: 0,
    images: [],
    grades: [],
    available: [],
  },
};

export default ElectiveModal;
