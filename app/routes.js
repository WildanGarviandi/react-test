import React from 'react';
import { Router, Route, IndexRoute, browserHistory, hashHistory, useRouterHistory } from 'react-router';
import checkAuth from './modules/auth/actions/checkAuth';
import ContainerPage from './views/container';
import ContainerDetailsPage from './views/container/details';
import ContainerFillPage from './views/container/fill';
import ContainerOrderPage from './views/container/order';
import DashboardPage from './views/dashboard';
import LoginPage from './views/login';
import {HubPage, MyOrderPage} from './views/order';
import store from './store';

import { createHashHistory } from 'history';
const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

function App(props) {
  return <div style={{height: "100%"}}>{props.children}</div>;
}

function requireAuth(nextState, replace, callback) {
  checkAuth(store).then(function(result) {
    if(!result.ok) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      })
    }

    callback();
  });
}

var firstVisit = true;
function checkFirstVisit(nextState, replace, callback) {
  if(firstVisit) {
    firstVisit = false;
    replace({
      pathname: '/container'
    })
  }

  callback();
}

export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={LoginPage} />
      <Route path="/home" component={DashboardPage} onEnter={requireAuth}>
        <IndexRoute component={ContainerPage} />
        <Route path="/hubOrder" component={HubPage} />
        <Route path="/container" component={ContainerPage} />
        <Route path="/container/:id" component={ContainerDetailsPage} onEnter={checkFirstVisit} />
        <Route path="/container/:id/order" component={ContainerOrderPage} onEnter={checkFirstVisit} />
        <Route path="/container/:id/fill" component={ContainerFillPage} onEnter={checkFirstVisit} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
