import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import checkAuth from './modules/auth/actions/checkAuth';
import store from './store';
import ContainerPage from './views/container';
import ContainerDetailsPage from './views/container/details';
import ContainerFillPage from './views/container/fill';
import ContainerOrderPage from './views/container/order';
import DashboardPage from './views/dashboard';
import LoginPage from './views/login';
import {HubPage, MyOrderPage} from './views/order';
import './main.css';

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

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/home" component={DashboardPage} onEnter={requireAuth}>
        <IndexRoute component={ContainerPage} />
        <Route path="/hubOrder" component={HubPage} />
        <Route path="/container" component={ContainerPage} />
        <Route path="/container/:id" component={ContainerDetailsPage} />
        <Route path="/container/:id/order" component={ContainerOrderPage} />
        <Route path="/container/:id/fill" component={ContainerFillPage} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);

const Root = () => {
  return (
    <Provider store={store}>
      {routes}
    </Provider>
  );
}

render(<Root />, document.getElementById('root'));
