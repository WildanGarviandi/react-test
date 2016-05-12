import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import checkAuth from './modules/auth/actions/checkAuth';
import App from './views/app';
import ContainerPage from './views/container';
import ContainerDetailsPage from './views/container/details';
import ContainerFillPage from './views/container/fill';
import DashboardPage from './views/dashboard';
import LoginPage from './views/login';
import store from './store';
import ContainerQRCodePage from './views/container/qrcode';

function requireAuth(nextState, replace, callback) {
  checkAuth(store).then(function(result) {
    if(!result.ok) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
    }

    callback();
  });
}

export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={LoginPage} />
      <Route path="/home" component={DashboardPage} onEnter={requireAuth}>
        <IndexRoute component={ContainerPage} onEnter={requireAuth}/>
        <Route path="/container" component={ContainerPage} onEnter={requireAuth}/>
        <Route path="/container/:id" component={ContainerDetailsPage} onEnter={requireAuth}/>
        <Route path="/container/:id/fill" component={ContainerFillPage} onEnter={requireAuth}/>
      </Route>
      <Route path="/qrcode/:id" component={ContainerQRCodePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/*" component={LoginPage} />
    </Route>
  </Router>
);
