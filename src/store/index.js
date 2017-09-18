import { combineReducers, createStore } from 'redux';

import electives from './reducers/electives';
import groups from './reducers/groups';

const reducer = combineReducers({ electives, groups });

export default createStore(reducer);
