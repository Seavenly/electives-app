import React from 'react';
import PropTypes from 'prop-types';

const ElectiveCard = ({ elective }) => (
  <div className="card">
    <div className="image">
      <img src={elective.images[0]} alt={elective.name} />
    </div>
    <div className="info">
      <h3>{elective.name}</h3>
      <p className="description">{elective.description}</p>
    </div>
  </div>
);

ElectiveCard.propTypes = {
  elective: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    semester: PropTypes.bool,
    required: PropTypes.bool,
    cap: PropTypes.number,
    limit: PropTypes.number,
    images: PropTypes.array,
    grades: PropTypes.array,
    available: PropTypes.array,
  }).isRequired,
};

export default ElectiveCard;
