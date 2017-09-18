import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';

import EditElectives from './admin/EditElectives';
import EditGroups from './admin/EditGroups';
import EditStudents from './admin/EditStudents';
import Log from './admin/Log';

const Admin = () => (
  <div className="view--admin">
    <div className="admin-panel">
      <div className="container">
        <nav>
          <ul>
            <li><Link to="/admin/electives">Edit Electives</Link></li>
            <li><Link to="/admin/groups">Edit Groups</Link></li>
            <li><Link to="/admin/students">Edit Students</Link></li>
            <li><Link to="/admin/log">Log</Link></li>
          </ul>
        </nav>
      </div>
    </div>
    <div className="container">
      <Switch>
        <Route path="/admin/electives" component={EditElectives} />
        <Route path="/admin/groups" component={EditGroups} />
        <Route path="/admin/students" component={EditStudents} />
        <Route path="/admin/log" component={Log} />
        <Route component={EditElectives} />
      </Switch>
    </div>
  </div>
);

export default Admin;