import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';

import { DashboardPage } from './modules/dashboard/component';
import { LoginPage } from './modules/login/component';
import './main.css';

function App(props) {
  return <div style={{height: "100%"}}>{props.children}</div>;
}

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={DashboardPage} />
      <Route path="/login" component={LoginPage} />
    </Route>
  </Router>
), document.getElementById('root'));
