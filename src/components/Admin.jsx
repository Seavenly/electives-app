import React from 'react';
import { Route, Switch } from 'react-router-dom';

import AdminPanel from './admin/AdminPanel';
import EditElectives from './admin/EditElectives';
import EditGroups from './admin/EditGroups';
import EditStudents from './admin/EditStudents';
import Log from './admin/Log';

const Admin = () => (
  <div className="page page--admin">
    <AdminPanel />
    <div className="page__container">
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
