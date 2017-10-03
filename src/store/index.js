import { combineReducers, createStore } from 'redux';

import electives from './reducers/electives';
import groups from './reducers/groups';

const reducer = combineReducers({ electives, groups });

/* eslint-disable no-underscore-dangle */
export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);
