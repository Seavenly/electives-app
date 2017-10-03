import React from 'react';
import { Link } from 'react-router-dom';

const AdminPanel = () => (
  <div className="admin-panel">
    <div className="admin-panel__container">
      <nav className="admin-panel__nav">
        <ul className="admin-panel__nav-items">
          <li className="admin-panel__nav-item"><Link to="/admin/electives" className="admin-panel__link">Edit Electives</Link></li>
          <li className="admin-panel__nav-item"><Link to="/admin/groups" className="admin-panel__link">Edit Groups</Link></li>
          <li className="admin-panel__nav-item"><Link to="/admin/students" className="admin-panel__link">Edit Students</Link></li>
          <li className="admin-panel__nav-item"><Link to="/admin/log" className="admin-panel__link">Log</Link></li>
        </ul>
      </nav>
    </div>
  </div>
);

export default AdminPanel;
