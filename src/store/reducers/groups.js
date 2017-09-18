import data from '../data/groups.json';

const ADD_GROUP = 'ADD_GROUP';
const DELETE_GROUP = 'DELETE_GROUP';

function groupsReducer(groups = data, action) {
  switch (action.type) {
    case ADD_GROUP:
      return [...groups,
        {
          ...action.group,
          electives: [...action.group.electives],
        },
      ];
    case DELETE_GROUP:
    {
      const index = groups.findIndex(group => group.id === action.id);
      return [
        ...groups.slice(0, index),
        ...groups.slice(index + 1),
      ];
    }
    default:
      return groups;
  }
}

export default groupsReducer;
