import data from '../data/electives.json';

const CREATE_ELECTIVE = 'CREATE_ELECTIVE';
const UPDATE_ELECTIVE = 'UPDATE_ELECTIVE';
const DELETE_ELECTIVE = 'DELETE_ELECTIVE';

function electivesReducer(electives = data.sort((a, b) => a.name > b.name), action) {
  switch (action.type) {
    case CREATE_ELECTIVE:
      return [...electives,
        {
          ...action.elective,
          images: [...action.elective.images],
          grades: [...action.elective.grades],
          available: [...action.elective.available],
        },
      ];
    case UPDATE_ELECTIVE:
    {
      const index = electives.findIndex(elective => elective.id === action.elective.id);
      return [
        ...electives.slice(0, index),
        {
          ...action.elective,
          images: [...action.elective.images],
          grades: [...action.elective.grades],
          available: [...action.elective.available],
        },
        ...electives.slice(index + 1),
      ];
    }
    case DELETE_ELECTIVE:
      return electives.filter(elec => !action.ids.includes(elec.id));
    default:
      return electives;
  }
}

export default electivesReducer;
