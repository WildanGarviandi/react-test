import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import DashboardPage from './modules/dashboard';
import LoginPage from './modules/login';
import {HubPage, MyOrderPage} from './modules/order';
import './main.css';

function App(props) {
  return <div style={{height: "100%"}}>{props.children}</div>;
}

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={DashboardPage}/>
      <Route path="/home" component={DashboardPage}>
        <Route path="/hubOrder" component={HubPage} />
        <Route path="/myOrder" component={MyOrderPage} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
), document.getElementById('root'));
