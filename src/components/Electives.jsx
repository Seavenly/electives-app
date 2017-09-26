import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ElectiveCard from './ElectiveCard';

const Electives = ({ electives }) => (
  <div className="view--electives">
    <div className="container">
      <h2>Electives</h2>
      <ul>
        {electives.sort((a, b) => a.name > b.name).map(elective => (
          <li key={elective.id}><ElectiveCard elective={elective} /></li>
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
