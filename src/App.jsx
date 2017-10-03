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
      <div className="app">
        <header className="header">
          <div className="header__container">
            <Link to="/" className="header__home-link">
              <h1 className="header__title">Electives App</h1>
            </Link>
            <nav className="main-nav">
              <ul className="main-nav__items">
                <li className="main-nav__item"><Link to="/" className="main-nav__link">Home</Link></li>
                <li className="main-nav__item"><Link to="/electives" className="main-nav__link">Electives</Link></li>
                <li className="main-nav__item"><Link to="/admin" className="main-nav__link">Admin</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="main">
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
