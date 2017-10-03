import React from 'react';
import PropTypes from 'prop-types';

const ElectiveCard = ({ elective }) => (
  <div className="elective-card">
    <div className="elective-card__image-wrapper">
      <img className="elective-card__image" src={elective.images[0]} alt={elective.name} />
    </div>
    <div className="elective-card__info">
      <h3 className="elective-card__title">{elective.name}</h3>
      <p className="elective-card__description">{elective.description}</p>
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
