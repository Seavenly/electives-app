import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ElectiveCard from './ElectiveCard';

const Electives = ({ electives }) => (
  <div className="page page--electives">
    <div className="page__container">
      <h2 className="page__title">Electives</h2>
      <ul className="page__items">
        {electives.sort((a, b) => a.name > b.name).map(elective => (
          <li key={elective.id} className="page__item"><ElectiveCard elective={elective} /></li>
        ))}
      </ul>
    </div>
  </div>
);

Electives.propTypes = {
  electives: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStatetoProps = state => ({
  electives: [...state.electives],
});

// const mapDispatchToProps = dispatch => ({

// });

export default connect(mapStatetoProps)(Electives);
