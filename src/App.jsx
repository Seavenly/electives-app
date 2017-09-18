import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import 'normalize.css';
import store from './store/index';

import Home from './components/Home';
import Electives from './components/Electives';
import Admin from './components/Admin';

import './App.css';

const App = () => (
  <Provider store={store}>
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="container">
            <Link to="/"><h1>Electives App</h1></Link>
            <nav>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/electives">Electives</Link></li>
                <li><Link to="/admin">Admin</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/electives" component={Electives} />
            <Route path="/admin" component={Admin} />
          </Switch>
        </main>
      </div>
    </Router>
  </Provider>
);

export default App;
