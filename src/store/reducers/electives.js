import data from '../data/electives.json';

const ADD_ELECTIVE = 'ADD_ELECTIVE';
const REMOVE_ELECTIVES = 'REMOVE_ELECTIVES';

function electivesReducer(electives = data, action) {
  switch (action.type) {
    case ADD_ELECTIVE:
      return [...electives,
        {
          ...action.elective,
          images: [...action.elective.images],
          grades: [...action.elective.grades],
          available: [...action.elective.available],
        },
      ];
    case REMOVE_ELECTIVES:
      return electives.filter(elec => !action.ids.includes(elec.id));
    default:
      return electives;
  }
}

export default electivesReducer;
